# Storage and documents

Last updated: 2026-09-22

## Systems of record

| Store | Role | Notes |
|-------|------|-------|
| **SQL Server** (one instance) | Primary OLTP | Schema per service (ADR-002); Liquibase (ADR-009) |
| **Redis** | Ephemeral edge/cache | api-gateway rate/session aids — not source of truth |
| **Kafka** | Event log | Durable history per retention (ADR-004) |
| Object/blob (optional later) | Exports, large media | Not a core MVP dependency |

## What must not happen

- Second primary DB product per service without ADR
- Cross-schema joins in application code
- Storing secrets in tables readable by UI

## Document-like data

| Data | Home | Access |
|------|------|--------|
| Audit entries | `Audit` schema | Append-only API |
| Config/docs flags | `Configuration` | Admin API |
| Binary attachments (if any) | blob store | Short-lived URLs |

## Related

- Ownership: [data-ownership-matrix.md](./data-ownership-matrix.md)
- Models: `06-data/` · Patterns: [communication-patterns.md](./communication-patterns.md)
