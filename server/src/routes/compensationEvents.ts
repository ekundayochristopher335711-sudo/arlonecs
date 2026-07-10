import express from 'express'
import { body, validationResult } from 'express-validator'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import prisma from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireProjectAccess, requireProjectRole } from '../middleware/roleCheck'
import { logAudit, diffObjects } from '../services/auditService'
import { nextNumber, createWithRetry } from '../services/numberingService'
import { sendCEStatusChangeNotification } from '../services/emailService'

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const router = express.Router()

// NEC workflow: forward-only. A CE can move to any later stage but never backwards.
const CE_WORKFLOW = ['NOTIFIED', 'QUOTED', 'ASSESSED', 'IMPLEMENTED', 'CLOSED']
const isValidTransition = (from: string, to: string): boolean =>
  CE_WORKFLOW.indexOf(to) >= CE_WORKFLOW.indexOf(from)

// NEC4 cl. 61.4 — the PM replies to a CE notification within one week.
const DEFAULT_REPLY_DAYS = 7

router.get('/:projectId/compensation-events', authenticate, requireProjectAccess, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { status } = req.query
    const ces = await prisma.compensationEvent.findMany({
      where: {
        projectId: req.params.projectId,
        ...(status ? { status: status as 'NOTIFIED' | 'QUOTED' | 'ASSESSED' | 'IMPLEMENTED' | 'CLOSED' } : {}),
      },
      include: {
        notices: { select: { id: true, noticeNumber: true, type: true, dateIssued: true } },
        documents: true,
        _count: { select: { notices: true, documents: true } },
      },
      orderBy: { dateNotified: 'desc' },
    })
    res.json(ces)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/:projectId/compensation-events/:id', authenticate, requireProjectAccess, async (req: AuthRequest, res): Promise<void> => {
  try {
    const ce = await prisma.compensationEvent.findFirst({
      where: { id: req.params.id, projectId: req.params.projectId },
      include: {
        notices: true,
        documents: true,
      },
    })
    if (!ce) { res.status(404).json({ message: 'CE not found' }); return }
    res.json(ce)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/:projectId/compensation-events',
  authenticate,
  requireProjectAccess,
  requireProjectRole('ADMIN', 'COMMERCIAL_MANAGER'),
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('dateNotified').isISO8601(),
  async (req: AuthRequest, res): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }

    try {
      const { title, description, clauseRef, dateNotified, dateResponseDue, valuationAmount } = req.body
      const notified = new Date(dateNotified)
      // NEC deadline clock: default the reply period if none was given
      const responseDue = dateResponseDue
        ? new Date(dateResponseDue)
        : new Date(notified.getTime() + DEFAULT_REPLY_DAYS * 24 * 60 * 60 * 1000)

      const ce = await createWithRetry(async () => {
        const ceNumber = await nextNumber('compensationEvent', req.params.projectId, 'CE')
        return prisma.compensationEvent.create({
          data: {
            ceNumber,
            projectId: req.params.projectId,
            title,
            description,
            clauseRef: clauseRef || null,
            dateNotified: notified,
            dateResponseDue: responseDue,
            valuationAmount: valuationAmount !== undefined && valuationAmount !== null && valuationAmount !== '' ? Number(valuationAmount) : null,
            notifiedBy: req.user!.id,
          },
          include: { notices: true, documents: true, _count: { select: { notices: true, documents: true } } },
        })
      })
      await logAudit({ userId: req.user!.id, projectId: req.params.projectId, entityType: 'CompensationEvent', entityId: ce.id, action: 'CREATE', ipAddress: req.ip })
      res.status(201).json(ce)
    } catch {
      res.status(500).json({ message: 'Server error' })
    }
  },
)

