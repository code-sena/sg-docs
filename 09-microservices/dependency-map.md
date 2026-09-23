# Dependency map

Last updated: 2026-09-22 · Logical dependencies (not deploy order hell — services stay independently deployable).

## Legend

- **HTTP/Kong** — via edge :8000
- **gRPC** — ADR-005
- **Kafka** — ADR-004
- **SQL schema** — same instance, isolated schema (ADR-002)

## Matrix (consumer → depends on)

| Consumer | Edge HTTP | gRPC / HTTP to | Kafka consumes | Schema reads (own) |
|----------|-----------|----------------|----------------|--------------------|
| api-gateway | — | routes to all :8080 | — | Redis only |
| iam-service | exposed | — | — | `Iam` |
| user-management-service | exposed | iam (validate) | — | `UserManagement` |
| school-service | exposed | — | — | `School` |
| bus-service | exposed | route, school | — | `Bus` |
| route-service | exposed | bus, school | — | `Route` |
| gps-service | exposed | bus, route | — | `Gps` |
| exceptional-service | exposed | route, bus, school | — | `Exceptional` |
| notification-service | exposed | user-mgmt / iam templates | exception, trip events | `Notification` |
| audit-service | exposed | — | most domain events | `Audit` |
| configuration-service | exposed | — | — | `Configuration` |

> Refine cells as OpenAPI/gRPC protos firm up; keep **no cross-schema FK**.

## Risky edges (watch)

- notification → user-mgmt (PII in payloads)
- gps high volume → avoid sync fan-out (use Kafka/read model)
- audit must not block main flows (async prefer)

## Related

- [service-catalog.md](./service-catalog.md) · [communication-patterns.md](./communication-patterns.md) · [data-ownership-matrix.md](./data-ownership-matrix.md)
