# Authentication & Authorization

> Single source of truth for how clients and services prove identity in
> School Guardian. Implements [ADR-008 JWT RS256](../05-architecture/decisions/records/ADR-008-jwt-rs256-authentication.md)
> behind the [ADR-006 API Gateway](../05-architecture/decisions/records/ADR-006-api-gateway.md).

**Owner service:** `iam-service` (folder `09-microservices/services/02-iam-service/`).
**Contract:** [`contracts/openapi/iam-service.yaml`](./contracts/openapi/iam-service.yaml).

---

## 1. Actors and trust model

```
Web (Angular)  ─┐
Mobile (Expo)  ─┼─ HTTPS + Bearer JWT ─▶ API Gateway (Kong OSS) :8000 ─▶ microservices
Operators/API  ─┘         │                    │
                          │                    ├─ verify RS256 (JWKS, local cache)
                          │                    └─ inject X-User-* headers (strip inbound)
                          ▼
                    iam-service :8080
                    (issues/revokes tokens, owns RBAC)
```

| Layer | Responsibility |
|-------|----------------|
| Gateway | Validate signature (RS256/JWKS) and expiry; enforce rate limits; strip and then inject identity headers |
| Services | Trust `X-User-*` **only** from the gateway; never accept them from clients; requests with no headers stay anonymous |
| Clients | Store the refresh token securely; never embed secrets in apps |

**Critical:** the gateway **strips** any inbound `X-User-*` headers from the
public internet before injecting authoritative values.

---

## 2. Token model

Both tokens are **RS256 JWTs** signed by `iam-service`. The access token is
returned in the response body; the refresh token is delivered as an
`HttpOnly` cookie on web and as a bearer value on mobile.

| Token | Algorithm | TTL | Storage (client) | Purpose |
|-------|-----------|-----|------------------|---------|
| Access token | RS256 (`kid=sg-iam`) | **15 minutes** | Memory (mobile: SecureStore) | Call APIs |
| Refresh token | RS256 | **30 days** | httpOnly cookie (web) / SecureStore (mobile) | Obtain a new token pair |

Claims in the access token (the refresh token uses the same identity claims but
`type: "refresh"` and no `jti`):

```json
{
  "sub": "profile-uuid",
  "personId": "person-uuid",
  "roleId": "role-uuid",
  "type": "access",
  "jti": "token-uuid",
  "email": "user@example.com",
  "campusId": "campus-uuid",
  "schoolId": "school-uuid",
  "iss": "school-guardian-iam",
  "aud": "school-guardian-api",
  "iat": 1760000000,
  "exp": 1760000900
}
```

Public keys are published at `GET /.well-known/jwks.json`. The gateway fetches
the JWKS and caches it (refresh on an unknown `kid`).

---

## 3. Auth flows

### 3.1 Login (admin-created accounts only)

There is **no public self-registration** (FR-2.x / functional.md): administrators
create accounts; IAM only authenticates them.

```
POST /api/v1/auth/login
{ "email": "...", "password": "..." }
→ 200 { accessToken, expiresAt, ... }   (refresh token in an HttpOnly cookie)
→ 401 INVALID_CREDENTIALS (generic — never reveals if email exists)
```

### 3.2 Refresh

```
POST /api/v1/auth/refresh
   Web:     HttpOnly refresh cookie
   Mobile:  Authorization: Bearer <refresh-token>
→ 200 new access + refresh pair (both rotated)
→ 401 if the refresh token is expired, malformed, or the account is inactive
```

### 3.3 Logout

```
POST /api/v1/auth/logout
→ 204: the access-token `jti` is added to the in-memory deny list and the
   refresh cookie is cleared
```

### 3.4 Password reset / account recovery

Handled by the `forgot-information` service (public routes):

- Forgot: `POST /api/v1/password/forgot` → a verification code is sent by email.
- Verify: `POST /api/v1/password/forgot/verify`.
- Reset: `POST /api/v1/password/reset`.
- Email/phone changes use `POST /api/v1/email/change/*` and
  `POST /api/v1/phone/change/*` respectively.

