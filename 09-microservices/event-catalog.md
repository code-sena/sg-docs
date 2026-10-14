# Event catalog (Kafka)

> Canonical async contracts. Topics versioned additively (ADR-004). Last updated: 2026-10-04
> Per-service event *docs* also live in `services/*/events.md` — this file is the **cross-service index**.

## Conventions

| Item | Rule |
|------|------|
| Naming | `<domain>.<entity>.<action>` or versioned subject `<domain>.<entity>.v1` |
| Key | Entity id (ordering per aggregate) |
| Payload | JSON or Avro/Protobuf per team standard — keep additive |
| PII | Minimize; no secrets in payloads |
| Ownership | Producer owns schema; consumers tolerate unknown fields |

## Catalog

### Implemented

Declared in `backend/kafka/init/topics.conf` and wired in code today.

| Topic | Producer | Consumers | Payload summary |
|-------|----------|-----------|-----------------|
| `student.created` | user-management-service (`CreateStudentService`) | iam-service (`PersonCreatedConsumer`, groupId `iam`) | New student person → IAM profile/role |
| `driver.created` | user-management-service (`CreateDriverService`) | iam-service (`PersonCreatedConsumer`, groupId `iam`) | New driver person → IAM profile/role |
| `admin.created` | user-management-service (`CreateAdminService`) | iam-service (`PersonCreatedConsumer`, groupId `iam`) | New admin person → IAM profile/role |
| `parent.created` | user-management-service (`CreateParentService`) | iam-service (`PersonCreatedConsumer`, groupId `iam`) | New guardian person → IAM profile/role |
| `profile.created` | iam-service (`CreateProfileService`) | — (no consumer yet) | IAM profile created for a person |
| `student.scanned` | notification-service (`ProcessScanService`) | notification-service (`StudentScannedConsumer`) | QR boarding/alighting scan → push to guardian |

> Naming in use is `<entity>.<action>`, not the `<domain>.<entity>.<action>` convention above.
> Rename additively before M2 rather than in place (ADR-004).

### Planned

Not declared in any broker configuration yet. Kept here as the target contract.

| Topic / subject | Producer | Consumers | Payload summary | Depends on |
|-----------------|----------|-----------|-----------------|------------|
| `trip.status.changed` | route-service | notification consumers | Trip lifecycle | route-service events |
| `location.sampled` *(optional high-volume)* | gps-service | analytics/read models | Batched points — consider separate store path | gps-service |
| `notification.delivered` | notification-service | metrics | Delivery outcome | notification-service |
| `user.access.revoked` | iam-service | gateways/sessions | Security | In-memory deny list (iam-service) |

> Fill producer/consumer codes to match ADRs and service READMEs as APIs stabilize; rename topics to final convention before M2.

## Related

- `02-domain/domain-events.md` (domain language)
- `services/*/events.md`
- ADR-004 Kafka · ADR-005 gRPC (sync still in catalog `service-catalog.md`)
