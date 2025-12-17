# Deployment Guide

This document covers how to deploy **plk-regis-meet** to production. The app uses **Next.js 16 (React 19 App Router) + Tailwind CSS** for the UI layer and **Prisma** for all database access. The default datasource is SQLite (`prisma/events.db`), but the Prisma schema can be pointed at PostgreSQL/MySQL if you need multi-instance concurrency.

## 1. Prerequisites
- **Runtime**: Node.js 20 LTS (Next.js 16 requires >= 18.17; use 20 for security patches). Bun 1.1+ works if you standardize on it, but examples here use npm.
- **Package Manager**: `npm` (lockfile required). Run `npm ci`, not `npm install`, on servers for deterministic builds.
- **Database**:
  - *SQLite*: simplest, stores data in `prisma/events.db`. Make sure the file lives on persistent storage and is backed up frequently. Only one write-heavy instance should connect.
  - *Managed DB (recommended)*: Set `DATABASE_URL` to PostgreSQL/MySQL and run Prisma migrations normally. Required for horizontal scaling.
- **Process Manager**: `systemd`, PM2, or your hosting platform's supervisor to keep `npm run start` alive.
- **TLS + Domain**: Configure reverse proxy (Nginx/Traefik) or host on Vercel so the Health ID callbacks point at HTTPS URLs.

## 2. Environment Variables
Create `.env` locally and configure the same keys in your production platform.

| Name | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Prisma connection string. `file:./prisma/events.db` for SQLite or standard Postgres/MySQL URLs. |
| `JWT_SECRET` | ✅ | Secret used by `src/lib/jwt.ts` for internal token helpers. Keep random & 32+ chars. |
| `NEXTAUTH_SECRET` | ✅ | Required by NextAuth for signing session JWTs. Generate via `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | ✅ | Public origin of the app, e.g. `https://regis.example.com`. Needed for NextAuth callback URLs. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Used on client + route handlers to craft absolute URLs (poster pages, Health ID redirect). Must match production origin. |
| `HEALTH_CLIENT_ID` | ✅ | OAuth client ID issued by moph.id.th. |
| `HEALTH_CLIENT_SECRET` | ✅ | Secret for the Health ID token exchange. |
| `HEALTH_REDIRECT_URI` | ✅ | Must match the redirect registered with Health ID (usually `https://your-domain.com/api/auth/healthid`). |
| `PROVIDER_CLIENT_ID` | ✅ | Credentials for provider.id.th profile APIs. |
| `PROVIDER_CLIENT_SECRET` | ✅ | Secret for provider.id.th.
| `NODE_ENV` | ✅ | Should be `production` on the server for correct Prisma + Next behavior. |

> Tip: If you continue with SQLite, copy the actual `prisma/events.db` file to the server alongside the codebase or point `DATABASE_URL` to a location on persistent storage.

## 3. Deployment Workflow (Self-hosted VPS / Docker host)
1. **Clone & checkout** the desired Git ref. Keep `package-lock.json` in sync.
2. **Install dependencies**
   ```bash
   npm ci
   ```
3. **Generate Prisma client** (needed if the build runs on a different machine than dev):
   ```bash
   npx prisma generate
   ```
4. **Run database migrations** (only after backups):
   ```bash
   npx prisma migrate deploy
   ```
   - For first-time SQLite deployments, copy an empty `prisma/events.db` or run `npx prisma db push` once to materialize tables (less ideal for prod).
5. **Build Next.js**
   ```bash
   npm run build
   ```
6. **Start the server**
   ```bash
   NODE_ENV=production npm run start
   ```
   Wrap this command in your supervisor (PM2 `pm2 start npm --name plk-regis-meet -- run start`, or a systemd unit). Serve port 3000 behind HTTPS.

### Optional: Seed data / fixtures
- Place initial events via Prisma seed or run a custom script (see `prisma/seeds`). Execute with `ts-node prisma/seeds/events_*.cjs` after migrations if you need starting data.

## 4. Vercel Deployment
Vercel natively supports Next.js 16 and Prisma.
1. **Import repo** into Vercel and select the Next.js framework preset.
2. **Environment variables**: add all keys from Section 2 in the Vercel dashboard. For SQLite you must switch to a hosted DB because Vercel serverless file systems are ephemeral. Use Vercel Postgres, Neon, Supabase, etc., then update `DATABASE_URL`.
3. **Prisma on Vercel**:
   - Commit `prisma/migrations/**` so Vercel can run `prisma migrate deploy` during the build.
   - If using Data Proxy, add `PRISMA_CLIENT_ENGINE_TYPE='dataproxy'` and adjust `schema.prisma` datasource accordingly.
4. **Trigger deployment** (push to `main`). Vercel handles `npm install`, `npm run build`, and serves using the Edge/Node runtime.
5. **Post-deploy**: run `npx prisma migrate deploy` manually via `vercel env pull` & `vercel exec` if you disabled automatic migrations.

## 5. Smoke Tests After Deploy
- `GET /api/events` returns a JSON list without 500s.
- Health ID login flow drives users through `/api/auth/healthid` and populates `LoginLog`.
- Admin-only routes under `/admin/*` redirect unauthenticated users to the sign-in page.
- Event creation + participant registration writes to the database and the counts update on `/participants` and `/poster` pages.

## 6. Operations & Monitoring
- **Backups**: snapshot the DB daily. If on SQLite, back up the `.db` file after stopping the app; for Postgres, use `pg_dump` or managed backups.
- **Logs**: capture stdout/stderr from Next.js plus Prisma warnings. Prisma logging is set to `error,warn` in `src/lib/prisma.ts`.
- **Secrets Rotation**: rotate `PROVIDER_*` and `HEALTH_*` credentials periodically—redeploy with new env vars and restart the process.
- **Zero-downtime updates**: run `npm run build` on a staging dir, swap symlink, then restart the process manager to minimize downtime.

Following this checklist keeps the Next.js + Prisma stack production-ready regardless of the hosting platform.

## 7. Deploying behind aaPanel (port 8080)
If you host on aaPanel/Nginx and want the public site under `https://your-domain/regis`, run the Next.js server on port **8080** and let Nginx reverse-proxy the traffic.

1. **Start the app on port 8080**
   ```bash
   PORT=8080 NODE_ENV=production npm run start
   ```
   - When using PM2 via aaPanel, set the start command to the line above.
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to include the `/regis` base path, for example `https://regis.example.com/regis`.

2. **Configure aaPanel → Website → Reverse Proxy** (or edit the virtual host conf):
   ```nginx
   location /regis {
       proxy_pass http://127.0.0.1:8080;
       proxy_http_version 1.1;

       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_cache_bypass $http_upgrade;

       proxy_connect_timeout 60s;
       proxy_send_timeout 60s;
       proxy_read_timeout 60s;

       client_max_body_size 50M;
   }
   ```
   - Place the block inside the site’s server configuration in aaPanel.
   - If you expose the entire domain (no `/regis` prefix), change the `location` to `/` and align the environment URLs.

3. **Reload Nginx** from aaPanel to apply changes and confirm the Health ID callback URLs point to `https://your-domain/regis/api/auth/healthid`.
