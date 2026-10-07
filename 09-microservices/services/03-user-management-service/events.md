# Events — User Management

> Async communication via Kafka (ADR-004). Consumers must be idempotent (at-least-once).

## Events this service PUBLISHES

| Event | Topic | When | Payload (key fields) |
|-------|-------|------|----------------------|
| PersonCreated | `user.person.created` | Person persisted | `{personId, email}` |
| PersonUpdated | `user.person.updated` | Person updated | `{personId}` |
| FamilyLinked | `user.family.linked` | Student linked to guardian | `{familyId, personId}` |

### Common envelope

```json
{
  "eventId": "uuid",
  "eventType": "<EventName>",
  "timestamp": "2026-09-22T12:00:00Z",
  "version": "1.0",
  "source": "user-management-service",
  "payload": {}
}
```

## Events this service CONSUMES

| Event | Published by | Topic | Action |
|-------|--------------|-------|--------|
| — | — | — | No external domain events consumed |

## Delivery guarantees

| Guarantee | Value | Implication |
|-----------|-------|-------------|
| At-least-once | Yes | Consumers idempotent by `eventId` |
| Ordering | Per key (`aggregateId`) | No global order assumed |

## Error handling

- **DLQ:** `dlq.user-management-service` — after 3 retries (exp. backoff)
- **Retries:** 3, then DLQ + metric increment
- **Alerts:** DLQ depth > 0 for 5 min → on-call

## Correlations

- Domain vocabulary → `02-domain/domain-events.md`
- Boundary rules → `09-microservices/service-boundary-rules.md`
