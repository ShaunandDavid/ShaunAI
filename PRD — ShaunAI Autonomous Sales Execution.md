PRD - ShaunAI Autonomous Sales Execution Platform (ASEP)
1) Product summary
ShaunAI ASEP is an enterprise-grade platform that executes outbound sales end-to-end (research -> personalization -> sequencing -> send -> reply handling -> booking -> CRM logging) under governance (policy, approvals, audit, rate caps, kill switch, canary).
Wedge product: AI SDR outbound execution (email + calendar + CRM) with enterprise safety controls.
Expansion: reply intelligence, inbound routing, multi-channel execution (without risky ToS automation dependencies), full "autonomous revenue ops".
---
2) Goals (what success looks like)
Business goals
- Win contracts large enough to hit 7-10 zero outcomes: enterprise pilots -> platform contracts -> co-sell/partner motion (Azure/M365, OpenAI/Azure OpenAI, Anthropic).
- Become the trusted execution layer above model providers.
Product goals
- Enterprise trust: SSO/RBAC, tenant isolation, immutable audit, BYOK, policy-as-code.
- Execution reliability: durable workflows, retries, idempotency, observability.
- Prove ROI: dashboards that quantify meetings booked, replies, pipeline influenced, time saved.
---
2.1) Discrepancies vs current codebase (as of 2026-01-02)
- Single-tenant runtime; no tenant isolation or per-tenant RBAC.
- No auth/SSO/JWT on API routes (endpoints are open).
- No durable workflow engine; queue is in-memory with no persistent retries/backoff.
- Persistence is JSON files under autonomy/server/state (no Postgres/Redis).
- HubSpot integration is not implemented; no CRM deal creation or pipeline mapping.
- No reply ingestion/classification from Gmail/M365; no intent-event pipeline.
- Microsoft Graph (M365) integration is not implemented.
- Policy logic is hardcoded in the server (no policy-as-code store/evaluator).
- Audit logs are plain files; no append-only hash chaining or export bundles.
- No OpenTelemetry/metrics pipeline in place.
- No Azure deployment/IaC (AKS, Key Vault, Postgres, Redis) in repo.
---
3) Non-goals (for v1)
- "LinkedIn automation" as a core requirement (too fragile/risky; not needed for enterprise wedge).
- Fully autonomous sending with no approvals by default (enterprise wants control).
- A consumer/SMB $99/mo self-serve motion (that's a later channel, not the 7-10 zero ceiling).
---
4) Target customers (who pays the big checks)
Primary ICP (highest ceiling)
- Mid-market / enterprise B2B teams where pipeline is existential and compliance matters:
  - Sales-led orgs with RevOps
  - PE-backed portfolio companies
  - Regulated-ish industries (careful positioning) where governance is mandatory
Buyer personas
- VP Sales / CRO: wants meetings + predictable pipeline
- RevOps Lead: wants workflow control, CRM hygiene, reporting
- IT/Security: wants SSO, audit trails, key management, isolation
- Sales Manager: wants sequences + coaching insights + "why it sent that"
---
5) Core user journeys (MVP-to-enterprise)
1. Set up tenant
  - SSO (Entra/Okta), roles, policy defaults, outbound caps
2. Connect channels
  - Gmail/Microsoft 365 mailbox(es), calendar(s), CRM (HubSpot first)
3. Create a campaign
  - ICP/persona + offer + constraints (domains, regions, compliance rules)
4. Load prospects
  - CSV import / CRM list / enrichment source
5. Generate + approve
  - ShaunAI drafts research-backed personalization + sequence steps
  - Approval queue (first-touch approval required by default)
6. Execute
  - Sends under rate caps + canary; logs everything to CRM; streams live events
7. Handle replies
  - Classifies replies, creates intent events, updates Deals, proposes next action, books meetings
8. Prove ROI
  - Dashboard shows meetings, positive replies, deals created, pipeline influenced, deliverability health
---
6) Requirements (what the product MUST do)
A) Tenant, identity, and access
- Multi-tenant support with strict data isolation
- SSO via Entra ID (Azure AD) + Okta (OIDC/SAML)
- RBAC roles:
  - Owner / Admin / RevOps / Manager / Operator / Auditor (read-only)
- Scoped API keys for service integrations + internal automation
B) Governance & policy-as-code (your moat)
- Policies that gate every outbound action:
  - approval rules (first-touch, new domain, high-risk content)
  - sending caps per mailbox/day/hour
  - suppression lists and do-not-contact rules
  - allowed domains / region rules / excluded verticals
  - kill switch (tenant-wide + campaign-wide)
  - canary mode (small batch before scale)
  - intent -> deal policy gates
  - confidence thresholds for "positive reply"
  - approval required for gray-zone confidence
  - never-create rules (OOO/unsub/bounce)
  - evidence required (facts used, reply excerpts, decision trace)
  - CRM hygiene policy
  - dedupe rules for contacts/companies/deals
  - prevent deal spam (no deal on first touch)
- Immutable audit log: who/what/when/why for every action
C) Prospect + campaign management
- Prospect CRUD + import
- Campaigns: ICP + offer + sequence template + constraints
- Sequence builder:
  - steps (email touch, delay, conditional branch)
  - variables and personalization fields
  - "approve once / approve every time" controls
D) Research & personalization
- Research sources:
  - web summaries, company site audits, public signals (non-invasive)
- Generate:
  - personalization bullets (facts used)
  - email copy + subject lines
  - call-to-action suggestions
