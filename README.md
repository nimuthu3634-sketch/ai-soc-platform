# Aegis Core

AI-Integrated SOC for Automated Threat Detection and Response

## Overview

Aegis Core is a university final year project focused on building a
professional Security Operations Center platform with AI-assisted workflows.
The repository is organized as a TypeScript monorepo so the frontend, backend,
shared contracts, and deployment assets can evolve together without tight
coupling.

## Current Project Status

- Monorepo workspace with `apps/web`, `apps/api`, and `packages/contracts`
- React/Vite frontend with protected routing and branded SOC dashboard UI
- Express/TypeScript backend with JWT auth, role-aware middleware, and
  standardized API responses
- Prisma/PostgreSQL data layer for users, logs, alerts, and incidents
- Functional log, alert, incident, dashboard, and AI-analysis flows
- Deployment assets for Vercel frontend hosting and Render or Railway backend
  hosting
- Optional Docker and GitHub Actions CI setup for local full-stack runs and
  quality checks

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT
- Data fetching and caching: React Query
- Charts: Recharts
- Forms and validation: React Hook Form, Zod
- Icons: lucide-react

## Workspace Layout

```text
.
|-- apps
|   |-- api
|   `-- web
|-- docs
|   |-- ai-integration.md
|   |-- branding
|   `-- deployment.md
|-- packages
|   `-- contracts
|-- public
|   `-- branding
|-- DEPLOYMENT_CHECKLIST.md
|-- docker-compose.yml
|-- render.yaml
`-- vercel.json
```

## Branding Assets

Place the project branding assets at these exact paths:

- `docs/branding/proposal-cover.png`
- `public/branding/aegiscore-logo.png`

The frontend already references the expected logo path and falls back safely if
the runtime logo is not available yet.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment files:

   ```bash
   copy apps\\web\\.env.example apps\\web\\.env
   copy apps\\api\\.env.example apps\\api\\.env
   ```

3. Start the embedded PostgreSQL server in one terminal:

   ```bash
   npm run db:start
   ```

4. In a second terminal, generate Prisma and apply local migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev -- --name init
   ```

5. Seed demo users and SOC data:

   ```bash
   npm run prisma:seed
   ```

6. Start the frontend and backend:

   ```bash
   npm run dev
   ```

Demo credentials after seeding:

- `admin@aegiscore.local` / `Aegis123!`
- `analyst@aegiscore.local` / `Aegis123!`
- `responder@aegiscore.local` / `Aegis123!`

## Scripts

- `npm run dev` starts both applications
- `npm run dev:web` starts the Vite frontend
- `npm run dev:api` starts the Express backend
- `npm run build` builds the workspace
- `npm run lint` runs ESLint across the workspace
- `npm run typecheck` runs TypeScript checks across the workspace
- `npm run prisma:generate` generates the Prisma client for the API
- `npm run prisma:migrate:dev` runs development migrations
- `npm run prisma:migrate:deploy` runs production-safe Prisma migrations
- `npm run prisma:seed` seeds demo users and SOC records
- `npm run compose:up` starts the optional Docker full-stack setup
- `npm run compose:down` stops the Docker full-stack setup

## Required Environment Variables

### Backend

