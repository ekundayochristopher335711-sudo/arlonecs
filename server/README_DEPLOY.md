# Deploying the Server with Supabase Database

This repo uses an Express API server with Prisma. You can keep the backend logic unchanged while migrating the database to Supabase.

## Recommended deployment pattern
1. Create a Supabase project.
2. Use Supabase Postgres and copy the `DATABASE_URL` connection string.
3. Set the same `DATABASE_URL` in your backend host environment.
4. Keep `JWT_SECRET` and `CLIENT_URL` configured in your host environment.

## Environment variables
- `DATABASE_URL` — Supabase Postgres URL
- `JWT_SECRET` — secure JWT signing key
- `CLIENT_URL` — Vercel frontend URL, e.g. `https://aurum-app.vercel.app`
- `PORT` — optional port for your backend host

## Notes
- You do not need to change any business code for Supabase Postgres.
- The Prisma schema already uses `env("DATABASE_URL")`.
- If you deploy the backend separately, point the frontend `VITE_API_URL` to the backend URL.
