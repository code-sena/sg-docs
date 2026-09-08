# Configuration

> Manages system-wide security settings and password policies.

---

## Responsibility

Handles security settings (key-value configuration) and password policy definitions used across the system.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 12 |
| Local port | 8090 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schema `Configuration`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- Security settings management (key-value)
- Password policy definitions

## Out of scope (what it does NOT do)

- Authentication logic — delegated to IAM service
- Session management — delegated to IAM service

---

## How to run it locally

```bash
# From the project root
docker compose up -d configuration-service

# Verify
curl http://localhost:8090/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/configuration-service.yaml)
