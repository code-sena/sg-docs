# CI/CD

> Minimal pipeline contract for School Guardian docs + services.
> Last updated: 2026-09-22

## Principles

- **Docs:** lint Markdown links + validate OpenAPI contracts on every PR.
- **Services:** build → unit tests → (optional) contract tests → container image → deploy by environment.
- **Database:** Liquibase changelogs run as a deploy step (ADR-009), never hand-edited prod schemas.
- **Edge:** Kong config (routes/plugins) is code-managed; changes go through PR.

## Suggested jobs (GitHub Actions / GitLab CI)

| Job | Triggers | Checks |
|-----|----------|--------|
| `docs-links` | PR touching `docs/**` | Broken relative links → fail |
| `openapi-validate` | PR touching `07-api/contracts/**` | `swagger-cli validate` / Spectral rules |
| `openapi-diff` | PR | Breaking-change detection vs main |
| `service-build` | PR touching service dir | Unit tests + Docker build |
| `liquibase-validate` | PR touching changelogs | `liquibase validate` |
| `deploy-dev` | push main | Roll out to dev; smoke `:8000/health` via Kong |

## Environments

See [environments.md](./environments.md) and [local-setup.md](./local-setup.md).

## Smoke path after deploy

```bash
# Edge is Kong :8000 — business services :8080 (Docker DNS)
curl -fsS http://localhost:8000/health || true
curl -fsS http://localhost:8080/health   # direct to a service, if mapped
```
