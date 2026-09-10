# Data Models per Service

## Service: Bus

**DB Engine:** SQL Server 16.

**Engine justification:**
- SQL Server enforces relational consistency for fleet and catalog records.
- Logical schema isolation supports the shared database decision without cross-service joins.

### Table: Bus

**Purpose:** Stores fleet vehicle information.

```sql
CREATE TABLE Bus (
	Id UNIQUEIDENTIFIER PRIMARY KEY,
    CampuseId UNIQUEIDENTIFIER NOT NULL,
	SoatValidity DATE NOT NULL, 
    GpsDeviceId UNIQUEIDENTIFIER UNIQUE NOT NULL,
	Capacity TINYINT NOT NULL, 
    Plate VARCHAR(15) UNIQUE NOT NULL,
    ModelId TINYINT NOT NULL,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Inactive')) DEFAULT 'Active'
);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Id | UNIQUEIDENTIFIER | Bus identifier | `550e8400-...` |
| CampuseId | UNIQUEIDENTIFIER | School campus reference | `550e8400-...` |
| SoatValidity | DATE | Insurance validity date | `2027-01-31` |
| GpsDeviceId | UNIQUEIDENTIFIER | GPS device reference | `550e8400-...` |
| GpsStatus | BOOLEAN | Whether GPS is enabled | `true` |
| Capacity | TINYINT | Passenger capacity | `40` |
| Plate | VARCHAR(15) | License plate | `ABC123` |
| ModelId | TINYINT | Vehicle model reference | `4` |
| Status | VARCHAR(20) | Lifecycle status | `Active` |

**Modeling decisions:**
1. External IDs are references resolved through APIs or events, never cross-schema joins.
2. `Status` supports controlled fleet deactivation without deleting history.

### Table: Brand

**Purpose:** Catalogs vehicle brands.

```sql
CREATE TABLE Brand (
    Id TINYINT PRIMARY KEY, 
    Name VARCHAR(30), 
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Inactive')) DEFAULT 'Active'
);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Id | TINYINT | Brand identifier | `1` |
| Name | VARCHAR(30) | Brand name | `Volvo` |
| Status | VARCHAR(20) | Lifecycle status | `Active` |

**Modeling decisions:**
1. `TINYINT` suits the low-cardinality catalog.
2. Nullable `Name` preserves the source model while status controls availability.

### Table: Model

**Purpose:** Catalogs vehicle models linked to a brand.

```sql
CREATE TABLE Model (
    Id TINYINT PRIMARY KEY, 
    BrandId TINYINT NOT NULL, 
    Name VARCHAR(30), 
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Inactive')) DEFAULT 'Active'
);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Id | TINYINT | Model identifier | `4` |
| BrandId | TINYINT | Brand reference | `1` |
| Name | VARCHAR(30) | Model name | `B340M` |
| Status | VARCHAR(20) | Lifecycle status | `Active` |

**Modeling decisions:**
1. Brand ownership is represented by `BrandID`.
2. Integer catalog keys minimize storage and simplify lookup.

### Table: DriverAssignemts

**Purpose:** Assigns a driver profile to a bus, defining a validity range for the assignment.

```sql
CREATE TABLE DriverAssignemts (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ProfileId UNIQUEIDENTIFIER NOT NULL,
    BusId UNIQUEIDENTIFIER NOT NULL,
    AssignedFrom DATE NOT NULL,
    AssignedTo DATE NULL
);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Id | UNIQUEIDENTIFIER | Assignment identifier | `550e8400-...` |
| ProfileId | UNIQUEIDENTIFIER | Driver profile correlation (IAM) | `550e8400-...` |
| BusId | UNIQUEIDENTIFIER | Bus reference | `550e8400-...` |
| AssignedFrom | DATE | Assignment start date | `2026-01-15` |
| AssignedTo | DATE | Assignment end date (NULL = currently assigned) | `NULL` |

**Modeling decisions:**
1. A driver is responsible for a single bus at a time; the assignment remains open until reassigned or unassigned.
2. The driver reaches a route transitively through the bus assigned to the route (see `route.md`); no driver→route table exists.

### Indexes

| Name | Fields | Type | Justification |
|------|--------|------|---------------|
| IX_DriverAssignemts_ProfileId | ProfileId | Nonclustered | Driver-to-bus lookup |
| IX_Bus_SchoolId | SchoolId | Nonclustered | School fleet lookup |
| IX_Bus_GpsDeviceId | GpsDeviceId | Nonclustered | GPS device lookup |
| IX_Bus_Plate | Plate | Nonclustered | License plate lookup |
| IX_Model_BrandId | BrandId | Nonclustered | Brand model lookup |

## Migration strategy

**Tool:** Versioned SQL Server migrations.

**File naming convention:** `V{Version}__{Description}.sql`

**Migration rules:**
1. Apply one forward-only logical change per migration.
2. Add nullable fields before making them required in a later release.
3. Retain historical buses and catalog records through `Status`.

```
Migrations are forward-only and immutable after execution.
Fleet history is retained through status changes instead of destructive deletion.
References to drivers, schools, and devices remain service correlations.
```

**Compatible schema changes (non-breaking):**

```sql
ALTER TABLE Bus ADD VehicleColor VARCHAR(30) NULL;
CREATE INDEX IX_Bus_Plate ON Bus (Plate);
CREATE INDEX IX_DriverAssignemts_ProfileId ON DriverAssignemts (ProfileId);
CREATE INDEX IX_Bus_SchoolId ON Bus (SchoolId);
CREATE INDEX IX_Bus_GpsDeviceId ON Bus (GpsDeviceId);
CREATE INDEX IX_Model_BrandId ON Model (BrandId);
```

**Incompatible changes (require 2-phase migration):**

```sql
ALTER TABLE Bus ADD RegistrationPlate VARCHAR(15) NULL;
UPDATE Bus SET RegistrationPlate = Plate;
ALTER TABLE Bus DROP COLUMN Plate;
```

## DB engine selection guide

| Engine | Use when... | Avoid when... |
|--------|------------|---------------|
| **SQL Server** | ACID fleet records, catalog integrity, and relational lookups | Ephemeral counters or cache-only state |
| **PostgreSQL** | ACID transactions, complex relationships, JSONB, full-text search | Deeply nested documents |
| **MongoDB** | Flexible documents and catalog-style data | Complex transactions across collections |
| **Redis** | Cache, sessions, TTL state, and counters | Authoritative fleet records |
| **Elasticsearch** | Full-text search, analytics, and logs | Source of truth for vehicles |

## Relationship diagram (per service)

```mermaid
erDiagram
		Brand ||--o{ Model : catalogs
		Model ||--o{ Bus : identifies
		Bus
```

## Correlations

- Authoritative source: `09-microservices/services/06-bus-service/data-model.md`
- Driver and school references: `06-data/domain/iam.md`, `06-data/domain/school.md`
- GPS reference: `06-data/domain/gps.md`
