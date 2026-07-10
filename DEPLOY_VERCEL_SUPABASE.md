# Deploying Arlonecs on Vercel + Supabase (only)

This app now runs entirely on **Vercel** (frontend static site **and** the Express API as
serverless functions) with **Supabase** as the Postgres database. No separate backend host.

The frontend calls the API at the same origin under `/api`, so there is **no CORS and no
`VITE_API_URL` to set**.

---

## 1. Supabase — get two connection strings

Click the green **"Connect"** button at the top of your Supabase project. Under
**Connection string** you'll see three options — Direct connection, Transaction pooler,
Session pooler. Use the two **pooler** ones:

- **`DATABASE_URL`** — the **Transaction pooler** URL (host contains `pooler`, port **6543**).
  Append the flags exactly:
  ```
  ...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
  ```
- **`DIRECT_URL`** — the **Session pooler** URL (host contains `pooler`, port **5432**).
  Used only for migrations. Copy it as-is (no extra flags).

⚠️ Do **not** use the "Direct connection" option (`db.xxxx.supabase.co`) — it is IPv6-only
and Vercel's build servers can't reach it, so migrations would fail. The **Session pooler**
is the IPv4-friendly equivalent that works for migrations.

Replace `[YOUR-PASSWORD]` in both with your database password (Supabase → Settings →
Database → *Reset database password* if you don't have it).

## 2. Vercel — project settings (this is the key part)

In your Vercel project → **Settings → General**:

- **Root Directory** → set to the **repository root** (blank / `./`), **NOT `client`**.
  This is what was wrong before — the old setup deployed only the frontend, so there was
  no API and login could never work.
- Framework Preset → **Other** (the included `vercel.json` handles the build).

## 3. Vercel — environment variables

**Settings → Environment Variables** (add for Production + Preview):

| Name | Value |
|------|-------|
| `DATABASE_URL` | Supabase pooler URL from step 1 (with `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Supabase direct URL (port 5432) |
| `JWT_SECRET` | any long random string |
| `CLIENT_URL` | your Vercel URL, e.g. `https://arlonecs.vercel.app` (no trailing slash) |
| `CRON_SECRET` | any random string (protects the daily email job) |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | optional — for invitation / reset / deadline emails |

**Delete `VITE_API_URL` if it exists** — the frontend must use the same-origin `/api`.

## 4. Deploy

Push to the connected GitHub repo (or click **Redeploy**). On build, Vercel automatically:
- installs dependencies and generates the Prisma client,
- runs `prisma migrate deploy` against Supabase (creates all tables),
- runs the seed (creates the admin user + demo project),
- builds the frontend.

## 5. Log in

- **Email:** `admin@arlonecs.com`
- **Password:** `ARLOTECH`

(Change this password in `server/prisma/seed.ts` before real launch — it's printed in build logs.)

---

## Notes & limitations on serverless

- **File uploads** (documents attached to CEs) write to Vercel's ephemeral `/tmp` and do
  **not persist** between requests. Everything else (auth, EWs, risks, CEs, notices, PDFs,
  exports, audit) works fully. For durable document storage, move uploads to Supabase
  Storage — ask and I'll wire it up.
- The daily NEC overdue-email job runs via **Vercel Cron** (configured in `vercel.json`,
  08:00 UTC) instead of an always-on timer.
- Traditional hosting (Render/Railway/Docker) still works too — `server/src/index.ts`
  runs the same app with a real listener and in-process cron.

## Troubleshooting "Invalid credentials"

That message appears for **any** failure, including the API being unreachable. Check:
1. Root Directory is the repo root (step 2) — most common cause.
2. `DATABASE_URL` / `DIRECT_URL` are set and the build logs show "migrate deploy" + seed succeeded.
3. Open `https://<your-site>/api/health` — it should return `{"status":"ok"}`. If it 404s,
   the API isn't deploying (Root Directory wrong) . If it 500s, check DB env vars.