- Must store "evidence used" for auditability
E) Sending + deliverability controls
- Providers:
  - Gmail API
  - Microsoft Graph (Outlook/M365)
- Deliverability subsystem:
  - rate caps, recipient caps, "new recipient/day" caps
  - bounce/complaint tracking inputs
  - suppression lists + unsubscribe management
- Must support "draft-only mode" for strict enterprises
F) Reply intelligence, intent events, deal creation, and booking (pipeline-grade)
- Inbound processing:
  - ingest replies (Gmail/M365)
  - classify reply: positive / neutral / objection / unsubscribe / OOO / bounce
  - generate next-step recommendation (human-readable)
- Intent event creation:
  - on POSITIVE reply -> create an INTENT_EVENT record with confidence + evidence
- Deal-on-positive-reply (default):
  - if confidence >= 0.85 -> auto-create/update CRM Deal
  - if 0.65-0.84 -> require Approval ("Create Deal?")
  - if < 0.65 -> do not create Deal
  - never create Deal on: unsubscribe / OOO / bounce
- Calendar booking:
  - propose times, check availability
  - create event + invite
  - log meeting + associate to Deal when present
G) CRM sync (HubSpot-first, deals required for enterprise ROI)
- HubSpot first (Salesforce later) via a CRM Adapter layer (so CRM is replaceable)
- Must support:
  - upsert Contact + Company
  - log outbound email touches (messageId, timestamps, content hash)
  - log replies (classification + evidence)
  - create Tasks (handoff)
  - create/update Deals on Positive Reply (with confidence gating + approvals)
  - associate Deal <-> Contact <-> Company; log Meeting to Deal when present
- Field mapping UI:
  - per-tenant pipeline + stage mapping for: POSITIVE_REPLY, MEETING_BOOKED, QUALIFIED, DISQUALIFIED
H) Reporting & analytics
- Campaign performance:
  - delivered/open (where available), reply rate, positive rate, meeting rate
  - deals created + pipeline influenced ($) (from CRM when available)
- Ops metrics:
  - queue latency, failures, retries
  - policy blocks (what was blocked, why)
  - deliverability health score
---
7) Non-functional requirements (enterprise credibility)
- Reliability: durable workflow engine, retries, idempotency keys everywhere
- Security: encryption at rest/in transit, secrets vault, least privilege, audit trails
- Performance: p95 "draft ready" under X seconds; "approval-to-send" under Y seconds
- Scalability: worker pools, mailbox sharding, per-tenant throttles
- Observability: OpenTelemetry traces/metrics/logs; alerting; per-tenant dashboards
- Compliance posture: SOC2-ready evidence logs (even before certification)
---
8) MVP scope (90-day "sell enterprise pilots" scope)
Must ship
- Tenant + SSO + RBAC
- Durable workflows + DB
- Policy engine + approvals + kill switch + canary
- Gmail + M365 send + calendar
- HubSpot integration (Contact + Company + Engagements + Tasks + Deals on Positive Reply)
- Reporting dashboard + audit viewer
- Reply triage -> intent event + deal gating -> next action suggestion -> book meeting
- Intent engine (reply classification + confidence + evidence + approval flow)
Can wait
- Full billing self-serve
- Multi-channel beyond email/calendar
- "Autonomous, no-approval" mode (only after trust + proof)
---
9) Milestones
Phase 0 (stabilize what you already have)
- Remove secrets from repo, rotate keys, lock down endpoints
- Replace file-state with DB (even before full multi-tenant)
Phase 1 (Pilot-ready enterprise platform)
- Tenant isolation + SSO + RBAC
- Durable workflows + policy gates
- Audit logs + reporting + pipeline attribution
- Azure staging deploy (AKS + Key Vault + Postgres + Redis + Blob)
Phase 2 (Scale + co-sell ready)
- Azure production hardening + co-sell packaging
- CRM-first analytics + exports
- Partner-ready security posture
---
10) Deal-on-Positive-Reply Spec
- Confidence thresholds:
  - >= 0.85: auto-create/update Deal
  - 0.65-0.84: approval required
  - < 0.65: do not create Deal
- Never-create rules: unsubscribe / OOO / bounce
- Dedupe strategy: no duplicate Deal for the same Contact/Company within the defined window
- Stage mapping requirements: POSITIVE_REPLY, MEETING_BOOKED, QUALIFIED, DISQUALIFIED
- Evidence required: facts used, reply excerpt, decision trace
---
11) Packaging & Pricing
- Platform fee (governance, SSO, audit, BYOK)
- Mailboxes/seats
- Workflow volume / research volume blocks
---
12) "Why OpenAI / Microsoft / Anthropic would care"
- You create a repeatable enterprise execution layer that drives model usage with governance.
- Microsoft: Azure + M365 + Entra + Azure OpenAI integration makes you a co-sell fit.
- OpenAI/Anthropic: you operationalize model value into enterprise revenue outcomes safely.



