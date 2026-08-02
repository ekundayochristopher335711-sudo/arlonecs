import PDFDocument from 'pdfkit'
import { Response } from 'express'
import { LOGO_BASE64 } from '../assets/logoBase64'

const GOLD = '#B45309'
const NAVY = '#0F1F4B'
const MUTED = '#64748B'
const RULE = '#D8DEE9'

const LOGO = Buffer.from(LOGO_BASE64, 'base64')

type Doc = InstanceType<typeof PDFDocument>

export interface ProjectMeta {
  name: string
  clientName?: string | null
  contractorName?: string | null
  contractType?: string | null
}

// Downloads are named after the project so they file correctly off-system:
// "Extension-of-ARI-N-001.pdf"
export function fileNameFor(project: ProjectMeta | string, ref: string, ext = 'pdf'): string {
  const name = typeof project === 'string' ? project : project.name
  const safe = (name || 'Project')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return `${safe}-${ref}.${ext}`
}

const asMeta = (p: ProjectMeta | string): ProjectMeta => (typeof p === 'string' ? { name: p } : p)

// Company letterhead: logo left, PROJECT NAME as the document heading.
// Returns the y position where body content should begin.
function addLetterhead(doc: Doc, project: ProjectMeta): number {
  const left = 40
  const right = doc.page.width - 40

  try {
    doc.image(LOGO, left, 34, { fit: [52, 52] })
  } catch {
    // A missing/corrupt logo must never break a contractual document
  }

  const textX = left + 64
  doc.font('Helvetica-Bold').fontSize(17).fillColor(NAVY)
    .text((project.name || 'Project').toUpperCase(), textX, 40, { width: right - textX - 10, lineBreak: false })

  const meta = [
    project.clientName ? `Client: ${project.clientName}` : null,
    project.contractorName ? `Contractor: ${project.contractorName}` : null,
    project.contractType ? `${project.contractType} Contract` : null,
  ].filter(Boolean).join('   ·   ')

  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
    .text(meta || 'Project Controls Document', textX, 62, { width: right - textX - 10, lineBreak: false })

  // Double rule — the traditional letterhead divider
  doc.moveTo(left, 94).lineTo(right, 94).lineWidth(2).strokeColor(NAVY).stroke()
  doc.moveTo(left, 98).lineTo(right, 98).lineWidth(0.75).strokeColor(GOLD).stroke()
  doc.lineWidth(1)

  return 116
}

// Formal, centred document title — bold and letter-spaced like a legal notice
function addDocumentTitle(doc: Doc, title: string, reference?: string, y?: number): number {
  const top = y ?? doc.y
  doc.font('Helvetica-Bold').fontSize(15).fillColor(NAVY)
    .text(title.toUpperCase(), 40, top, { width: doc.page.width - 80, align: 'center', characterSpacing: 1.6 })

  let next = doc.y + 4
  if (reference) {
    doc.font('Helvetica').fontSize(9.5).fillColor(MUTED)
      .text(reference, 40, next, { width: doc.page.width - 80, align: 'center' })
    next = doc.y + 4
  }
  doc.moveTo(doc.page.width / 2 - 40, next + 4).lineTo(doc.page.width / 2 + 40, next + 4)
    .lineWidth(1.5).strokeColor(GOLD).stroke()
  doc.lineWidth(1)
  return next + 20
}

function addFooter(doc: Doc, project: ProjectMeta, reference: string, pageNum = 1) {
  const y = doc.page.height - 46
  doc.moveTo(40, y - 8).lineTo(doc.page.width - 40, y - 8).lineWidth(0.5).strokeColor(RULE).stroke()
  doc.lineWidth(1)
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
    .text(`${project.name}  |  ${reference}  |  Generated ${new Date().toLocaleString('en-GB')}  |  CONFIDENTIAL`, 40, y, {
      width: doc.page.width - 80,
    })
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTED)
    .text(`Page ${pageNum}`, doc.page.width - 90, y, { width: 50, align: 'right' })
}

