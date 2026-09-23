# Runbook — IAM

**Service:** iam-service
**Port:** 8080
**Stack:** Java + Spring Boot
**Database:** SQL Server schema Iam via svc_iam
**Version:** 1.0
**Last updated:** 2026-09-22

## 1. Quick information

| Field | Value |
|-------|-------|
| Local port | 8080 |
| Production URL | `https://api.example.com/api/v1/iam` |
| Dashboard | Grafana → IAM |
| Alert channel | `#alerts` |
| Escalation | Tech Lead |
| Target RTO | 30 min |
| Target RPO | 5 min |

## 2. Verify health

```bash
curl http://localhost:8080/health
# {"status":"ok","version":"1.0.0","db":"connected"}
```

## 3. Frequent alerts

### Alert: Login failure spike

**Triage:** Possible credential stuffing

```bash
kubectl logs -n school-guardian -l app=iam-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=iam-service
# kubectl logs ... | grep 401; check rate-limit
```

### Alert: JWKS endpoint down

**Triage:** All services fail token verification

```bash
kubectl logs -n school-guardian -l app=iam-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=iam-service
# Check iam pods; JWKS is P0
```

### Alert: DB down (Iam schema)

**Triage:** Login unavailable

```bash
kubectl logs -n school-guardian -l app=iam-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=iam-service
# Verify SQL Server; session writes
```

## 4. Database

- Scope: SQL Server schema Iam via svc_iam
- Migrations: Liquibase (ADR-009), changelog owned by this service only
- Never query another service's schema (`09-microservices/service-boundary-rules.md`)

## 5. Rollback / scale

```bash
kubectl rollout history deployment/iam-service -n school-guardian
kubectl rollout undo deployment/iam-service -n school-guardian
kubectl scale deployment/iam-service -n school-guardian --replicas=3
```

## 6. Incident communication

| Event | Channel | Sample |
|-------|---------|--------|
| P0 | `#incidents` | `[P0] iam-service degraded since HH:MM` |
| Update | `#incidents` | Every 15 min |
| Resolved | `#incidents` | Duration + root cause |

## 7. Post-incident checklist

- [ ] Health green, SLO restored
- [ ] Incident logged → `13-operations/incident-management.md`
- [ ] Follow-up → backlog / `15-project-control/risks.md`
