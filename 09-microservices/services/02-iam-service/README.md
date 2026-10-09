# IAM

> Identity authority: authentication, JWT issuance, RBAC, sessions.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 02 |
| Local port | 8080 |
| Stack | Java + Spring Boot |
| SQL Server schema | `Iam` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | configuration-service (password policy on change) |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- Authenticate users and issue access + refresh tokens (RS256)
- Publish JWKS for token verification
- Manage roles, permissions, and role-permission mappings
- Manage profiles (credentials) and active sessions
- Revoke tokens / logout and password lifecycle endpoints

## Out of scope (what it does NOT do)

- Personal data (Person/Family) → user-management-service
- Business configuration → configuration-service

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Authenticate and issue tokens |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke current session |
| POST | `/auth/forgot-password` | Start password reset |
| POST | `/auth/reset-password` | Complete password reset |
| POST | `/auth/change-password` | Change password |
| GET | `/jwks` | Public keys for JWT verification |
| GET | `/roles` | List roles |
| POST | `/roles` | Create role |
| GET | `/permissions` | List permissions |
| GET | `/profiles` | List profiles |
| PATCH | `/profiles/{id}/status` | Activate/deactivate profile |

## How to run it locally

```bash
docker compose up -d iam-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Iam`; tables: Role, Permissions, PermissionsRole, Profile, SessionProfile
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/iam-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
