# School

> Schools, campuses, courses, course groups, and cities (Geographic).

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 04 |
| Local port | 8080 |
| Stack | C# + ASP.NET |
| SQL Server schema | `School + Geographic` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | — |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- CRUD schools and campuses
- Manage courses and course groups
- Own City catalog (Geographic schema)
- Provide school/location reference data to route-service

## Out of scope (what it does NOT do)

- Route geometry/stops → route-service
- Student enrollment → user-management-service

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/schools` | List schools |
| POST | `/schools` | Create school |
| GET | `/schools/{id}` | Get school |
| PUT | `/schools/{id}` | Update school |
| GET | `/campuses` | List campuses |
| POST | `/campuses` | Create campus |
| GET | `/courses` | List courses |
| POST | `/courses` | Create course |
| GET | `/cities` | List cities |
| POST | `/cities` | Create city |

## How to run it locally

```bash
docker compose up -d school-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `School + Geographic`; tables: School, SchoolCampus, Course, CourseGroup, City
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/school-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
