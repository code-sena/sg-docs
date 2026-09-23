# Events — Notification

> Async communication via Kafka (ADR-004). Consumers must be idempotent (at-least-once).

## Events this service PUBLISHES

| Event | Topic | When | Payload (key fields) |
|-------|-------|------|----------------------|
| BoardingRegistered | `notification.boarding.registered` | QR scan saved | `{boardingId, studentProfileId, busId}` |
| AlertRaised | `notification.alert.raised` | Alert created | `{alertId, alertTypeId}` |
| AlertDelivered | `notification.alert.delivered` | Delivery ack | `{alertId, channel}` |

### Common envelope

```json
{
  "eventId": "uuid",
  "eventType": "<EventName>",
  "timestamp": "2026-09-22T12:00:00Z",
  "version": "1.0",
  "source": "notification-service",
  "payload": {}
}
```

## Events this service CONSUMES

| Event | Published by | Topic | Action |
|-------|--------------|-------|--------|
| RouteExecuted / boarding context | route-service | `route.*` | Create boarding record |
| GpsAnomalyDetected | gps-service | `gps.anomaly` | Raise alert to recipients |

## Delivery guarantees

| Guarantee | Value | Implication |
|-----------|-------|-------------|
| At-least-once | Yes | Consumers idempotent by `eventId` |
| Ordering | Per key (`aggregateId`) | No global order assumed |

## Error handling

- **DLQ:** `dlq.notification-service` — after 3 retries (exp. backoff)
- **Retries:** 3, then DLQ + metric increment
- **Alerts:** DLQ depth > 0 for 5 min → on-call

## Correlations

- Domain vocabulary → `02-domain/domain-events.md`
- Boundary rules → `09-microservices/service-boundary-rules.md`
