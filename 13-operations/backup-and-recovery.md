# Backup and recovery

Last updated: 2026-09-22 · Engine: **SQL Server** single instance, schemas per service (ADR-002) · Related: [incident-management.md](./incident-management.md), [observability.md](./observability.md)

## Principles

1. Back up the **instance**, but document **schema-level** RPO/RTO owners (each service).
2. Config and secrets are not only in DB — also env/Kong config (treat as backup set).
3. Restore is rehearsed; a backup that was never restored is a hope.

## Scope

| Asset | Method | RPO target | RTO target | Owner |
|-------|--------|------------|------------|-------|
| SQL Server full + log backups | Native backup / platform managed | ≤ 15 min | ≤ 2 h | platform + DB owner |
| Liquibase changelogs (git) | Git history | 0 | minutes | all services |
| Kafka retention | Topic retention + mirror if needed | per topic | per topic | platform |
| Kong config / routes | GitOps export | 0 | minutes | edge |
| Redis | Ephemeral — **no** restore requirement | — | recreate | edge |

> Replace RPO/RTO targets with signed-off numbers from stakeholders.

## What is NOT backed up as source of truth

- Redis counters/sessions (ephemeral)
- Container filesystem layers
- Local developer machines

## Restore procedure (outline)

1. Declare incident severity ([incident-management.md](./incident-management.md)).
2. Identify latest clean full + subsequent logs; restore to standby.
3. Point application config (connection strings) to restored instance in a controlled window.
4. Verify per schema smoke: iam login, school read, gps last N, audit append.
5. Kafka: decide replay window vs accept gap (document decision).
6. Postmortem → update this doc + runbooks.

## Verification schedule

| Check | Frequency |
|-------|-----------|
| Backup job success alert | Daily (see observability) |
| Point-in-time restore drill | Quarterly |
| Liquibase changelog integrity on restored copy | Each drill |

## Runbooks

Service-specific: `09-microservices/services/*/runbook.md`
