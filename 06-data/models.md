# Data Models per Service

> **What to fill in here:** The data schema for each microservice.
> Each service has its own section. Remember: **all services share a single SQL Server
> instance, each with its own schema** (ADR-002).
> Schema changes are always done with versioned migrations, never by modifying tables in place.

> **DB engine note:** This document is technology-agnostic. The examples show standard SQL
> compatible with most relational engines. For document databases
> (MongoDB) or key-value stores (Redis), adapt the diagrams and schemas to the corresponding format.
> The engine choice is documented in each service section — the scaffold does not assume which one to use.

---

## Data modeling principles

### 1. Shared Monolithic Database — Schema per Service (ADR-002)
All services share a **single SQL Server instance**, but each service only owns and
accesses its **own schema** (logical isolation). No service reads or writes another
service's schema, and there are never JOINs across schemas.
Communication between services is always via API or events.

> Deviation from the framework default "Database per Service", justified in
> `05-architecture/decisions/records/ADR-002-shared-database-monolithic-db.md`.
> If the data volume or team grows, migrate gradually to separate databases (Strangler Fig).

```
✓ Service A → schema_a (SQL Server shared instance)
✓ Service B → schema_b (SQL Server shared instance)
✗ Service A → JOIN with Service B's tables (different schema)
✗ Service A → writes to Service B's schema
```

### 2. Standard audit fields
All tables include:

```sql
id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
created_at  TIMESTAMPTZ NOT NULL     DEFAULT NOW(),
updated_at  TIMESTAMPTZ NOT NULL     DEFAULT NOW(),
deleted_at  TIMESTAMPTZ              -- NULL = active (soft delete)
```

### 3. Soft delete by default
Do not delete records with a physical DELETE. Use `deleted_at IS NOT NULL` to mark as deleted.
This facilitates auditing and recovery.

### 4. Naming conventions

```sql
-- Tables:      PascalCase, plural              → Orders, OrderItems, Users
-- Columns:     PascalCase, descriptive         → UnitPrice, delivery_date
-- FKs:         [referenced_table]Id            → CustomerId, ProductId
-- Indexes:     IDX_<Table>_<Columns>           → IDX_Order_CustomerID
-- DATETIME2:   
```

---


## Service: [service-name]

**Database:** [schema_name]

**Engine justification:**
- [Why this engine for this service. E.g.: "SQL Server — shared instance with schema isola
tion per ADR-002"]
- [Which engine features are used: JSONB, full-text search, geo, etc.]

### Table: [table_name]

**Purpose:** [What this table records]

```sql
CREATE TABLE [table_name] (
    -- ...
);

CREATE INDEX idx_[table]_[field] ON [table_name] ([field]);
CREATE INDEX idx_[table]_deleted ON [table_name] (deleted_at) WHERE deleted_at IS NULL;
-- Partial / filtered index when useful:
CREATE INDEX idx_[table]_[search_field] ON [table_name] ([search_field]);
```

**Data dictionary:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | PK |
| ... | ... | ... | ... |

**Modeling decisions:**

1. [Why field X is NOT NULL and not nullable]
2. [Why soft delete is used instead of hard delete]
3. [Why the status field has that set of values]

### Table: [related_table]

**Purpose:** [What this table records — relationships, lookup, child rows]

```sql
CREATE TABLE [related_table] (
    id          UUID PRIMARY KEY,
    [table_name]_id UUID NOT NULL REFERENCES [table_name](id),
    -- ...
);

CREATE INDEX idx_[related]_[table_name] ON [related_table]([table_name]_id);
```

---

## Migration strategy

**Tool:** [Flyway / Liquibase / Prisma Migrate / TypeORM Migrations]

**File naming convention:**

```
V1__create_orders.sql
V2__add_order_status.sql
```

**Migration rules:**

1. Migrations are immutable once applied in shared environments.
2. Never edit a deployed changeset body — add a new version.
3. Prefer expand → backfill → contract for breaking changes.
4. Every schema change ships with the owning service (Liquibase under `database/ms-*-db` when following ADR-009).

**Compatible schema changes (non-breaking):**

- Add nullable column
- Add table
- Add index
- Widen type carefully (locks / duration)

**Incompatible changes (require 2-phase migration):**

- Rename / drop column still read by running containers
- Type change that old code cannot parse
- Split table with dual-write window

---

## DB engine selection guide

| Engine | Use when... | Avoid when... |
|--------|------------|---------------|
| **SQL Server** | ACID transactions, RBAC relationships, and shared schemas | Ephemeral counters or unstructured event streams |
| **MongoDB** | Flexible documents and catalog-style data | Complex transactions across collections |
| **Redis** | Cache, sessions, TTL state, and counters | Source of truth for identity or authorization |
| **Elasticsearch** | Full-text search, analytics, and logs | Authoritative identity data |

---

## Relationship diagram (per service)

Use Mermaid ER or PlantUML; export under `08-uml/diagrams/`.

```mermaid
erDiagram
    [table_name] ||--o{ [related_table] : has
    [table_name] {
        UUID id PK
        TIMESTAMPTZ created_at
        TIMESTAMPTZ deleted_at
    }
```

---

## Correlations

| Document | Relationship |
|----------|--------------|
| `domain/*.md` | Filled model **per schema** (copy structure from this scaffold) |
| `data-dictionary.md` | Ambiguous / PII field meanings |
| `modeling-conventions.md` | Naming, keys, timestamps |
| `normalization-assessment.md` | Intentional denormalization |
| `migration-strategy.md` | Liquibase / expand-contract |
| `07-api/contracts/` | What each service exposes |
| `08-uml/` | ER / sequence diagrams |
| `09-microservices/services/*/data-model.md` | Service-owned summary |
