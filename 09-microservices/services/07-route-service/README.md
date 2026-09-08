# Route

> Manages routes, stops, schedules, executions, and student/bus assignments.

---

## Responsibility

Handles route definitions, stop locations, route schedules, route executions, and route-to-bus/student assignments.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 08 |
| Local port | 8086 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schema `Route`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- Route management (CRUD)
- Stop location management
- Route schedule by day of week
- Route execution (actual trips)
- Route-bus and route-student assignments

## Out of scope (what it does NOT do)

- Boarding/event recording — delegated to Boarding service
- Fleet management — delegated to Bus service

---

## How to run it locally

```bash
# From the project root
docker compose up -d route-service

# Verify
curl http://localhost:8086/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/route-service.yaml)
