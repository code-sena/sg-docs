# Design Decisions — Forgot Information

> Technical decisions specific to this service (not global architectural ones — those go in
> `05-architecture/decisions/`). This service is the first real implementation of ADR-004
> (Kafka) and ADR-005 (gRPC), so several decisions here establish the pattern other services
> should follow afterward.

---

## [DEC-001] OTP storage: SQL Server table instead of Redis

**Date:** 2026-10-01
**Status:** Active

**Context:**
The project documents Redis as the intended store for ephemeral/TTL state (see
`09-microservices/services/01-api-gateway/data-model.md` and `.env.example`), but no Redis
instance is deployed anywhere in the codebase yet.

**Decision:**
Store verification requests in the shared SQL Server instance (`ForgotInformation.VerificationRequest`,
see `data-model.md`), with `ExpiresAt` enforced in application logic and a periodic cleanup job,
instead of introducing Redis as net-new infrastructure for this first iteration.

**Alternatives considered:**
- Redis with native TTL: cleaner expiration semantics, but would make this service the one
  to introduce brand-new infrastructure (Redis container, client library, ops runbook) purely
  to support a feature that can work correctly on existing infrastructure.

**Consequences:**
- ✅ No new infrastructure dependency; reuses the SQL Server instance and Liquibase pipeline every other service already uses
- ✅ Verification requests are naturally covered by the existing SQL Server backup/ops story
- ⚠️ Expiration is enforced by the application (`WHERE ExpiresAt > GETUTCDATE()`), not by the
  store itself — a cleanup job must run periodically to physically delete expired rows
- ⚠️ If OTP volume grows significantly, this should be revisited in favor of Redis (the
  decision should be superseded here, not silently changed in code)

---

## [DEC-002] Synchronous communication via REST + internal API key

**Date:** 2026-10-07
**Status:** Active (supersedes the original gRPC plan)

**Context:**
The original plan was gRPC (ADR-005) with `iam.proto` and `user_management.proto`. No `.proto`
contract was ever created and `ms-iam` (Spring) already exposes REST endpoints.

**Decision:**
`ms-forgot-information` calls `ms-iam` over REST using the shared internal key
(`INTERNAL_API_KEY`, validated by the IAM `InternalApiKeyFilter`). Endpoints used:
`GET /api/profiles/by-email`, `GET /api/profiles/by-phone`, `PUT /api/profiles/{id}/password`,
`PUT /api/profiles/{id}/email`, `POST /api/profiles/{id}/phone/matches`, `PUT /api/profiles/{id}/phone`.
Email and phone updates reach `ms-user-management` through IAM, not directly.

**Consequences:**
- ✅ No new codegen tooling; works with the existing stack
- ✅ One-way dependency: forgot-information → IAM
- ⚠️ ADR-005 (gRPC) is not followed here; revisit if gRPC is adopted project-wide
- ⚠️ The internal key must be identical in both services and never exposed to clients

---

## [DEC-006] SMS codes delegated to Twilio Verify

**Date:** 2026-10-07
**Status:** Active

**Decision:**
Phone changes verify the current and the new phone with Twilio Verify (API Key/Secret and Verify
Service SID). Twilio generates, sends and checks the code; this service keeps only a ledger row
(target, expiry, attempts, rate limit) with a placeholder hash. The phone is updated in IAM only
when Twilio answers `approved`.

**Consequences:**
- ✅ No SMS code is generated or stored locally
- ⚠️ Twilio *trial* accounts only deliver to verified numbers and prefix a test text
- ⚠️ Without `TWILIO_*` variables the SMS endpoints answer 503 (`delivery_failed`)
---

## [DEC-003] Password-change verification policy

**Date:** 2026-10-01
**Status:** Active — flagged for confirmation

**Context:**
Neither `dvlp-back` (legacy monolith) nor `ms-iam` define an existing password
policy to reuse. The project has no prior art to follow here.

**Decision:**
An authenticated password change requires **either** the current password **or** a verified
OTP sent to the profile's current email — not both, and not neither. The OTP path exists so a
user who forgot their current password but is still logged in (valid session) is not
forced to log out and go through full password recovery.

**Alternatives considered:**
- Require current password only: simpler, but blocks the "I'm logged in on my phone but
  forgot my password" case, which is one of the stated goals of this service.
- Require current password **and** OTP: safer, but adds friction without a documented
  security requirement forcing it; can be revisited if a future security review asks for it.

**Consequences:**
- ✅ Covers both the "I know my password" and "I'm logged in but forgot it" cases with one flow
- ⚠️ This is a product/security policy decision with no prior precedent in the codebase — must
  be confirmed with the team before implementation, not just inferred

---

## [DEC-004] No sensitive data in logs or event payloads

**Date:** 2026-10-01
**Status:** Active

**Context:**
No shared logging framework or redaction policy exists yet in any .NET service in the
workspace to copy from.

**Decision:**
Structured logs for this service include `profileId`, `purpose`, and `outcome` only. OTP
values, password values/hashes, and JWTs are never logged, never included in exceptions sent
to clients, and never included in Kafka event payloads (see `events.md`).

**Consequences:**
- ✅ Satisfies the project's stated security requirement without depending on infrastructure
  that does not exist yet (e.g. a centralized redaction proxy)
- ⚠️ Must be enforced by code review / lint rule once implemented, since nothing currently
  blocks a future PR from accidentally logging a code or token

---

## [DEC-005] Explicit errors instead of anti-enumeration; rate limiting in own database

**Date:** 2026-10-07
**Status:** Active (supersedes the original anti-enumeration decision)

**Context:**
The first design answered `password/forgot` identically whether or not the account existed.
That made failures invisible: with a wrong email or phone, or a failing SMTP/SMS provider, users
saw "code sent" and nothing arrived (notably in the mobile app).

**Decision:**
- The request endpoints report why no code was sent: `404 account_not_found`,
  `400 phone_mismatch`, `503 delivery_failed`, `429 rate_limited` (body `{message, code}`).
  Web and mobile map these codes to translated messages (es, en, fr, pt).
- This **deliberately reveals** whether an email/phone is registered. The product owner accepted
  the trade-off; rate limiting is the mitigation.
- Rate limiting counts recent `VerificationRequest` rows per `ProfileID` + `Purpose`
  (default 3 requests per 10 minutes), plus a per-IP limiter (`otp-public`).
- A code whose delivery fails is consumed immediately so it can never be verified.

**Consequences:**
- ✅ Users and support can tell what went wrong
- ⚠️ Account/phone enumeration is possible; revisit if the threat model changes
- ⚠️ When the gateway-level Redis rate limiting ships, this remains as a second layer

---

## [DEC-007] Password reset vs password change emails

**Date:** 2026-10-07
**Status:** Active

**Decision:**
Both flows share `/api/v1/password/*`. The optional `isPasswordChange` flag on `forgot` selects
the email wording: reset (no session) says "Restablecer contraseña"; change (with session) says
"Cambiar contraseña". Resending a code keeps the original flavor.
