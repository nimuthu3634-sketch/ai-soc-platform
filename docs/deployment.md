# Deployment Guide

## Target Layout
- Frontend: Vercel
- Backend: Render web service or Railway service
- Database: hosted PostgreSQL

This project keeps the frontend and backend deployable independently. The frontend only needs the backend API base URL, and the backend only needs the allowed frontend origins plus a PostgreSQL connection string.

## Frontend on Vercel
Use the repository root as the Vercel project root so the shared workspace build can access `packages/contracts`.

Required Vercel environment variables:

```env
VITE_API_BASE_URL=https://your-api-host/api
VITE_APP_NAME=Aegis Core
VITE_LOGO_PATH=/branding/aegiscore-logo.png
VITE_PROPOSAL_COVER_REFERENCE=docs/branding/proposal-cover.png
VITE_AI_ANALYSIS_ENABLED=true
```

Project behavior is configured in `vercel.json`:
- installs dependencies with `npm ci`
- builds `@aegis-core/contracts` and `@aegis-core/web`
- publishes `apps/web/dist`
- rewrites all SPA routes to `index.html`

## Backend on Render
`render.yaml` provides a ready-to-sync backend configuration.

It configures:
- build command
- Prisma generate during build
- Prisma migrate deploy as a pre-deploy step
- start command
- readiness health check path

Required backend environment variables:

```env
NODE_ENV=production
HOST=0.0.0.0
FRONTEND_ORIGINS=https://your-vercel-domain.vercel.app
TRUST_PROXY=true
DATABASE_URL=postgresql://user:password@host:5432/aegis_core?schema=public
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=8h
JWT_ISSUER=aegis-core
LOG_LEVEL=info
AI_ANALYZER_PROVIDER=mock
AI_ALERT_THRESHOLD=80
AI_EXTERNAL_SERVICE_URL=
AI_EXTERNAL_SERVICE_API_KEY=
AI_EXTERNAL_SERVICE_TIMEOUT_MS=8000
```

Health endpoints:
- `GET /api/health`
- `GET /api/health/ready`

## Backend on Railway
Railway can deploy the same backend without an extra repo config file.

Recommended Railway settings:
- Build command: `npm ci && npm run prisma:generate -w @aegis-core/api && npm run build -w @aegis-core/contracts && npm run build -w @aegis-core/api`
- Pre-deploy command: `npm run prisma:migrate:deploy -w @aegis-core/api`
- Start command: `npm run start -w @aegis-core/api`

Use the same backend environment variables listed for Render.

## Production Migrations and Seed Data
Use migrations on every deployment:

```bash
npm run prisma:migrate:deploy
```

Use seed data only for demo or staging environments:

```bash
npm run prisma:seed
```

For a live deployment with real user data, do not re-run the demo seed script after the system is in use.

## Docker Option
Optional Docker assets are included for local full-stack hosting:
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `docker-compose.yml`

Start the containerized stack:

```bash
docker compose up --build
```

Then open:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000/api`

## Logging Strategy
The backend now emits:
- development-friendly console logs locally
- JSON-style structured logs in production
- request logs with request IDs
- structured error logs for unexpected failures and readiness issues

This keeps Render or Railway runtime logs readable while still being simple enough for a student project.
