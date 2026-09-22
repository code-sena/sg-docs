# ADR-006 — API Gateway as the single entry point

- **ID:** ADR-006
- **Date:** 2026-09-08
- **Status:** Proposed
- **Authors:** [Team]

---

## Context

School Guardian exposes services to two client platforms: a **web admin app** and a **mobile app**
(see ADR-003). Internal services communicate synchronously via gRPC (ADR-005) and asynchronously
via Kafka (ADR-004). We need a **single entry point** that handles routing, authentication,
rate limiting, and CORS for all external traffic. Without a gateway, clients would need to know
the internal service topology, create coupling, and duplicate cross-cutting logic in each service.

**Known constraints:**
- Two external clients: web app (admin) and mobile app (parents, drivers).
- Authentication via JWT RS256 (see `.env.example`).
- Rate limiting must be applied at the edge (not per service).
- CORS must be configured for the web client.
- The gateway must route to internal services by path prefix.

---

## Decision

**We decided:** to use **Kong Gateway** (OSS) as the API Gateway for School Guardian.

**Justification:**
- **Declarative configuration:** route rules, plugins, and services defined via YAML/DB — no custom code needed for standard cross-cutting concerns.
- **Plugin ecosystem:** JWT validation, rate limiting, CORS, request transformation, logging — all available as plugins without writing middleware.
- **Proxy performance:** Kong runs on NGINX under the hood — battle-tested HTTP proxy performance.
- **Runs anywhere:** Docker container, fits the local dev + production deployment model (ADR-012).
- **Admin API:** programmatic management of routes/plugins (useful for CI/CD automation).

---

## Evaluated alternatives

| Alternative | Routing | Auth (JWT) | Rate Limiting | CORS | Complexity | Rating (1-10) |
|-------------|---------|-----------|---------------|------|-----------|---------------|
| Kong OSS (CHOSEN) | Excellent (path/host) | Plugin (key-based) | Plugin (sliding window) | Plugin | Medium (runs on NGINX) | 9 |
| NGINX + custom Lua/config | Excellent | Manual config (jwt模块) | Manual (limit_req) | Manual | High (Lua scripting) | 7 |
| Spring Cloud Gateway | Excellent (Java routes) | Filter-based | Filter-based | Filter-based | High (JVM dependency) | 6 |
| Traefik | Excellent (auto-discovery) | Plugin (ForwardAuth) | Plugin | Plugin | Medium | 7 |
| Custom (Express/Fastify) | Full control | Code | Code | Code | High (maintenance burden) | 5 |

---

## Consequences

**Positive:**
- Single entry point for all external traffic — clients only know one URL.
- Cross-cutting logic (JWT, rate limiting, CORS) lives in one place, not duplicated per service.
- Internal services stay pure (business logic only), no gateway middleware in each.
- Easy to add new services: just add a route in Kong.

**Negative / Trade-offs:**
- Adds one infrastructure component to maintain (Kong container).
- Adds latency (one extra hop) — acceptable for the gateway layer.
- Kong becomes a single point of failure (mitigated with replication/health checks).
- Debugging: need to distinguish gateway errors from service errors (structured logging with correlation ID).

**Impact on the system:**
- Affected services: all externally exposed services (auth-service, users-service, route-service, etc.).
- Documents that must be updated:
  - `05-architecture/overview.md` (update "Kong/NGINX/Spring Cloud Gateway" → Kong)
  - `09-microservices/service-catalog.md` (update API Gateway entry)
  - `10-devops/local-setup.md` (Kong in Docker Compose)
  - `10-devops/environments.md` (Kong per environment)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Kong becomes single point of failure | Low | High | Run with replicas + health check; document in `13-operations/` |
| Plugin misconfiguration (JWT bypass) | Medium | High | Test JWT validation in integration tests; review plugin config in PRs |
| Performance bottleneck under high load | Low | Medium | Benchmark with expected load; scale Kong horizontally if needed |

---

## References

- Kong Gateway docs: https://docs.konghq.com/gateway/
- Related to: ADR-003 (monolithic clients), ADR-005 (gRPC internal), ADR-015 (JWT auth)
- API Gateway service detail: `09-microservices/services/01-api-gateway/`
