# GPS

> Manages GPS devices and position history of the bus fleet.

---

## Responsibility

Handles GPS device registry and the stream of location points reported by each device.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 09 |
| Local port | 8087 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schema `Gps`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- GPS device registry (CRUD)
- Location history per device
- Real-time position queries

## Out of scope (what it does NOT do)

- Fleet management — delegated to Bus service
- Route planning — delegated to Route service

---

## How to run it locally

```bash
# From the project root
docker compose up -d gps-service

# Verify
curl http://localhost:8087/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/gps-service.yaml)
