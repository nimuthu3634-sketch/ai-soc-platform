# Aegis Core Codex Instructions

## Project Intent
- This repository is the foundation for `Aegis Core`, an AI-integrated SOC platform for automated threat detection and response.
- Favor maintainable scaffolding, conventions, and modular growth over rushed feature depth unless a task explicitly asks for implementation detail.

## Architecture Boundaries
- Keep the monorepo layout intact:
  - `apps/web` for the React + Vite frontend
  - `apps/api` for the Express + Prisma backend
  - `packages/contracts` for shared TypeScript-only contracts
  - `docs/` for project documentation and academic assets
  - `public/` for shared frontend branding assets served by Vite
- Use feature-based folders inside both apps. Add new module code under the existing `features/<module>` structure.
- Keep runtime imports local within each app. Shared package imports should stay type-only unless a task explicitly requires shared runtime utilities.

## Branding And UX
- Preserve the Aegis Core visual language:
  - dark platform background
  - orange accent derived from the logo
  - white/light gray text
  - polished SOC dashboard tone
- Branding references belong here:
  - `docs/branding/proposal-cover.png`
  - `public/branding/aegiscore-logo.png`
- If the image files are missing, keep the path references in code and provide graceful fallbacks instead of inventing substitute assets.

## Frontend Conventions
- Use React, TypeScript, Tailwind CSS, React Router, React Query, Recharts, React Hook Form, Zod, and `lucide-react`.
- Place pages under `apps/web/src/features/<module>/routes`.
- Reusable UI should live in `apps/web/src/components`.
- Shared client utilities belong in `apps/web/src/lib`.
- Keep pages thin. Move view data, schemas, and client helpers into nearby feature files when a feature grows.

## Backend Conventions
- Use Express + TypeScript + Prisma with PostgreSQL assumptions.
- New routes belong under `apps/api/src/features/<module>`.
- Reuse the shared API response helpers from `apps/api/src/lib/http`.
- Return the standard envelope shape:
  - success: `{ success, message, data, meta }`
  - error: `{ success, error, meta }`
- Never hardcode secrets or fallback production credentials.
- Validate environment variables with Zod before booting the server.

## Delivery Expectations
- TypeScript strictness should remain enabled.
- Add or update `.env.example` whenever introducing new environment variables.
- Keep comments sparse and only where the code needs help.
- Prefer placeholder modules, mock data, and explicit TODO boundaries over half-finished production logic.
- When adding a new module, update:
  - navigation in the frontend
  - route registration in the backend
  - `README.md` if setup changes
  - `IMPLEMENTATION_PLAN.md` if project scope or milestone ordering changes
