# Runbook — Notification

**Service:** notification-service
**Port:** 8080
**Stack:** .NET 10
**Database:** SQL Server schema Notification
**Version:** 1.0
**Last updated:** 2026-10-23

## 1. Quick information

| Field | Value |
|-------|-------|
| Local port | 8080 |
| Production URL | `https://api.example.com/api/v1/notifications` |
| Dashboard | Grafana → Notification |
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

### Alert: Kafka consumer lag
**Triage:** Boarding/alerts delayed

```bash
docker logs notification-service --tail 100 | grep -E 'ERROR|WARN'
docker ps | grep notification-service
# Check consumer group lag via Kafka tools
```

### Alert: Delivery failure spike
**Triage:** External provider down

```bash
docker logs notification-service --tail 100 | grep -E 'ERROR|WARN'
docker ps | grep notification-service
# Check AlertDelivered failure rate
```

### Alert: 5xx on POST /boarding
**Triage:** Students cannot scan

```bash
docker logs notification-service --tail 100 | grep -E 'ERROR|WARN'
docker ps | grep notification-service
# P0 during school hours — scale pods via docker compose
```

## 4. Database

- Scope: SQL Server schema Notification
- Migrations: Liquibase (ADR-009), changelog owned by this service only
- Never query another service's schema (`09-microservices/service-boundary-rules.md`)

## 5. Rollback / scale

```bash
# View logs for the service
docker compose logs -f notification-service

# Update to latest image and restart
docker compose pull notification-service
docker compose up -d notification-service

# Scale the service (if configured in compose)
docker compose up -d --scale notification-service=3
```

## 6. Incident communication

| Event | Channel | Sample |
|-------|---------|--------|
| P0 | `#incidents` | `[P0] notification-service degraded since HH:MM` |
| Update | `#incidents` | Every 15 min |
| Resolved | `#incidents` | Duration + root cause |

## 7. Post-incident checklist

- [ ] Health green, SLO restored
- [ ] Incident logged → `13-operations/incident-management.md`
- [ ] Follow-up → backlog / `15-project-control/risks.md`