// Section heading: a bold label above a hairline rule (formal, not a colour bar)
function sectionTitle(doc: Doc, text: string) {
  const y = doc.y
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(NAVY)
    .text(text.toUpperCase(), 40, y, { characterSpacing: 0.6 })
  const ruleY = doc.y + 3
  doc.moveTo(40, ruleY).lineTo(doc.page.width - 40, ruleY).lineWidth(0.75).strokeColor(RULE).stroke()
  doc.lineWidth(1)
  doc.y = ruleY + 10
  doc.fillColor(NAVY)
}

// Aligned label/value pairs — reads like a formal record, not a form dump
function fieldTable(doc: Doc, fields: Array<[string, string]>) {
  const labelW = 125
  fields.forEach(([label, value]) => {
    const y = doc.y
    doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(label, 40, y, { width: labelW })
    doc.font('Helvetica-Bold').fontSize(9).fillColor(NAVY)
      .text(value || '—', 40 + labelW, y, { width: doc.page.width - 80 - labelW })
    doc.y = Math.max(doc.y, y + 14)
    doc.moveDown(0.15)
  })
  doc.font('Helvetica')
}

function tableRow(doc: Doc, cols: string[], widths: number[], isHeader = false, y?: number) {
  const startY = y ?? doc.y
  let x = 40
  if (isHeader) doc.rect(40, startY, widths.reduce((a, b) => a + b, 0), 18).fill('#EEF2F7')
  cols.forEach((col, i) => {
    doc
      .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(isHeader ? 8.5 : 8)
      .fillColor(isHeader ? NAVY : '#334155')
      .text(col, x + 4, startY + 5, { width: widths[i] - 8, lineBreak: false })
    x += widths[i]
  })
  doc.moveTo(40, startY + 20).lineTo(40 + widths.reduce((a, b) => a + b, 0), startY + 20)
    .lineWidth(0.5).strokeColor(RULE).stroke()
  doc.lineWidth(1)
  doc.y = startY + 22
  doc.font('Helvetica')
}

// Signature block — what makes a notice read as a served contractual document
function signatureBlock(doc: Doc) {
  doc.moveDown(1.5)
  sectionTitle(doc, 'Acknowledgement of Receipt')
  const y = doc.y + 16
  const colW = (doc.page.width - 80 - 30) / 3
  const labels = ['Signed', 'Name & Position', 'Date']
  labels.forEach((label, i) => {
    const x = 40 + i * (colW + 15)
    doc.moveTo(x, y).lineTo(x + colW, y).lineWidth(0.75).strokeColor('#94A3B8').stroke()
    doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label, x, y + 5, { width: colW })
  })
  doc.lineWidth(1)
  doc.y = y + 24
}

export function generateEarlyWarningPDF(
  res: Response,
  ew: Record<string, unknown>,
  project: ProjectMeta | string,
) {
  const meta = asMeta(project)
  const ref = String(ew['ewNumber'] ?? 'EW')
  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameFor(meta, ref)}"`)
  doc.pipe(res)

  const top = addLetterhead(doc, meta)
  doc.y = addDocumentTitle(doc, 'Early Warning Notice', `Notice Reference: ${ref}  ·  NEC Clause 15.1`, top)

  sectionTitle(doc, 'Particulars')
  fieldTable(doc, [
    ['Early Warning No.', ref],
    ['Subject', String(ew['title'] ?? '')],
    ['Status', String(ew['status'] ?? '')],
    ['Date Raised', ew['dateRaised'] ? new Date(ew['dateRaised'] as string).toLocaleDateString('en-GB') : ''],
    ['Date Required By', ew['dateRequired'] ? new Date(ew['dateRequired'] as string).toLocaleDateString('en-GB') : 'Not specified'],
    ['Raised By', String(ew['raisedBy'] ?? '')],
    ['Assigned To', String(ew['assignedTo'] ?? 'Unassigned')],
  ])

  doc.moveDown(1)
  sectionTitle(doc, 'Description of the Matter')
  doc.font('Helvetica').fontSize(9.5).fillColor(NAVY)
    .text(String(ew['description'] ?? ''), 40, doc.y, { width: doc.page.width - 80, lineGap: 4, align: 'justify' })

  doc.moveDown(1.5)
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(MUTED)
    .text('This Early Warning is given under the contract and forms part of the project record. Recipients should attend the next early warning meeting where this matter will be considered.',
      40, doc.y, { width: doc.page.width - 80, lineGap: 2 })

  signatureBlock(doc)
  addFooter(doc, meta, ref)
  doc.end()
}

