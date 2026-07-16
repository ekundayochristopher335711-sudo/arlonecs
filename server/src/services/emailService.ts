import nodemailer from 'nodemailer'
import prisma from '../config/database'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const emailConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)

const FROM = () => `"Aurum Project Controls" <${process.env.SMTP_USER}>`

function shell(inner: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#080F1C;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="color:#FFFFFF;margin:0;font-size:18px">Aurum Project Controls</h2>
        <p style="color:#FBBF24;margin:4px 0 0;font-size:12px">NEC Contract Workflow Engine</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 8px 8px">
        ${inner}
      </div>
    </div>`
}

// Daily NEC deadline clock: alerts for CEs already overdue AND CEs due within 3 days
export async function sendOverdueNotifications() {
  if (!emailConfigured()) return

  const now = new Date()
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const dueCEs = await prisma.compensationEvent.findMany({
    where: {
      status: { not: 'CLOSED' },
      OR: [
        { dateResponseDue: { lt: soon } },
        // cl. 62.3 quotation clock — runs while the CE awaits a quotation
        { status: 'NOTIFIED', dateQuotationDue: { lt: soon } },
      ],
    },
    include: {
      project: { select: { name: true } },
    },
  })

  if (dueCEs.length === 0) return

  const projects = await prisma.project.findMany({
    where: { id: { in: [...new Set(dueCEs.map((ce) => ce.projectId))] } },
    include: { members: { include: { user: { select: { email: true, name: true } } } } },
  })

  for (const project of projects) {
    const projectCEs = dueCEs.filter((ce) => ce.projectId === project.id)
    const overdue = projectCEs.filter((ce) => ce.dateResponseDue && ce.dateResponseDue < now && ce.dateResponseDue < soon)
    const dueSoon = projectCEs.filter((ce) => ce.dateResponseDue && ce.dateResponseDue >= now && ce.dateResponseDue < soon)
    const quotationDue = projectCEs.filter((ce) => ce.status === 'NOTIFIED' && ce.dateQuotationDue && ce.dateQuotationDue < soon)
    const recipients = project.members
      .filter((m) => m.role !== 'VIEWER')
      .map((m) => m.user.email)

    if (recipients.length === 0) continue

    const rows = (list: typeof projectCEs, color: string, dateOf: (ce: typeof projectCEs[number]) => Date | null) => list.map((ce) => `
      <tr>
        <td style="padding:8px;border:1px solid #E2E8F0;font-size:12px;font-weight:bold">${ce.ceNumber}</td>
        <td style="padding:8px;border:1px solid #E2E8F0;font-size:12px">${ce.title}</td>
        <td style="padding:8px;border:1px solid #E2E8F0;font-size:12px;color:${color}">${dateOf(ce)?.toLocaleDateString('en-GB')}</td>
        <td style="padding:8px;border:1px solid #E2E8F0;font-size:12px">${ce.status}</td>
      </tr>`).join('')

    const table = (title: string, list: typeof projectCEs, color: string, dateOf: (ce: typeof projectCEs[number]) => Date | null = (ce) => ce.dateResponseDue) => list.length === 0 ? '' : `
      <h3 style="color:#0F172A;margin-top:16px">${title}</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#F8FAFC">
          <th style="padding:8px;text-align:left;border:1px solid #E2E8F0;font-size:12px">CE No.</th>
          <th style="padding:8px;text-align:left;border:1px solid #E2E8F0;font-size:12px">Title</th>
          <th style="padding:8px;text-align:left;border:1px solid #E2E8F0;font-size:12px">Due Date</th>
          <th style="padding:8px;text-align:left;border:1px solid #E2E8F0;font-size:12px">Status</th>
        </tr>
        ${rows(list, color, dateOf)}
      </table>`

    await transporter.sendMail({
      from: FROM(),
      to: recipients.join(', '),
      subject: `[ACTION REQUIRED] ${overdue.length} overdue / ${dueSoon.length + quotationDue.length} due soon — ${project.name}`,
      html: shell(`
        ${table(`⚠️ Overdue Compensation Events — ${project.name}`, overdue, '#DC2626')}
        ${table('⏳ Response due within 3 days', dueSoon, '#D97706')}
        ${table('📋 Quotation due (NEC cl. 62.3)', quotationDue, '#B45309', (ce) => ce.dateQuotationDue)}
        <p style="margin-top:20px"><a href="${process.env.CLIENT_URL}" style="background:#B45309;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">Open Aurum Project Controls</a></p>
      `),
    })
  }
}

export async function sendCEStatusChangeNotification(
  ceNumber: string,
  ceTitle: string,
  projectName: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string,
  recipientEmails: string[],
) {
  if (!emailConfigured() || recipientEmails.length === 0) return

  await transporter.sendMail({
    from: FROM(),
    to: recipientEmails.join(', '),
    subject: `CE Status Update: ${ceNumber} → ${newStatus} — ${projectName}`,
    html: shell(`
      <h3>${ceNumber} status updated</h3>
      <p><strong>Project:</strong> ${projectName}</p>
      <p><strong>CE:</strong> ${ceTitle}</p>
      <p><strong>Status change:</strong> <span style="color:#64748B">${oldStatus}</span> → <span style="color:#16A34A;font-weight:bold">${newStatus}</span></p>
      <p><strong>Changed by:</strong> ${changedBy}</p>
    `),
  })
}

export async function sendInvitationEmail(
  email: string,
  inviterName: string,
  projectName: string,
  role: string,
  inviteUrl: string,
) {
  if (!emailConfigured()) return

  await transporter.sendMail({
    from: FROM(),
    to: email,
    subject: `You've been invited to ${projectName} — Aurum Project Controls`,
    html: shell(`
      <h3 style="color:#080F1C;font-size:20px;margin:0 0 8px">You're invited</h3>
      <p style="color:#6B7280;margin:0 0 24px;font-size:14px">
        <strong>${inviterName}</strong> has invited you to join
        <strong>${projectName}</strong> as a <strong>${role.replace('_', ' ')}</strong>.
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#B45309" style="border-radius:8px"><a href="${inviteUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#FFFFFF;text-decoration:none">Accept Invitation</a></td></tr></table>
      <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0">
        This invitation expires in 7 days. If you weren't expecting this, you can ignore this email.
      </p>
      <p style="color:#D1D5DB;font-size:11px;margin:8px 0 0">
        Or copy this link: ${inviteUrl}
      </p>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  if (!emailConfigured()) return

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`
  await transporter.sendMail({
    from: FROM(),
    to: email,
    subject: 'Reset your password — Aurum Project Controls',
    html: shell(`
      <h3 style="color:#080F1C;font-size:20px;margin:0 0 8px">Password reset</h3>
      <p style="color:#6B7280;margin:0 0 24px;font-size:14px">
        Hi ${name}, we received a request to reset your password. This link expires in 1 hour.
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#B45309" style="border-radius:8px"><a href="${resetUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#FFFFFF;text-decoration:none">Reset Password</a></td></tr></table>
      <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0">
        If you didn't request this, you can safely ignore this email — your password will not change.
      </p>
      <p style="color:#D1D5DB;font-size:11px;margin:8px 0 0">
        Or copy this link: ${resetUrl}
      </p>
    `),
  })
}