- `NODE_ENV`
- `HOST`
- `PORT`
- `FRONTEND_ORIGINS`
- `TRUST_PROXY`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_ISSUER`
- `LOG_LEVEL`
- `AI_ANALYZER_PROVIDER`
- `AI_ALERT_THRESHOLD`
- `AI_EXTERNAL_SERVICE_URL`
- `AI_EXTERNAL_SERVICE_API_KEY`
- `AI_EXTERNAL_SERVICE_TIMEOUT_MS`

Backward compatibility:

- `FRONTEND_ORIGIN` is still accepted for older local configs, but
  `FRONTEND_ORIGINS` is preferred for deployment.

### Frontend

- `VITE_API_BASE_URL`
- `VITE_APP_NAME`
- `VITE_LOGO_PATH`
- `VITE_PROPOSAL_COVER_REFERENCE`
- `VITE_AI_ANALYSIS_ENABLED`

Example production env files:

- `apps/api/.env.production.example`
- `apps/web/.env.production.example`

## Deployment Overview

The deployment model is intentionally simple:

- Frontend: Vercel serves the static React build
- Backend: Render or Railway runs the Node/Express API
- Database: hosted PostgreSQL

This separation keeps deployment flexible and makes it easy to swap backend
hosting later without changing the frontend architecture.

## Frontend Deployment on Vercel

Use the repository root as the Vercel project root so the frontend build can
access the shared `packages/contracts` workspace.

Set at least:

```env
VITE_API_BASE_URL=https://your-backend-host/api
```

Optional frontend env values:

```env
VITE_APP_NAME=Aegis Core
VITE_LOGO_PATH=/branding/aegiscore-logo.png
VITE_PROPOSAL_COVER_REFERENCE=docs/branding/proposal-cover.png
VITE_AI_ANALYSIS_ENABLED=true
```

`vercel.json` already configures:

- `npm ci`
- workspace build for contracts and frontend
- output directory `apps/web/dist`
- SPA rewrites to `index.html`

## Backend Deployment on Render

`render.yaml` is included for the API service. It configures:

- Node runtime
- workspace build
- Prisma client generation
- Prisma migrate deploy before release
- health check path `/api/health/ready`

Minimum backend env values for Render:

```env
NODE_ENV=production
HOST=0.0.0.0
FRONTEND_ORIGINS=https://your-vercel-domain.vercel.app
TRUST_PROXY=true
DATABASE_URL=postgresql://user:password@host:5432/aegis_core?schema=public
JWT_SECRET=replace-with-a-strong-secret
```

Recommended defaults:

```env
JWT_EXPIRES_IN=8h
JWT_ISSUER=aegis-core
LOG_LEVEL=info
AI_ANALYZER_PROVIDER=mock
AI_ALERT_THRESHOLD=80
AI_EXTERNAL_SERVICE_TIMEOUT_MS=8000
```

## Backend Deployment on Railway

Railway can run the same API without a separate repo config file.

Recommended Railway commands:

- Build: `npm ci && npm run prisma:generate -w @aegis-core/api && npm run build`
  `-w @aegis-core/contracts && npm run build -w @aegis-core/api`
- Pre-deploy: `npm run prisma:migrate:deploy -w @aegis-core/api`
- Start: `npm run start -w @aegis-core/api`

Use the same backend environment variables listed for Render.

## Production Database Workflow

Run migrations during deployment:

```bash
npm run prisma:migrate:deploy
```

Seed only demo, review, or staging environments:

```bash
npm run prisma:seed
```

Do not re-run the demo seed against a live environment that already contains
real user or incident data.

## Health Checks

- `GET /api/health` confirms the API process is running
- `GET /api/health/ready` confirms the API can also reach PostgreSQL

Use `/api/health/ready` as the platform health check path on Render or Railway.

## Error Logging Strategy

The backend now uses a small structured logger:

- local development logs stay readable
- production logs are emitted as structured console output
- request logs include request IDs
- unexpected backend failures and readiness-check failures are logged explicitly

This is intentionally lightweight so platform logs on Render or Railway remain
easy to inspect during demos and reviews.

## Optional Docker Setup

Optional Docker assets are included for local full-stack runs:

- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `apps/web/nginx.conf`
- `docker-compose.yml`

Run:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000/api`

## CI

A basic GitHub Actions workflow is included at `.github/workflows/ci.yml`.

It runs:

- dependency installation
- Prisma client generation
- typecheck
- lint
- build

## Additional Docs

- AI integration path: `docs/ai-integration.md`
- Deployment guide: `docs/deployment.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`

## Folder Structure

```text
apps/
  api/
    prisma/              Prisma schema, migrations, and seed script
    src/
      config/            Environment and server configuration
      features/          Feature-based route modules
      lib/               Shared backend helpers including logging
      middleware/        Express middleware
      routes/            Route composition
  web/
    src/
      app/               Router and providers
      components/        Reusable UI and branding components
      config/            Navigation and branding configuration
      features/          Feature modules and route pages
      layouts/           Application shells
      lib/               Client utilities
packages/
  contracts/
    src/                 Shared TypeScript contracts
docs/
  branding/              Proposal and presentation assets
  deployment.md          Hosting and release guidance
public/
  branding/              Runtime branding assets for the frontend
```
