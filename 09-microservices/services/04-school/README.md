# School

> Manages school, campus, course, and geographic (city) data.

---

## Responsibility

Handles school registry, campus locations, course and course-group organization, and city (geographic) reference data.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 04 |
| Local port | 8083 |
| Repository | [Repo URL] |
| DB engine | SQL Server (schemas `School`, `Geographic`) |
| Status | In development |

---

## Responsibilities (what this service DOES)

- School data management (CRUD)
- School campus management
- Course and course group management
- City (geographic) reference data

## Out of scope (what it does NOT do)

- Student personal data — delegated to User Management
- Stop/route data — delegated to Route service

---

## How to run it locally

```bash
# From the project root
docker compose up -d school-service

# Verify
curl http://localhost:8083/health
```

---

## Related documents

- [data-model.md](./data-model.md) — DB schema
- [events.md](./events.md) — Events it publishes and consumes
- [decisions.md](./decisions.md) — Internal design decisions
- [runbook.md](./runbook.md) — Operation in production
- [API Contract](../../../07-api/contracts/openapi/school-service.yaml)
