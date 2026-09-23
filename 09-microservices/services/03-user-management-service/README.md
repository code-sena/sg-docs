# User Management

> Persons, families, family members, and driver licenses.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 03 |
| Local port | 8080 |
| Stack | C# + ASP.NET |
| SQL Server schema | `UserManagement` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | iam-service (resolve Profile identity) |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- CRUD for persons (students, guardians, drivers, admins)
- Manage families and family-member links
- Manage driver licenses
- Emit user.* events for downstream projections

## Out of scope (what it does NOT do)

- Credentials/roles/sessions → iam-service
- Route assignments → route-service / bus-service

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/persons` | List persons |
| POST | `/persons` | Create person |
| GET | `/persons/{id}` | Get person |
| PUT | `/persons/{id}` | Update person |
| DELETE | `/persons/{id}` | Soft delete person |
| GET | `/families` | List families |
| POST | `/families` | Create family |
| POST | `/families/{id}/members` | Link member to family |
| GET | `/driver-licenses` | List driver licenses |
| POST | `/driver-licenses` | Create driver license |

## How to run it locally

```bash
docker compose up -d user-management-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `UserManagement`; tables: Person, Family, FamilyMember, DriverLicense
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/user-management-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
