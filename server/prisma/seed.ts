import { PrismaClient, Role, ContractType } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Seed runs at build time (Vercel) or startup (traditional hosts). Prefer the
// direct connection when available — the Supabase pooler (pgbouncer) can reject
// the prepared statements Prisma uses for one-off scripts.
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
})

// One-time rename of interim Arlonecs-branded accounts back to the Aurum
// domain, preserving passwords and project memberships (no duplicate users).
async function migrateLegacyEmails() {
  const renames: Array<[string, string]> = [
    ['admin@arlonecs.com', 'admin@aurum.com'],
    ['manager@arlonecs.com', 'manager@aurum.com'],
  ]
  for (const [oldEmail, newEmail] of renames) {
    const legacy = await prisma.user.findUnique({ where: { email: oldEmail } })
    if (!legacy) continue
    const target = await prisma.user.findUnique({ where: { email: newEmail } })
    if (target) {
      // New account already exists — retire the legacy one
      await prisma.user.update({ where: { id: legacy.id }, data: { isActive: false } })
    } else {
      await prisma.user.update({ where: { id: legacy.id }, data: { email: newEmail } })
    }
    console.log(`Migrated legacy account ${oldEmail} → ${newEmail}`)
  }
}

async function main() {
  await migrateLegacyEmails()

  const adminPassword = await bcrypt.hash('ARLOTECH', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aurum.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@aurum.com',
      password: adminPassword,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  })

  const cmPassword = await bcrypt.hash('Manager1234!', 12)
  const cm = await prisma.user.upsert({
    where: { email: 'manager@aurum.com' },
    update: {},
    create: {
      email: 'manager@aurum.com',
      password: cmPassword,
      name: 'Commercial Manager',
      role: Role.COMMERCIAL_MANAGER,
    },
  })

  const project = await prisma.project.upsert({
    where: { id: 'seed-project-001' },
    update: {},
    create: {
      id: 'seed-project-001',
      name: 'M25 Motorway Extension Phase 2',
      description: 'Major highway infrastructure project under NEC4 ECC contract',
      contractType: ContractType.NEC4,
      clientName: 'National Highways',
      contractorName: 'Aurum Civil Engineering Ltd',
      contractValue: 45000000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2026-06-30'),
      members: {
        create: [
          { userId: admin.id, role: Role.ADMIN },
          { userId: cm.id, role: Role.COMMERCIAL_MANAGER },
        ],
      },
    },
  })

  console.log('Seed complete.')
  console.log('Admin login: admin@aurum.com / ARLOTECH')
  console.log('Manager login: manager@aurum.com / Manager1234!')
  console.log('Demo project:', project.name)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
