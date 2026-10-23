# Data Model — API Gateway

> The API Gateway is **stateless**: it has no database of its own.
> Configuration state (routes, rate limits, allowlists) is managed via
> environment variables and configuration files versioned in Git,
> not in database tables.

---

## Database engine

**Engine:** N/A — no persistent database.

**Justification:** An API Gateway that requires its own database introduces an extra failure point in the layer that all traffic passes through. Routing state is managed via configuration (YAML files or environment variables), and rate-limit counters are kept in local, per-node memory. Token revocation is not stored here: it lives in iam-service's in-memory deny list.

---

## In-memory state

The API Gateway keeps only ephemeral, per-node in-memory state:

| Data | Storage | TTL | Purpose |
|------|---------|-----|---------|
| Rate limit counters | Local memory (per node) | 60 seconds | Request counting per IP |

**iam-service** is the **owner** of the token deny list (keyed by `jti`, tied to the short access-token TTL) — the gateway validates tokens statelessly against the JWT signature and expiry and does not store revocation state.

---

## Route configuration files

Instead of tables, routes are defined in:

```
config/
├── routes.yaml          # Route map: path → service + port
├── rate-limits.yaml     # Limits per route and role
└── cors.yaml            # CORS configuration per origin
```

These files are versioned in Git and reloaded on service startup.
A route change requires a redeploy (intentional: routing changes are infrastructure changes).

---

## Correlations

- Environment configuration → `10-devops/environments.md`
- Gateway runbook → `runbook.md`
- Catalog of available routes → `09-microservices/service-catalog.md`
