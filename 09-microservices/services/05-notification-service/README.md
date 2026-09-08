# Notification

> Manages boarding/alighting events and alerts (with their types and recipients).

---

## Responsibility

Handles boarding and alighting events reported during route executions, plus alerts, their types, and recipient read tracking.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 05 |
| Local port | 8084 |
| Repository | [Repo URL] |
| DB engine | SQL Server |
| Status | In development |

---

## Responsibilities (what this service DOES)

- Record boarding events (student boards bus)
- Record alighting events (student leaves bus)
- Alert management (CRUD)
- Alert type definitions
- Alert recipient tracking (read status)

## Out of scope (what it does NOT do)

- Route scheduling — delegated to Route service
- Fleet management — delegated to Bus service

---

## How to run it locally

```bash
# From the project root
docker compose up -d notification-service

# Verify
curl http://localhost:8084/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/notification-service.yaml)
