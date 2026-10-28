# ForgotInformation — implemented schema

Source checked: 2026-10-27, independently in `database` and
`schoo-guardian/sg-db`. Both checkouts contain the same recovery DDL and index
scripts; no database connection or migration was executed.

## Table: ForgotInformation.VerificationRequest

The table stores verification/recovery state. The following is the Liquibase
DDL contract, not a claim about a deployed instance:

| Column | SQL type | Nullable | Constraint/default |
|---|---|---|---|
| Id | UNIQUEIDENTIFIER | No | Primary key, supplied by caller |
| ProfileId | UNIQUEIDENTIFIER | No | Logical identifier; **no declared FK** |
| Purpose | VARCHAR(20) | No | CHECK: PasswordReset, ChangePassword, ChangeEmail, ChangePhone |
| Target | VARCHAR(100) | No | No SQL default |
| CodeHash | VARCHAR(255) | No | No SQL default |
| ResetTokenHash | VARCHAR(255) | Yes | No SQL default |
| ExpiresAt | DATETIME2 | No | No SQL default |
| AttemptCount | TINYINT | No | Default 0 |
| MaxAttempts | TINYINT | No | Default 5 |
| Status | VARCHAR(20) | No | CHECK: Pending, Verified, Consumed, Expired, Locked; default Pending |
| CreatedAt | DATETIME2 | No | Default GETUTCDATE() |
| VerifiedAt | DATETIME2 | Yes | No SQL default |
| ConsumedAt | DATETIME2 | Yes | No SQL default |
| RequestIp | VARCHAR(50) | No | No SQL default |

Two non-unique indexes:

| Name | Ordered columns |
|---|---|
| idx_verificationrequest_profile_purpose_status | ProfileId, Purpose, Status |
| idx_verificationrequest_expiresat | ExpiresAt |

Sources in each DB checkout:

- `ms-forgot-information-db/01-ddl/03-tables/001-create-table-verification-request.sql`
- `ms-forgot-information-db/01-ddl/09-indexes/001-idx-verificationrequest-profile-purpose-status.sql`
- `ms-forgot-information-db/01-ddl/09-indexes/002-idx-verificationrequest-expiresat.sql`
- `ms-forgot-information-db/changelog/changelog-master.yaml`

## EF and startup initializer are not identical to Liquibase

In the principal `sg-ms-forgot-information` service, `ForgotInformationContext`
maps the table/schema and `VerificationRequestConfiguration` configures string
lengths, enum-to-string conversion, the primary key and both named indexes.
The entity uses `Guid`, `byte`, and `DateTime`/`DateTime?` for the corresponding
SQL types. It declares no relationship for `ProfileId`.

`Program.cs` also calls `VerificationRequestSchemaInitializer.InitializeAsync`.
That initializer creates missing schema/table/indexes, using `NVARCHAR` for
strings and **no CHECK constraints or SQL defaults**. This agrees with EF's
Unicode convention, but differs from the Liquibase `VARCHAR`/CHECK/default
contract above. It does not alter an already existing table to reconcile them.

The DBML intentionally depicts the versioned Liquibase contract. Do not infer
that a table created by the runtime initializer has the same constraints.
Inventory the actual environment and design a separately authorized migration
before attempting reconciliation. This documentation adds no physical DDL,
foreign key, or migration.
