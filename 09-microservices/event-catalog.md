# Event catalog (Kafka)

> Canonical async contracts. Topics versioned additively (ADR-004). Last updated: 2026-09-22
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

| Topic / subject | Producer | Consumers | Payload summary |
|-----------------|----------|-----------|-----------------|
| `trip.status.changed` | bus/route (TBD) | notification, audit, gps consumers | Trip lifecycle |
| `exception.raised` | exceptional-service | notification, audit, coordinator UIs via API | Severity + refs |
| `location.sampled` *(optional high-volume)* | gps-service | analytics/read models | Batched points — consider separate store path |
| `notification.delivered` | notification-service | audit, metrics | Delivery outcome |
| `config.changed` | configuration-service | all interested services | Feature flag updates |
| `user.access.revoked` | iam-service | gateways/sessions | Security |

> Fill producer/consumer codes to match ADRs and service READMEs as APIs stabilize; rename topics to final convention before M2.

## Related

- `02-domain/domain-events.md` (domain language)
- `services/*/events.md`
- ADR-004 Kafka · ADR-005 gRPC (sync still in catalog `service-catalog.md`)
