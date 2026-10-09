# Migration strategy

> How schema changes ship safely.
> Tool: **Liquibase** (ADR-009) · Engine: **SQL Server**, one instance, schema per service (ADR-002).
> Last updated: 2026-09-22

## Ground rules

1. **Database is migrated by the pipeline**, not by hand on prod.
2. Every service’s DDL lives under `database/ms-<name>-db/` with `changelog/changelog-master.yaml`.
3. Docs (`06-data/**`) change in the **same PR** as the changeset when shape or meaning changes.
4. Never edit an already-applied changeset body — add a new one (checksum safety).

## Repository layout (aligned with codebase)

```text
database/
  ms-iam-db/
    changelog/changelog-master.yaml
    01-ddl/
      01-schema/changelog.yaml
      03-tables/changelog.yaml
      04-alter/changelog.yaml
      09-indexes/changelog.yaml
  ms-user-management-db/
  ms-school-db/
  ms-notification-db/
  ms-fleet-db/          # bus
  ms-route-db/
  ms-gps-db/
  ms-settings-db/       # configuration
  ms-geographic-db/     # supporting geographic ref data
```

One logical database project per service schema family — keep master changelog as the only entry point for that unit.

## Change categories

### A. Compatible (single deploy)

- ADD COLUMN nullable / with default backfilled safely
- ADD INDEX / UNIQUE
- ADD TABLE
- Widen types (careful with locks; prefer new column + swap for large tables)

Deploy app → old code still works → done.

### B. Breaking (expand → migrate → contract)

| Step | Action |
|------|--------|
| 1 Expand | Add new table/column; dual-write if renaming |
| 2 Migrate | Backfill in batches; verify counts |
| 3 Switch | Release app that reads new shape |
| 4 Contract | Drop old column/table in a **later** release |

Renames of columns/tables used by running containers are **step-B**, not a quick ALTER.

### C. Data-only

- Backfills, enum code fixes, PII normalization — still versioned changesets.

## Environment flow

```text
PR → liquibase validate (CI job in 10-devops/ci-cd.md)
  → deploy dev (updateSQL / update run as deploy step)
  → smoke: health via Kong :8000, critical read paths
  → promote same artifact to staging/prod
```

Local: [../10-devops/local-setup.md](../10-devops/local-setup.md)

## Rollback policy

| Case | Approach |
|------|----------|
| Compatible changeset | Revert app; schema left (harmless) or compensating changeset |
| Breaking, not yet backfilled | Stop deploy; do not contract |
| Breaking, data moved | **Forward fix** preferred; true down-migrations only if explicitly written and tested |
| Bad seed/config row | Compensating changeset (audit-friendly) |

Down migrations are optional per changeset; if present, they must be tested in dev.

## Multi-service coordination

- **No cross-schema FKs** — schema change in one service does not require DDL in another.
- **Shared events** (Kafka, ADR-004): additive schema evolution first; breaking event changes use versioned subjects/topics + dual publish.
- **gRPC** (ADR-005): additive fields only on the wire; deprecate before removal.

## Checklist before merge

- [ ] Changeset id unique; `runOnChange` not abused
- [ ] Indexes for new WHERE/JOIN paths
- [ ] Soft-delete / audit fields consistent ([modeling-conventions.md](./modeling-conventions.md))
- [ ] Meaning documented ([data-dictionary.md](./data-dictionary.md))
- [ ] Domain ER notes updated (`domain/*.md`)
- [ ] PII → governance security-policy awareness
- [ ] CI `liquibase-validate` green
