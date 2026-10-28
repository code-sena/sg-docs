# 06 — Data

> **What is this?** How the system stores, structures, and migrates data.
> In microservices, data management is one of the most complex challenges.

## Fundamental principle in microservices

> **All services share a single SQL Server instance, each with its own schema.**

Per ADR-002, this project uses a **shared monolithic database** (one SQL Server) with a
**separate schema per service** (logical isolation). Schema ownership is the architectural
goal, not enforced physical isolation: the implemented EF contexts include cross-schema
read models and the versioned SQL declares cross-schema foreign keys. API/event boundaries
do not eliminate those existing dependencies. The migration path to a full "Database per
Service" is documented in ADR-002 (Strangler Fig).

## Implementation evidence (2026-10-27)

The canonical `database` checkout and `schoo-guardian/sg-db` are separate revisions;
their migrations must not be mixed. Each has 34 DDL tables across nine schemas.
Their original DBML files also had 34 tables, but omitted
`ForgotInformation.VerificationRequest` and included an unsupported `Audit` table.
The corrected diagrams align those table sets, use the physical `Fleet` group
(not a `Bus` schema), and retain the implemented spelling `DriverAssignemts`.

The [recovery model](./domain/forgot-information.md) distinguishes Liquibase DDL
from the implemented .NET startup initializer. GPS tables are versioned SQL,
but the GPS service currently keeps devices/latest locations in memory; no GPS
JPA entities were found. Neither a diagram nor a dependency proves live persistence.

The `database` README records the static EF/JPA/DDL comparison and unresolved
differences, including EF-only `Person.CityId`/`SchoolId`, nullable SQL versus
required EF `RouteExecution.RouteId`, and Unicode/default/CHECK differences in
recovery. `database` includes school address migration 007 (`VARCHAR(255)`),
while this workspace's `sg-db` revision does not (`VARCHAR(30)`).
Both contain route script 010 (`RouteExecution.Direction`), but neither includes
it in the checked-in changelog: a field in a SQL file/diagram is not proof that
the migration runner creates it.

The older model examples/dictionary below are not an exhaustive physical schema
or evidence of deployment. Prefer each checkout's SQL plus its own ordered
migrations; consult its README for limitations. No real database was inspected.

---


## File map

| File | Role | Status |
|------|------|--------|
| [models.md](./models.md) | **Scaffold/guide** for filling a new service model (placeholders) | ✅ template |
| [domain/](./domain/) | Filled table models per schema | ✅ 9 schemas |
| [domain/forgot-information.md](./domain/forgot-information.md) | Recovery table, constraints and initializer differences | Source-checked |
| [data-dictionary.md](./data-dictionary.md) | Ambiguous / PII / enum meanings | ✅ |
| [modeling-conventions.md](./modeling-conventions.md) | Naming, keys, timestamps | ✅ |
| [normalization-assessment.md](./normalization-assessment.md) | Intentional denormalization | ✅ |
| [migration-strategy.md](./migration-strategy.md) | Liquibase / expand-contract | ✅ |

## What is here and how to fill it in

### `models.md` ⭐
Data models for each microservice.
**Fill in:** ER (entity-relationship) diagram or description of collections/tables for each service.

**Format per service:**
```markdown
## Service: [name]
**DB Engine:** SQL Server (ADR-002) for all services
**Justification:** [why this engine for this service]

### Table/Collection: [name]
| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| id | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| [field] | [type] | [Yes/No] | [description] | [FK/Unique/etc.] |

### Indexes
| Name | Fields | Type | Justification |
|------|--------|------|---------------|
```

### `data-dictionary.md` ⭐
Exact meaning of each important field in the system.
**Fill in:** especially for fields that may be ambiguous or have business rules.

**Format:**
```markdown
| Field | Service | Table | Type | Detailed description | Possible values |
|-------|---------|-------|------|---------------------|-----------------|
| status | scheduling | schedule | ENUM | Current status of the schedule | ACTIVE, CANCELLED, PENDING |
```

### `modeling-conventions.md`
Naming and style conventions for the project's databases.
**Fill in:** naming (snake_case or camelCase), use of UUIDs vs sequential, standard timestamps,
soft delete vs hard delete, auditing (created_at, updated_at, created_by).

### `normalization-assessment.md`
Analysis of the normalization level and justification for denormalizations.
**Fill in:** for each intentional denormalization, explain why (performance, simplification).

### `migration-strategy.md`
Strategy for migrating data between schema versions.
**Fill in:** migration tool (Liquibase — see ADR-009), rollback policy,
how to handle migrations with data in production.

---

## Correlations with other sections

| This section is fed by... | And feeds into... |
|---------------------------|-------------------|
| `02-domain/entities-and-rules.md` → domain entities | DB tables |
| `05-architecture/` → DB engine decisions | Engine choice in `models.md` |
| `models.md` | `07-api/contracts/` → what data each service exposes |
| `models.md` | `08-uml/` → ER diagrams |
| `models.md` | `09-microservices/[service]/data-model.md` |

---

## Important data decisions in microservices

### SQL or NoSQL?
There is no single answer. It depends on the service:
- **SQL** (SQL Server): relational data, ACID transactions, fixed schema (ADR-002)
- **Document** (MongoDB): hierarchical data, flexible schema, high variability
- **Time series** (InfluxDB, TimescaleDB): metrics, event logs

### How to handle consistency between services?
Without a shared database, consistency is **eventual**:
- Saga Pattern: chain of compensating transactions
- Outbox Pattern: guarantee that the event is published along with the transaction

---

## Questions this section must answer

- What data does each microservice handle?
- Why was that database engine chosen for each service?
- How is the schema updated without breaking the system?
- Who is the "owner" of each piece of data in the system?
