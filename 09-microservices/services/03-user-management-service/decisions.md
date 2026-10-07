# Design Decisions — User Management

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Person split from Profile

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to user-management-service.

**Decision:** Personal data lives here; authentication Profile stays in iam schema (ADR-002).

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

## [DEC-002] Soft delete only

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to user-management-service.

**Decision:** Historical references preserved via deleted_at without cross-schema FKs.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
