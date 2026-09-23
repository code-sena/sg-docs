# Runbook — GPS

**Service:** gps-service
**Port:** 8080
**Stack:** Java + Spring Boot
**Database:** SQL Server schema Gps
**Version:** 1.0
**Last updated:** 2026-09-22

## 1. Quick information

| Field | Value |
|-------|-------|
| Local port | 8080 |
| Production URL | `https://api.example.com/api/v1/gps` |
| Dashboard | Grafana → GPS |
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

### Alert: No device data

**Triage:** Provider outage

```bash
kubectl logs -n school-guardian -l app=gps-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=gps-service
# Check last PositionRecorded
```

### Alert: Storage growth

**Triage:** High ingest

```bash
kubectl logs -n school-guardian -l app=gps-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=gps-service
# Review sampling/retention
```

### Alert: Anomaly false positives

**Triage:** Noisy alerts

```bash
kubectl logs -n school-guardian -l app=gps-service --tail=100 | grep -E 'ERROR|WARN'
kubectl get pods -n school-guardian -l app=gps-service
# Tune thresholds
```

## 4. Database

- Scope: SQL Server schema Gps
- Migrations: Liquibase (ADR-009), changelog owned by this service only
- Never query another service's schema (`09-microservices/service-boundary-rules.md`)

## 5. Rollback / scale

```bash
kubectl rollout history deployment/gps-service -n school-guardian
kubectl rollout undo deployment/gps-service -n school-guardian
kubectl scale deployment/gps-service -n school-guardian --replicas=3
```

## 6. Incident communication

| Event | Channel | Sample |
|-------|---------|--------|
| P0 | `#incidents` | `[P0] gps-service degraded since HH:MM` |
| Update | `#incidents` | Every 15 min |
| Resolved | `#incidents` | Duration + root cause |

## 7. Post-incident checklist

- [ ] Health green, SLO restored
- [ ] Incident logged → `13-operations/incident-management.md`
- [ ] Follow-up → backlog / `15-project-control/risks.md`
