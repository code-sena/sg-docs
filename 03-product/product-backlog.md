# Product backlog

> **Aligned 1:1 with** [`04-requirements/user-stories.md`](../04-requirements/user-stories.md) (Cut 1 = **19 HUs**).
> This file is the product view (value, role, priority). Formal AC / services / endpoints live only in `04-requirements/`.
> Last updated: 2026-09-22

## Principal roles (only these 4)

| Role | Client | Typical duties |
|------|--------|----------------|
| **Admin** | Web | Accounts, routes, buses, student↔route, config |
| **Parent / guardian** (`father/parent/guardian`) | Mobile | Live map, route details, boarding/alighting alerts |
| **Student** | Mobile | Personal QR for boarding/alighting |
| **Driver** | Mobile | My route, start/end trip, scan QR, report incident |

Canonical labels in HUs: `administrator` · `parent`/`guardian` · `student` · `driver`.

## How to use

1. Backlog row **ID = HU ID** (no parallel `B-xxx` series).
2. Refine in `04-requirements/` (DoR); do not fork a second story text here.
3. Trace after implementation: `04-requirements/traceability-matrix.md`.

## Status legend

`Backlog` · `Refined` · `Ready` · `Scheduled` · `In progress` · `Done`

---

## By epic (same as 04-requirements)

### EP-001 — QR Boarding / Alighting

| HU | Title (short) | Role | Platform | Priority | Status |
|----|---------------|------|----------|----------|--------|
| HU-QR-001 | Scan student QR — boarding | Driver | Mobile | High | Backlog |
| HU-QR-002 | Scan student QR — alighting | Driver | Mobile | High | Backlog |
| HU-QR-004 | View personal QR | Student | Mobile | Medium | Backlog |

### EP-002 — Notifications

| HU | Title (short) | Role | Platform | Priority | Status |
|----|---------------|------|----------|----------|--------|
| HU-NOTIF-001 | Pickup / drop-off notifications | Parent / guardian | Mobile | High | Backlog |
| HU-NOTIF-005 | Alert on prolonged stop | Parent / guardian | Mobile | Medium | Backlog |

### EP-003 — Route & Fleet Management

| HU | Title (short) | Role | Platform | Priority | Status |
|----|---------------|------|----------|----------|--------|
| HU-ROUTE-001 | Create / manage routes (stops, schedules) | Admin | Web | High | Backlog |
| HU-ROUTE-002 | View my assigned route | Driver | Mobile | High | Backlog |
| HU-ROUTE-003 | Start / finish trip | Driver | Mobile | Medium | Backlog |
| HU-ROUTE-004 | View child's route details | Parent / guardian | Mobile | Medium | Backlog |
| HU-ROUTE-008 | Assign students to route + stops | Admin | Web | High | Backlog |
| HU-FLEET-001 | Manage bus fleet (CRUD, activate/deactivate) | Admin | Web | Medium | Backlog |
| HU-ROUTE-005 | Assign bus to route | Admin | Web | Medium | Backlog |
| HU-BUS-002 | Assign driver to bus | Admin | Web | High | Backlog |

### EP-004 — User Management / Family

| HU | Title (short) | Role | Platform | Priority | Status |
|----|---------------|------|----------|----------|--------|
| HU-IAM-001 | Sign-in, roles (RBAC) | All 4 roles | Web + Mobile | High | Backlog |
| HU-USER-003 | Link students to guardian | Admin | Web | High | Backlog |
| HU-USER-004 | Manage school accounts | Admin | Web | High | Backlog |

### EP-005 — Live Tracking

| HU | Title (short) | Role | Platform | Priority | Status |
|----|---------------|------|----------|----------|--------|
| HU-GPS-002 | Real-time bus map | Parent / guardian | Mobile | Medium | Backlog |

### EP-006 — Incidents

| HU | Title (short) | Role | Platform | Priority | Status |
|----|---------------|------|----------|----------|--------|
| HU-INCIDENT-001 | Report incident / emergency | Driver | Mobile | Medium | Backlog |

### EP-007 — UI & Personalization

| HU | Title (short) | Role | Platform | Priority | Status |
|----|---------------|------|----------|----------|--------|
| HU-UI-001 | Customize theme colors | All 4 roles | Web + Mobile | Low | Backlog |
| HU-UI-002 | Choose interface language (≥4) | All 4 roles | Web + Mobile | Low | Backlog |

**Count check:** 3+2+8+3+1+1+2 = **20** HUs — matches Cut 1 in `user-stories.md`.

---

## Priority snapshot (from HU tables)

| Band | HUs |
|------|-----|
| High | HU-IAM-001, HU-ROUTE-001, HU-NOTIF-001, HU-USER-003, HU-USER-004, HU-QR-001, HU-QR-002, HU-ROUTE-002, HU-ROUTE-008, HU-BUS-002 |
| Medium | HU-GPS-002, HU-NOTIF-005, HU-ROUTE-003, HU-INCIDENT-001, HU-ROUTE-004, HU-QR-004, HU-FLEET-001, HU-ROUTE-005 |
| Low | HU-UI-001, HU-UI-002 |

---

## Out of scope (current product)

- Payments / billing
- Multi-tenant public SaaS packaging
- In-bus entertainment
- Roles beyond the four above (no separate “coordinator”, “compliance officer”, “director”, or “ops” as app roles)

## Open questions

- [ ] GPS retention days → `15-project-control/open-questions.md` Q-01
- [ ] Notification channels per school (in-app primary per HU-NOTIF-001)
- [ ] ADR-003 monolithic clients — accept or reject (Q-02)

## Related

- Canonical HUs: [`../04-requirements/user-stories.md`](../04-requirements/user-stories.md)
- FR mapping: [`../04-requirements/functional.md`](../04-requirements/functional.md)
- [vision.md](./vision.md) · [roadmap.md](./roadmap.md) · [problem-framing.md](./problem-framing.md)
