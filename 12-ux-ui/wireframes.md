# Wireframes

Last updated: 2026-09-22 · Pairs with [navigation-map.md](./navigation-map.md), [design-system.md](./design-system.md)

> Place low-fidelity frames here (Figma export links or Mermaid). Prefer links over binary blobs in git.

## Priority screens

| Screen | Persona | Priority | Status |
|--------|---------|----------|--------|
| Login / session | All | P0 | Todo |
| Parent: live bus map | Parent | P0 | Todo |
| Driver: trip check-in (offline-capable) | Driver | P0 | Todo |
| Coordinator: exception inbox | Coordinator | P0 | Todo |
| Admin: routes / schools CRUD | Admin | P1 | Todo |
| Admin: notification templates | Admin | P1 | Todo |

## Frame slots

### Parent — live map

```
[ Map canvas :8000 APIs ]
[ Bus ETA card ]
[ Alert banner (exception events) ]
```

### Driver — check-in

```
[ Current route / next stop ]
[ Offline badge + pending sync count ]
[ Big primary action ]
```

### Coordinator — exceptions

```
[ Filter: severity / school / route ]
[ List rows with time + owner ]
[ Acknowledge / escalate ]
```

## Accessibility

- Contrast per design-system tokens
- Touch targets ≥ 44px on mobile
- Live map must have non-map text summary (location not color-only)

## Open

- [ ] Which parent features are web vs app first
