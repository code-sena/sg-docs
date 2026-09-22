# NFR-[NNN]: [NFR Name]

> **ID convention:** `NFR-[NNN]`
> Examples: NFR-001, NFR-023, NFR-005
> NFRs define **qualities of the system** — not what it does, but how well it does it.
> Golden rule: every NFR must have a metric. "The system must be fast" is not an NFR.

---

## Requirement

**The system must** [measurable quality statement]

| Attribute | Metric |
|-----------|--------|
| [attribute] | [measurable target with condition — e.g., P95 < 300ms under 50 RPS] |

**Category:** [Performance / Availability / Security / Scalability / Observability / Maintainability / Portability / Disaster Recovery]

---

## How to verify

> [Concrete verification method: load test, monitoring, security audit, contract test]
> [Context/condition in which the metric applies — e.g., "during the peak boarding window 6:30–8:00 AM, in staging"]

**Tool(s):** [k6, Prometheus + Grafana, SonarQube, OWASP ZAP, K8s probes...]
**Where it is validated:** [CI / staging / production]

---

## Priority and ownership

| Field | Value |
|-------|-------|
| Priority | P1 / P2 / P3 |
| Validated in CI? | Yes / No |
| Owner | [role — e.g., Tech Lead (Backend), DevOps, Security] |
| Derives from | [ADR / architecture decision / legal requirement / business constraint] |
| Related NFR | [NFR-0XX if applicable — remove if none] |