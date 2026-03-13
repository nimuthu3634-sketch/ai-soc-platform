# Aegis Core Deployment Checklist

## Before Deploying
- Confirm the frontend production URL and backend production URL.
- Provision a hosted PostgreSQL database and copy its connection string.
- Generate a strong `JWT_SECRET` with at least 16 characters.
- Add the real branding asset at `public/branding/aegiscore-logo.png`.
- Decide whether AI runs in `mock` mode or via an external HTTP service.

## Frontend
- Set `VITE_API_BASE_URL` to the deployed backend API URL ending with `/api`.
- Set the Vercel project root to the repository root when using `vercel.json`.
- Verify the deployed frontend can load, log in, and refresh deep-linked routes.

## Backend
- Set `NODE_ENV=production`.
- Set `HOST=0.0.0.0`.
- Set `FRONTEND_ORIGINS` to the exact allowed frontend origins.
- Set `TRUST_PROXY=true` on Render or Railway.
- Set `DATABASE_URL`, `JWT_SECRET`, and any AI provider variables.
- Confirm the health check path is `/api/health/ready`.

## Database
- Run `npm run prisma:migrate:deploy` before serving traffic.
- Seed only demo or staging environments with `npm run prisma:seed`.
- Do not reseed a production database that already contains real records.

## Validation
- Open the Vercel frontend and verify login works against the hosted API.
- Verify `GET /api/health` returns `200`.
- Verify `GET /api/health/ready` returns `200`.
- Create a user or log in with a seeded demo user in non-production environments.
- Verify dashboard, logs, alerts, incidents, and AI analysis are reachable.

## Post-Deploy
- Add the production frontend URL to backend CORS allow-list updates.
- Keep secrets in the hosting provider dashboard, not in the repository.
- Review logs for startup errors, migration failures, or blocked CORS origins.
