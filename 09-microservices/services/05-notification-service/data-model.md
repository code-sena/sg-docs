# Data Model — Notification

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: Boarding

**Purpose:** Records boarding and alighting events during route execution

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| RouteExecutionID | UNIQUEIDENTIFIER | No | Reference to route execution | FK → RouteExecution.ID (Route) |
| ProfileID | UNIQUEIDENTIFIER | No | Reference to student profile | FK → Profile.ID (IAM) |
| RouteStopID | UNIQUEIDENTIFIER | No | Reference to route stop | FK → RouteStop.ID (Route) |
| DateTime | DATETIME2 | No | Event date/time | NOT NULL, Default GETDATE() |
| BoardingType | VARCHAR(20) | No | ON_BOARD or OFF_BOARD | CHECK (BoardingType IN ('ON_BOARD', 'OFF_BOARD')), Default 'ON_BOARD' |

**Relationships:**
- `RouteExecutionID` → FK to `RouteExecution.ID` in Route service
- `ProfileID` → FK to `Profile.ID` in IAM service
- `RouteStopID` → FK to `RouteStop.ID` in Route service

**Enum values for BoardingType:** ON_BOARD, OFF_BOARD

### Table: AlertType

**Purpose:** Catalog of alert types with urgency level

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK |
| Name | VARCHAR(30) | Yes | Alert type name | |
| Description | VARCHAR(100) | Yes | Description | |
| UrgencyLevel | TINYINT | Yes | Numeric urgency level | |

### Table: Alert

**Purpose:** Stores alerts raised during route executions

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| RouteExecutionID | UNIQUEIDENTIFIER | No | Reference to route execution | FK → RouteExecution.ID (Route) |
| AlertTypeID | TINYINT | No | Reference to alert type | FK → AlertType.ID |
| ProfileId | UNIQUEIDENTIFIER | No | Reference to reporting profile | FK → Profile.ID (IAM) |
| DateTime | DATETIME | Yes | Alert timestamp | |
| Description | VARCHAR(500) | Yes | Alert description (free text for an incident report) | |

**Relationships:**
- `RouteExecutionID` → FK to `RouteExecution.ID` in Route service
- `AlertTypeID` → FK to `AlertType.ID`
- `ProfileId` → FK to `Profile.ID` in IAM service

### Table: AlertRecipient

**Purpose:** Tracks which profiles should receive an alert and their read status

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| AlertID | UNIQUEIDENTIFIER | No | Reference to alert | FK → Alert.ID |
| ProfileID | UNIQUEIDENTIFIER | No | Reference to recipient profile | FK → Profile.ID (IAM) |
| DateTimeRead | DATETIME | No | When the alert was read | |

**Relationships:**
- `AlertID` → FK to `Alert.ID`
- `ProfileID` → FK to `Profile.ID` in IAM service

---

## Modeling decisions

- **Single table for both directions:** BoardingType distinguishes ON_BOARD vs OFF_BOARD in one table, keeping the event log simple.
- **UrgencyLevel numeric:** AlertType carries a numeric urgency level for sorting/prioritization.
- **Read tracking:** AlertRecipient records DateTimeRead, enabling delivery confirmation per recipient.
- **Incidents reuse `Alert`:** a driver's incident report (FR-8.1) is an `Alert` whose `ProfileId` is the reporting driver and whose `AlertRecipient` rows are the school admins plus the guardians of the students on board (FR-8.2) — there is no separate incident table. `Description` was widened to `VARCHAR(500)` to hold the free-text report, and the `AlertType` catalog gained the four reportable incident types (Accident, Medical Emergency, Mechanical Breakdown, Security Incident).
