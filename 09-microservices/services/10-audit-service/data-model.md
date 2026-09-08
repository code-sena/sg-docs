# Data Model — Audit

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Audit`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: Audit

**Purpose:** Trails actions performed by profiles

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | INT | No | Unique identifier | PK, AUTO_INCREMENT |
| ProfileID | UUID | No | Reference to acting profile | FK → Profile.ID (IAM) |
| Action | VARCHAR(255) | No | Action performed | |
| Date | DATETIME2 | No | When the action occurred | |
| Description | VARCHAR(500) | No | Action detail | |
| IPAddress | VARCHAR(50) | No | Client IP address | |
| Application | VARCHAR(255) | Yes | Source application | |

**Relationships:**
- `ProfileID` → FK to `Profile.ID` in IAM service

### Table: LogErrors

**Purpose:** Stores system error records

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | INT | No | Unique identifier | PK, AUTO_INCREMENT |
| TypeError | VARCHAR(100) | No | Error type | |
| Description | VARCHAR(255) | No | Error description | |
| IPAddress | VARCHAR(50) | No | Related IP address | |

---

## Modeling decisions

- **Application label:** Audit records which application generated the action (Application field), useful when multiple clients interact with the same profile.
- **Soft-append only:** both tables are intended as append-only logs.
