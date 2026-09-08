# Exceptional

> Manages exceptional (out-of-pattern) driver and route usage.

---

## Responsibility

Records special-use cases: exceptional driver usage and exceptional route usage outside the normal schedule.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 10 |
| Local port | 8088 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schema `Exceptional`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- Exceptional driver usage records
- Exceptional route usage records

## Out of scope (what it does NOT do)

- Normal route scheduling — delegated to Route service
- Boarding events — delegated to Boarding service

---

## How to run it locally

```bash
# From the project root
docker compose up -d exceptional-service

# Verify
curl http://localhost:8088/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/exceptional-service.yaml)
