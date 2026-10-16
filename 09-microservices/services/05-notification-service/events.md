# Events — Notification

> Async communication via Kafka (ADR-004). Consumers must be idempotent (at-least-once).

## Events this service PUBLISHES

| Event | Topic | When | Payload (key fields) |
|-------|-------|------|----------------------|
| StudentScanned | `student.scanned` | QR scan saved (boarding or alighting) | `{boardingId, alertId, studentProfileId, routeExecutionId, boardingType, timestamp, stopName, stopAddress, latitude, longitude}` |
| IncidentReported | `incident.reported` | Driver reports an incident or emergency during the trip (FR-8.1) | `{alertId, routeExecutionId, reportedByProfileId, alertTypeId, description, studentsOnBoard[], recipients[], timestamp}` |

> **The topics above are the ones the service actually publishes.** An earlier revision of this
> document proposed the names `notification.boarding.registered`, `notification.alert.raised` and
> `notification.alert.delivered`, none of which exist in the code. It also proposed the envelope
> below, which is **not** used: `KafkaEventPublisher` serialises the event object as the message
> value and sets a generated `Guid` as the Kafka key, so the "ordering per key (`aggregateId`)"
> claim further down does not hold either. Treat the envelope, the `notification.*` names and the
> ordering guarantee as the target design, not as the current behaviour.

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
| StudentScanned | notification-service (itself) | `student.scanned` | Create the `AlertRecipient` rows for the student's guardians and send the Expo push |
| GpsAnomalyDetected | gps-service | `gps.anomaly` | Raise alert to recipients — **not implemented**: gps-service and this consumer do not exist yet (FR-6.x is pending) |

## Delivery guarantees

| Guarantee | Value | Implication |
|-----------|-------|-------------|
| At-least-once | Yes | Consumers idempotent by `eventId` |
| Ordering | None assumed (the Kafka key is a generated `Guid`) | No global or per-aggregate order assumed |

## Error handling

- **DLQ:** `dlq.notification-service` — after 3 retries (exp. backoff)
- **Retries:** 3, then DLQ + metric increment
- **Alerts:** DLQ depth > 0 for 5 min → on-call

## Correlations

- Domain vocabulary → `02-domain/domain-events.md`
- Boundary rules → `09-microservices/service-boundary-rules.md`
