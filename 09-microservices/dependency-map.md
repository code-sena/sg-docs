# Dependency map

Last updated: 2026-09-25 · Logical dependencies (services stay independently deployable behind Kong and Kafka/gRPC).

## Legend

- **HTTP/Kong** — via edge :8000
- **gRPC** — ADR-005
- **Kafka** — ADR-004
- **SQL schema** — same instance, isolated schema with direct relational integrity (ADR-002)

## Matrix (consumer → depends on)

| Consumer | Domain | Edge HTTP | gRPC / HTTP to | Kafka consumes | Schema reads (own) |
|----------|--------|-----------|----------------|----------------|--------------------|
| api-gateway | Infra | — | routes to all :8080 | — | Redis only |
| iam-service | Identity | exposed | — | — | `Iam` |
| user-management-service | Identity | exposed | iam (validate) | — | `UserManagement` |
| school-service | School | exposed | — | — | `School`, `Geographic` |
| notification-service | Notifications | exposed | user-mgmt / iam templates | exception, trip events | `Notification` |
| bus-service | Transport | exposed | route, school | — | `Bus` |
| route-service | Transport | exposed | bus, school | — | `Route` |
| gps-service | Tracking | exposed | bus, route | — | `Gps` |
| exceptional-service | Transport | exposed | route, bus, school | — | `Exceptional` |
| audit-service | Infra | exposed | — | most domain events | `Audit` |
| configuration-service | Infra | exposed | — | — | `Configuration` |

## Risky edges (watch)

- notification → user-mgmt (PII in payloads)
- gps high volume → avoid sync fan-out (use Kafka/read model)
- audit must not block main flows (async prefer)

## Related

- [service-catalog.md](./service-catalog.md) · [communication-patterns.md](./communication-patterns.md) · [data-ownership-matrix.md](./data-ownership-matrix.md)
