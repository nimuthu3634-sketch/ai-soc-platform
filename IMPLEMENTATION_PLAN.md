# Aegis Core Implementation Plan

## Current Objective
Reach a reliable `~25%` project completion baseline by next week. That means the stack, project conventions, navigation shell, backend API skeleton, database schema draft, and documentation are all ready for feature work without rework.
Status: Achieved in the current repository state with real auth, protected routes, local PostgreSQL workflow, and seeded SOC demo data.

## Phase 1: Foundation And Delivery Baseline (0% -> 25%)
Status: In progress with this scaffold.

Scope:
- Monorepo structure with frontend, backend, and shared contracts
- Branding-aware frontend shell and placeholder module routes
- Express API skeleton with response conventions and error handling
- Initial Prisma schema draft for core SOC entities
- Environment examples, linting, formatting, and documentation

Acceptance criteria:
- Team can clone the repo, install dependencies, configure env files, and start both apps locally
- Navigation and module placeholders exist for all planned features
- API has versioned placeholder endpoints for each module
- Prisma schema models the main SOC domain concepts at a high level

## Phase 2: Authentication And User Management (25% -> 45%)
Primary goal:
Implement secure login, user roles, profile management, and protected routes.

Work items:
- JWT-based login and refresh strategy
- Password hashing and seed admin flow
- Frontend auth state, route guards, and session persistence
- Role-aware navigation for admin, analyst, and responder views

Definition of done:
- Auth flow works end to end against PostgreSQL
- Protected pages redirect correctly
- Basic profile and user listing pages are functional

## Phase 3: SOC Monitoring Core (45% -> 65%)
Primary goal:
Deliver the operational center of the platform.

Work items:
- Dashboard metrics from live backend endpoints
- Log ingestion model and searchable log management views
- Alert lifecycle: new, acknowledged, escalated, resolved
- Filtering, severity badges, and trend visualizations

Definition of done:
- Demo data can move through log to alert workflows
- Dashboard reflects real backend state
- Analysts can inspect and update alerts through the UI

## Phase 4: Incident And Reporting Workflows (65% -> 85%)
Primary goal:
Connect alerts to response coordination and reporting.

Work items:
- Incident creation and assignment from alerts
- Incident status workflow and timeline notes
- Report generation templates and export-ready summaries
- Settings screens for organization profile and notification preferences

Definition of done:
- Core operational lifecycle is connected from detection to reporting
- Reports summarize incidents and alert activity accurately

## Phase 5: AI Integration, Hardening, And Final Demo (85% -> 100%)
Primary goal:
Polish the platform into a defensible final-year project demo.

Work items:
- AI assistant placeholder replaced with explainability-focused workflows
- Secure API hardening, validation, and audit logging
- Test coverage on critical paths
- Demo script, screenshots, and presentation alignment with proposal assets

Definition of done:
- The platform demonstrates a coherent SOC narrative
- Final presentation assets and software state are aligned
- Known limitations are documented clearly

## Recommended Next Week Focus
To hit the next milestone, implement Phase 2 first in this order:

1. Finalize Prisma auth-related fields and run the first migration.
2. Build backend auth endpoints with password hashing and JWT issuance.
3. Add frontend auth state, login submission, and protected routing.
4. Seed one admin user and one analyst user for demos.
5. Replace placeholder dashboard cards with authenticated API data.

## Risk Watchlist
- Do not let UI polish delay auth and data foundations.
- Avoid building charts and tables against fake shapes that will be replaced later.
- Keep API envelope and naming conventions consistent now to prevent widespread refactors.
- Treat AI features as explainable workflow support, not as an unbounded chatbot scope.
