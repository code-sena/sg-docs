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
| ID | UUID | No | Unique identifier | PK |
| DriverID | UUID | No | Reference to driver profile | FK → Profile.ID (IAM) |
| SchoolID | UUID | No | Reference to school | FK → School.ID (School) |
| SoatValidity | DATE | No | SOAT insurance validity | |
| GpsDeviceID | UUID | No | Reference to GPS device | FK → GpsDevice.ID (GPS) |
| GpsStatus | BOOLEAN | No | GPS enabled status | |
| Capacity | TINYINT | No | Passenger capacity | |
| Plate | VARCHAR(15) | No | License plate | |
| ModelId | TINYINT | No | Reference to model | FK → Model.ID |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `DriverID` → FK to `Profile.ID` in IAM service
- `SchoolID` → FK to `School.ID` in School service
- `GpsDeviceID` → FK to `GpsDevice.ID` in GPS service
- `ModelId` → FK to `Model.ID`

### Table: Brand

**Purpose:** Vehicle brands catalog

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK |
| Name | VARCHAR(30) | Yes | Brand name | |
| Status | STATUS | No | Record status | Default: ACTIVE |

### Table: Model

**Purpose:** Vehicle models catalog, linked to brand

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK |
| BrandID | TINYINT | No | Reference to brand | FK → Brand.ID |
| Name | VARCHAR(30) | Yes | Model name | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `BrandID` → FK to `Brand.ID`

---

## Modeling decisions

- **Catalog tables (Brand/Model):** Model references Brand to build the fleet catalog with low-cardinality integer keys.
- **External references:** Bus references Profile (driver), School, and GpsDevice from other services via foreign keys.
