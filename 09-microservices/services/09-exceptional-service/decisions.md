# Design Decisions — Exceptional

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Validate via gRPC not JOIN

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to exceptional-service.

**Decision:** Bus/Route in other schemas; check at write time (boundary rules F3).

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