13) Profit-max architecture and dependency spec
Priorities for 7-10 zero outcomes and strategic partner interest:
- Enterprise trust (security, auditability, policy, governance)
- Execution at scale (durable workflows, retries, isolation, observability)
- Model-agnostic, cloud-friendly (OpenAI + Azure OpenAI + Anthropic first-class)
- Clear wedge + expansion (AI SDR -> Sales Execution Platform -> Revenue OS)
This section defines the exact product and technical spec (down to dependencies).
---
Core Product Definition (the thing we sell)
Name
ShaunAI - Autonomous Sales Execution Platform (ASEP)
What it does (one line)
Runs outbound sales execution end-to-end (research -> personalization -> sequencing -> sending -> reply handling -> booking -> CRM logging) under enterprise governance (approvals, policy, audit, kill switch, rate caps, RBAC, tenant isolation).
Why it wins (your moat)
Everyone can generate emails. Almost nobody can safely execute at scale inside real enterprises with:
- approvals and policy-as-code
- immutable audit trail
- tenant isolation + BYOK
- safe browser automation sandbox
- compliance rails
- reliability you can SLA
That's where the 7-10 zero outcomes live.
---
Wedge -> Expansion (the highest-ceiling product ladder)
Wedge (sell first)
Outbound Execution for B2B: "Book qualified meetings safely."
Expansion (where the billions come from)
1. Reply Intelligence + Routing (triage, qualification, meeting conversion)
2. Multi-channel execution (email + calendar + Teams/Slack notifications; NOT LinkedIn automation as a requirement)
3. Sales Ops automation (CRM hygiene, enrichment, pipeline operations)
4. Autonomous Revenue Team (multiple agents + orchestration + policy layer)
---
Non-Negotiable Enterprise Requirements (your "investor-grade" checklist)
Security / Trust
- Multi-tenant with strict isolation (RLS + per-tenant encryption keys)
- SSO: Entra ID (Azure AD) + Okta (OIDC/SAML)
- RBAC + scoped API keys + service accounts
- Immutable audit log (append-only)
- BYOK / Bring-your-own-model keys (OpenAI / Azure OpenAI / Anthropic)
- Secrets vault (no .env secrets in repo, ever)
- SOC2-ready logging + evidence trails from day 1
Reliability / Execution
- Durable workflow engine (not in-memory queues)
- Retries with backoff, idempotency everywhere
- Job concurrency control, rate caps, circuit breakers
- Observability (OpenTelemetry traces/metrics/logs)
- Canary mode and kill switch at policy layer
Compliance Rails (outbound reality)
- Suppression lists, unsubscribe management, bounce handling
- Consent metadata + regional policies
- Human approval gates (configurable)
(Not legal advice - this is product survival.)
---
Reference Architecture (exact components)
Services (minimum set)
1. API Gateway / Control Plane
  - Auth, tenancy, RBAC
  - CRUD for leads, campaigns, policies, approvals
  - Streams events to UI (SSE/WebSocket)
2. Workflow Orchestrator (Durable)
  - Runs outbound sequences as workflows
  - Enforces policy checks on every step
3. Worker Pool
  - LLM calls, enrichment, scoring
  - sends (email/calendar)
  - reply processing
  - CRM logging
4. Browser Sandbox Service
  - Playwright in isolated containers
  - screenshot/audit/scrape with strict allowlists + timeouts
5. Model Router
  - single interface: OpenAI / Azure OpenAI / Anthropic
  - supports tool-calls + structured output + streaming
  - per-tenant config, fallback, cost controls
6. Event + Audit Service
  - immutable audit events
  - compliance exports
  - anomaly detection (sending spikes, unusual targets)
Data Stores
- PostgreSQL (system of record, multi-tenant with RLS)
- Redis (rate limiting, caching, ephemeral locks)
- Object Storage (screenshots, artifacts, reports, audit bundles)
- Vector store: pgvector (keep it inside Postgres)
Deployment
- Kubernetes on Azure (AKS) (this makes Microsoft care)
- Terraform for infra
- Helm charts for releases
---
Data Model (tables you will have)
tenants
- id, name, plan, created_at
users
- id, tenant_id, email, role, auth_provider, created_at
integrations
- tenant_id, provider (google/microsoft/salesforce/hubspot), encrypted_tokens, scopes
prospects
- tenant_id, email, name, company, title, source, enrichment_json
campaigns
- tenant_id, name, target_persona, offer, status
sequences
- tenant_id, campaign_id, steps_json (touches, delays, channels)
actions
- tenant_id, type (research/draft/send/book/log), payload_json, status, idempotency_key
approvals
- tenant_id, action_id, requested_by, approved_by, status, timestamps
audit_events (append-only)
- tenant_id, actor, event_type, event_json, hash, previous_hash, created_at
deliverability
- tenant_id, mailbox_id, daily_caps, warmup_state, bounce_rate, health_score
---
"Policy-as-Code" Governance Layer (THIS is your enterprise differentiator)
Policy engine
- Every outbound action must pass:
  - user permission
  - tenant limits
  - campaign limits
  - recipient suppression
  - content risk check (PII, prohibited claims, etc.)
  - approval requirement
  - canary requirement
Policies you ship
- "All first touches require approval"
- "Never email .gov"
- "Max 40 new recipients/day"
- "Only send to allowlisted domains during pilot"
- "Kill switch = stop everything now"
Implement this like a real product, not a feature.
---
Exact Tech Stack + Dependencies (production-grade, best choice)
Monorepo layout (recommended)
/apps
  /api            (NestJS control plane)
  /worker         (Temporal workers)
  /browser-sandbox (Playwright service)
  /web            (React console)
/packages
  /shared         (types, utils, schemas)
  /policy         (OPA client + policy defs)
  /model-router   (OpenAI/Anthropic/Azure adapters)
  /db             (Prisma schema)
