import express from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { requireProjectAccess, requireProjectRole } from '../middleware/roleCheck'
import { logAudit } from '../services/auditService'
import { sendCommentNotification } from '../services/emailService'

const TARGETS = ['PROJECT', 'EARLY_WARNING', 'RISK', 'COMPENSATION_EVENT', 'NOTICE'] as const
type Target = typeof TARGETS[number]

const router = express.Router()

// Human-readable reference for the record being discussed, used in emails
async function describeTarget(targetType: Target, targetId: string, projectName: string): Promise<string> {
  try {
    if (targetType === 'PROJECT') return projectName
    if (targetType === 'EARLY_WARNING') {
      const r = await prisma.earlyWarning.findUnique({ where: { id: targetId }, select: { ewNumber: true, title: true } })
      return r ? `${r.ewNumber} — ${r.title}` : 'Early Warning'
    }
    if (targetType === 'RISK') {
      const r = await prisma.riskItem.findUnique({ where: { id: targetId }, select: { riskId: true, description: true } })
      return r ? `${r.riskId} — ${r.description.slice(0, 60)}` : 'Risk'
    }
    if (targetType === 'COMPENSATION_EVENT') {
      const r = await prisma.compensationEvent.findUnique({ where: { id: targetId }, select: { ceNumber: true, title: true } })
      return r ? `${r.ceNumber} — ${r.title}` : 'Compensation Event'
    }
    const r = await prisma.notice.findUnique({ where: { id: targetId }, select: { noticeNumber: true, title: true } })
    return r ? `${r.noticeNumber} — ${r.title}` : 'Notice'
  } catch {
    return projectName
  }
}

// ── List the thread for one record (or the project itself) ───────────────────
router.get('/:projectId/comments', authenticate, requireProjectAccess, async (req: AuthRequest, res): Promise<void> => {
  const { targetType, targetId } = req.query
  if (!targetType || !TARGETS.includes(targetType as Target)) {
    res.status(400).json({ message: 'Invalid targetType' })
    return
  }
  try {
    const comments = await prisma.comment.findMany({
      where: {
        projectId: req.params.projectId,
        targetType: targetType as Target,
        targetId: (targetId as string) || req.params.projectId,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
    res.json(comments)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Post a comment ───────────────────────────────────────────────────────────
// Viewers are intentionally allowed to comment: the client side of a contract
// often has read-only record access but must still be able to respond.
router.post('/:projectId/comments',
  authenticate,
  requireProjectAccess,
  requireProjectRole('ADMIN', 'COMMERCIAL_MANAGER', 'VIEWER'),
  body('body').trim().notEmpty().withMessage('Comment cannot be empty').isLength({ max: 5000 }),
  body('targetType').isIn(TARGETS),
  async (req: AuthRequest, res): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return }

    const projectId = req.params.projectId
    const targetType = req.body.targetType as Target
    const targetId = req.body.targetId || projectId

    try {
      const comment = await prisma.comment.create({
        data: { projectId, targetType, targetId, body: req.body.body, authorId: req.user!.id },
        include: { author: { select: { id: true, name: true, email: true } } },
      })
      await logAudit({ userId: req.user!.id, projectId, entityType: 'Comment', entityId: comment.id, action: 'CREATE', ipAddress: req.ip })

      // Notify the rest of the project team (fire-and-forget)
      prisma.project.findUnique({
        where: { id: projectId },
        include: { members: { include: { user: { select: { id: true, email: true } } } } },
      }).then(async (project) => {
        if (!project) return
        const recipients = project.members
          .filter((m) => m.user.id !== req.user!.id)
          .map((m) => m.user.email)
        if (recipients.length === 0) return
        const on = await describeTarget(targetType, targetId, project.name)
        return sendCommentNotification({
          recipients,
          projectName: project.name,
          on,
          authorName: comment.author.name,
          body: comment.body,
        })
      }).catch(console.error)

      res.status(201).json(comment)
    } catch {
      res.status(500).json({ message: 'Server error' })
    }
  },
)

// ── Delete a comment (author or project admin) ───────────────────────────────
router.delete('/:projectId/comments/:id', authenticate, requireProjectAccess, async (req: AuthRequest, res): Promise<void> => {
  try {
    const comment = await prisma.comment.findFirst({
      where: { id: req.params.id, projectId: req.params.projectId },
    })
    if (!comment) { res.status(404).json({ message: 'Comment not found' }); return }

    const isAdmin = req.user!.role === 'ADMIN' || req.projectRole === 'ADMIN'
    if (comment.authorId !== req.user!.id && !isAdmin) {
      res.status(403).json({ message: 'You can only delete your own comments' })
      return
    }
    if (req.projectActive === false) {
      res.status(403).json({ message: 'This project has been completed and is read-only.' })
      return
    }

    await prisma.comment.delete({ where: { id: comment.id } })
    await logAudit({ userId: req.user!.id, projectId: req.params.projectId, entityType: 'Comment', entityId: comment.id, action: 'DELETE', ipAddress: req.ip })
    res.status(204).send()
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
