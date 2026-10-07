# Design Decisions — IAM

> Service-local technical decisions (global ones live in `05-architecture/decisions/`).

## [DEC-001] RS256 asymmetric keys

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to iam-service.

**Decision:** All polyglot services verify via JWKS without shared secrets; private key only in iam-service.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

## [DEC-002] Gateway-centric token validation

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to iam-service.

**Decision:** Gateway validates JWT + blacklist; services trust X-User-* headers injected at edge.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

## [DEC-003] No public self-registration

**Date:** 2026-09-22
**Status:** Active

**Context:** Decision scoped to iam-service.

**Decision:** Accounts created by administrators (FR-1.1); login-only public surface.

**Consequences:**
- ✅ Aligned with service catalog and boundary rules
- ⚠️ Revisit if scaling or ownership changes

---

## Correlations

- ADRs → `05-architecture/decisions/records/`
- Boundary rules → `09-microservices/service-boundary-rules.md`
