# Data Model — Route

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Route`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: Route

**Purpose:** Defines a bus route for a school

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| SchoolID | UUID | No | Reference to school | FK → School.ID (School) |
| Name | VARCHAR(30) | Yes | Route name | |
| TargetSector | VARCHAR(30) | Yes | Target neighborhood/sector | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `SchoolID` → FK to `School.ID` in School service

### Table: Stop

**Purpose:** Represents a pickup/drop-off stop location

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| CityID | UUID | No | Reference to city | FK → City.ID (School) |
| SchoolID | UUID | No | Reference to school | FK → School.ID (School) |
| Address | VARCHAR(30) | Yes | Address | |
| Longitude | DECIMAL(12,2) | Yes | Longitude coordinate | |
| Latitude | DECIMAL(12,2) | Yes | Latitude coordinate | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `CityID` → FK to `City.ID` in School service
- `SchoolID` → FK to `School.ID` in School service

### Table: RouteStop

**Purpose:** Orders the stops within a route

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| RouteID | UUID | No | Reference to route | FK → Route.ID |
| StopID | UUID | No | Reference to stop | FK → Stop.ID |
| Order | INT | No | Stop sequence order | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `RouteID` → FK to `Route.ID`
- `StopID` → FK to `Stop.ID`

### Table: RouteBusAssignments

**Purpose:** Assigns buses to routes

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| BusID | UUID | No | Reference to bus | FK → Bus.ID (Bus) |
| RouteID | UUID | No | Reference to route | FK → Route.ID |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `BusID` → FK to `Bus.ID` in Bus service
- `RouteID` → FK to `Route.ID`

### Table: RouteStudentAssignments

**Purpose:** Assigns students (profiles) to route stops

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| ProfileID | UUID | No | Reference to student profile | FK → Profile.ID (IAM) |
| RouteStopID | UUID | No | Reference to route stop | FK → RouteStop.ID |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `ProfileID` → FK to `Profile.ID` in IAM service
- `RouteStopID` → FK to `RouteStop.ID`

### Table: RouteSchedule

**Purpose:** Defines weekly schedules for a route-bus assignment

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| RouteBusAssignmentsId | UUID | No | Reference to route-bus assignment | FK → RouteBusAssignments.ID |
| DayOfWeek | DAYOFWEEK | No | Day of the week | Default: MONDAY |
| Direction | VARCHAR(10) | No | Trip direction (e.g., outbound/inbound) | |
| StartTime | TIME | No | Scheduled start time | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `RouteBusAssignmentsId` → FK to `RouteBusAssignments.ID`

**Enum values for DayOfWeek:** MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

### Table: RouteExecution

**Purpose:** Records each actual route trip execution

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| RouteScheduleId | UUID | No | Reference to route schedule | FK → RouteSchedule.ID |
| DayOfWeek | DAYOFWEEK | No | Day of the week | Default: MONDAY |
| StartDateTime | DATETIME | No | Start of execution | |
| EndDateTime | DATETIME | No | End of execution | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `RouteScheduleId` → FK to `RouteSchedule.ID`

**Enum values for DayOfWeek:** MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

---

## Modeling decisions

- **Schedule vs Execution:** RouteSchedule is the plan (weekly, per day-of-week); RouteExecution records each actual occurrence, supporting historical tracking.
- **Assignment hierarchy:** Route → RouteStop → RouteStudentAssignments places each student at a specific ordered stop; RouteBusAssignments links a bus to the route for scheduling.
- **RouteExecution as boarding anchor:** Boarding and Alert services reference RouteExecution to correlate events to a specific trip.
