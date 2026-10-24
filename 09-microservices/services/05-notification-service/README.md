# Notification

> Boarding/alighting events, alerts, alert types, and recipients.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 05 |
| Local port | 8080 |
| Stack | .NET 10 |
| SQL Server schema | `Notification` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | iam-service (profile identity), route-service (executions/stops), bus-service (fleet reference) |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- Record boarding/alighting scans (QR)
- Create and fan-out alerts
- Manage alert types and recipient lists
- Consume route/gps events to trigger notifications

## Out of scope (what it does NOT do)

- Route execution ownership → route-service
- Device position storage → gps-service
- User contact data → user-management/iam

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/boarding` | Register boarding/alighting |
| GET | `/boarding` | List boarding events |
| GET | `/alerts` | List alerts |
| POST | `/alerts` | Create alert |
| PATCH | `/alerts/{id}/status` | Update alert status |
| GET | `/alert-types` | List alert types |
| GET | `/recipients` | List recipients |

## How to run it locally

```bash
docker compose up -d notification-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Notification`; tables: Boarding, Alert, AlertType, AlertRecipient
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/notification-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
