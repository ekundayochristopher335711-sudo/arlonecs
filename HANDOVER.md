# Aurum Project Controls — Client Handover Checklist

Follow these in order. Steps 1–4 must be done in sequence, because the wipe
deletes the admin account and the redeploy is what recreates it.

---

## 1. Choose the admin credentials (Vercel → Settings → Environment Variables)

| Name | Value |
|------|-------|
| `SEED_ADMIN_EMAIL` | the address the client will log in with, e.g. `admin@aurum.com` |
| `SEED_ADMIN_PASSWORD` | a strong password you choose — **not** the old `ARLOTECH` |

The seed creates this account only if it does not already exist, and **never
overwrites the password afterwards** — so once the client changes their
password, it survives every future deploy.

Leave `SEED_DEMO` unset. Demo data is now opt-in; without it the platform stays
clean forever.

## 2. Wipe the database (Supabase → SQL Editor)

Open `server/scripts/wipe-database.sql`, paste it into a new query, and Run.
Everything is deleted: projects, compensation events, early warnings, risks,
notices, documents, invitations, audit history and all user accounts.

The verification query at the bottom should return `0` for every row.

## 3. Redeploy (Vercel → Deployments → ⋯ → Redeploy)

This runs the seed, which recreates the single admin account using the
credentials from step 1. Nothing else is created.

## 4. Sign in and confirm

Log in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. You should see an empty
Projects page and, under User Management, exactly one account: yours.

---

## Renaming the deployment to Aurum

Vercel → Settings → General → **Project Name** → rename (this changes the
`*.vercel.app` address). Then, critically:

> **Update `CLIENT_URL` to the new address** (Settings → Environment Variables),
> with no trailing slash, and redeploy.

`CLIENT_URL` is what invitation and password-reset emails put in their links. If
it still points at the old address, every emailed link will break.

When a custom domain is purchased, add it under Settings → Domains and set
`CLIENT_URL` to that instead.

## Replacing the logo

Save the client's PNG as **`client/public/logo.png`** (square works best, at
least 256×256, transparent background). The app references `/logo.svg` today;
once the PNG is in place the references are switched to `/logo.png` and the
favicon regenerated from it.

## Email deliverability

Emails currently send from a personal Gmail account, so first-time recipients
often find them in Spam. Once a custom domain exists, move to a transactional
provider (Resend or Brevo — both free at this volume) and set `SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` to their values. No code changes needed.

## Still outstanding

- **Billing** — no payment flow exists yet (Stripe).
- **Automated tests** — none; changes are verified manually.
- **Multi-company projects** — every project team is currently one shared list,
  not separate client/contractor/subcontractor organisations.
