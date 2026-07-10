import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth'
import projectRoutes from './routes/projects'
import earlyWarningRoutes from './routes/earlyWarnings'
import riskRoutes from './routes/risks'
import ceRoutes from './routes/compensationEvents'
import noticeRoutes from './routes/notices'
import dashboardRoutes from './routes/dashboard'
import reportRoutes from './routes/reports'
import excelRoutes from './routes/excel'
import invitationRoutes, { publicRouter as publicInvitationRoutes } from './routes/invitations'
import { sendOverdueNotifications } from './services/emailService'

dotenv.config()

const app = express()

// On Vercel the filesystem is read-only except /tmp; only create a local
// uploads dir when running on a traditional always-on host.
if (!process.env.VERCEL) {
  const uploadDir = path.join(__dirname, '..', 'uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
}

// Running behind a reverse proxy (Vercel/Render/Railway) — needed for
// correct client IPs in rate limiting and audit logs
app.set('trust proxy', 1)

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Global API rate limit (stricter per-endpoint limits live on the auth routes)
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))

// NOTE: uploaded documents are served through the authenticated
// /api/projects/:projectId/documents/:docId/download endpoint, never statically.

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects', earlyWarningRoutes)
app.use('/api/projects', riskRoutes)
app.use('/api/projects', ceRoutes)
app.use('/api/projects', noticeRoutes)
app.use('/api/projects', dashboardRoutes)
app.use('/api/projects', reportRoutes)
app.use('/api/projects', excelRoutes)
app.use('/api/projects', invitationRoutes)
app.use('/api/invitations', publicInvitationRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// NEC deadline clock endpoint — triggered by Vercel Cron (serverless has no
// always-on process for node-cron). Vercel Cron sends a GET with an
// Authorization: Bearer <CRON_SECRET> header when CRON_SECRET is configured.
const runOverdueCron = async (req: express.Request, res: express.Response): Promise<void> => {
  const secret = process.env.CRON_SECRET
  const provided = req.headers.authorization?.replace('Bearer ', '') || (req.query.secret as string)
  if (secret && provided !== secret) { res.status(401).json({ message: 'Unauthorized' }); return }
  try {
    await sendOverdueNotifications()
    res.json({ status: 'ok', ran: new Date().toISOString() })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Cron failed' })
  }
}
app.get('/api/cron/overdue', runOverdueCron)
app.post('/api/cron/overdue', runOverdueCron)

export default app
