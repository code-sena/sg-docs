# User Management

> Manages person data, family relationships, and driver licenses.

---

## Responsibility

Handles personal information (name, ID, contact), family groupings, family member relationships, and driver license records for bus drivers.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 03 |
| Local port | 8082 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schema `UserManagement`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- Person data management (CRUD)
- Family group management
- Family member relationships (parent/student)
- Driver license records

## Out of scope (what it does NOT do)

- Authentication and profiles — delegated to IAM
- School data — delegated to School service

---

## How to run it locally

```bash
# From the project root
docker compose up -d user-management-service

# Verify
curl http://localhost:8082/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/user-management-service.yaml)
