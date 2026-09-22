# Bus

> Manages the school bus fleet, brands, and models.

---

## Responsibility

Handles bus registry, assigned drivers, GPS device association, vehicle models, and brands.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 06 |
| Local port | 8085 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schema `Bus`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- Bus fleet management (CRUD)
- Bus model and brand management
- GPS device association to buses
- Driver assignment to buses

## Out of scope (what it does NOT do)

- Route planning — delegated to Route service
- GPS position tracking — delegated to GPS service

---

## How to run it locally

```bash
# From the project root
docker compose up -d bus-service

# Verify
curl http://localhost:8085/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/bus-service.yaml)
