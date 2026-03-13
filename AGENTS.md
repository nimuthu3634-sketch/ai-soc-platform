# Aegis Core Codex Instructions

## Project Purpose
- `Aegis Core` is a final-year academic demo of an AI-assisted Security Operations Center platform for threat detection, triage, incident response, and reporting.
- Prioritize maintainable, presentation-ready workflows and clean scaffolding over rushed feature depth or speculative complexity.

## Architecture Summary
- Keep the monorepo shape intact:
  - `apps/web`: React + Vite frontend
  - `apps/api`: Express + Prisma backend
  - `packages/contracts`: shared TypeScript contracts and domain types
  - `docs/`: academic, deployment, and branding documentation
  - `public/`: runtime frontend assets such as branding
- Frontend code is feature-based. Backend code is feature-based with route composition centralized in `apps/api/src/routes/index.ts`.
- Shared types belong in `packages/contracts`. Prefer type-only imports from that package unless a task explicitly justifies shared runtime code.

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router, React Query, React Hook Form, Zod, Recharts, `lucide-react`
- Backend: Node.js 20+, Express, TypeScript, Prisma, PostgreSQL, JWT, Zod
- Quality tooling: ESLint, Prettier, strict TypeScript, GitHub Actions CI

## Coding Conventions
- Keep TypeScript strict and preserve the existing formatting rules: 2 spaces, LF endings, single quotes, semicolons, trailing commas, and ordered imports.
- Use the `@/` alias inside `apps/web/src`. Keep backend imports explicit and local to the app.
- Reuse existing helpers before creating new patterns:
  - frontend API client: `apps/web/src/lib/api/client.ts`
  - backend HTTP helpers: `apps/api/src/lib/http`
  - backend auth/logger/middleware: `apps/api/src/lib` and `apps/api/src/middleware`
- Keep routes, controllers, and pages thin where practical. Put schemas, formatters, hooks, data mappers, and feature helpers next to the feature they support.
- Match the current domain vocabulary and module names: auth, dashboard, logs, alerts, incidents, AI, reports, settings.

## UI And Branding Rules
- Preserve the Aegis Core visual language: dark SOC background, orange accent derived from the logo, white/light slate text, and a polished operations-dashboard feel.
- Reuse the existing design tokens and utilities in `apps/web/src/index.css`, `apps/web/src/config/branding.ts`, and `apps/web/tailwind.config.ts`.
- Keep the established typography direction: `Chakra Petch` for display, `Manrope` for UI text, and `IBM Plex Mono` for technical labels.
- Maintain stable branding references:
  - `public/branding/aegiscore-logo.png`
  - `docs/branding/proposal-cover.png`
- If branding assets are missing, keep the path references and preserve graceful fallbacks instead of inventing substitutes.
- Preserve academic demo quality: believable SOC data, clear empty/error states, concise professional copy, and explainable AI wording instead of hype.

## API Response Conventions
- Use the shared helpers in `apps/api/src/lib/http/response.ts`.
- Success responses must follow `{ success, message, data, meta }`.
- Error responses must follow `{ success, error, meta }`.
- Preserve `meta` behavior, including timestamps and request IDs.
- Validate request input with Zod schemas and `validateRequest`. Keep environment validation in `apps/api/src/config/env.ts`.
- Use centralized error handling and `AppError` for expected failures instead of ad-hoc response shapes.

## Folder Structure Expectations
- Frontend pages belong in `apps/web/src/features/<module>/routes`.
- Frontend reusable UI belongs in `apps/web/src/components`.
- Frontend shared utilities belong in `apps/web/src/lib`.
- Backend modules belong in `apps/api/src/features/<module>` and should follow the current `*.routes.ts` plus nearby `controllers`, `services`, and `schemas` pattern where needed.
- When adding or expanding a module, update the relevant frontend navigation/router, backend route registration, shared contracts, and docs if setup or scope changes.
- If environment variables change, update the matching app examples such as `apps/api/.env.example`, `apps/api/.env.production.example`, `apps/web/.env.example`, and `apps/web/.env.production.example`.

## Testing Expectations
- There is no dedicated automated test suite yet, so do not pretend coverage exists.
- For major changes, always run the relevant checks from the repo root at minimum:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- If Prisma schema or seed behavior changes, also run the relevant database commands such as `npm run prisma:generate` and the appropriate migration or seed command.
- For user-facing workflows, do a quick manual smoke check of the affected screens or endpoints and report any verification gaps.

## Safe Refactor Rules
- Preserve API contracts, route paths, shared contract names, seeded demo flows, env variable names, and branding references unless the task explicitly requires a breaking change.
- Prefer incremental refactors over broad rewrites. Update registrations, imports, and dependent types together.
- Avoid moving runtime logic into `packages/contracts` unless it is intentionally becoming a shared package concern.
- Do not leave half-finished placeholders, dead navigation, broken demo paths, or inconsistent copy behind.

## Readability And Demo Quality
- Optimize for readable, explainable code: focused functions, explicit types, sparse comments, and minimal abstraction.
- Keep the repository defensible for academic review: coherent architecture, polished UI states, realistic sample data, and a stable end-to-end demo narrative.
