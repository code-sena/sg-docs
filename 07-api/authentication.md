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
                          │                    └─ inject X-User-Id, X-User-Role
                          ▼
                    iam-service :8080
                    (issues/revokes tokens, owns RBAC)
```

| Layer | Responsibility |
|-------|----------------|
| Gateway | Validate signature, expiry, blacklist; enforce rate limits; inject identity headers |
| Services | Trust `X-User-Id` / `X-User-Role` **only** from the gateway; never accept them from clients |
| Clients | Store refresh token securely; never embed secrets in apps |

**Critical:** the gateway **strips** any inbound `X-User-*` headers from the
public internet before injecting authoritative values.

---

## 2. Token model

| Token | Algorithm | TTL | Storage (client) | Purpose |
|-------|-----------|-----|------------------|---------|
| Access token | RS256 | **1 hour** | Memory (mobile: SecureStore) | Call APIs |
| Refresh token | Opaque/SHA-256 id | **7 days** (sliding on use) | httpOnly cookie (web) / SecureStore (mobile) | Obtain new access token |

Claims in access token:

```json
{
  "sub": "profile-uuid",
  "roles": ["ADMIN"],
  "permissions": ["route.create", "route.update"],
  "iss": "school-guardian-iam",
  "aud": "school-guardian-api",
  "iat": 1760000000,
  "exp": 1760003600,
  "jti": "token-uuid"
}
```

Public keys are published at `GET /.well-known/jwks.json` (see contract `jwks`).
Services/gateway fetch JWKS and cache it (refresh on unknown `kid`, min 5 min).

---

## 3. Auth flows

### 3.1 Login (admin-created accounts only)

There is **no public self-registration** (FR-2.x / functional.md): administrators
create accounts; IAM only authenticates them.

```
POST /api/v1/auth/login
{ "email": "...", "password": "..." }
→ 200 { accessToken, refreshToken, expiresIn }
→ 401 INVALID_CREDENTIALS (generic — never reveals if email exists)
```

### 3.2 Refresh

```
POST /api/v1/auth/refresh
Authorization: Bearer <refresh-token>
→ 200 new pair; old refresh token rotated (one-time use)
→ 401 REFRESH_REUSED (revoke entire session family — possible theft)
```

### 3.3 Logout

```
POST /api/v1/auth/logout
→ 204: add access `jti` to blacklist + revoke refresh session
```

### 3.4 Password change / reset

- Change (authenticated): `POST /api/v1/auth/change-password`
  (current + new password; policy from `configuration-service`).
- Forgot: `POST /api/v1/auth/forgot-password` → code by email/notification →
  `POST /api/v1/auth/reset-password`.
- After reset/change: revoke all sessions for that profile.

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
| Public | None | `/health`, `/auth/login`, `/auth/forgot-password`, JWKS |
| Authenticated | Valid JWT | Most CRUD |
| Role-gated | JWT + role | `/superadmin/*` → SUPER_ADMIN only |
| Permission-gated | JWT + permission | `route.create`, `user.deactivate` |
| Gateway health | None | `/api/gateway/health` |

---

## 6. Internal headers (gateway → service)

| Header | Example | Rules |
|--------|---------|-------|
| `X-User-Id` | profile UUID | Injected by gateway; trusted by services |
| `X-User-Role` | `ADMIN` | Injected by gateway |
| `X-Correlation-Id` | UUID | Propagated end-to-end; logged everywhere |

Clients **cannot** set these past the edge.

---

## 7. Session & revocation

- Access-token revocation relies on short TTL + **blacklist** in Redis
  (logout, password reset, admin disable).
- Refresh sessions live in `Iam.SessionProfile`; reuse detection rotates families.
- Deactivated profile: login fails; existing access dies at TTL or blacklist push.

---

## 8. Security requirements

- Passwords: Argon2id or bcrypt (cost ≥ 12); never log plaintext.
- Login rate limit: 10 / 5 min / IP (gateway, see [guidelines.md](./guidelines.md)).
- Brute-force response identical for unknown user vs bad password.
- TLS 1.2+ everywhere; HTTP only inside compose network.
- Secrets (signing key, DB) only via environment/secret manager — never Git.
- RS256 private key lives **only** in `iam-service`; all others use public JWKS.
- Audit: login success/failure, password reset, role change → owning service status/log history.

---

## 9. Service-to-service calls

Default: authenticated user context forwarded as headers (same request path).

Machine jobs (no user): use client credentials style service token **or**
mutual TLS inside the cluster — decision tracked in service `decisions.md`.
gRPC internal calls reuse the same JWT claims (metadata `authorization`).

---

## 10. Compliance checklist

- [ ] Login/refresh/logout implemented per contract
- [ ] RS256 + JWKS; no HS256 shared secrets
- [ ] Access TTL ≤ 1 h; refresh rotation + reuse detection
- [ ] Gateway strips client `X-User-*`
- [ ] RBAC permissions mapped to routes; default deny
- [ ] Rate limit on login/forgot-password
- [ ] No credentials in logs, URLs, or client bundles
- [ ] Session revocation on disable/password reset
