# ADR-009 — Liquibase for schema migrations across all services

- **ID:** ADR-009
- **Date:** 2026-09-19
- **Status:** Accepted
- **Authors:** [Team]

---

## Context

School Guardian is built as **polyglot microservices** (ASP.NET, Go, Java + Spring Boot) that share a single SQL Server instance with schema-per-service isolation (ADR-002). Each service owns its schema and must manage its own table structures through versioned migrations.

The initial impulse was to use each stack's native migration tool (EF Core Migrations for ASP.NET, Flyway for Java, golang-migrate for Go). However, this creates several problems:

- **Inconsistent migration format:** each tool has its own file naming convention, checksum mechanism, and state tracking — making it harder to maintain a unified migration history.
- **Operational complexity:** the team (3 developers) would need to learn and maintain three different migration tools.
- **CI/CD overhead:** the pipeline would need to support three different migration runners.
- **No single source of truth:** migration state is scattered across different tools and databases.

The team needs a **single, stack-agnostic migration tool** that works uniformly across all services regardless of the programming language.

---

## Decision

**We decided:** to use **Liquibase** as the sole schema migration tool for all microservices.

**Justification:**
- **Stack-agnostic:** Liquibase runs independently of the application code — migrations are XML, YAML, or SQL changelogs executed via the Liquibase CLI or Docker image. No dependency on any language runtime.
- **Single source of truth:** all services write changelogs in the same format (SQL or YAML), tracked in a shared `DATABASECHANGELOG` table within the SQL Server instance.
- **SQL Server native support:** first-class support for SQL Server, including schema isolation via the `contexts` attribute (one context per service schema).
- **Rollback support:** built-in rollback capabilities (when changelogs are written with rollback instructions).
- **Small team simplicity:** one tool to learn, one Docker image to run, one CI/CD step to maintain.
- **Dry-run and validation:** `liquibase update-sql` shows the SQL that will be executed before applying, reducing risk in production.

---

## Evaluated alternatives

| Tool | Stack-agnostic | SQL Server support | Rollback | Team complexity | Multi-schema support | Rating (1-10) |
|------|---------------|-------------------|----------|----------------|---------------------|---------------|
| **Liquibase (CHOSEN)** | Yes (CLI / Docker) | Excellent | Yes (built-in) | Low (one tool) | Yes (contexts) | 9 |
| Flyway | No (JVM-only) | Excellent | Limited (paid) | Medium (Java only) | Yes (schemas) | 7 |
| EF Core Migrations | No (.NET-only) | Excellent | Yes (built-in) | High (3 tools) | Yes (schemas) | 5 |
| golang-migrate | No (Go-only) | Good | Limited | High (3 tools) | Manual | 4 |
| Alembic | No (Python-only) | Good (via pyodbc) | Yes | High (3 tools) | Manual | 4 |
| DbUp | No (.NET-only) | Excellent | No | High (3 tools) | Manual | 3 |

---

## Consequences

**Positive:**
- Single migration tool across all services — one learning curve, one CI/CD step.
- Migrations are plain SQL (or YAML) — no code generation, no runtime dependency.
- CI/CD pipeline runs `liquibase update` uniformly for any service.
- Easy to audit: `DATABASECHANGELOG` table shows exactly what was applied, when, and by whom.
- New services (regardless of stack) inherit the same migration pattern instantly.

**Negative / Trade-offs:**
- Adds a dependency on the Liquibase CLI / Docker image in the CI/CD pipeline.
- Rollback instructions must be written manually in each changelog (Liquibase does not auto-generate them).
-团队需要 to adopt the SQL changelog format (not stack-specific migration files).

**Impact on the system:**
- Affected services: all (IAM, User Management, School, Notification, Bus, Route, GPS, Exceptional, Audit, Configuration).
- Documents that must be updated:
  - `06-data/models.md` (migration strategy section)
  - `10-devops/local-setup.md` (migration commands)
  - `10-devops/environments.md` (CI/CD migration step)
  - `09-microservices/_template/service/data-model.md` (template)
  - `_stacks/go.md`, `_stacks/java-spring.md`, `_stacks/dotnet-aspnet.md` (stack-specific commands)

---

## Migration changelog structure

```

```

**Run command (uniform across all stacks):**

```bash
# Apply pending migrations
docker run --rm \
  --network host \
  liquibase/liquibase:4.23 \
  --url="jdbc:sqlserver://localhost:1433;databaseName=school_guardian" \
  --username=sa \
  --password=YourStrong!Passw0rd \
  --changeLogFile=migrations/changelog-master.yaml \
  --contexts="iam" \
  update

# Dry-run (show SQL without applying)
docker run --rm \
  --network host \
  liquibase/liquibase:4.23 \
  --url="jdbc:sqlserver://localhost:1433;databaseName=school_guardian" \
  --username=sa \
  --password=YourStrong!Passw0rd \
  --changeLogFile=migrations/changelog-master.yaml \
  --contexts="iam" \
  update-sql

# Rollback last change
docker run --rm \
  --network host \
  liquibase/liquibase:4.23 \
  --url="jdbc:sqlserver://localhost:1433;databaseName=school_guardian" \
  --username=sa \
  --password=YourStrong!Passw0rd \
  --changeLogFile=migrations/changelog-master.yaml \
  --contexts="iam" \
  rollback-count 1
```

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Liquibase Docker image not available in CI environment | Low | Medium | Pre-cache the image; use Liquibase CLI as fallback |
| Changelog conflicts when two developers modify the same service schema | Medium | Low | Use feature branches; one migration per PR |
| Rollback instructions not written, making rollbacks impossible | Medium | High | PR review must verify rollback instructions exist; add CI check |
| Performance impact of running migrations on large tables | Low | Medium | Use `ONLINE = ON` for index creation; test migrations against production-like data volume |

---

## References

- Related to: ADR-002 (shared database, schema per service)
- Data modeling and migration strategy → `06-data/models.md`
- Local setup with Liquibase → `10-devops/local-setup.md`
- Per-service data model template → `09-microservices/_template/service/data-model.md`
