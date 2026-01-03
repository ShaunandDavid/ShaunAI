# Build Plan (v2)

## Phase 0: Workspace scaffold
- [ ] Root configs and docs
- [ ] App scaffolds
- [ ] Package scaffolds

## Phase 1: Core platform foundation
- [ ] Postgres schema + Prisma client
- [ ] Tenant + RBAC model
- [ ] Policy evaluation skeleton + audit decision logs
- [ ] CRM adapter interface + HubSpot provider stub
- [ ] Minimal API endpoints (health, auth placeholders, approvals queue)

## Phase 2: Execution layer
- [ ] Temporal workflow skeletons (outbound, reply triage)
- [ ] Idempotency + rate caps (Redis)
- [ ] Basic sending adapters (Gmail/M365 stubs)

## Phase 3: Evidence and ROI
- [ ] Intent events + deal gating flow
- [ ] Audit log API and viewer endpoints
- [ ] Reporting endpoints (campaign + ops metrics)

## Phase 4: Console
- [ ] Admin shell (auth + nav)
- [ ] Campaigns + approvals views
- [ ] Audit viewer + basic dashboards
