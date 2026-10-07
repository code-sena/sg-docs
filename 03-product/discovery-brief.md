# Discovery brief

Last updated: 2026-09-22 · Pairs with [problem-framing.md](./problem-framing.md) and [vision.md](./vision.md)

## Problem

Schools and families need trustworthy **when/where** for school buses and clear alerts when something goes wrong (delay, incident, loss of signal).

## Users (4 principal roles only)

| Segment | Client | Job to be done |
|---------|--------|----------------|
| **Admin** | Web | Configure ecosystem: accounts, routes, buses, student assignments |
| **Parent / guardian** | Mobile | Know if the bus is coming; trust pickup/drop-off events |
| **Student** | Mobile | Present QR when boarding / alighting |
| **Driver** | Mobile | Run the route with minimal friction; offline-tolerant scans; report incidents |

## Hypotheses

1. Live GPS + clear map (HU-GPS-002) reduces “where is the bus” friction.
2. QR boarding + push (HU-QR-001/002 + HU-NOTIF-001) beats phone trees for certainty.
3. Offline-tolerant driver scan prevents coverage gaps.

## Evidence to collect

- Current channels (WhatsApp, phone, paper)
- Route density and GPS/QR coverage per school
- Compliance needs for audit retention

## Non-goals (discovery)

- Extra roles beyond Admin / Parent-guardian / Student / Driver
- Building a general-purpose fleet SaaS before product-market fit

## Next artifacts

- Backlog index → [product-backlog.md](./product-backlog.md) (= HUs in `04-requirements/`)
- Slice roadmap → [roadmap.md](./roadmap.md)
