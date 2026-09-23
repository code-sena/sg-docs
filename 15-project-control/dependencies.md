# Dependencies

Last updated: 2026-09-22

| ID | Dependency | Type | Owner | Status | Risk if late |
|----|------------|------|-------|--------|--------------|
| D-01 | SQL Server instance + credentials | Infra | platform | Assumed available | Block all schemas |
| D-02 | Kafka cluster | Infra | platform | Assumed | Async features |
| D-03 | Domain: route/exception taxonomy sign-off | People | product | Open | Wrong enums |
| D-04 | Push/SMS provider contracts | Vendor | product/fin | Open | Notification-service |
| D-05 | School data load (schools, lines) | Data | customer | Open | Demo/launch |
| D-06 | GPS device/vendor feed format | Vendor | ops | Open | gps-service ingest |

## External vendor checklist

- [ ] Contract + sandbox credentials
- [ ] Rate limits documented
- [ ] Failure mode in runbooks
