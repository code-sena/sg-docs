# Runbook — Audit

**Service:** audit-service
**Port:** 8080
**Stack:** C# + ASP.NET
**Database:** SQL Server schema Audit
**Version:** 1.0
**Last updated:** 2026-09-22

## 1. Quick information

| Field | Value |
|-------|-------|
| Local port | 8080 |
| Production URL | `https://api.example.com/api/v1/audit` |
| Dashboard | Grafana → Audit |
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

### Alert: Consumer lag

**Triage:** Compliance gap risk

```bash
kubectl logs -n school-guardian -l app=audit-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=audit-service
# Scale consumers; alert on lag
```

### Alert: Disk growth

**Triage:** Retention not applied

```bash
kubectl logs -n school-guardian -l app=audit-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=audit-service
# Run retention job
```

## 4. Database

- Scope: SQL Server schema Audit
- Migrations: Liquibase (ADR-009), changelog owned by this service only
- Never query another service's schema (`09-microservices/service-boundary-rules.md`)

## 5. Rollback / scale

```bash
kubectl rollout history deployment/audit-service -n school-guardian
kubectl rollout undo deployment/audit-service -n school-guardian
kubectl scale deployment/audit-service -n school-guardian --replicas=3
```

## 6. Incident communication

| Event | Channel | Sample |
|-------|---------|--------|
| P0 | `#incidents` | `[P0] audit-service degraded since HH:MM` |
| Update | `#incidents` | Every 15 min |
| Resolved | `#incidents` | Duration + root cause |

## 7. Post-incident checklist

- [ ] Health green, SLO restored
- [ ] Incident logged → `13-operations/incident-management.md`
- [ ] Follow-up → backlog / `15-project-control/risks.md`
