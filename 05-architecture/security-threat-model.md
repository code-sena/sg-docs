# Security threat model (STRIDE)

Last updated: 2026-09-22 · Companion to [security-policy](../00-governance/security-policy.md), [authentication](../07-api/authentication.md), ADR-006/ADR-008.

## Scope

**In scope:** edge (Kong :8000), 11 business microservices (:8080), Kafka, gRPC, SQL Server (schemas), Redis (ephemeral), admin/operator paths.

**Out of scope:** physical data-center controls, third-party OS patching (owned by platform team).

## Trust zones

1. **Public** — browsers/mobile → Kong OSS **:8000**
2. **Service network** — Docker DNS service names; services **:8080**
3. **Data** — SQL Server + Redis; no direct public path
4. **Admin** — Kong admin / ops runbooks (network-restricted)

## STRIDE summary

| # | Category | Threat (example) | Mitigation | Owner |
|---|----------|------------------|------------|-------|
| S | Spoofing | Forged JWT to call internal APIs | RS256 JWT at edge (ADR-008); reject `alg=none`; key rotation | iam-service + Kong |
| T | Tampering | Replay of gRPC payload / Kafka message | TLS in transit; Kafka ACLs; payload schema registry (ADR-004) | platform |
| R | Repudiation | "Who changed route assignment?" | Status history on application rows; no UPDATE/DELETE from app without trace | owning service |
| I | Information disclosure | SQL injection across schemas | Parameterized queries; Liquibase-controlled DDL (ADR-009); least-privilege DB roles per schema | each service |
| D | Denial of service | Stampede on `/health` or auth | Kong rate limiting; Redis for edge counters; backoff on gRPC | Kong + services |
| E | Elevation of privilege | User calls another tenant's school data | Authorization at edge + service; row scope by school/tenant; service-boundary rules | iam + school |

## Entry-point review (per request path)

| Path | AuthN | AuthZ | Rate limit | Notes |
|------|-------|-------|------------|-------|
| `:8000/**` public health | None | — | Yes | Minimal surface |
| `:8000/api/v1/auth/**` | Bootstrapping / login | — | Tight | iam-service :8080 |
| `:8000/api/v1/**` (default) | Bearer JWT RS256 | Role + resource scope | Yes | Kong plugin + service check |
| Service → service gRPC | mTLS or network trust + JWT/claims | Per operation | Circuit breaker | ADR-005 |
| Kafka producers/consumers | SASL/ACL as per environment | Topic-level | Quotas | ADR-004 |

## Residual risks / follow-ups

- [ ] Confirm Kong plugins inventory (JWT, rate-limit, request-transformer) matches ADR-006
- [ ] Threat-model offline-first GPS sync (device trust) — gps-service
- [ ] Pen-test checklist against RS256 key handling (ADR-008)
- [ ] Revisit after any new public route

## References

- [security-policy.md](../00-governance/security-policy.md)
- [07-api/authentication.md](../07-api/authentication.md)
- [09-microservices/service-boundary-rules.md](../09-microservices/service-boundary-rules.md)
