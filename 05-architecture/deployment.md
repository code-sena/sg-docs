# Deployment view

Last updated: 2026-09-22 · Complements [overview.md](./overview.md) (C4) and `10-devops/`

## Topology (local / single environment)

```text
Browser / Mobile
      │
      ▼ :8000
┌─────────────┐     ┌──────────────────────────────────┐
│  Kong OSS   │────▶│ business services :8080 (DNS)    │
│ api-gateway │     │ iam, user-mgmt, school, bus, ... │
└─────────────┘     └───────────────┬──────────────────┘
                                    │
                    ┌───────────────▼──────────────────┐
                    │ SQL Server (schemas per service) │
                    │ Redis · Kafka                    │
                    └──────────────────────────────────┘
```

## Runtime units

| Unit | Port | Notes |
|------|------|-------|
| Kong (gateway) | **8000** public | Routes → `http://<service-name>:8080` |
| Each microservice | **8080** | Container network only |
| SQL Server | 1433 | Not exposed publicly |
| Kafka | internal | Not exposed publicly |
| Adminer (optional dev) | 8090 | Dev convenience only |

## Environments

See `10-devops/environments.md`, `10-devops/local-setup.md`, `10-devops/ci-cd.md`.

## Release shape

1. Migrate DB (Liquibase) → 2. Deploy services → 3. Reload Kong routes if changed → 4. Smoke via `http://localhost:8000/health`.

## Related

- ADR-006 Kong · ADR-009 Liquibase · Runbooks under `09-microservices/services/*/runbook.md`
