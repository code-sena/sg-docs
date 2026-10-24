# ADR-005 — gRPC for synchronous inter-service communication

- **ID:** ADR-005
- **Date:** 2026-09-08
- **Status:** Accepted
- **Authors:** [Team]

---

## Context

School Guardian is built as polyglot microservices (ASP.NET, Java + Spring Boot) that share
a single SQL Server instance (ADR-002) and use Kafka for asynchronous events (ADR-004).
Services also need **synchronous** communication: one service queries another in real time
(e.g. API Gateway validates a token with iam-service, a service queries user data from
users-service, a service queries route details from route-service). We must choose the protocol
for these synchronous calls.

**Known constraints:**
- Polyglot stack: the protocol must have first-class clients in C# and Java.
- Low latency required for real-time queries (user validation, route lookups).
- The API Gateway must forward requests to internal services efficiently.
- Contracts must be defined and versioned (no ad-hoc JSON negotiation).

---

## Decision

**We decided:** to use **gRPC** for synchronous communication between internal microservices.
REST (HTTP/JSON) remains the protocol for **external-facing** APIs (API Gateway → mobile/web clients).

**Justification:**
- **Polyglot support:** official gRPC clients in C# (Grpc.Net) and Java (grpc-java),
  Java (grpc-java) — first-class support in all three stacks.
- **Performance:** HTTP/2 + Protocol Buffers = smaller payloads, multiplexed connections,
  lower latency than JSON over HTTP/1.1.
- **Contract-first:** `.proto` files define the contract, code is generated automatically
  in all languages — eliminates JSON drift between services.
- **Streaming support:** bidirectional streaming available if needed (e.g. live GPS feed
  between services), though initially used for simple request/response.
- **Ecosystem:** health checks, deadlines, cancellation, and interceptors are built into
  the gRPC spec — features that require custom middleware in REST.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| gRPC (CHOSEN) | HTTP/2, protobuf (fast), polyglot codegen, streaming, health checks built-in | Binary format (not human-readable), requires proto tooling, browser support limited | — (chosen) |
| REST (HTTP/JSON) | Universal, human-readable, browser-native, OpenAPI ecosystem mature | Text payloads (larger), no streaming, contract drift without strict OpenAPI enforcement | Keep for external APIs (mobile/web); not optimal for internal high-frequency calls |
| GraphQL | Flexible queries, single endpoint, strong typing | Overkill for service-to-service, no polyglot codegen as clean as proto, extra runtime layer | Designed for client→server, not server→server |
| Apache Thrift | Fast, polyglot | Smaller ecosystem than gRPC, less tooling support | gRPC is more widely adopted and better supported |

---

## Consequences

**Positive:**
- Type-safe contracts across all services via `.proto` files.
- Lower latency and smaller payloads for internal calls.
- Code generation eliminates manual client/server stubs.
- Health check protocol built into the gRPC spec.

**Negative / Trade-offs:**
- Binary format is not human-readable (debugging requires tools like `grpcurl` or Postman gRPC).
- Additional tooling: `protoc` compiler, proto linting, code generation in CI.
- Browser cannot call gRPC natively (not an issue — browsers go through the API Gateway).

**Impact on the system:**
- Affected services: all inter-service synchronous calls.
- Documents that must be updated:
  - `05-architecture/overview.md` (communication pattern: gRPC internal, REST external)
  - `09-microservices/communication-patterns.md` (when to use gRPC vs events)
  - `07-api/contracts/` → new `proto/` folder for `.proto` files

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Proto tooling adds CI complexity | Medium | Low | Standardize proto compilation in shared CI pipeline; document in `10-devops/` |
| Debugging binary payloads harder than JSON | Low | Low | Use `grpcurl`, Postman gRPC, and structured logging at service boundaries |
| Versioning proto files incorrectly | Medium | Medium | Use package versioning (`package school.v1`), backward-compatible changes only |

---

## References

- gRPC official docs: https://grpc.io/docs/
- Related to: ADR-002 (shared database), ADR-004 (Kafka for async), ADR-006 (API Gateway)
- Proto files location: `07-api/contracts/proto/`
