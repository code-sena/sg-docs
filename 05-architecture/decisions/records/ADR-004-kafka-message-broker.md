# ADR-004 — Apache Kafka as the event/message broker

- **ID:** ADR-004
- **Date:** 2026-09-04
- **Status:** Accepted
- **Authors:** Juan Pablo Chala

---

## Context

School Guardian is built as microservices that need to communicate asynchronously by **events** (e.g. student boarding/alighting, notifications, live-tracking alerts). The microservices are **polyglot**: they are built in several languages and stacks (for example **ASP.NET (C#), Java + Spring Boot, etc.**) and share a single SQL Server instance (see ADR-002). We must choose a **message broker** that supports event-driven communication across these stacks.

**Known constraints:**
- Several services in different languages and frameworks — the broker must have first-class clients for all of them.
- Need for **pub/sub** (several services reacting to the same event).
- Need for **reliable delivery and replay** of events (e.g. notifications must not be lost).
- Data volume is moderate now but must scale with the ingestion of GPS/live-tracking events.

---

## Decision

**We decided:** to use **Apache Kafka** as the event/message broker for inter-service communication in School Guardian.

**Justification:**
- **Language-agnostic:** official first-class clients for most languages and platforms in the market (C#, Java, Python, Node.js, etc.), so all microservices integrate uniformly regardless of the stack.
- **Event streaming:** topics + partitions + offsets fit the event-driven model (boarding, alighting, tracking, notifications) and allow replay/audit.
- **Scalability:** high throughput for high-volume event ingestion such as GPS/live-tracking without re-architecting.
- **Multi-language integration** is simpler and more consistent than brokers tied to a single ecosystem.

---

## Evaluated alternatives

| Broker | Performance | Work queues | Pub/Sub (events) | Security | Multi-stack support (multi-language) | Rating (1-10) |
|--------|-------------|-------------|------------------|----------|---------------------------------------|---------------|
| Apache Kafka (CHOSEN) | High (streaming, millions msg/s) | Consumer groups + DLT for retries | Excellent (topics, partitions) | Good (SASL, TLS, ACL) | Excellent (official clients in almost every language) | 9 |
| RabbitMQ | Good | Excellent (queues, DLQ, priority) | Very good (exchanges) | Good (TLS, VHost) | Good (clients in many languages) | 8 |
| AWS RDS Service Bus | Good | Excellent (queues, DLQ, sessions) | Very good (topics) | Excellent (managed) | Acceptable (stronger in .NET than other languages) | 7 |
| NATS | High | Good (JetStream) | Very good | Good | Good (clients in many languages) | 7 |

---

## Consequences

**Positive:**
- Consistent integration across microservices in different languages and stacks.
- Event streaming supports replay, audit, and live-tracking ingestion.
- Scales for the growing volume of GPS events without re-architecting.

**Negative / Trade-offs:**
- Kafka is operationally more complex to run/manage than a simple queue broker.
- Not a native point-to-point work queue (retries require a Dead Letter Topic / consumer
  group pattern).
- Adds infrastructure (broker cluster) that must be operated and monitored.

**Impact on the system:**
- Affected services: all (publishers/consumers of events).
- Documents that must be updated:
  - `05-architecture/pattern-guide.md` (adopt Kafka / event-driven patterns)
  - `09-microservices/event-catalog.md` (topics per service)
  - `05-architecture/overview.md` (architecture diagram with Kafka)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Operational complexity of managing the Kafka cluster | Medium | Medium | Use managed or containerized Kafka; monitor with metrics/alerts |
| Event ordering and duplicate consumers | Medium | High | Design partitions and partition keys correctly; document the event-catalog |
| Event loss due to incorrect configuration | Low | High | Configure retention/acks correctly; use replay |

---

## References

- Related to: ADR-002 (shared database), ADR-003 (monolithic web/mobile)
- Messaging/event patterns → `05-architecture/pattern-guide.md`
- Event catalog → `09-microservices/event-catalog.md`