---
Backend: Control Plane (apps/api)
Runtime
- Node 20+
- TypeScript
Dependencies (exact)
- Framework
  - @nestjs/core
  - @nestjs/common
  - @nestjs/platform-fastify
  - fastify
  - pino + pino-pretty (dev)
- Auth / Security
  - openid-client (OIDC for Entra/Okta)
  - jose (JWT verify/sign)
  - @nestjs/passport
  - passport
  - helmet
  - cors
  - zod (request validation)
- DB
  - prisma
  - @prisma/client
  - pg
- Rate limiting / safety
  - rate-limiter-flexible
  - ioredis
- Observability
  - @opentelemetry/api
  - @opentelemetry/sdk-node
  - @opentelemetry/auto-instrumentations-node
  - prom-client
- Streaming
  - native SSE (no dependency) OR ws if you go WebSockets later
---
Orchestration + Workers (apps/worker)
Durable workflows (best-in-class)
- Temporal (this is what makes it enterprise-SLA credible)
Dependencies
- @temporalio/client
- @temporalio/worker
- @temporalio/workflow
Worker-side essentials
- p-limit (concurrency)
- ioredis (shared throttles)
- zod
- uuid
---
Model Router (packages/model-router)
Must support Day 1
- OpenAI (commercial)
- Azure OpenAI (Microsoft loves this)
- Anthropic (Claude)
Dependencies
- openai
- @anthropic-ai/sdk
- @azure/identity
- @azure/openai (Azure OpenAI SDK)
- zod (strict structured output)
- p-retry (retries)
- bottleneck (throttling per model + per tenant)
Router behaviors (required)
- per-tenant model preference
- fallback chain (e.g., Azure OpenAI -> OpenAI -> Anthropic)
- cost ceiling per tenant/day
- policy-filtered tool calls only
- structured output required for execution steps (no freeform)
---
Browser Sandbox (apps/browser-sandbox)
Why Playwright
More robust than puppeteer for enterprise automation and isolation patterns.
Dependencies
- playwright
- fastify (thin service)
- zod
Sandbox rules (required)
- allowlist outbound domains per tenant
- hard timeouts
- max page size / max downloads
- strip credentials from logs
- artifact storage to object store only
---
Integrations Layer (in worker + packages)
Microsoft (to make Microsoft care)
- Microsoft Graph for:
  - Outlook mail send/read
  - Calendar events
  - Teams notifications
  - (later) Dynamics 365
Dependencies
- @microsoft/microsoft-graph-client
- @azure/identity
Google (already in your repo)
- Gmail + Calendar
Dependencies
- googleapis
CRM (enterprise-grade priority)
Ship HubSpot first (Salesforce later); Airtable stays dev only.
Dependencies
- HubSpot: @hubspot/api-client
- Salesforce: jsforce (later)
---
UI Console (apps/web)
Dependencies
- react
- react-dom
- react-router-dom
- @tanstack/react-query
- zod
- react-hook-form
- recharts (analytics)
- eventsource-parser (if you want nicer SSE handling)
(Keep it simple: dashboards + approvals + campaigns + audit viewer + deliverability.)
---
Infra Dependencies (the "enterprise is real" kit)
Core
- Docker
- Kubernetes (AKS)
- Terraform
- Helm
Runtime services
- Temporal server (Helm chart)
- PostgreSQL (managed: Azure Database for PostgreSQL)
- Redis (Azure Cache for Redis)
- Object storage (Azure Blob)
Secrets
- Azure Key Vault
Observability
- OpenTelemetry Collector
- Prometheus + Grafana
- Sentry (optional but very useful)
---
The "OpenAI / Microsoft / Anthropic want it" hooks
For OpenAI
- You drive large, sticky API usage with governance (enterprise-safe execution).
- You can ship as a "reference customer" for agentic workflows done responsibly.
For Microsoft
- Run on Azure, integrate Entra + Graph + Teams, support Azure OpenAI first-class.
- You become a co-sell candidate because you increase Azure consumption + M365 adoption.
For Anthropic
- Claude is strong for long-context reasoning, policy analysis, and safer drafting.
- You give them distribution into revenue execution, which is high-value.
Translation: You are not a "tool." You're an execution platform that sits on top of their models and makes them monetizable in the enterprise.
---
The Build Order (what I would do next, in sequence)
1. Rip secrets out, rotate keys, lock repo
2. Implement Tenant + Auth + RBAC (Entra ID first)
3. Replace in-memory/file state with Postgres + Prisma
4. Replace queue with Temporal workflows
5. Build Policy-as-Code gate that intercepts every action
6. Build Audit trail viewer in UI (this closes enterprise deals)
7. Add Microsoft Graph email/calendar alongside Google
8. Add Reply triage + booking flow (closing the SDR loop)
9. Harden deliverability subsystem (caps, suppression, bounce, warmup)
10. Ship 3 enterprise pilots with single-tenant deployments -> convert to platform contracts
---
Packaging + Pricing (built for 7-10 zeros)
Enterprise Platform Contract
- Base: $60k-$250k ARR depending on seats + volume + integrations
- Usage: mailbox count, workflow runs, research runs
- Add-on: compliance export + audit bundle + BYOK + dedicated VPC deployment
This is how you avoid the $900/mo commodity trap and build something worth real money.

