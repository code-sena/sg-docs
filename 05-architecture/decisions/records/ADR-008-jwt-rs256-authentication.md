# ADR-008 — JWT RS256 for authentication and authorization

- **ID:** ADR-008
- **Date:** 2026-09-08
- **Status:** Accepted
- **Authors:** [Team]

---

## Context

School Guardian needs to authenticate users (parents, drivers, administrators) and authorize their actions. The clients are a web app and a mobile app that communicate with the API Gateway (ADR-006). The API Gateway must validate tokens in a stateless manner without querying the database on every request. The stack is polyglot (C#, Go, Java), so the authentication strategy must be consistent across all services.

**Known constraints:**
- Two clients: web and mobile.
- API Gateway must validate tokens without DB calls.
- Polyglot stack: validation must work in C#, Go, and Java.
- Tokens must be invalidable (logout, password change).
- Refresh tokens for long-lived sessions.

---

## Decision

**We decided:** to use **JWT with RS256 algorithm** (RSA signature) for authentication and authorization.

**Justification:**
- RS256 uses a key pair (public/private): only iam-service holds the private key, all others validate with the public key — no shared secrets.
- Stateless validation: the API Gateway and each service validate the JWT locally without calling iam-service.
- Native support across all stacks: `System.IdentityModel.Tokens.Jwt` (C#), `jwt-go` (Go), `java-jwt` (Java).
- The payload carries useful claims: `sub` (user ID), `role`, `permissions`, `exp`.
- JWKS endpoint (`/.well-known/jwks.json`) enables key rotation without redeploy.

**JWT payload (designed):**

```json
{
  "sub": "uuid-del-usuario",
  "email": "usuario@correo.com",
  "role": "ADMIN|DRIVER|PARENT|STUDENT",
  "school_id": "uuid-del-colegio",
  "iat": 1725800000,
  "exp": 1725803600
}
```

**Flow:**

```
1. Client → POST /auth/login (credentials)
2. iam-service → generates JWT (RS256) + refresh token
3. Client → sends JWT in Authorization: Bearer <token>
4. API Gateway → validates RSA signature, claims, exp → allows or rejects
5. API Gateway → forwards with headers: X-User-Id, X-User-Role, X-Correlation-Id
6. Refresh → POST /auth/refresh (refresh token) → new JWT
```

---

## Evaluated alternatives

| Alternative | Stateless | Validation without DB | Multi-stack | Invalidable | Rating |
|-------------|----------|----------------------|------------|-------------|--------|
| JWT RS256 (CHOSEN) | Yes | Yes (public key) | Yes (official libs) | Yes (Redis blacklist + refresh tokens) | 9 |
| JWT HS256 (HMAC) | Yes | Yes (shared secret) | Yes | Yes | 7 |
| Sessions + Cookie | No (server-side) | No (DB query) | N/A | Yes (destroy session) | 4 |
| OAuth 2.0 + opaque token | Yes | Yes (introspection) | Yes | Yes | 7 |

**Why not HS256:** requires sharing a secret across all services — if one is compromised, all are compromised. RS256 separates the public key (validation) from the private key (signing).

---

## Consequences

**Positive:**
- Stateless validation at the edge, no shared secrets.
- Claims carry authorization data (role, school_id).
- JWKS endpoint for key rotation without redeploy.
- Consistent validation across polyglot services.

**Negative / Trade-offs:**
- RS256 is slower than HS256 (asymmetric) — negligible difference at our scale.
- Tokens are not immediately invalidable on logout (mitigated with short TTL + Redis blacklist for refresh tokens).

**Impact on the system:**
- Affected services: iam-service (generates tokens), API Gateway (validates), all services (read claims).
- Documents that must be updated:
  - `05-architecture/overview.md` (auth flow)
  - `09-microservices/service-catalog.md` (iam-service detail)
  - `07-api/contracts/openapi/iam-service.yaml` (JWT endpoints)
  - `00-governance/security-policy.md` (auth strategy)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Private key compromised | Low | High | Store in vault/secrets, rotate periodically, JWKS |
| Token not immediately invalid on logout | Medium | Medium | Short TTL (15 min) + Redis blacklist for refresh tokens |
| JWT payload contains sensitive data | Medium | High | Minimal claims only (sub, role, email), never sensitive PII |

---

## References

- JWT spec: https://datatracker.ietf.org/doc/html/rfc7519
- JWKS: https://datatracker.ietf.org/doc/html/rfc7517
- Related to: ADR-006 (API Gateway validates JWT), ADR-002 (shared DB), `07-api/contracts/openapi/iam-service.yaml`
