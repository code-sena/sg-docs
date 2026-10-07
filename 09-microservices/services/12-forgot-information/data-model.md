# Data Model — Forgot Information

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.
> It does **not** own Person, Profile, or password-hash data — see `ms-iam` and
> `ms-user-management` for those.

---

## Database engine

**Engine:** SQL Server
**Schema:** `ForgotInformation`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002). No
separate engine is introduced because the volume and access pattern (short-lived rows,
occasional writes) does not justify adding new infrastructure (e.g. Redis) before it is
actually needed — see `decisions.md` DEC-001 for the Redis alternative and when to revisit it.

---

## Schema

### Table: VerificationRequest

**Purpose:** Represents a single OTP challenge issued for one purpose (password reset,
password change, email change, or phone change). This is the only durable state this
service keeps — there is no copy of `Person` or `Profile` here.

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| ProfileID | UNIQUEIDENTIFIER | No | Owner of the request | Reference to `Profile.ID` in IAM, no local copy of profile data |
| Purpose | VARCHAR(20) | No | What the code authorizes | Stored as the enum name: `PasswordReset`, `EmailChange`, `EmailChangeConfirm`, `PhoneChange`, `PhoneChangeConfirm` |
| Target | VARCHAR(100) | No | Destination of the code: current email for `PasswordReset`/`EmailChange`, new email for `EmailChangeConfirm`, new E.164 phone for `PhoneChangeConfirm` | |
| CodeHash | VARCHAR(255) | No | HMAC-SHA256 hash of the OTP (salt + `Otp__HashPepper`). For Twilio challenges it is a placeholder that can never match user input | Never stored in plaintext |
| ExpiresAt | DATETIME2 | No | Expiration instant | Short TTL (minutes), enforced in application logic |
| AttemptCount | TINYINT | No | Failed verification attempts so far | Default: 0 |
| MaxAttempts | TINYINT | No | Attempts allowed before lockout | Default: 5 |
| Status | VARCHAR(20) | No | Lifecycle state | `Pending`, `Verified`, `Consumed`, `Expired`, `Locked` |
| ResetTokenHash | VARCHAR(255) | Yes | Hash of the one-time reset token issued after a successful verification | NULL until verified; never stored in plaintext |
| CreatedAt | DATETIME2 | No | Request creation time | Default: current timestamp |
| VerifiedAt | DATETIME2 | Yes | When the code was successfully verified | NULL until verified |
| ConsumedAt | DATETIME2 | Yes | When the underlying change was actually applied | NULL until the password/email/phone update is confirmed by `ms-iam` |
| RequestIp | VARCHAR(50) | No | Origin IP of the request, for rate limiting and audit | |

**Relationships:**
- `ProfileID` → FK to `Profile.ID` in IAM service (read-only reference, no join across DBs — resolved through the IAM REST API, not a physical FK across schemas)

### Indexes

| Name | Fields | Type | Justification |
|------|--------|------|---------------|
| idx_verificationrequest_profile_purpose_status | ProfileID, Purpose, Status | BTREE | Enforce "one active code per purpose" and support rate limiting (count recent requests per profile+purpose) |
| idx_verificationrequest_expiresat | ExpiresAt | BTREE | Background cleanup/expiration job |

---

## Modeling decisions

- **No copy of Person/Profile/password data:** `ProfileID` is only a reference used to call
  `ms-iam` through its REST API; this service never reads or writes those
  tables directly (see ADR-002 — a shared DB is not an invitation to cross-schema joins).
- **Single table for all flows:** `Purpose` discriminates password reset, email change (current and new mailbox) and phone change instead of separate tables, since the shape of
  a "verification challenge" is identical across all of them.
- **`CodeHash`, never plaintext:** the OTP is hashed the same way a password would be;
  comparison happens by hashing the submitted code and comparing hashes.
- **Rate limiting reuses this table:** instead of a separate rate-limit table, the count of
  `PENDING`/recent rows per `ProfileID` + `Purpose` within a time window is used to block
  excessive requests (see `decisions.md` DEC-005).
- **`ConsumedAt` vs `VerifiedAt`:** verifying the code and applying the actual change are two
  different instants — a code can be verified but the downstream update to
  `ms-iam` could still fail, so both timestamps are tracked
  separately for auditability.

---

## Schema migration

**Tool:** Liquibase for the shared schema (`sg-db/`). The service also runs EF Core against the `ForgotInformation` schema (`HasDefaultSchema`).
**Script location:** `sg-db/ms-forgot-information-db/01-ddl/`
**Naming convention:** same as existing services — `NNN-create-table-verification-request.sql`
under `03-tables/`, with schema creation under `01-schema/` (see `sg-db/ms-iam-db` for the
folder layout to replicate).

**Rollback policy:**
- Liquibase `rollback` per changeset, same as the rest of `sg-db` services — no custom
  rollback tooling introduced for this service.

---

## Related schema note

`UserManagement.Person.Phone` is `BIGINT` (it was `INT`) so 10-digit mobile numbers fit. Existing
databases need `ALTER TABLE UserManagement.Person ALTER COLUMN Phone BIGINT NOT NULL;`.

---

## Related schema note

`UserManagement.Person.Phone` is `BIGINT` (it was `INT`) so 10-digit mobile numbers fit. Existing
databases need `ALTER TABLE UserManagement.Person ALTER COLUMN Phone BIGINT NOT NULL;`.
