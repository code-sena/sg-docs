# IAM (Identity and Access Management)

> **Identity authority** of the system. Manages authentication, JWT issuance, RBAC permissions, and sessions.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 02 |
| Local port | 8081 |
| Repository | [Service repo URL] |
| DB engine | SQL Server (schema `Iam`) |
| Communicates with | — (does not call other microservices) |
| Consumed by | api-gateway (token verification), all other services |

---

## Responsibilities (what this service DOES)

- Authentication (login, logout, token refresh)
- Role management (RBAC): assign, revoke, query
- Permission management (RBAC)
- Session tracking (SessionProfile)

## Out of scope (what it does NOT do)

- Person data (name, phone, etc.) — delegated to User Management service
- School data — delegated to School service
- Password policies/security settings — delegated to Configuration service

---

## How to run it locally

```bash
# Start with its dependency (SQL Server)
docker compose up -d iam-service

# Verify
curl http://localhost:8081/health
```

---

## Related documents

- [data-model.md](./data-model.md) — Tables `Role`, `Permissions`, `PermissionsRole`, `Profile`, `SessionProfile`
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Design decisions for the IAM service
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/iam-service.yaml)
