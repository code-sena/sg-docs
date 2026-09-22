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
-- Indexes:     IX_<Table>_<Columns>            → IX_Order_CustomerID
-- DATETIME2:   
```

---

## Service: [service-name]

**DB Engine:** PostgreSQL 15 / MongoDB 7 / Redis 7 — [justification for the choice]

**Engine justification:**
- [Why this engine for this service. E.g.: "PostgreSQL for ACID support in financial transactions"]
- [Which engine features are used: JSONB, full-text search, geo, etc.]

### Table: [table_name]

**Purpose:** [What this table records]

```sql
CREATE TABLE [table_name] (
  id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  
  -- Business fields
  [field1]        [TYPE]      NOT NULL,
  [field2]        [TYPE],
  [field3]        [TYPE]      NOT NULL DEFAULT [value],
  
  -- Relationships
  [reference]_id  UNIQUEIDENTIFIER REFERENCES [referenced_table](id) ON DELETE RESTRICT,
  
  -- Status fields
  status          VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE', 'INACTIVE', 'CANCELLED')),
  
  -- Audit (in all tables)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  created_by      UNIQUEIDENTIFIER,
  updated_by      UNIQUEIDENTIFIER
);

-- Indexes
CREATE INDEX idx_[table]_[field] ON [table_name] ([field]);
CREATE INDEX idx_[table]_deleted ON [table_name] (deleted_at) WHERE deleted_at IS NULL;
-- For frequent searches:
CREATE INDEX idx_[table]_[search_field] ON [table_name] ([search_field]);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | UNIQUEIDENTIFIER | Auto-generated unique identifier | `550e8400-...` |
| [field1] | [TYPE] | [Business description] | [Example] |
| status | VARCHAR(50) | Lifecycle status | `ACTIVE` |
| created_at | TIMESTAMPTZ | When the record was created | `2024-01-15T10:30:00Z` |
| deleted_at | TIMESTAMPTZ | NULL = active; with value = deleted | `NULL` |

**Modeling decisions:**
1. [Why field X is NOT NULL and not nullable]
2. [Why soft delete is used instead of hard delete]
3. [Why the status field has that set of values]

---

### Table: [related_table]

```sql
CREATE TABLE [related_table] (
  id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  [principal]_id  UNIQUEIDENTIFIER NOT NULL REFERENCES [principal_table](id) ON DELETE CASCADE,
  
  -- Fields
  [field]         [TYPE]      NOT NULL,
  
  -- Audit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_[related_table]_[principal]_id ON [related_table] ([principal]_id);
```

---

## Migration strategy

**Tool:** [Flyway / Liquibase / Prisma Migrate / TypeORM Migrations]

**File naming convention:**

```
V{version_number}__{snake_case_description}.sql

Examples:
  V001__create_orders_table.sql
  V002__add_status_to_orders.sql
  V003__create_index_orders_customer_id.sql
```

**Migration rules:**

```
✓ Migrations are ALWAYS forward-only
✓ One migration per logical change
✓ Seed data goes in separate migrations with prefix S: S001__seed_...
✗ Never modify a migration already executed in any environment
✗ Never do DROP COLUMN / DROP TABLE in a migration if there is code in production that uses it
    (process: 1-deprecate in code → 2-cleanup migration in the next release)
```

**Compatible schema changes (non-breaking):**

```sql
-- Add nullable column → always safe
ALTER TABLE orders ADD COLUMN notes TEXT;

-- Add NOT NULL column with DEFAULT → safe if DEFAULT is valid
ALTER TABLE orders ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL';

-- Create new index → safe (in production use CONCURRENTLY)
CREATE INDEX CONCURRENTLY idx_orders_date ON orders (created_at);
```

**Incompatible changes (require 2-phase migration):**

```sql
-- Rename column → 2 phases:
-- Phase 1 (release N): Add new column, copy data, update code to use both
ALTER TABLE orders ADD COLUMN delivery_date TIMESTAMPTZ;
UPDATE orders SET delivery_date = fecha_entrega;

-- Phase 2 (release N+1): Remove old column (code no longer uses it)
ALTER TABLE orders DROP COLUMN fecha_entrega;
```

---

## DB engine selection guide

| Engine | Use when... | Avoid when... |
|--------|------------|---------------|
| **PostgreSQL** | ACID transactions, complex relationships, JSONB, full-text | Deeply nested documents, graphs |
| **MongoDB** | Flexible documents, product catalogs, catalogs | Complex transactions across collections |
| **Redis** | Cache, sessions, lightweight queues, counters | Source of truth, critical data |
| **Elasticsearch** | Full-text search, analytics, logs | Source of truth (it's an index, not a DB) |
| **InfluxDB / TimescaleDB** | Time series, metrics, IoT | Transactional business data |

---

## Relationship diagram (per service)

```
Replace with an ER diagram of the service using your preferred tool's notation.

Mermaid example:
\```mermaid
erDiagram
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS {
        uniqueidentifier id PK
        uniqueidentifier customer_id FK
        varchar status
        decimal total
        timestamptz created_at
    }
    ORDER_ITEMS {
        uniqueidentifier id PK
        uniqueidentifier order_id FK
        uniqueidentifier product_id FK
        integer quantity
        decimal unit_price
    }
\```
```

---

## Correlations

- Domain entities that map to these tables → `02-domain/entities-and-rules.md`
- Saga and Outbox pattern for distributed consistency → `05-architecture/pattern-guide.md`
- Data for each service in detail → `09-microservices/services/XX/data-model.md`
- How data is accessed via API → `07-api/contracts/openapi/`
