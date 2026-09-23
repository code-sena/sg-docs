# Service readiness checklist

Use before calling a service "done" for a release (aligns with DoD).

## Per service

- [ ] README accurate (stack, schema, port **8080**, health URL)
- [ ] OpenAPI in `07-api/contracts/<service>.yaml` validates (gateway via **:8000**)
- [ ] `events.md` lists produced/consumed topics (if any) → indexed in [event-catalog.md](./event-catalog.md)
- [ ] `data-model.md` matches `06-data/domain/*.md` + Liquibase `database/ms-*-db`
- [ ] Runbook: health, logs, common failure, rollback notes
- [ ] Decisions recorded (`decisions.md` / ADRs if architectural)
- [ ] AuthN/Z: JWT path via Kong + in-service checks
- [ ] Metrics/traces/logging (see `13-operations/observability.md`)
- [ ] Tests: unit + critical path (quality strategy)
- [ ] CI job green (`10-devops/ci-cd.md`)
- [ ] No local machine paths; Docker DNS names only

## Edge service (Kong)

- [ ] Routes map to correct upstream `:8080` service names
- [ ] Rate limit + JWT plugins
- [ ] Public health on **:8000**

## Cross-cutting

- [ ] Security policy / PII log rules
- [ ] Backup impact if schema changed (ops)
- [ ] Docs PR updated in same change