Architecture Spec - ShaunAI ASEP
1) Architecture principles
- Execution is workflows, not requests. Everything important is a durable workflow with checkpoints.
- Policy gates every action. No "oops we sent it" moments.
- Model-agnostic routing. OpenAI/Azure OpenAI/Anthropic are pluggable and per-tenant configurable.
- Audit-first. Every action is traceable (inputs -> decision -> output).
- Tenant isolation. Data separation is enforced at the DB level + encryption boundaries.
---
2) Target architecture (services)
Recommended production control plane (refactor from current repo):
1. Control Plane API (auth, tenancy, RBAC, CRUD)
2. Workflow Orchestrator (durable workflows)
3. Worker Service (LLM calls, research, sending, CRM sync, reply processing)
4. Browser Sandbox (Playwright/Chromium in isolated containers)
5. Model Router (OpenAI/Azure OpenAI/Anthropic adapters + cost controls)
6. Policy Engine (policy-as-code + decision logs)
7. Audit/Event Store (append-only audit events + export bundles)
8. Web Console (admin + ops + approvals + analytics)
---
3) Data stores
- PostgreSQL (system of record)
  - Row Level Security (RLS) by tenant_id
  - pgvector for embeddings (optional but clean)
- Redis
  - rate limits, locks, idempotency caches, short-lived tokens
- Object Storage (S3/Azure Blob)
  - screenshots, artifacts, reports, evidence bundles
- (Optional) Warehouse
  - if you want deep BI later; not needed for pilots
---
4) Security architecture
Identity
- OIDC/SAML SSO (Entra ID + Okta)
- JWT sessions; short-lived access tokens, refresh flow
Authorization
- RBAC enforced in API middleware + DB policies
- Scoped service tokens for workers
Secrets
- Vault (Azure Key Vault in Azure path)
- Per-tenant encrypted integration tokens
Tenant isolation
- DB: tenant_id everywhere + RLS
- Object store: tenant-prefixed buckets/paths + IAM policies
- Worker execution: tenant context required for every job
---
5) Workflow engine (durable)
Replace in-memory queue with a durable orchestrator.
Key workflow: Outbound Campaign Execution
State machine (high level):
1. Select next prospect (respect caps + suppression)
2. Research/enrich (evidence captured)
3. Draft content (structured output)
4. Policy check -> approval required?
5. If approval: create approval record + wait
6. Send (provider adapter) with idempotency key
7. Log to CRM + store audit events
8. Schedule follow-up step(s)
9. Monitor replies -> classify -> intent event -> deal gating -> next action + booking
Other workflows
- Reply triage -> intent event + deal gating -> next action suggestion -> book meeting
- Bounce/complaint handling -> suppression updates -> deliverability score updates
- Canary run -> escalate to full run after health checks
---
6) Policy engine spec (the "enterprise moat")
Policy evaluation inputs:
- tenant settings + role permissions
- campaign rules
- mailbox health + caps
- recipient history + suppression status
- content risk signals
- evidence quality (are claims supported by research?)
- intent confidence + reply classification + evidence trace
- deal dedupe state (existing deal for contact/company)
Policy outputs:
- allow/deny + reasons
- approval_required flag
- reduced caps (throttle)
- require_canary flag
- require_manual_review flag
- deal_create_allowed flag
- deal_create_requires_approval flag
Every decision is logged as an audit event.
---
7) Model router spec
Capabilities:
- Per-tenant provider config:
  - OpenAI key
  - Azure OpenAI endpoint + key
  - Anthropic key
- Fallback chain by tenant policy (e.g., Azure -> OpenAI -> Anthropic)
- Cost controls:
  - per-tenant daily max
  - per-campaign max
- Safety controls:
  - structured output enforced for "actionable" steps
  - tool-calls allowed only from approved tool list
---
8) Browser sandbox spec
- Isolated service running Playwright
- Strict allowlist domains per tenant/campaign
- Hard CPU/mem/time limits
- No credential reuse across tenants
- All artifacts stored in object storage with signed URLs
---
9) Integration adapters (email/calendar/CRM)
Outbound
- Gmail API adapter
- Microsoft Graph Mail adapter
- Calendar: Google Calendar + Microsoft Calendar adapters
Inbound
- Gmail watch/webhook or polling (depending on architecture)
- Graph subscription/webhook for M365
CRM
- HubSpot adapter (Salesforce later)
- pipeline stage mapping per tenant (POSITIVE_REPLY, MEETING_BOOKED, QUALIFIED, DISQUALIFIED)
- Mapping layer: store field mappings per tenant
---
10) API surface (control plane endpoints)
Prefix: /v1
Auth
- POST /auth/login (OIDC redirect start)
- GET /auth/callback
- POST /auth/logout
Tenants & users
- GET /tenants/me
- POST /tenants
- GET /users
- POST /users
- PATCH /users/:id/role
Campaigns & sequences
- POST /campaigns
- GET /campaigns
- POST /campaigns/:id/sequences
- GET /campaigns/:id/sequences
Prospects
- POST /prospects/import
- GET /prospects
- PATCH /prospects/:id
Approvals
- GET /approvals
- POST /approvals/:id/approve
- POST /approvals/:id/reject
Execution
- POST /campaigns/:id/start
- POST /campaigns/:id/stop
- GET /execution/status
Policies
- GET /policies
- POST /policies
- POST /policies/test
Integrations
- POST /integrations/google/connect
- POST /integrations/microsoft/connect
- POST /integrations/crm/connect
- GET /integrations/status
Observability
- GET /metrics (protected)
- GET /healthz
Events
- GET /events/stream (SSE/WebSocket)
---
11) Event + audit model (append-only)
Core events:
- PROSPECT_SELECTED
- RESEARCH_COMPLETED
- DRAFT_CREATED
- POLICY_EVALUATED
- APPROVAL_REQUESTED
- APPROVAL_GRANTED / APPROVAL_REJECTED
- SEND_ATTEMPTED / SEND_SUCCEEDED / SEND_FAILED
- CRM_LOGGED
- REPLY_RECEIVED
- INTENT_EVENT_CREATED
- DEAL_CREATED / DEAL_UPDATED
- DEAL_CREATION_BLOCKED
- MEETING_BOOKED
- KILL_SWITCH_ACTIVATED
Audit record must include:
- tenant_id, actor, correlation_id, idempotency_key, payload hash, timestamp
---
12) Deployment spec (Azure-first to make Microsoft care)
- AKS for services
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Blob Storage
- Azure Key Vault for secrets
- Azure OpenAI optional path (first-class)
---
13) Migration plan from your current repo (practical)
Your existing autonomy/server becomes the seed of:
- Control Plane API (split endpoints)
- Worker functions (send, research, audit)
- Policy gates (you already have approvals/kill switch/caps-formalize them)
Your file-based JSON state becomes:
- Postgres tables (leads, approvals, sequences, ledger, audit_events)
Your in-memory queue becomes:
- Durable workflows + workers (the execution engine)
root monorepo package.json + each app/package package.json (with a couple placeholders where your org/name will go). This is enterprise-grade, aligns with the PRD/Architecture I gave you, and cleanly replaces your current "single Express runtime + file state" into a real platform.
---
Repo Layout (target)
shaunai-asep/
  apps/
    api/
    worker/
    browser-sandbox/
    web/
  packages/
    shared/
    db/
    model-router/
    policy/
  package.json
  pnpm-workspace.yaml
  turbo.json