router.put('/:projectId/compensation-events/:id',
  authenticate,
  requireProjectAccess,
  requireProjectRole('ADMIN', 'COMMERCIAL_MANAGER'),
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const existing = await prisma.compensationEvent.findFirst({
        where: { id: req.params.id, projectId: req.params.projectId },
      })
      if (!existing) { res.status(404).json({ message: 'CE not found' }); return }

      const { id, ceNumber, projectId, createdAt, updatedAt, notices, documents, notifiedBy, _count, ...updateData } = req.body

      // NEC workflow is forward-only
      if (updateData.status && !isValidTransition(existing.status, updateData.status)) {
        res.status(400).json({ message: `Invalid NEC workflow transition: ${existing.status} → ${updateData.status}. Status can only move forward.` })
        return
      }

      if (updateData.dateNotified) updateData.dateNotified = new Date(updateData.dateNotified)
      if (updateData.dateResponseDue !== undefined) {
        updateData.dateResponseDue = updateData.dateResponseDue ? new Date(updateData.dateResponseDue) : null
      }
      if (updateData.valuationAmount !== undefined) {
        updateData.valuationAmount = updateData.valuationAmount === null || updateData.valuationAmount === '' ? null : Number(updateData.valuationAmount)
      }

      const ce = await prisma.compensationEvent.update({
        where: { id: req.params.id },
        data: updateData,
        include: { notices: true, documents: true, _count: { select: { notices: true, documents: true } } },
      })

      const changes = diffObjects(existing as unknown as Record<string, unknown>, updateData)
      const statusChanged = existing.status !== ce.status
      await logAudit({ userId: req.user!.id, projectId: req.params.projectId, entityType: 'CompensationEvent', entityId: ce.id, action: statusChanged ? 'STATUS_CHANGE' : 'UPDATE', changes, ipAddress: req.ip })

      if (statusChanged) {
        // Notify project team of the workflow move (fire-and-forget)
        prisma.project.findUnique({
          where: { id: req.params.projectId },
          include: { members: { include: { user: { select: { email: true } } } } },
        }).then((project) => {
          if (!project) return
          const recipients = project.members.filter((m) => m.role !== 'VIEWER').map((m) => m.user.email)
          return sendCEStatusChangeNotification(ce.ceNumber, ce.title, project.name, existing.status, ce.status, req.user!.email, recipients)
        }).catch(console.error)
      }

      res.json(ce)
    } catch {
      res.status(500).json({ message: 'Server error' })
    }
  },
)

router.post('/:projectId/compensation-events/:id/documents',
  authenticate,
  requireProjectAccess,
  requireProjectRole('ADMIN', 'COMMERCIAL_MANAGER'),
  upload.single('file'),
  async (req: AuthRequest, res): Promise<void> => {
    if (!req.file) { res.status(400).json({ message: 'No file uploaded' }); return }
    try {
      const ce = await prisma.compensationEvent.findFirst({
        where: { id: req.params.id, projectId: req.params.projectId },
      })
      if (!ce) { res.status(404).json({ message: 'CE not found' }); return }

      const doc = await prisma.document.create({
        data: {
          ceId: req.params.id,
          name: req.file.originalname,
          path: req.file.filename,
          size: req.file.size,
          mimeType: req.file.mimetype,
          uploadedBy: req.user!.id,
        },
      })
      await logAudit({ userId: req.user!.id, projectId: req.params.projectId, entityType: 'Document', entityId: doc.id, action: 'CREATE', ipAddress: req.ip })
      res.status(201).json(doc)
    } catch {
      res.status(500).json({ message: 'Server error' })
    }
  },
)

// Authenticated document download — files are NOT publicly served
router.get('/:projectId/documents/:docId/download', authenticate, requireProjectAccess, async (req: AuthRequest, res): Promise<void> => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.docId, ce: { projectId: req.params.projectId } },
    })
    if (!doc) { res.status(404).json({ message: 'Document not found' }); return }

    const filePath = path.join(UPLOAD_DIR, path.basename(doc.path))
    if (!fs.existsSync(filePath)) { res.status(404).json({ message: 'File missing from storage' }); return }

    await logAudit({ userId: req.user!.id, projectId: req.params.projectId, entityType: 'Document', entityId: doc.id, action: 'EXPORT', ipAddress: req.ip })
    res.setHeader('Content-Type', doc.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${doc.name.replace(/"/g, '')}"`)
    fs.createReadStream(filePath).pipe(res)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Project-wide document register
router.get('/:projectId/documents', authenticate, requireProjectAccess, async (req: AuthRequest, res): Promise<void> => {
  try {
    const docs = await prisma.document.findMany({
      where: { ce: { projectId: req.params.projectId } },
      include: { ce: { select: { id: true, ceNumber: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    })
    // Resolve uploader names in one query
    const userIds = [...new Set(docs.map((d) => d.uploadedBy))]
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    const nameMap = new Map(users.map((u) => [u.id, u.name]))
    res.json(docs.map((d) => ({ ...d, uploadedByName: nameMap.get(d.uploadedBy) ?? 'Unknown' })))
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// Deleting contractual records is restricted to project ADMINs and is always audited
router.delete('/:projectId/compensation-events/:id', authenticate, requireProjectAccess, requireProjectRole('ADMIN'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const existing = await prisma.compensationEvent.findFirst({
      where: { id: req.params.id, projectId: req.params.projectId },
      include: { documents: true },
    })
    if (!existing) { res.status(404).json({ message: 'CE not found' }); return }

    await prisma.compensationEvent.delete({ where: { id: req.params.id } })
    // Remove orphaned files from storage
    for (const doc of existing.documents) {
      const filePath = path.join(UPLOAD_DIR, path.basename(doc.path))
      fs.promises.unlink(filePath).catch(() => {})
    }
    await logAudit({ userId: req.user!.id, projectId: req.params.projectId, entityType: 'CompensationEvent', entityId: req.params.id, action: 'DELETE', changes: { record: { old: `${existing.ceNumber}: ${existing.title}`, new: null } }, ipAddress: req.ip })
    res.status(204).send()
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
