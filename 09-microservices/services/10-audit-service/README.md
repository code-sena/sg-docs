# Audit

> Audit trail and error logs across the platform.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 10 |
| Local port | 8080 |
| Stack | C# + ASP.NET |
| SQL Server schema | `Audit` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | iam-service (actor resolution) |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- Ingest audit actions from all services (Kafka)
- Persist audit records and error logs
- Expose query API for compliance

## Out of scope (what it does NOT do)

- Deciding what to audit (producers decide)
- Cold storage (future archive)

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/entries` | Query audit trail |
| POST | `/entries` | Internal ingest |
| GET | `/errors` | Query error logs |

## How to run it locally

```bash
docker compose up -d audit-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Audit`; tables: Audit, LogErrors
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/audit-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
