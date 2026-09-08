# Data Model — Configuration

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Configuration`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: SecuritySettings

**Purpose:** Stores system-wide security configuration as key-value pairs

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | INT | No | Unique identifier | PK, AUTO_INCREMENT |
| NameSettings | VARCHAR(100) | No | Setting name | |
| ValueSettings | VARCHAR(100) | No | Setting value | |
| Description | VARCHAR(255) | No | Purpose of the setting | |

### Table: PasswordPolicies

**Purpose:** Defines password requirements applied at registration/reset

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | INT | No | Unique identifier | PK, AUTO_INCREMENT |
| MinLongitude | BYTE | No | Minimum length | |
| MaxLongitude | BYTE | No | Maximum length | |
| RequiresCapitalLetters | BYTE | No | Requires uppercase (flag) | |
| RequiresNumbers | BYTE | No | Requires numbers (flag) | |
| RequiresSymbols | BYTE | No | Requires symbols (flag) | |
| ExpirationDays | BYTE | No | Password expiration period | |

---

## Modeling decisions

- **Flag fields as BYTE:** RequiresCapitalLetters / RequiresNumbers / RequiresSymbols use BYTE as boolean-like flags.
- **Key-value design:** SecuritySettings is generic (name/value) to support future settings without schema changes.
