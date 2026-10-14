# Technical decisions — API Gateway

> Internal design decisions for this service that are not covered by the global architecture ADRs.
> Each decision documents the context, the choice, and the consequences.

---

## Decision: Auth at the gateway vs. at each service

**Date:** [decision date]  
**Context:** There are two strategies for verifying JWT tokens: (A) the gateway verifies the token
and passes user context as headers; (B) each microservice verifies its own token.

**Decision:** Strategy A — the gateway verifies the JWT (signature + expiration)
and attaches `X-User-Id` and `X-User-Role` as internal headers. Microservices trust
these headers without re-verifying the token. (Token revocation is handled by iam-service's in-memory deny list, not by the gateway.)

**Consequences:**
- Microservices are simpler (no JWT library required)
- The gateway is the only point that needs access to the JWT public key
- If the gateway is compromised, all services are vulnerable — mitigated with internal TLS
- Internal headers must NOT be reachable from outside the gateway (nginx/proxy strips inbound `X-User-*` headers)

---

## Decision: Rate limiting by IP vs. by user

**Date:** [decision date]  
**Context:** Rate limiting can be applied to the source IP or to the authenticated user.

**Decision:** Rate limiting by IP for public endpoints (login, register), by user-id for
authenticated endpoints.

**Consequences:**
- IP rate limit does not penalize users on the same network (corporate NAT)
- User-id rate limit requires the token to be verified before applying the limit
- Implementation: local (per-node) in-memory bucket with key `rate:{ip}:{path}` or `rate:{userId}:{path}`

---

## Decision: Gateway implementation

**Date:** [decision date]  
**Context:** Options: (A) Kong OSS, (B) NGINX Plus, (C) custom Express/Fastify, (D) Envoy sidecar.

**Decision:** **(A) Kong OSS** — industry gateway, language-neutral for services, auth/rate-limit plugins, aligned with ADR-006/ADR-007 (Scalar for docs).

**Consequences:** [trade-offs of the decision]

---

## Correlations

- Global architecture ADRs → `05-architecture/decisions/records/`
- Gateway runbook → `runbook.md`
