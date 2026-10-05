# Configuration

> Security settings and password policies.

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 11 |
| Local port | 8080 |
| Stack | C# + ASP.NET |
| SQL Server schema | `Settings` |
| Repository | One folder per service under `backend/` (reached by Docker DNS name, not by host path) |
| Communicates with | — |
| Consumed by | api-gateway (all client traffic) |

## Responsibilities (what this service DOES)

- Store system security settings (key-value)
- Store password policies for iam-service
- Broadcast setting changes via Kafka

## Out of scope (what it does NOT do)

- Infrastructure config (env/K8s)
- UI feature flags (future)

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/settings` | List settings |
| GET | `/settings/{name}` | Get setting |
| PUT | `/settings/{name}` | Update setting |
| GET | `/password-policies` | List policies |
| PUT | `/password-policies/{id}` | Update policy |

## How to run it locally

```bash
docker compose up -d configuration-service
curl http://localhost:8080/health
```

## Related documents

- [data-model.md](./data-model.md) — schema `Settings`; tables: SecuritySettings, PasswordPolicies
- [events.md](./events.md) — publishes/consumes
- [decisions.md](./decisions.md) — service-level decisions
- [runbook.md](./runbook.md) — production operations
- [API Contract](../../../07-api/contracts/openapi/configuration-service.yaml)
- Catalog → `09-microservices/service-catalog.md`
