# Deployment Environments

> Defines the system's environments, their purposes, access, and key configurations.
> **Rule:** If you need to access production directly, something is wrong in the process.

---

## Project environments

| Environment | Purpose | Update | Access | Data |
|-------------|---------|--------|--------|------|
| **local** | Development on the dev's machine | Manual | Individual dev | Synthetic / seed |
| **production** | Real users | Automatic (via GitHub Actions) | Tech Lead + DevOps only | Real |

---

## Environment variables per environment

> Specific variables go in the environment's secrets system.
> Local values go in `.env.example` (without real data).

### Naming convention

```
APP_[SERVICE]_[VARIABLE]
```

### Variables per environment (example values)

| Variable | Local | Production |
|----------|-------|-------------|
| `ConnectionStrings__Default` | `Server=localhost,1433;...` | Vault / Secret Manager |
| `JWT_SECRET` | `dev-secret-only-local` | Vault / Secret Manager |
| `LOG_LEVEL` | `debug` | `warn` |

---

## CI/CD Pipeline (GitHub Actions)

```
Developer
  │
  │ git push feature/HU-XXX
  │
  │
  ▼
┌─────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS WORKFLOW                                │
│  ─────────────────────────────────────────────          │
│  1. Lint + Build + Unit Tests                          │
│  2. Build Docker Image                                 │
│  3. Push to Registry (Docker Hub / AWS ECR)            │
│  4. SSH to EC2 Instance                                │
│  5. docker compose pull && docker compose up -d         │
└─────────────────────────────────────────────────────────┘
```

---

## Production deploy strategy

**Adopted strategy:** Rolling update via Docker Compose.

### Production deploy checklist

- [ ] The release PR was reviewed and approved
- [ ] Staging tests passed
- [ ] The PO approved the HUs included in this release
- [ ] The Tech Lead approved the deploy
- [ ] Someone is available to monitor the first 30 min post-deploy
- [ ] If there are database changes: migration ran before the code deploy

### Rollback

```bash
# Rollback to previous image version via docker compose
docker compose pull
docker compose up -d
```

---

## Deploy log

| Date | Service | Version | Environment | Deployed by | Issues |
|------|---------|---------|-------------|-------------|--------|
| [date] | [service] | v[X.Y.Z] | production | [name] | None |

---

## Correlations

- Local setup → `10-devops/local-setup.md`
- Post-deploy observability → `13-operations/observability.md`
- Runbook per service → `09-microservices/services/*/runbook.md`
- Branch policy → `00-governance/git-conventions.md`
