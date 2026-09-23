# Design Decisions — Audit

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Append-only audit

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to audit-service.

**Decision:** No UPDATE/DELETE API; corrections are compensating entries.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

## [DEC-002] Kafka primary ingest

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to audit-service.

**Decision:** Decouples producers; monitor consumer lag.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
