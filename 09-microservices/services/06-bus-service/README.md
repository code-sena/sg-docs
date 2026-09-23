# Bus

> Bus fleet, brands, models, and driver assignments.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 06 |
| Local port | 8080 |
| Stack | C# + ASP.NET |
| SQL Server schema | `Bus` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | — |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- CRUD buses, brands, models
- Assign/unassign driver to bus
- Track SOAT validity and GPS-enabled flag

## Out of scope (what it does NOT do)

- Route↔bus assignment → route-service
- GPS positions → gps-service

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/buses` | List buses |
| POST | `/buses` | Create bus |
| GET | `/buses/{id}` | Get bus |
| PUT | `/buses/{id}` | Update bus |
| POST | `/buses/{id}/driver` | Assign driver |
| DELETE | `/buses/{id}/driver` | Unassign driver |
| GET | `/brands` | List brands |
| GET | `/models` | List models |

## How to run it locally

```bash
docker compose up -d bus-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Bus`; tables: Bus, Brand, Model, DriverAssignments
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/bus-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
