# ShaunAI ASEP v2

  This folder is the v2 platform workspace. It coexists with the current autonomy stack.

  ## Quick start
  - Install pnpm 9.x (once).
  - From this folder: `pnpm install`.
  - Run all services: `pnpm dev`.

  ## Layout
  - `apps/`
- api (NestJS control plane)
- worker (Temporal workers)
- browser-sandbox (Playwright service)
- web (React console)
  - `packages/`
- shared, db, policy, model-router, crm, crm-hubspot

  ## Docs
  - `BUILD_PLAN.md`
- build phases and checklists
  - `DECISIONS.md`
- key architectural choices

  ## Source of truth
  The PRD in the repo root is the reference spec for scope and requirements.
