# Runbook — Route

**Service:** route-service
**Port:** 8080
**Stack:** C# + ASP.NET
**Database:** SQL Server schema Route
**Version:** 1.0
**Last updated:** 2026-09-22

## 1. Quick information

| Field | Value |
|-------|-------|
| Local port | 8080 |
| Production URL | `https://api.example.com/api/v1/routes` |
| Dashboard | Grafana → Route |
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

### Alert: Execution stuck RUNNING

**Triage:** Crash mid-trip

```bash
kubectl logs -n school-guardian -l app=route-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=route-service
# Inspect open executions; manual close
```

### Alert: Assignment conflicts

**Triage:** Bus already assigned

```bash
kubectl logs -n school-guardian -l app=route-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=route-service
# Return 409 to UI
```

## 4. Database

- Scope: SQL Server schema Route
- Migrations: Liquibase (ADR-009), changelog owned by this service only
- Never query another service's schema (`09-microservices/service-boundary-rules.md`)

## 5. Rollback / scale

```bash
kubectl rollout history deployment/route-service -n school-guardian
kubectl rollout undo deployment/route-service -n school-guardian
kubectl scale deployment/route-service -n school-guardian --replicas=3
```

## 6. Incident communication

| Event | Channel | Sample |
|-------|---------|--------|
| P0 | `#incidents` | `[P0] route-service degraded since HH:MM` |
| Update | `#incidents` | Every 15 min |
| Resolved | `#incidents` | Duration + root cause |

## 7. Post-incident checklist

- [ ] Health green, SLO restored
- [ ] Incident logged → `13-operations/incident-management.md`
- [ ] Follow-up → backlog / `15-project-control/risks.md`
