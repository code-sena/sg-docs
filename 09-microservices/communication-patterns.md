# Communication patterns

Last updated: 2026-09-22 · Sync: **gRPC** (ADR-005) · Async: **Kafka** (ADR-004) · Edge: **Kong :8000** → services **:8080**

## Decision table

| Scenario | Pattern | Why |
|----------|---------|-----|
| UI needs response now | HTTP via Kong → service | Public REST/OpenAPI |
| Service needs result from another service, low latency | **gRPC** | Typed, efficient (ADR-005) |
| Fan-out, decoupling, audit trail, retry | **Kafka** | Durable, replay (ADR-004) |
| Same request must join two services for one screen | API composition in caller / BFF later | No cross-schema join (ADR-002) |
| Real-time vehicle push to clients | WebSocket/SSE at edge or poll GPS API | Separate from gRPC mesh |

## Rules

1. **No** shared table writes across schemas.
2. Prefer **idempotent** consumers; include event id.
3. Timeouts + circuit breakers on gRPC callers.
4. Never call another service on a synchronous path without a failure plan.
5. Dual-write to Kafka via outbox when DB commit must match event publish.

## Patterns in use

### Request/response (edge)

```text
Client → Kong :8000 → <service>:8080 (Docker DNS)
```

### Sync service-to-service

```text
service-a → gRPC → service-b:8080
```

### Async domain event

```text
service-a DB commit → outbox → Kafka → service-b consumer
```

## Related

- [event-catalog.md](./event-catalog.md)
- [service-catalog.md](./service-catalog.md)
- [service-boundary-rules.md](./service-boundary-rules.md)
