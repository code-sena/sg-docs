# Data Model — Exceptional

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Exceptional`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: ExceptionalDriverUsage

**Purpose:** Records when a driver operates a bus outside their normal assignment

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| BusID | UUID | No | Reference to bus | FK → Bus.ID (Bus) |
| ProfileID | UUID | No | Reference to driver profile | FK → Profile.ID (IAM) |
| DateTime | DATETIME | No | When the exceptional usage occurred | |
| Reason | VARCHAR(200) | No | Justification | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `BusID` → FK to `Bus.ID` in Bus service
- `ProfileID` → FK to `Profile.ID` in IAM service

### Table: ExceptionalRouteUsage

**Purpose:** Records when a student uses a route outside their normal assignments

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| ProfileID | UUID | No | Reference to student profile | FK → Profile.ID (IAM) |
| RouteID | UUID | No | Reference to route | FK → Route.ID (Route) |
| StartDateTime | DATETIME | No | Usage start | |
| EndDateTime | DATETIME | No | Usage end | |
| Reason | VARCHAR(200) | No | Justification | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `ProfileID` → FK to `Profile.ID` in IAM service
- `RouteID` → FK to `Route.ID` in Route service

---

## Modeling decisions

- **Separate tables by usage type:** ExceptionalDriverUsage and ExceptionalRouteUsage are kept separate to model distinct scenarios (bus assignment vs route assignment) with their own references.
