# Data Models per Service

## Service: Configuration

**DB Engine:** SQL Server 15.

**Engine justification:**
- SQL Server provides durable transactional storage for security settings and password policies.
- Schema isolation keeps configuration ownership explicit in the shared database.

### Table: SecuritySettings

**Purpose:** Stores system-wide security settings as key-value records.

```sql
CREATE TABLE SecuritySettings (
	Id TINYINT PRIMARY KEY IDENTITY, 
    NameSettings VARCHAR(100) NOT NULL,
	ValueSettings VARCHAR(100) NOT NULL, 
    Description VARCHAR(255) NOT NULL
);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Id | INT | Setting identifier | `1` |
| NameSettings | VARCHAR(100) | Setting name | `SessionTimeout` |
| ValueSettings | VARCHAR(100) | Setting value | `30` |
| Description | VARCHAR(255) | Setting purpose | `Session lifetime in minutes` |

**Modeling decisions:**
1. Key-value rows allow new settings without schema changes.
2. A unique setting name prevents ambiguous configuration resolution.

### Table: PasswordPolicies

**Purpose:** Defines password requirements for registration and reset.

```sql
CREATE TABLE PasswordPolicies (
	Id TINYINT PRIMARY KEY IDENTITY, 
    MinLongitude BYTE NOT NULL, 
    MaxLongitude BYTE NOT NULL,
	RequiresCapitalLetters BYTE NOT NULL, 
    RequiresNumbers BYTE NOT NULL,
	RequiresSymbols BYTE NOT NULL, 
    ExpirationDays BYTE NOT NULL
);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Id | INT | Policy identifier | `1` |
| MinLongitude | BYTE | Minimum password length | `8` |
| MaxLongitude | BYTE | Maximum password length | `64` |
| RequiresCapitalLetters | BYTE | Uppercase requirement flag | `1` |
| RequiresNumbers | BYTE | Number requirement flag | `1` |
| RequiresSymbols | BYTE | Symbol requirement flag | `0` |
| ExpirationDays | BYTE | Password validity period | `90` |

**Modeling decisions:**
1. `BYTE` flags preserve the source model and support compact policy storage.
2. Numeric bounds are data so policy changes do not require code changes.

### Indexes

| Name | Fields | Type | Justification |
|------|--------|------|---------------|
| UX_SecuritySettings_NameSettings | NameSettings | Unique | Prevents duplicate setting names |

## Migration strategy

**Tool:** Versioned SQL Server migrations.

**File naming convention:** `V{Version}__{Description}.sql`

**Migration rules:**
1. Migrations are forward-only and immutable after execution.
2. Seed settings and policies in separate, repeatable deployment steps.
3. Add new policy fields compatibly before enforcing them in application code.

```
Migrations are forward-only and immutable after execution.
Seed settings are separated from structural schema changes.
Policy changes are validated before they become mandatory for consumers.
```

**Compatible schema changes (non-breaking):**

```sql
ALTER TABLE SecuritySettings ADD Environment VARCHAR(30) NULL;
CREATE INDEX IX_SecuritySettings_ValueSettings ON SecuritySettings (ValueSettings);
CREATE UNIQUE INDEX UX_SecuritySettings_NameSettings ON SecuritySettings (NameSettings);
```

**Incompatible changes (require 2-phase migration):**

```sql
ALTER TABLE SecuritySettings ADD SettingName VARCHAR(100) NULL;
UPDATE SecuritySettings SET SettingName = NameSettings;
ALTER TABLE SecuritySettings DROP COLUMN NameSettings;
```

## DB engine selection guide

| Engine | Use when... | Avoid when... |
|--------|------------|---------------|
| **SQL Server** | Durable settings, password policies, and transactional configuration | Ephemeral counters or cache-only state |
| **PostgreSQL** | ACID transactions, complex relationships, JSONB, full-text search | Deeply nested documents |
| **MongoDB** | Flexible configuration documents | Complex transactions across collections |
| **Redis** | Cache, sessions, TTL state, and counters | Authoritative security configuration |
| **Elasticsearch** | Search and analytics over configuration history | Source of truth for settings |

## Relationship diagram (per service)

```mermaid
erDiagram
		SecuritySettings
		PasswordPolicies
```

## Correlations

- Authoritative source: `09-microservices/services/11-configuration-service/data-model.md`
- Authentication consumer: `06-data/domain/iam.md`
- Environment overrides: `10-devops/environments.md`
