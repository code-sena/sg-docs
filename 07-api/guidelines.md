# REST API Guidelines

> **Mandatory standards** for every endpoint in School Guardian.
> Read this document **before** designing any endpoint. Contracts that violate
> these rules will be rejected in review.

**Enforced by:** API review in DoD (`00-governance/definition-of-done.md`).
**Authority:** These rules override individual service preferences.
**Related:** [authentication.md](./authentication.md) · [contracts/openapi/](./contracts/openapi/) · [ADR-006 API Gateway](../05-architecture/decisions/records/ADR-006-api-gateway.md)

---

## 1. Versioning

- **URL versioning:** all public paths are under `/api/v1/...`.
- Breaking changes require a new major segment (`/api/v2/...`).
- Additive (backward-compatible) changes do **not** bump the version.
- Prefer new optional fields over redefining existing ones.

```
GET  /api/v1/routes
POST /api/v1/routes
```

---

## 2. Endpoint naming

| Rule | Correct | Wrong |
|------|---------|-------|
| Plural nouns for collections | `GET /users` | `GET /user` |
| Nouns, never verbs | `GET /users/{id}/orders` | `GET /getUserOrders` |
| kebab-case for multi-word paths | `/family-members` | `/familyMembers` or `/family_members` |
| Sub-resources nest with parent id | `/routes/{routeId}/stops` | `/stops?route=...` only |
| Actions as sub-resources when truly needed | `POST /routes/{id}/assignments` | `PUT /assignRoute` |

**HTTP verbs map to semantics:**

| Verb | Use | Idempotent | Success |
|------|-----|------------|---------|
| `GET` | Read one or many | Yes | 200 |
| `POST` | Create / trigger action | No | 201 |
| `PUT` | Full replace | Yes | 200 |
| `PATCH` | Partial update | Yes* | 200 |
| `DELETE` | Soft delete | Yes | 204 |

\* PATCH is idempotent when the payload fully describes the desired state.

**Never** use `GET` with side effects, or `POST /delete/...`.

---

## 3. Pagination, filtering, sorting

All list endpoints **must** support:

```
GET /api/v1/{resource}?page=1&limit=20
GET /api/v1/{resource}?sort=createdAt&order=desc
GET /api/v1/{resource}?status=ACTIVE
```

| Param | Default | Max | Notes |
|-------|---------|-----|-------|
| `page` | 1 | — | 1-based page number |
| `limit` | 20 | 100 | Page size hard cap |
| `sort` | service default | — | Whitelisted field name |
| `order` | `asc` | — | `asc` \| `desc` |

Standard list envelope:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 137,
    "totalPages": 7
  }
}
```

Cursor-based pagination (`?cursor=...`) may be added later for high-volume
streams (e.g. GPS positions) without removing offset pagination.

---

## 4. Standard HTTP responses

| Code | When |
|------|------|
| 200 | Success with body |
| 201 | Resource created (`Location` header with new URI) |
| 204 | Success, no body (delete) |
| 400 | Malformed request / syntax |
| 401 | Missing or invalid JWT |
| 403 | Authenticated but not authorized (RBAC) |
| 404 | Resource not found |
| 409 | Conflict (duplicate business key) |
| 422 | Semantic validation failed |
| 429 | Rate limited (`Retry-After` header) |
| 500 | Unhandled server error |
| 503 | Dependency down / starting |

---

## 5. Error format

All errors use `ErrorResponse` from [`_shared.yaml`](./contracts/openapi/_shared.yaml):

```json
{
  "error": "VALIDATION_ERROR",
  "message": "The email field is required",
  "details": [
    { "field": "email", "message": "required" }
  ],
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `error` | Yes | SCREAMING_SNAKE_CODE, stable identifier |
| `message` | Yes | Human-readable, English, no sensitive data |
| `details` | No | Field-level problems; omit when N/A |
| `correlationId` | Yes on 5xx | Same as `X-Correlation-Id` header |

**Never** leak stack traces, SQL, connection strings, or internal hostnames
in error bodies.

---

## 6. Authentication & headers

- External calls carry `Authorization: Bearer <jwt>` (see [authentication.md](./authentication.md)).
- The gateway strips inbound `X-User-Id` / `X-User-Role` and injects them
  for upstreams; services trust only gateway-injected values.
- Every request/response includes `X-Correlation-Id` (generate if absent).
- Timestamps in payloads: ISO-8601 UTC (`2026-09-22T14:00:00Z`).

---

## 7. Resource representation

- JSON only; field names **camelCase** in payloads (SQL columns may differ).
- Always include: `id`, `createdAt`, `updatedAt`, `status` where applicable.
- Soft-deleted rows are excluded by default; opt in with `?includeDeleted=true`
  (admin-only endpoints).
- Binary payloads (logos, documents): multipart upload endpoints return
  an `id`, never base64 inside JSON collections.

---

## 8. Partial vs full updates

- `PUT` = full representation (client supplies every required field).
- `PATCH` = only changed fields; server ignores unknown keys silently
  **or** returns 422 — pick one per resource and document it in OpenAPI.
- Password/credential changes are never `PUT /users` — always dedicated
  endpoints (e.g. `POST /auth/change-password`).

---

## 9. Health checks

Every service exposes (no auth):

```
GET /health          → 200 {"status":"ok","version":"...","db":"connected"}
GET /health/ready    → 200 when dependencies ready; 503 otherwise
```

Only `/health` (and optionally `/health/ready`) bypass JWT at the gateway.

---

## 10. Rate limiting (gateway-enforced)

| Audience | Key | Default limit |
|----------|-----|---------------|
| Public (`/auth/login`, forgot-password) | IP | 10 / 5 min |
| Authenticated APIs | user id | 100 / min |
| Internal health | — | none | 

Responses over limit: `429` + `Retry-After` (seconds).

---

## 11. Contract-first workflow

1. Copy [`_template-service.yaml`](./contracts/openapi/_template-service.yaml).
2. Design paths/schemas; reuse components from [`_shared.yaml`](./contracts/openapi/_shared.yaml).
3. Save as `contracts/openapi/<service-name>.yaml`.
4. Wire route in the gateway (`api-gateway.yaml` + Kong config).
5. Implement against the contract; CI validates contract still matches code.

**Rule:** code never ships an endpoint absent from its OpenAPI file.

---

## 12. Checklist for API review

- [ ] Path under `/api/v1`, plural nouns, kebab-case
- [ ] Verb semantics correct; no side effects on GET
- [ ] List endpoints: pagination + sort whitelist
- [ ] Errors use `ErrorResponse` + correlation id
- [ ] Auth: bearer JWT or documented public flag
- [ ] OpenAPI updated and validates (`_shared.yaml` refs resolve)
- [ ] No schema reads across service boundaries (ADR-002)
- [ ] Rate limit class assigned for public endpoints