Password policy is owned by `iam-service`, which enforces it directly.

---

## 4. Authorization (RBAC)

| Concept | Owner | Notes |
|---------|-------|-------|
| Role | `Iam.Role` | e.g. SUPER_ADMIN, ADMIN, DRIVER, GUARDIAN |
| Permission | `Iam.Permissions` | Format `resource.action` (`route.create`) |
| Role↔Permission | `Iam.PermissionsRole` | M:N |
| Profile↔Role | `Iam.Profile` | User identity + hash + role assignment |

**Evaluation order:**

1. Gateway: token valid? → else 401.
2. Gateway/service: required permission present in token **or** live check for
   privileged ops → else 403.
3. Resource-level checks (ownership: school id, family id) → else 403/404.

**Default deny.** UI hiding is never authorization.

---

## 5. Endpoint protection matrix

| Endpoint class | Auth | Example |
|----------------|------|---------|
| Public | None | `/health`, `/api/v1/auth/*`, `/api/v1/password/*`, JWKS |
| Authenticated | Valid JWT | Most CRUD |
| Role-gated | JWT + role | `/superadmin/*` → SUPER_ADMIN only |
| Permission-gated | JWT + permission | `route.create`, `user.deactivate` |
| Gateway health | None | `/api/gateway/health` |

---

## 6. Internal headers (gateway → service)

The gateway verifies the token and then injects these headers; it also strips
any inbound `X-User-*` value so a client can never spoof identity.

| Header | Example | Rules |
|--------|---------|-------|
| `X-User-Id` | profile UUID (from `sub`) | Injected by gateway; trusted by services |
| `X-User-Role` | role UUID (from `roleId`) | Injected by gateway |
| `X-User-Email` | `user@example.com` | Injected by gateway |
| `X-Campus-Id` | campus UUID | Injected by gateway when present |
| `X-School-Id` | school UUID | Injected by gateway when present |
| `X-Correlation-Id` | UUID | Propagated end-to-end; logged everywhere |

Services build the request identity from these headers and treat a request with
no headers as anonymous (used by internal gRPC/REST calls).

---

## 7. Session & revocation

- `iam-service` keeps an **in-memory deny list** (`InMemoryTokenDenyList`) of
  revoked access-token `jti` values, keyed by their expiry and purged hourly.
  Because each access token lives only 15 minutes, revocation is effective
  within that window.
- Refresh tokens are self-contained (no server-side session row); rotation
  issues a fresh pair on every refresh and an expired/invalid refresh token is
  rejected.
- Deactivated profile: login fails and refresh is rejected; an already-issued
  access token dies at its short TTL (or sooner if logged out).

---

## 8. Security requirements

- Passwords: Argon2id or bcrypt (cost ≥ 12); never log plaintext.
- Login rate limit: 10 / 5 min / IP (gateway, see [guidelines.md](./guidelines.md)).
- Brute-force response identical for unknown user vs bad password.
- TLS 1.2+ everywhere; HTTP only inside compose network.
- Secrets (signing key, DB) only via environment/secret manager — never Git.
- RS256 private key lives **only** in `iam-service`; all others use public JWKS.
- Logging: login success/failure, password reset and role changes are recorded by the owning service's logs.

---

## 9. Service-to-service calls

Default: the gateway-injected identity headers travel with the request, so a
downstream service sees the same user context.

Internal calls that do not originate from an authenticated request (gRPC
between services, background jobs) carry **no** `X-User-*` headers and are
therefore treated as anonymous — services must not assume an identity is
present. Cross-service calls that must act on behalf of a user forward the
`X-User-*` headers explicitly.

---

## 10. Compliance checklist

- [ ] Login/refresh/logout implemented per contract
- [ ] RS256 + JWKS; no HS256 shared secrets
- [x] Access TTL 15 min; refresh rotation on every use
- [x] Gateway strips client `X-User-*` before injecting
- [ ] RBAC permissions mapped to routes; default deny
- [ ] Rate limit on login/forgot-password
- [ ] No credentials in logs, URLs, or client bundles
- [ ] Session revocation on logout (in-memory deny list)