---
Root
package.json
{
  "name": "@<YOUR_ORG>/shaunai-asep",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.11.0"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev --parallel",
    "build": "turbo build",
    "start": "pnpm -C apps/api start",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "format": "prettier -w .",
    "prepare": "husky"
  },
  "devDependencies": {
    "@types/node": "20.11.30",
    "eslint": "8.57.0",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-import": "2.29.1",
    "husky": "9.0.11",
    "lint-staged": "15.2.2",
    "prettier": "3.2.5",
    "turbo": "2.1.3",
    "typescript": "5.5.4"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md,yaml,yml}": [
      "prettier -w"
    ]
  }
}
pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^test"]
    }
  }
}
---
Apps
apps/api/package.json (Control Plane API - NestJS + Fastify)
{
  "name": "@<YOUR_ORG>/api",
  "version": "0.1.0",
  "private": true,
  "main": "dist/main.js",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main.js",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@<YOUR_ORG>/db": "workspace:*",
    "@<YOUR_ORG>/policy": "workspace:*",
    "@<YOUR_ORG>/shared": "workspace:*",
    "@nestjs/common": "10.3.8",
    "@nestjs/config": "3.2.3",
    "@nestjs/core": "10.3.8",
    "@nestjs/passport": "10.0.3",
    "@nestjs/platform-fastify": "10.3.8",
    "@nestjs/swagger": "7.3.1",
    "cors": "2.8.5",
    "fastify": "4.26.2",
    "fastify-helmet": "11.1.1",
    "fastify-rate-limit": "9.1.0",
    "jose": "5.2.4",
    "openid-client": "5.6.5",
    "pino": "9.1.0",
    "passport": "0.7.0",
    "pg": "8.11.5",
    "prom-client": "15.1.2",
    "rate-limiter-flexible": "5.0.3",
    "uuid": "9.0.1",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@nestjs/cli": "10.3.2",
    "@types/cors": "2.8.17",
    "@types/uuid": "9.0.8",
    "ts-node": "10.9.2",
    "vitest": "2.0.5"
  }
}
---
apps/worker/package.json (Durable Execution - Temporal Workers)
{
  "name": "@<YOUR_ORG>/worker",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@<YOUR_ORG>/db": "workspace:*",
    "@<YOUR_ORG>/model-router": "workspace:*",
    "@<YOUR_ORG>/policy": "workspace:*",
    "@<YOUR_ORG>/shared": "workspace:*",
    "@temporalio/client": "1.10.4",
    "@temporalio/worker": "1.10.4",
    "@temporalio/workflow": "1.10.4",
    "bottleneck": "2.19.5",
    "googleapis": "134.0.0",
    "@hubspot/api-client": "11.1.0",
    "ioredis": "5.4.1",
    "p-limit": "6.1.0",
    "p-retry": "6.2.1",
    "pg": "8.11.5",
    "uuid": "9.0.1",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/uuid": "9.0.8",
    "tsx": "4.16.2",
    "vitest": "2.0.5"
  }
}
Notes:
- jsforce = Salesforce adapter (later).
- Add @hubspot/api-client now (HubSpot-first).
---
apps/browser-sandbox/package.json (Playwright sandbox service)
{
  "name": "@<YOUR_ORG>/browser-sandbox",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "postinstall": "playwright install --with-deps"
  },
  "dependencies": {
    "@<YOUR_ORG>/shared": "workspace:*",
    "fastify": "4.26.2",
    "playwright": "1.47.2",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "tsx": "4.16.2",
    "vitest": "2.0.5"
  }
}
---
apps/web/package.json (React console UI)
{
  "name": "@<YOUR_ORG>/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@<YOUR_ORG>/shared": "workspace:*",
    "@tanstack/react-query": "5.51.21",
    "eventsource-parser": "1.1.2",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-hook-form": "7.52.2",
    "react-router-dom": "6.26.1",
    "recharts": "2.12.7",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "@vitejs/plugin-react": "4.3.1",
    "typescript": "5.5.4",
    "vite": "5.4.2",
    "vitest": "2.0.5"
  }
}
---
Packages
packages/shared/package.json (types, schemas, utilities)
{
  "name": "@<YOUR_ORG>/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "uuid": "9.0.1",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "vitest": "2.0.5"
  }
}
---
packages/db/package.json (Prisma + Postgres)
{
  "name": "@<YOUR_ORG>/db",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "5.18.0",
    "pg": "8.11.5"
  },
  "devDependencies": {
    "prisma": "5.18.0",
    "typescript": "5.5.4",
    "vitest": "2.0.5"
  }
}
---
packages/model-router/package.json (OpenAI + Azure OpenAI + Anthropic)
{
  "name": "@<YOUR_ORG>/model-router",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@<YOUR_ORG>/shared": "workspace:*",
    "@anthropic-ai/sdk": "0.27.3",
    "@azure/identity": "4.2.1",
    "@azure/openai": "1.0.0-beta.12",
    "bottleneck": "2.19.5",
    "openai": "4.56.0",
    "p-retry": "6.2.1",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "vitest": "2.0.5"
  }
}
Placeholder reality: Azure OpenAI SDK versions move a lot. This is still the right dependency shape even if you bump the beta.
---
packages/policy/package.json (Policy-as-code + audit hashing)
{
  "name": "@<YOUR_ORG>/policy",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@<YOUR_ORG>/shared": "workspace:*",
    "json-stable-stringify": "1.1.1",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "vitest": "2.0.5"
  }
}
If you decide to embed OPA/rego later, we add the exact OPA wasm or run OPA as a sidecar service and keep Node policy evaluation as the fallback.
---
Quick sanity check (so this actually runs)
- pnpm i
- pnpm dev (turbo runs all dev servers)
- You'll need these env vars (placeholders ok):
  - DATABASE_URL
  - REDIS_URL
  - TEMPORAL_ADDRESS
  - OPENAI_API_KEY / AZURE_OPENAI_* / ANTHROPIC_API_KEY
  - GOOGLE_* and/or MS_GRAPH_* integration credentials
