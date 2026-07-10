import { execSync } from 'child_process'

// Defends against the most common Vercel env-var paste mistakes: a value
// accidentally wrapped in quotes, or with stray leading/trailing whitespace or
// newlines. Prisma reads these vars directly, so we sanitise them here before
// running migrations + seed.
function clean(v?: string): string | undefined {
  if (!v) return v
  return v.trim().replace(/^["'\s]+/, '').replace(/["'\s]+$/, '')
}

const env = { ...process.env }
if (env.DATABASE_URL) env.DATABASE_URL = clean(env.DATABASE_URL)
if (env.DIRECT_URL) env.DIRECT_URL = clean(env.DIRECT_URL)

// Helpful, non-sensitive diagnostics (never prints the password)
function describe(label: string, url?: string) {
  if (!url) { console.log(`${label}: (not set)`); return }
  try {
    const u = new URL(url)
    console.log(`${label}: host=${u.hostname} port=${u.port} db=${u.pathname.replace('/', '')} user=${u.username.split('.')[0]}.***`)
  } catch {
    console.log(`${label}: (unparseable — check for quotes or missing parts)`)
  }
}
describe('DATABASE_URL', env.DATABASE_URL)
describe('DIRECT_URL', env.DIRECT_URL)

const run = (cmd: string) => execSync(cmd, { stdio: 'inherit', env })

run('npx prisma generate')
run('npx prisma migrate deploy')
run('npx tsx prisma/seed.ts')
