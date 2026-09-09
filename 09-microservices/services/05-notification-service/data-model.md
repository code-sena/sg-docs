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
| BusID | UNIQUEIDENTIFIER | No | Reference to bus | FK → Bus.ID (Bus) |
| StopID | UNIQUEIDENTIFIER | No | Reference to stop | FK → Stop.ID (Route) |
| DateTime | TIMESTAMP | Yes | Event date/time (auto-generated) | |
| Status | STATUS | No | Record status | Default: ACTIVE |
| BoardingType | BOARDINGTYPE | No | ON_BOARD or OFF_BOARD | Default: ON_BOARD |

**Relationships:**
- `RouteExecutionID` → FK to `RouteExecution.ID` in Route service
- `ProfileID` → FK to `Profile.ID` in IAM service
- `BusID` → FK to `Bus.ID` in Bus service
- `StopID` → FK to `Stop.ID` in Route service

**Enum values for BoardingType:** ON_BOARD, OFF_BOARD

### Table: AlertType

**Purpose:** Catalog of alert types with urgency level

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK |
| Name | VARCHAR(30) | Yes | Alert type name | |
| Description | VARCHAR(100) | Yes | Description | |
| UrgencyLevel | TINYINT | Yes | Numeric urgency level | |
| Status | STATUS | No | Record status | Default: ACTIVE |

### Table: Alert

**Purpose:** Stores alerts raised during route executions

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| RouteExecutionID | UNIQUEIDENTIFIER | No | Reference to route execution | FK → RouteExecution.ID (Route) |
| AlertTypeID | TINYINT | No | Reference to alert type | FK → AlertType.ID |
| ProfileId | UNIQUEIDENTIFIER | No | Reference to reporting profile | FK → Profile.ID (IAM) |
| DateTime | DATETIME | Yes | Alert timestamp | |
| Description | VARCHAR(100) | Yes | Alert description | |
| Status | STATUS | No | Record status | Default: ACTIVE |

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
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `AlertID` → FK to `Alert.ID`
- `ProfileID` → FK to `Profile.ID` in IAM service

---

## Modeling decisions

- **Single table for both directions:** BoardingType distinguishes ON_BOARD vs OFF_BOARD in one table, keeping the event log simple.
- **UrgencyLevel numeric:** AlertType carries a numeric urgency level for sorting/prioritization.
- **Read tracking:** AlertRecipient records DateTimeRead, enabling delivery confirmation per recipient.
