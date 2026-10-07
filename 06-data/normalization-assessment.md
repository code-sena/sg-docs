# Normalization assessment

> Where we **deliberately denormalize**, and where we stay normalized.
> Framework default is 3NF within a schema; denormalization needs a written reason.
> Last updated: 2026-09-22

## Decision rule

| Situation | Choice |
|-----------|--------|
| Same schema, transactional consistency required | **Normalize** (3NF) |
| Read-heavy dashboard / list API across many rows | Denormalize **or** index + read model — prefer index first |
| Cross-service join that would span schemas | **Do not join** — compose in API or Kafka materialization |
| Telemetry write path (`Gps`) | Append-only facts; no rewrite of history |
| Need stable snapshot (route effective version) | Versioned rows / effective dates (controlled duplication) |

## Intentional denormalizations (keep)

| Location | What is duplicated | Why | Risk / control |
|----------|--------------------|-----|----------------|
| `Route` effective versions | Path/attributes copied per version | Historical accuracy without temporal joins | Only insert new version; no UPDATE of old |
| Notification denormalized recipient snapshot (name, school label) at send time | Display fields on the message | Template rendering must not break if profile changes | Source of truth remains `UserManagement`/`School` |
| Audit before/after JSON (or column pair) | Attribute snapshot | Forensic trail independent of current row | Append-only; size cap |
| Configuration scope rows (global + school overrides) | Effective value per scope | Avoid deep hierarchy queries | Cache with TTL; invalidation event |
| Optional geographic label on operational rows | Read model for lists | Avoid N+1 to `Geographic` | Rebuild by job or trigger on ref change (if used) |
| Session / token metadata in `Iam` | Claims needed at edge | Fast reject without joins | TTL cleanup job |

## Stays normalized (do not denormalize)

| Area | Reason |
|------|--------|
| RBAC (`Role`, `Permissions`, `PermissionsRole`) | Integrity of grants; classic M:N |
| User ↔ profile core attributes | Single writer service |
| Bus ↔ Route assignment graph | Conflicts and uniqueness matter more than read fan-out |
| Liquibase changelog bookkeeping | Tool-owned |

## Cross-service “denormalization”

Forbidden patterns:

- Storing another service’s mutable master data as authority (copy-as-cache without refresh contract)
- Cross-schema FK or shared table writes (violates ADR-002 boundary)

Allowed patterns:

- **Read models** built from Kafka topics (outbox/events, ADR-004)
- **API composition** in the caller (or BFF later) via gRPC (ADR-005)
- **Immutable snapshots** on events (notifications, audit)

## Review checklist

- [ ] Is the write path still single-owner?
- [ ] Is refresh / rebuild strategy written (job, event, on-read)?
- [ ] Does it break soft-delete or audit rules?
- [ ] Is it documented in the owning `domain/*.md` “Modeling decisions” section?
