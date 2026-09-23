# Design Decisions — School

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Geographic schema owned by school-service

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to school-service.

**Decision:** City tightly coupled to school address; one service owns both schemas (data-ownership-matrix).

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
