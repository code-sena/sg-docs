# Design Decisions — Notification

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Boarding stored in Notification schema

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to notification-service.

**Decision:** Boarding triggers family notification; execution referenced by UUID (no cross-schema FK).

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

## [DEC-002] Go for fan-out throughput

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to notification-service.

**Decision:** High event volume, small static binary.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