---
14) CRM strategy decision (HubSpot-first, Revenue OS later)
Building a full CRM now slows revenue. CRMs win on ecosystem, adoption, reporting, workflows, integrations, and switching costs - not just CRUD.
Best move (profit-first): ship HubSpot-first, but architect it so HubSpot is replaceable.
This yields enterprise revenue now while you build the internal "Revenue System of Record" underneath.
Decision:
- v1: HubSpot integration (enterprise-credible, fastest to revenue)
- v1 architecture: CRM Adapter layer (so later you can swap HubSpot -> "ShaunCRM" without rewrites)
- long game: Your own "Revenue OS DB" becomes the source of truth; CRMs become optional sinks
---
HubSpot-first Integration Spec (exact)
1) CRM Adapter Interface (core abstraction)
Create a package: packages/crm/ with one interface and providers.
packages/crm/src/types.ts
Methods you implement once and call everywhere:
- connect(tenantId): OAuthUrl
- exchangeCodeForToken(tenantId, code)
- refreshTokenIfNeeded(tenantId)
- upsertCompany(tenantId, company: {domain, name?, website?}) -> {externalId}
- upsertContact(tenantId, contact: {email, firstName?, lastName?, title?, companyDomain?}) -> {externalId}
- logEmail(tenantId, payload: {contactExternalId, subject, body, direction, sentAt, messageId})
- logMeeting(tenantId, payload: {contactExternalId, title, startAt, endAt, attendees[]})
- createTask(tenantId, payload: {contactExternalId, title, dueAt, note})
- setLifecycle(tenantId, payload: {contactExternalId, stage})
- suppress(tenantId, payload: {email, reason})
Why this matters: your platform stays CRM-agnostic while still selling enterprise outcomes.
---
2) HubSpot Provider (the first implementation)
Create: packages/crm-hubspot/ implementing the interface.
Objects we use in v1 (minimal, high ROI)
- Contacts: store prospects
- Companies: attach by domain
- Deals: create/update on positive reply (confidence gated)
- Engagements/Notes (or the current HubSpot engagement endpoints): log emails + replies + meetings
- Tasks: follow-ups and handoffs
ID mapping (required)
In Postgres, store external IDs so you never duplicate:
Tables:
- crm_accounts: tenant_id, provider, access_token_enc, refresh_token_enc, expires_at, scopes
- crm_mappings: tenant_id, provider, internal_type, internal_id, external_id
  - internal_type: prospect|company|campaign|sequence|meeting|deal
