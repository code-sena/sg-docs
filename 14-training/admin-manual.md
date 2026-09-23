# Admin manual (draft outline)

Last updated: 2026-09-22 · Audiences: school admins, platform ops

## 1. Administration console access
- Roles from `iam-service` (RBAC)
- All changes appear in `Audit` schema

## 2. Schools, users, routes, buses
- Create/update masters; soft-delete policy

## 3. Configuration / feature flags
- `configuration-service` scopes: global / school / user
- Secrets never returned to browsers

## 4. Notifications
- Templates, channels, retry visibility

## 5. Operations (technical)
- Health: Kong **:8000**, services **:8080**
- See `10-devops/local-setup.md`, service runbooks, `13-operations/`

## Related

- Security policy: `00-governance/security-policy.md`
- DoD / release gates: `00-governance/definition-of-done.md`