const NOTICE_TYPE_LABELS: Record<string, string> = {
  EARLY_WARNING: 'Early Warning Notice',
  COMPENSATION_EVENT: 'Compensation Event Notice',
  INSTRUCTION: 'Project Manager’s Instruction',
  ACCEPTANCE: 'Notice of Acceptance',
  REJECTION: 'Notice of Rejection',
  QUOTATION: 'Quotation',
  ASSESSMENT: 'Assessment',
  GENERAL: 'General Notice',
}

export function generateNoticePDF(
  res: Response,
  notice: Record<string, unknown>,
  project: ProjectMeta | string,
) {
  const meta = asMeta(project)
  const typeLabel = NOTICE_TYPE_LABELS[String(notice['type'])] ?? 'Notice'
  const ref = String(notice['noticeNumber'] ?? 'Notice')
  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameFor(meta, ref)}"`)
  doc.pipe(res)

  const top = addLetterhead(doc, meta)
  doc.y = addDocumentTitle(doc, typeLabel, `Notice Reference: ${ref}`, top)

  const ce = notice['ce'] as Record<string, unknown> | null
  sectionTitle(doc, 'Particulars')
  fieldTable(doc, [
    ['Notice Number', ref],
    ['Notice Type', typeLabel],
    ['Subject', String(notice['title'] ?? '')],
    ['Issued By', String(notice['issuedBy'] ?? '')],
    ['Issued To', String(notice['issuedTo'] ?? '')],
    ['Date Issued', notice['dateIssued'] ? new Date(notice['dateIssued'] as string).toLocaleDateString('en-GB') : ''],
    ['Response Due', notice['dueDate'] ? new Date(notice['dueDate'] as string).toLocaleDateString('en-GB') : 'Not specified'],
    ['Related Compensation Event', ce ? `${ce['ceNumber']} — ${ce['title']}` : 'None'],
  ])

  doc.moveDown(1)
  sectionTitle(doc, 'Notice')
  doc.font('Helvetica').fontSize(9.5).fillColor(NAVY)
    .text(String(notice['content'] ?? ''), 40, doc.y, { width: doc.page.width - 80, lineGap: 4, align: 'justify' })

  doc.moveDown(1.5)
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(MUTED)
    .text('This notice is issued under the contract and forms part of the project’s contractual record.',
      40, doc.y, { width: doc.page.width - 80 })

  signatureBlock(doc)
  addFooter(doc, meta, ref)
  doc.end()
}

export function generateRiskRegisterPDF(
  res: Response,
  risks: Record<string, unknown>[],
  project: ProjectMeta | string,
) {
  const meta = asMeta(project)
  const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameFor(meta, 'Risk-Register')}"`)
  doc.pipe(res)

  const top = addLetterhead(doc, meta)
  doc.y = addDocumentTitle(doc, 'Risk Register', `${risks.length} item(s)  ·  ${new Date().toLocaleDateString('en-GB')}`, top)

  const cols = ['Risk ID', 'Description', 'Prob', 'Cost (£)', 'Time (d)', 'Status', 'Owner']
  const widths = [70, 250, 45, 80, 60, 75, 100]
  tableRow(doc, cols, widths, true)

  risks.forEach((r) => {
    const costRaw = r['costImpact']
    const cost = typeof costRaw === 'number' ? costRaw.toLocaleString('en-GB') : 'N/A'
    tableRow(doc, [
      String(r['riskId'] ?? ''),
      String(r['description'] ?? '').substring(0, 80),
      String(r['probability'] ?? ''),
      cost,
      r['timeImpact'] != null ? String(r['timeImpact']) : 'N/A',
      String(r['status'] ?? ''),
      String(r['owner'] ?? 'TBC'),
    ], widths)
    if (doc.y > doc.page.height - 80) {
      doc.addPage()
      doc.y = addLetterhead(doc, meta)
    }
  })

  addFooter(doc, meta, 'Risk Register')
  doc.end()
}

