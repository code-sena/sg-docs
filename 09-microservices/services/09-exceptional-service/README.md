# Exceptional

> Exceptional driver and route usage outside normal assignments.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 09 |
| Local port | 8080 |
| Stack | C# + ASP.NET |
| SQL Server schema | `Exceptional` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | — |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- Record exceptional driver usage
- Record exceptional route usage
- Validate bus/driver/route via owner APIs

## Out of scope (what it does NOT do)

- Normal assignments → bus/route services
- Approval workflow (future epic)

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/driver-usages` | List driver usages |
| POST | `/driver-usages` | Record driver usage |
| GET | `/route-usages` | List route usages |
| POST | `/route-usages` | Record route usage |

## How to run it locally

```bash
docker compose up -d exceptional-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Exceptional`; tables: ExceptionalDriverUsage, ExceptionalRouteUsage
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/exceptional-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
