# Data Model — Configuration

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Settings`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: SecuritySettings

**Purpose:** Stores system-wide security configuration as key-value pairs

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK, IDENTITY |
| NameSettings | VARCHAR(100) | No | Setting name | UNIQUE |
| ValueSettings | VARCHAR(100) | No | Setting value | |
| Description | VARCHAR(150) | No | Purpose of the setting | |

### Table: PasswordPolicies

**Purpose:** Defines password requirements applied at registration/reset

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK, IDENTITY |
| MinLongitude | TINYINT | No | Minimum length | |
| MaxLongitude | TINYINT | No | Maximum length | |
| RequiresCapitalLetters | TINYINT | No | Requires uppercase (flag) | |
| RequiresNumbers | TINYINT | No | Requires numbers (flag) | |
| RequiresSymbols | TINYINT | No | Requires symbols (flag) | |
| ExpirationDays | TINYINT | No | Password expiration period | |

---

## Modeling decisions

- **All columns TINYINT:** IDs, lengths, day counts and flags stay within 0–255, so every numeric column is `TINYINT` (1 byte) instead of `INT` (4 bytes) — smaller rows and indexes for values that will never grow.
- **Flag fields as TINYINT:** RequiresCapitalLetters / RequiresNumbers / RequiresSymbols are boolean-like flags stored as `TINYINT`.
- **Key-value design:** SecuritySettings is generic (name/value) to support future settings without schema changes.
