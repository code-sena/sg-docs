# Design Decisions — GPS

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Hexagonal ports/adapters

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to gps-service.

**Decision:** Ingest and Kafka publishing behind ports for testability.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

## [DEC-002] Position retention

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to gps-service.

**Decision:** Older points archived to bound growth.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
