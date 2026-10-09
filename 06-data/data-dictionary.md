# Data dictionary

> Ambiguous / business-critical fields across schemas.
> One SQL Server instance, **schema per service** (ADR-002).
> Last updated: 2026-09-22

## How to read this

| Column | Meaning |
|--------|---------|
| Schema | SQL Server schema (service boundary) |
| Table.column | Physical name |
| Meaning | Business definition (not just type) |
| Allowed values / format | Enum, pattern, unit |
| Owner service | Who writes it |
| Notes | Rules, PII, soft-delete, etc. |

## Cross-schema shared concepts

| Concept | Canonical store | Consumers must not |
|---------|-----------------|--------------------|
| Person / user identity | `Iam` + `UserManagement` | Duplicate password or role rows |
| School / campus | `School` | Join across schemas for writes |
| Bus fleet unit | `Bus` | Store plate independently without FK-by-convention |
| Route assignment | `Route` | Mutate GPS raw samples |
| Position sample | `Gps` | Treat as source of truth for schedule (derived) |
| Audit trail | Application status history | UPDATE/DELETE application rows |
| Feature flags / settings | `Settings` | Hardcode env-specific flags in services |

## Per-schema highlights

### `Iam`

| Field | Meaning | Notes |
|-------|---------|-------|
| Users.email | Login identifier (normalized lowercase) | PII |
| Users.password_hash | Argon2/bcrypt hash only | Never log |
| SessionProfile.expires_at | JWT/session lifetime boundary | Aligns with ADR-008 RS256 |
| Role / Permissions / PermissionsRole | RBAC graph | Authorization checked at edge + service |

### `UserManagement`

| Field | Meaning | Notes |
|-------|---------|-------|
| Profile document type + number | National ID / passport style keys | Format per locale |
| Profile.status | Active / inactive / archived | Soft delete via `deleted_at` too |
| School linkage | Home school reference | Business key, not cluster PK |

### `School`

| Field | Meaning | Notes |
|-------|---------|-------|
| School.code | Stable institutional code | Used in URLs / reports |
| SchoolAdmin.ProfileId | Admin profile linked to one school | UNIQUE: one school per admin |
| Geographic references | Links into `Geographic` where present | Read-only from school writers |

### `Bus` / `Route` / `Gps`

| Field | Meaning | Notes |
|-------|---------|-------|
| Bus.plate / fleet_id | Physical vehicle identity | Unique per tenant rules |
| Route.geometry | Path (points / simple encoding) | Versioned with effective dates |
| Gps.lat / Gps.lon | WGS84 decimal degrees | High write rate — indexes on time+vehicle |
| Gps.recorded_at vs received_at | Device time vs server ingest | Offline-first gap detection |

### `Notification`

| Field | Meaning | Notes |
|-------|---------|-------|
| Template.key | i18n template id | Not free-text body as source of truth |
| Delivery.status | queued / sent / failed / read | Idempotent retries via Kafka (ADR-004) |
| channel | push / sms / email / webhook | Channel-specific payload envelope |

### `Settings`

| Field | Meaning | Notes |
|-------|---------|-------|
| key / value / scope | Feature or operational setting | scope = global / school / user |
| is_secret | Mask in API and logs | Never return secrets to clients |

### `Geographic` (supporting schema)

| Field | Meaning | Notes |
|-------|---------|-------|
| region / locality hierarchy | Place names and codes | Reference data; low change rate |
| geometry | Optional shapes | Keep out of hot path of `Gps` |

## PII register

| Data | Schema | Handling |
|------|--------|----------|
| Email, name, document id | Iam, UserManagement | Encrypt at rest (disk/TDE as platform), minimize logs |
| Child / student associations | UserManagement, School | Authorization by school scope |
| Live location | Gps | Retention policy; restrict to authorized roles |

## Change control

- New columns → Liquibase changelog under `database/<ms-*-db>/` (ADR-009), never ad-hoc DDL.
- This file updates in the same PR as the changelog when meaning is ambiguous or new.
