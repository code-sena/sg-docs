# GPS

> GPS devices registry and position history.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 08 |
| Local port | 8080 |
| Stack | Java + Spring Boot |
| SQL Server schema | `Gps` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | bus-service (device↔bus binding) |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- Register GPS devices (IMEI) and connection status
- Ingest and store position history
- Detect anomalies (deviation) and publish events

## Out of scope (what it does NOT do)

- Map UI rendering → clients
- Alert fan-out → notification-service

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices` | List devices |
| POST | `/devices` | Register device |
| GET | `/devices/{id}` | Get device |
| PATCH | `/devices/{id}/status` | Update status |
| POST | `/locations` | Ingest position |
| GET | `/locations` | Query positions |

## How to run it locally

```bash
docker compose up -d gps-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Gps`; tables: GpsDevice, GpsLocation
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/gps-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
