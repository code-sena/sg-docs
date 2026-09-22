# Audit

> Manages audit trail and error logs.

---

## Responsibility

Records audit actions performed by profiles and captures system error logs.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 11 |
| Local port | 8089 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schema `Audit`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- Audit trail for user actions
- System error logging

## Out of scope (what it does NOT do)

- Business logic — this is an observability/cross-cutting service

---

## How to run it locally

```bash
# From the project root
docker compose up -d audit-service

# Verify
curl http://localhost:8089/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/audit-service.yaml)
