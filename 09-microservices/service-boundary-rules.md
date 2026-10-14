# Service Boundary Rules

> Hard rules that keep microservice boundaries real when the database is shared
> (ADR-002: single SQL Server, schema-per-service). Referenced by
> [ADR-002](../05-architecture/decisions/records/ADR-002-shared-database-monolithic-db.md)
> and enforced in code review + CI.

**Golden rule:** *One owner per entity. Everyone else goes through the owner's
API or events — never through another schema.*

---

## 1. Schema ownership

| Rule | Detail |
|------|--------|
| 1.1 | Each service owns **exactly one** schema (school-service also owns `Geographic`). |
| 1.2 | A service may `SELECT/INSERT/UPDATE` **only** its own schema. |
| 1.3 | DB login per service (`svc_<name>`) is granted rights on that schema only. |
| 1.4 | API Gateway owns **no** SQL schema (stateless, no datastore). |

Authoritative list: [data-ownership-matrix.md](./data-ownership-matrix.md).

---

## 2. Forbidden patterns

| # | Forbidden | Why | Instead |
|---|-----------|-----|---------|
| F1 | Cross-schema `JOIN` | Hidden coupling; breaks deploy independence | Call owner API; compose in the caller |
| F2 | `SELECT` from another service's tables | Breaks ownership & migrations | REST/gRPC query to owner |
| F3 | Foreign keys pointing across schemas | Physical coupling in shared DB | Store UUID as plain column + validate via API/events |
| F4 | Shared writable tables | Two writers = conflicting truths | Split entity; open ADR |
| F5 | Direct DB access from frontend/ETL to a non-owned schema | Bypasses business rules | Published APIs only |
| F6 | Storing another service's PII "for convenience" | Privacy & duplication | Reference by id; fetch on demand |

**Allowed cross-schema reference shape:**

```sql
-- ✅ UUID stored as value, no FK constraint to another schema
RouteExecution.BusId UNIQUEIDENTIFIER NOT NULL  -- validated via bus-service API
-- ❌ FK BusId REFERENCES Bus.Bus(Id)  -- different schema/owner
```

---

## 3. When you need another service's data

**Decision order (first match wins):**

1. **You don't need it** — drop the field/display.
2. **Event already carries it** — consume and store a projection in *your* schema.
3. **Rare read, strong consistency** — synchronous REST/gRPC to owner.
4. **Frequent read, eventual OK** — subscribe to owner events; local read model.
5. **Write must span services** — choreography: command to owner, react to result;
   never one distributed transaction across schemas (no 2PC).

---

## 4. Consistency expectations

| Pattern | Consistency | Example |
|---------|-------------|---------|
| Single-service write | Strong (local TX) | Create route + stops (same schema) |
| Cross-service workflow | Eventual | Assign bus → route receives `BusAssigned` |
| Query composition | Eventual / request-time | Gateway UI aggregates via BFF calls |

Compensating actions (saga steps) live in the initiating service; document them
in that service's `events.md`.

---

## 5. Event boundary rules

- Events are published to **Kafka** (ADR-004) with payload owned by the emitter.
- Payloads carry **ids + minimal denormalized display fields** only
  (e.g. `routeName`, not the whole route aggregate).
- Version the payload (`"version": "1.0"`); additive changes only within a version.
- Consumers must be **idempotent** (at-least-once delivery).
- Never publish an event containing another service's private schema dump.

---

## 6. API boundary rules

- Public surface = OpenAPI in `07-api/contracts/openapi/<service>.yaml` only.
- No "just this once" internal endpoints exposed through the gateway without contract.
- Internal (service-to-service) APIs may exist but must be documented in the
  service README and not routable from the internet.
- Commands that change state belong to the owner; do not emulate writes
  by updating sibling schemas.

---

## 7. Migration boundary rules (shared instance)

- Liquibase (ADR-009) runs **per service**, changelog path scoped to its schema.
- A migration never alters another service's objects — even "additive".
- Renaming/dropping a column used by another service requires:
  1. Dual-write/read window coordinated with consumers, or
  2. Explicit ADR if the entity changes owner.

---

## 8. Team & review enforcement

| Check | Where |
|-------|-------|
| SQL/DAL only references own schema | Code review + static query lint |
| New cross-service read has event or API plan | PR template item |
| FK never crosses schema | CI migration scan |
| Contract updated before new endpoint | API review (DoD) |
| Ownership matrix updated on new entity | PR checklist |

Violation = change request; two violations = open an ADR (boundary redesign).

---

## 9. Smells that a boundary is eroding

- Repeated identical joins rebuilt in 3+ services → extract service or event.
- Same table edited by two services' migrations → split ownership.
- "Read-only" cross-schema query that grows WHERE clauses → wrong boundary.
- Circular sync calls A↔B → introduce event or merge services.

---

## 10. When to split the database

If a single schema needs independent scaling, different backup cadence, or a
second team owns half its tables — open a new ADR to move that schema to its
own instance (Strangler Fig path reserved in ADR-002).

---

## Correlations

- Decision record → `05-architecture/decisions/records/ADR-002-shared-database-monolithic-db.md`
- Entity ownership → `09-microservices/data-ownership-matrix.md`
- Catalog → `09-microservices/service-catalog.md`
- Domain events → `02-domain/domain-events.md`
