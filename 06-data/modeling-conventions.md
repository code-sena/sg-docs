# Modeling conventions

> Naming, keys, timestamps, and consistency rules for all SQL Server schemas.
> Last updated: 2026-09-22

## Language and case

| Object | Convention | Example |
|--------|------------|---------|
| Schema | PascalCase, one per service | `Iam`, `UserManagement`, `Gps` |
| Table | PascalCase singular | `User`, `Route`, `AuditLog` |
| Column | PascalCase | `CreatedAt`, `IsActive` |
| Foreign key column | `<Ref>Id` or `<Ref>Code` | `SchoolId`, `BusId` |
| Index | `IX_<Table>_<Col>[_…]` | `IX_Gps_VehicleId_RecordedAt` |
| Unique | `UQ_<Table>_<Col>` | `UQ_Iam_User_Email` |
| PK | `Id` (see surrogate keys) | `Id` |
| Check | `CK_<Table>_<rule>` | `CK_Gps_Lat` |
| FK | `FK_<Table>_<RefTable>` | `FK_Route_Bus` |

Store procedures / functions (if any): `usp_<Verb><Entity>`, `fn_<Name>`.

## Surrogate vs natural keys

- **Default:** `Id INT IDENTITY(1,1)` or `UNIQUEIDENTIFIER` — pick one style **per schema** and stick to it (align with existing Liquibase under `database/`).
- Natural/business keys used for uniqueness and external reference: `Code`, `Email`, `Plate` — always **UNIQUE** where the business demands it.
- **No cross-schema physical FKs** (ADR-002 + service-boundary-rules): reference by id/code in the application; integrity across services is eventual (Kafka/gRPC), not RDBMS FK.

## Timestamps

| Column | Type | Meaning |
|--------|------|---------|
| `CreatedAt` | `DATETIME2` (UTC) | Insert time (app writes UTC) |
| `UpdatedAt` | `DATETIME2` NULL | Last modification |
| `DeletedAt` | `DATETIME2` NULL | Soft delete marker |
| `RecordedAt` / domain times | `DATETIME2` | Domain event time (may differ from CreatedAt — e.g. GPS offline) |

Never store local-time without offset; prefer UTC everywhere.

## Soft delete

- Default for user-facing masters (`IsActive` + `DeletedAt`).
- **Not** for high-volume telemetry (`Gps` raw samples) unless legal hold — prefer retention jobs.
- **Never** for `Audit` history (append-only).

## Status and enums

- Prefer lookup tables or documented CHECK constraints over free text.
- Document allowed values in [data-dictionary.md](./data-dictionary.md).
- Adding an enum value = migration + docs in the same PR.

## Strings

- Emails/names: `NVARCHAR` lengths explicit (`NVARCHAR(320)` email).
- Codes: trim, uppercase on write if business says so — document in dictionary.
- JSON payloads: `NVARCHAR(MAX)` only when shape is truly open; else columns.

## Indexes (minimum)

- Every FK-equivalent column used in WHERE/JOIN.
- Soft-delete pattern: filtered index `WHERE DeletedAt IS NULL` where used.
- Time-series (`Gps`): `(VehicleId, RecordedAt DESC)`.
- Document rationale next to non-obvious indexes in domain docs.

## Migrations

- Tool: **Liquibase** (ADR-009); layout mirrors `database/ms-<name>-db/`.
- Expand → migrate data → contract for breaking changes (see [migration-strategy.md](./migration-strategy.md)).
- No manual prod DDL.

## What “done” means for a model change

1. Liquibase changeset(s) reviewed
2. Domain doc table updated (`domain/*.md`)
3. [data-dictionary.md](./data-dictionary.md) updated if meaning/PII/enum changed
4. OpenAPI / events touched if the API surface changed
5. ADR only if the **style** of modeling changes (not every column)
