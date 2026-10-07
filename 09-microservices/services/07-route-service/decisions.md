# Design Decisions — Route

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] No driver↔route table

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to route-service.

**Decision:** Driver→bus→route transitively (FR-3.6).

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

## [DEC-002] Delete blocked when execution active

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to route-service.

**Decision:** App-level guard without cross-schema FKs.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
