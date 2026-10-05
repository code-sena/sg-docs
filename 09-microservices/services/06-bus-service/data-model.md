# Data Model — Bus

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Bus`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: Bus

**Purpose:** Stores fleet vehicle information

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| SchoolID | UNIQUEIDENTIFIER | No | Reference to school | FK → School.ID (School) |
| SoatValidity | DATE | No | SOAT insurance validity | |
| GpsDeviceID | UNIQUEIDENTIFIER | No | Reference to GPS device | FK → GpsDevice.ID (GPS), UNIQUE |
| Capacity | TINYINT | No | Passenger capacity | |
| Plate | VARCHAR(15) | No | License plate | |
| ModelId | TINYINT | No | Reference to model | FK → Model.ID |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

**Relationships:**
- `SchoolID` → FK to `School.ID` in School service
- `GpsDeviceID` → FK to `GpsDevice.ID` in GPS service
- `ModelId` → FK to `Model.ID`

### Table: DriverAssignemts

**Purpose:** Assigns a driver profile to a bus, defining a validity range for the assignment

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| ProfileID | UNIQUEIDENTIFIER | No | Driver profile reference | FK → Profile.ID (IAM) |
| BusID | UNIQUEIDENTIFIER | No | Bus reference | FK → Bus.ID |
| AssignedFrom | DATE | No | Assignment start date | |
| AssignedTo | DATE | Yes | Assignment end date (NULL = currently assigned) | |

**Relationships:**
- `ProfileID` → FK to `Profile.ID` in IAM service
- `BusID` → FK to `Bus.ID`

### Table: Brand

**Purpose:** Vehicle brands catalog

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK |
| Name | VARCHAR(30) | Yes | Brand name | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

### Table: Model

**Purpose:** Vehicle models catalog, linked to brand

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK |
| BrandID | TINYINT | No | Reference to brand | FK → Brand.ID |
| Name | VARCHAR(30) | Yes | Model name | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

**Relationships:**
- `BrandID` → FK to `Brand.ID`

---

## Modeling decisions

- **Catalog tables (Brand/Model):** Model references Brand to build the fleet catalog with low-cardinality integer keys.
- **External references:** Bus references School and GpsDevice from other services via foreign keys. The bus does not carry the driver: the driver relationship lives in `DriverAssignemts`.
- **Driver assignment (FR-3.6 / HU-BUS-002):** a driver is responsible for one bus at a time via `DriverAssignemts` (`AssignedTo` NULL = currently assigned) and reaches a route transitively through the bus assigned to the route (`RouteBusAssignments`, route-service). No driver→route table exists.