export function generateCESummaryPDF(
  res: Response,
  ces: Record<string, unknown>[],
  project: ProjectMeta | string,
) {
  const meta = asMeta(project)
  const doc = new PDFDocument({ size: 'A4', margin: 40, layout: 'landscape' })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameFor(meta, 'CE-Summary')}"`)
  doc.pipe(res)

  const total = ces.reduce((sum, ce) => {
    const v = ce['valuationAmount']
    return sum + (typeof v === 'number' ? v : 0)
  }, 0)

  const top = addLetterhead(doc, meta)
  doc.y = addDocumentTitle(doc, 'Compensation Event Summary',
    `${ces.length} event(s)  ·  Total valuation £${total.toLocaleString('en-GB')}`, top)

  const cols = ['CE No.', 'Title', 'Clause', 'Date Notified', 'Due Date', 'Valuation (£)', 'Status']
  const widths = [60, 220, 60, 90, 90, 100, 90]
  tableRow(doc, cols, widths, true)

  ces.forEach((ce) => {
    const val = ce['valuationAmount']
    tableRow(doc, [
      String(ce['ceNumber'] ?? ''),
      String(ce['title'] ?? '').substring(0, 50),
      String(ce['clauseRef'] ?? 'N/A'),
      ce['dateNotified'] ? new Date(ce['dateNotified'] as string).toLocaleDateString('en-GB') : '',
      ce['dateResponseDue'] ? new Date(ce['dateResponseDue'] as string).toLocaleDateString('en-GB') : 'N/A',
      typeof val === 'number' ? val.toLocaleString('en-GB') : 'TBD',
      String(ce['status'] ?? ''),
    ], widths)
    if (doc.y > doc.page.height - 80) {
      doc.addPage()
      doc.y = addLetterhead(doc, meta)
    }
  })

  addFooter(doc, meta, 'CE Summary')
  doc.end()
}

export function generateCommercialDashboardPDF(
  res: Response,
  data: {
    projectName: string
    project?: ProjectMeta
    openEWs: number
    openRisks: number
    openCEs: number
    totalCEValue: number
    riskExposure: number
    overdueItems: number
    cesByStatus: { status: string; count: number }[]
  },
) {
  const meta = data.project ?? { name: data.projectName }
  const doc = new PDFDocument({ size: 'A4', margin: 40 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileNameFor(meta, 'Commercial-Report')}"`)
  doc.pipe(res)

  const top = addLetterhead(doc, meta)
  doc.y = addDocumentTitle(doc, 'Commercial Report',
    `Reporting date: ${new Date().toLocaleDateString('en-GB')}`, top)

  sectionTitle(doc, 'Key Performance Indicators')
  const kpis = [
    ['Open Early Warnings', String(data.openEWs)],
    ['Open Risk Items', String(data.openRisks)],
    ['Open Compensation Events', String(data.openCEs)],
    ['Total CE Valuation', `£${data.totalCEValue.toLocaleString('en-GB')}`],
    ['Risk Exposure (Cost)', `£${data.riskExposure.toLocaleString('en-GB')}`],
    ['Overdue Items', String(data.overdueItems)],
  ]

  const cols = 2
  const kpiWidth = (doc.page.width - 80) / cols
  let rowTop = doc.y
  kpis.forEach(([label, value], i) => {
    const x = 40 + (i % cols) * kpiWidth
    doc.rect(x + 3, rowTop, kpiWidth - 6, 48).fillAndStroke('#F8FAFC', RULE)
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(label, x + 12, rowTop + 9, { width: kpiWidth - 24 })
    doc.font('Helvetica-Bold').fontSize(16).fillColor(NAVY).text(value, x + 12, rowTop + 23, { width: kpiWidth - 24 })
    if (i % cols === cols - 1) rowTop += 56
  })
  doc.y = rowTop + 10
  doc.font('Helvetica')

  doc.moveDown(1)
  sectionTitle(doc, 'Compensation Events by Status')
  const statusWidths = [200, 100]
  tableRow(doc, ['Status', 'Count'], statusWidths, true)
  data.cesByStatus.forEach((row) => tableRow(doc, [row.status, String(row.count)], statusWidths))

  addFooter(doc, meta, 'Commercial Report')
  doc.end()
}
