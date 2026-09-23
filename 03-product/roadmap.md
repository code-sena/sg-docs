# Roadmap

> Outcome-oriented slices. Feature bullets cite **HU IDs** from `04-requirements/user-stories.md`.
> Last updated: 2026-09-22

## Now (MVP) — cut aligned to Sprint 1–4 HUs

- **Auth + accounts:** HU-IAM-001, HU-USER-004, HU-USER-003 (Admin web)
- **Routes / fleet foundation:** HU-ROUTE-001, HU-BUS-001, HU-BUS-002, HU-ROUTE-008 (Admin)
- **Driver mobile:** HU-ROUTE-002, HU-ROUTE-003, HU-QR-001, HU-QR-002
- **Student mobile:** HU-QR-004
- **Guardian mobile:** HU-ROUTE-004, HU-NOTIF-001, HU-GPS-002
- **Edge:** Kong **:8000** → services **:8080**

## Next

- HU-NOTIF-005 prolonged-stop alert
- HU-INCIDENT-001 driver incident report
- HU-UI-001 / HU-UI-002 theme + language
- Training pack (`14-training/`)

## Later

- Analytics / read models (`06-data/normalization-assessment.md`)
- Multi-region evaluation (ADR-002 strangler path)

## Milestone checklist

| Milestone | Exit criteria |
|-----------|----------------|
| M1 Edge | Kong routes + health smoke via :8000 |
| M2 Accounts + routes | HU-IAM-001, HU-USER-*, HU-ROUTE-001, HU-BUS-* refined/ready |
| M3 Trip ops | QR boarding/alighting + trip start/end on mobile |
| M4 Guardian visibility | GPS map + pickup/drop-off notifications |
| M5 Launch pack | Runbooks, backup, onboarding docs |

Related: [vision.md](./vision.md) · [product-backlog.md](./product-backlog.md) · `15-project-control/risks.md`
