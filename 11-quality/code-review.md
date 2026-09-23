# Code review guide

Last updated: 2026-09-22 · Complements [testing-strategy.md](./testing-strategy.md), [tdd-guide.md](./tdd-guide.md), DoD (`00-governance/definition-of-done.md`)

## What reviewers check

| Area | Look for |
|------|----------|
| Correctness | Logic, edge cases, error handling |
| Boundary | Cross-schema SQL joins, shared tables (ADR-002), service-boundary-rules |
| API | OpenAPI contract match under `07-api/contracts/` |
| Events | Additive Kafka evolution (ADR-004) |
| gRPC | Compatible proto changes (ADR-005) |
| Security | Secrets, authz checks, PII in logs (security-policy) |
| Migrations | Liquibase-only DDL, expand/contract (ADR-009) |
| Tests | Meaningful coverage, not just snapshots |
| Docs | Relevant `docs/**` updated in same PR |

## Ports / edge reminders

- Public entry **Kong :8000**; services **:8080** (Docker DNS).
- No host-local filesystem paths in examples.

## Approval

- Minimum: 1 reviewer + CI green (`10-devops/ci-cd.md`)
- Breaking API/event: owner of contract + ADR if style changes

## Nit / block language

- **Block:** correctness, security, data loss, contract break
- **Should fix:** clarity, missing test for tricky branch
- **Nit:** style within project conventions (`git-conventions.md`)
