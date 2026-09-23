# Design Decisions — Configuration

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Business settings in DB not env

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to configuration-service.

**Decision:** Admins change security posture without redeploy.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
