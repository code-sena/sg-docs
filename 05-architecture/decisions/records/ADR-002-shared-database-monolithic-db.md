# ADR-002 — Shared Database (Monolithic DB) for all microservices

- **ID:** ADR-002
- **Date:** 2026-09-04
- **Status:** Accepted
- **Authors:** Juan Pablo Chala

---

## Context

School Guardian is built as a **microservices** backend, but the team is small (3 people) and the initial data volume is moderate (school scale: hundreds of students, buses, and routes). The project governance framework defaults to the **"Database per Service"** pattern (each microservice with its own database), as described in `05-architecture/overview.md` (principle P2) and `06-data/README.md`.

However, running **one SQL Server instance per microservice** adds infrastructure, operation, and migration costs that are not justified at the current size and stage of the project. This ADR documents the decision to deviate from the default pattern in an explicit and reasoned way, so it does not remain an arbitrary choice.

**Known constraints:**
- Team of 3 developers (everyone does everything).
- Chosen database engine: **Microsoft SQL Server**.
- Limited infrastructure budget (initial / MVP phase).
- Current stage: MVP development, low data volume.

---

## Decision

**We decided:** to use **a single SQL Server instance** shared by all microservices, but with **a separate schema per service** (logical isolation), instead of "Database per Service".

**Justification:**
- A single SQL Server reduces infrastructure cost and operational overhead (migrations, backups, monitoring).
- Keeping **separate schemas** (e.g. `identity`, `users`, `school`, `route`, `gps`, `bus`, `notification`) preserves logical decoupling: each service only touches its own schema.
- Inter-service communication remains via **API/events**, never via JOINs across schemas, respecting the spirit of microservices.
- If the project grows, it can migrate gradually from "separate schema" to "separate database" (see synergy with the Strangler Fig pattern in `05-architecture/pattern-guide.md`).

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| A. Monolithic database with schema per service (CHOSEN) | Lower cost/operation; logical decoupling; gradual migration possible | Physical coupling; no hardware isolation; risk if the schema boundary is not respected | — (chosen: best trade-off for the project size) |
| B. Database per Service (framework standard) | Full isolation per service; independent deployment; no coupling risk | Higher infrastructure and operation cost; more complex for a team of 3 | Excessive for the current data volume and budget |
| C. Single schema with no service separation | Maximum simplicity; direct JOINs | Total coupling between services; contradicts microservices architecture; makes future decoupling impossible | Breaks the service separation we do want |

---

## Consequences

**Positive:**
- Lower infrastructure and license cost (single SQL Server).
- Simplified operation: one database for backup, migrations, and monitoring.
- Centralized migrations easier to coordinate in a small team.

**Negative / Trade-offs:**
- No physical isolation between services (a failing service can affect the shared DB).
- Coupling risk if a service accesses another service's schema without permission
  (mitigated with review rules).
- Limited vertical scaling: the single instance is a bottleneck if it grows too much.

**Impact on the system:**
- Affected services: all (identity, users, school, route, gps, bus, notification).
- Documents that must be updated:
  - `05-architecture/overview.md` (adjust principle P2 and the data pattern)
  - `06-data/models.md` (define tables per schema)
  - `09-microservices/data-ownership-matrix.md` (owner of each schema)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Coupling between services by not respecting the schema boundary | Medium | High | PR review verifying that each service only accesses its own schema; document the ownership matrix |
| Single SQL Server as a bottleneck as it grows | Medium | Medium | Gradual migration plan to separate databases when the data justifies it |
| Permissions to access the shared DB | Medium | High | Create a login/user per service with permissions only over its own schema |

---

## References

- "Database per Service" pattern → `05-architecture/overview.md` (P2), `06-data/README.md`
- "Strangler Fig" pattern for incremental migration → `05-architecture/pattern-guide.md`
- Framework rule: "if two things share a DB..." → `09-microservices/service-boundary-rules.md`
- Related to: ADR-001 (documentation language)
