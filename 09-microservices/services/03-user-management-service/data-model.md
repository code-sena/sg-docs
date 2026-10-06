# Data Model — User Management

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `UserManagement`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: Person

**Purpose:** Stores personal information for all individuals in the system

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| Name | VARCHAR(50) | No | First name | |
| LastName | VARCHAR(50) | No | Last name | |
| IdentificationType | IDENTIFICATIONTYPE | No | ID document type | Default: TI |
| IdentificationNumber | VARCHAR(50) | No | Document number | |
| Email | VARCHAR(50) | No | Email address | |
| Phone | INT | No | Phone number | |
| ResidenceAddress | VARCHAR(50) | No | Home address | |
| DateBirth | DATE | No | Date of birth | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

### Table: Family

**Purpose:** Groups related individuals (e.g., a student and their parents)

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| Name | VARCHAR(50) | Yes | Family name/label | |
| Observations | VARCHAR(100) | Yes | Additional notes | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

### Table: FamilyMember

**Purpose:** Links individuals to families with relationship type

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| FamilyID | UNIQUEIDENTIFIER | No | Reference to family | FK → Family.ID |
| ProfileID | UNIQUEIDENTIFIER | No | Reference to profile | FK → Profile.ID (IAM) |
| RelationshipType | RELATIONSHIPTYPE | No | Relationship type | Default: PARENT |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

**Relationships:**
- `FamilyID` → FK to `Family.ID`
- `ProfileID` → FK to `Profile.ID` in IAM service

**Enum values for RelationshipType:** PARENT, STUDENT

### Table: DriverLicense

**Purpose:** Stores driver license information for bus drivers

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| ProfileID | UNIQUEIDENTIFIER | No | Reference to profile | FK → Profile.ID (IAM) |
| LicenseNumber | SMALLINT | Yes | License number | |
| LicenseExpirationDate | DATE | No | Expiration date | |
| Status | VARCHAR(20) | No | Record status | CHECK (Status IN ('Active', 'Inactive')), Default 'Active' |

**Relationships:**
- `ProfileID` → FK to `Profile.ID` in IAM service

---

## Modeling decisions

- **Person as base entity:** Person holds all personal data. Profile (IAM) references Person via foreign key, separating identity concerns from personal data.
- **Family as grouping:** Family is a logical grouping. FamilyMember links profiles to families with a relationship type (PARENT/STUDENT).
