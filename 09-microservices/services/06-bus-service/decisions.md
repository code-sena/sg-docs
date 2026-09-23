# Design Decisions — Bus

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] Driver assigned to bus, not route

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to bus-service.

**Decision:** Driver reaches routes transitively via bus↔route (FR-3.6).

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
