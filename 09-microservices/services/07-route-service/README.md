# Route

> Routes, stops, schedules, executions, and bus/student assignments.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 07 |
| Local port | 8080 |
| Stack | C# + ASP.NET |
| SQL Server schema | `Route` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | school-service (reference), bus-service (bus validity) |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- CRUD routes, ordered stops, schedules
- Assign bus and students (boarding/alighting stop)
- Run route executions and expose status
- Publish route.* events

## Out of scope (what it does NOT do)

- Fleet master data → bus-service
- QR boarding records → notification-service
- Live GPS points → gps-service

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/routes` | List routes |
| POST | `/routes` | Create route |
| GET | `/routes/{id}` | Get route |
| PUT | `/routes/{id}` | Update route |
| DELETE | `/routes/{id}` | Delete route |
| POST | `/routes/{id}/stops` | Add stop |
| POST | `/routes/{id}/bus` | Assign bus |
| POST | `/routes/{id}/students` | Assign student |
| GET | `/routes/{id}/schedules` | List schedules |
| GET | `/executions` | List executions |
| POST | `/executions` | Start execution |

## How to run it locally

```bash
docker compose up -d route-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Route`; tables: Route, Stop, RouteStop, RouteBusAssignments, RouteStudentAssignments, RouteSchedule, RouteExecution
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/route-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
