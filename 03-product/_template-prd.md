# PRD — [Product / feature name]

| Field | Value |
|-------|-------|
| Status | Draft |
| Owner | [name] |
| Updated | 2026-09-22 |

## Problem

[Who hurts, how often, what it costs today]

## Goals / non-goals

- Goals: …
- Non-goals: …

## Users & jobs (only 4 principal roles)

| Persona | Client | Job |
|---------|--------|-----|
| Admin | Web | Manage accounts, routes, buses, assignments |
| Parent / guardian | Mobile | Track bus, receive boarding/alerts, view child's route |
| Student | Mobile | Show personal QR for boarding/alighting |
| Driver | Mobile | Follow route, start/finish trip, scan QR, report incident |

## Requirements

### Functional

- FR-1: … (source HU-* in `04-requirements/`)

### Non-functional

- Summarize / link `04-requirements/non-functional.md`

## Success metrics

| Metric | Target |
|--------|--------|
| Live location load (edge Kong :8000) | < 2s |
| Boarding → guardian notify | < 30s (HU-NOTIF-001) |

## Risks & dependencies

- `15-project-control/risks.md`, `dependencies.md`

## Open questions

- [ ] …

---

### Worked example (MVP transport)

**Problem:** Families cannot see bus location; trips lack trustworthy boarding events.  
**Goal:** QR boarding + live map + notifications through Kong :8000 in MVP.  
**Non-goal:** Routing optimization AI in v1.  
**HUs:** HU-QR-001/002/004, HU-NOTIF-001, HU-GPS-002, HU-ROUTE-001…