---
3) OAuth flow (HubSpot)
Where it lives:
- apps/api owns OAuth redirects/callbacks (control plane)
- apps/worker uses stored tokens to sync + log
Endpoints (API):
- POST /v1/integrations/hubspot/connect -> returns auth_url
- GET /v1/integrations/hubspot/callback?code=... -> exchanges tokens, stores encrypted
- GET /v1/integrations/status -> shows connected/disconnected + scopes
Security requirements:
- Tokens encrypted at rest (KMS/Key Vault in prod)
- Per-tenant token storage only
- Scope minimization (only what you need)
---
4) What gets logged (HubSpot as the proof engine)
Every outbound "touch" becomes a CRM event:
- Email drafted -> audit event (internal)
- Email approved -> audit event (internal)
- Email sent -> HubSpot logEmail()
- Reply received -> HubSpot engagement + classification evidence
- Intent event created -> HubSpot note (evidence + confidence)
- Deal created/updated (when allowed) -> HubSpot deal update
- Meeting booked -> HubSpot logMeeting()
- Next action created -> HubSpot task
This makes your ROI undeniable and makes your platform sticky.
---
5) Event triggers (workflows)
Outbound workflow steps that must call CRM
- Step SEND_EMAIL_SUCCEEDED -> crm.logEmail()
- Step INTENT_EVENT_CREATED -> gated crm.createDeal/updateDeal + log evidence note
- Step MEETING_BOOKED -> crm.logMeeting() + crm.updateDealStage() (optional)
Inbound signals (optional in v1, strong in v1.5)
HubSpot webhooks to pull:
- contact updated
- deal stage changed
- unsubscribe status
This lets you enforce suppression automatically.
---
Dependencies (exact updates)
Update: apps/worker/package.json
Add HubSpot client:
"dependencies": {
  "@hubspot/api-client": "11.1.0"
}
(Version can be bumped later; the dependency is correct.)
Optional (if you want resilient refresh + retries)
"dependencies": {
  "p-retry": "6.2.1",
  "bottleneck": "2.19.5"
}
(You already have those in the worker spec I gave - keep them.)
---
Env Vars (minimum set)
In apps/api
- HUBSPOT_CLIENT_ID
- HUBSPOT_CLIENT_SECRET
- HUBSPOT_REDIRECT_URI
- APP_BASE_URL
In apps/worker
- none required if tokens are stored in DB and fetched by tenant context
---
Reality check on "build our own CRM"
You will build your own, but it should start as:
- ShaunAI's internal Revenue System of Record (your DB + audit + analytics + policy decisions)
- plus an optional CRM UI later (pipeline + contacts + deals) once you've got distribution + cashflow
That's how you "take them out" without stalling your billion-dollar platform.
- Decision (profit-max): Option 2 - Contacts + Deals
Because the highest-ceiling buyers don't pay for "emails sent."
They pay for pipeline created and revenue influenced.
Deals unlock:
- pipeline reporting ($ influenced, stages, win rates)
- ROI dashboards that justify $60k-$250k+ ARR contracts
- exec sponsorship (CRO/RevOps/Finance care immediately)
- expansion into "Revenue OS" (multi-agent GTM ops)
---
The best way to implement Deals (so you don't trash their CRM)
Deal-on-Positive-Reply (best)
Do NOT create deals on first touch. That's spammy in CRM terms.
Create a Deal only on POSITIVE reply with confidence gating:
- >= 0.85 -> auto-create/update
- 0.65-0.84 -> approval required
- < 0.65 -> do not create
Fallback: if meeting booked and no deal exists, create and associate.
Default: deal-on-positive-reply with confidence thresholds; meeting booked advances stage.
---
Exact HubSpot objects we will use (enterprise-grade minimal set)
Required objects
- Contacts (prospects)
- Companies (by domain)
- Deals (created on positive reply)
- Engagements / Notes (log emails + replies)
- Tasks (handoffs / follow-ups)
Required associations
- Contact <-> Company
- Deal <-> Company
- Deal <-> Contact
- Engagement <-> Contact (and optionally <-> Deal)
- Meeting <-> Contact (and optionally <-> Deal)
---
Update the CRM Adapter Interface (exact spec)
Add these methods to packages/crm/src/types.ts:
- findDealForContactOrCompany(tenantId, { contactExternalId?, companyExternalId? })
- createDeal(tenantId, { name, amount?, pipelineId?, stageId?, closeDate?, ownerId?, source }) -> { externalId }
- updateDealStage(tenantId, { dealExternalId, stageId })
- associateDealToContact(tenantId, { dealExternalId, contactExternalId })
- associateDealToCompany(tenantId, { dealExternalId, companyExternalId })
- logEngagement(tenantId, { type: 'EMAIL'|'NOTE', contactExternalId, dealExternalId?, subject?, body, occurredAt })
- logMeeting(tenantId, { contactExternalId, dealExternalId?, title, startAt, endAt, attendees[] })
Deal creation rule (hard default):
- If POSITIVE reply with confidence >= 0.85 -> create/update deal; if 0.65-0.84 -> approval required; if < 0.65 -> do not create; if meeting booked and no deal exists -> create + associate + update stage.
---
Data you store internally (so you're never "just a HubSpot plugin")
In Postgres, you must persist:
- prospects (your canonical lead record)
- touches (every action + content hash + provider messageId)
- meetings
- replies (classification + evidence)
- deals_shadow (internal representation of deal state, even if CRM is disconnected)
- crm_mappings (internal_id <-> hubspot_id)
- audit_events (append-only)
That's how you eventually "take them out" while still using them to win contracts now.
---
What this enables (the "Sam/Microsoft/Zuck" magnet)
To get those calls, you need a product that:
1. Moves revenue (pipeline & attribution)
2. Runs on their rails (Azure/M365, OpenAI/Azure OpenAI, Anthropic)
3. Is enterprise-safe (SSO, audit, policy, BYOK)
4. Scales operationally (durable workflows + governance)
5. Has a platform story (execution layer above models)
Deals + pipeline attribution is the fastest path to that story.
