# Runbook — API Gateway

> Operations procedures for whoever is on call.
> Each section is executable without extra context.

**Service:** api-gateway  
**Local port:** 8000  
**Version:** 1.0  
**Last updated:** 2026-09-22

---

## 1. Quick info

| Field | Value |
|-------|-------|
| Local port | **8000** (Kong proxy) |
| Production URL | `https://api.[domain]/` |
| Staging URL | `https://staging.api.[domain]/` |
| Grafana dashboard | [Gateway dashboard URL] |
| Alerts channel | [#alerts] |
| Escalation | [Tech Lead — contact] |
| Target RTO | 5 min (public entry point — immediate P0) |
| Target RPO | N/A (stateless) |

---

## 2. Health check

```bash
# Public health check (no auth required)
curl http://localhost:8000/health  # Kong

# Expected response:
# {"status": "ok", "timestamp": "2024-01-15T10:30:00Z"}

# If there are problems, check upstreams:
curl -H "Authorization: Bearer [dev-token]" https://api.[domain]/api/v1/auth/health
```

---

## 3. Common alerts

### High 502/503 error rate (upstream not responding)

**Symptom:** Services behind the gateway return 502 or 503.

```bash
# See which service the errors belong to
kubectl logs -n [ns] -l app=api-gateway --tail=200 | grep '"status":50'

# Verify the affected service pods are Running
kubectl get pods -n [ns] -l app=[affected-service]
```

**Decision tree:**
- Does the affected service have `Running` pods? → Problem may be an unhandled exception. Check service logs.
- Are pods in `CrashLoopBackOff`? → Service crashed. Escalate to the affected service runbook.
- Are all services down? → Network or gateway problem. See section 3.3.

### High 401 error rate (invalid token)

**Symptom:** Many 401s. Could be an attack or a rotated JWT key.

```bash
# See IPs with the most 401s
kubectl logs -n [ns] -l app=api-gateway --tail=500 | \
  grep '"status":401' | jq '.ip' | sort | uniq -c | sort -rn | head
```

- Does a single IP generate all 401s? → Possible attack. Add to denylist.
- Do many IPs return 401 after a deploy? → JWT public key may have changed. Verify gateway environment variables.

### Rate limit triggered globally

```bash
# See how many requests blocked by rate limit
kubectl logs -n [ns] -l app=api-gateway --tail=200 | grep '"status":429'
```

If the rate limit is triggering under normal conditions, the limit may be too low.
Coordinate with the Tech Lead before changing it.

---

## 4. Rollback

The API Gateway is stateless — rollback is a redeploy of the previous version:

```bash
kubectl rollout history deployment/api-gateway -n [ns]
kubectl rollout undo deployment/api-gateway -n [ns]
kubectl rollout status deployment/api-gateway -n [ns]
```

---

## 5. Scale the gateway

```bash
# Horizontal scale (no downtime, stateless)
kubectl scale deployment/api-gateway -n [ns] --replicas=3
kubectl get pods -n [ns] -l app=api-gateway
```

---

## 6. Post-incident

- [ ] Gateway responding with P95 latency < 50ms
- [ ] Zero 5xx in the last 5 minutes
- [ ] Incident recorded in `13-operations/incident-management.md`
- [ ] If the incident caused an SLA breach: notify Tech Lead
