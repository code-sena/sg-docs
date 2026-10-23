# Data Model — School

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schemas:** `School`, `Geographic`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: School

**Purpose:** Stores school registry information

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| CityID | UNIQUEIDENTIFIER | No | Reference to city | FK → City.ID |
| Logo | BYTE | Yes | School logo image | |
| Name | VARCHAR(30) | Yes | School name | |
| Address | VARCHAR(30) | Yes | School address | |
| Phone | INT | Yes | Contact phone | |
| Email | VARCHAR(50) | Yes | Contact email | |
| Website | VARCHAR(100) | Yes | Website URL | |
| Theme | VARCHAR(20) | Yes | Visual theme config | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

**Relationships:**
- `CityID` → FK to `City.ID`

### Table: SchoolCampus

**Purpose:** Represents physical campuses belonging to a school

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| SchoolID | UNIQUEIDENTIFIER | No | Reference to school | FK → School.ID |
| Name | VARCHAR(30) | Yes | Campus name | |
| Address | VARCHAR(30) | Yes | Campus address | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

**Relationships:**
- `SchoolID` → FK to `School.ID`

### Table: SchoolAdmin

**Purpose:** Links an administrator profile to the single school it manages

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| SchoolID | UNIQUEIDENTIFIER | No | Reference to school | FK → School.ID |
| ProfileID | UNIQUEIDENTIFIER | No | Reference to admin profile | FK → Profile.ID (IAM), UNIQUE (one school per admin) |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

**Relationships:**
- `SchoolID` → FK to `School.ID`
- `ProfileID` → FK to `Profile.ID` in IAM service

---

## Geographic Schema

### Table: City

**Purpose:** Geographic reference of cities

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| Name | VARCHAR(40) | Yes | City name | |
| Country | VARCHAR(30) | Yes | Country name | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

---

## Modeling decisions

- **City as shared reference:** City is used by School, Stop (Route), and GpsLocation. It lives in the Geographic schema owned by this service.
- **SchoolAdmin link:** one admin profile manages exactly one school; enforced by UNIQUE on `SchoolAdmin.ProfileID`.
