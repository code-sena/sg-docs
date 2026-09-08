# Data Model — IAM

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Iam`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: Role

**Purpose:** Defines system roles for RBAC

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK |
| Name | VARCHAR(20) | No | Role name | |
| Description | VARCHAR(100) | No | Role description | |
| Status | STATUS | No | Record status | Default: ACTIVE |

### Table: Permissions

**Purpose:** Defines available permissions in the system

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK, AUTO_INCREMENT |
| TypePermissions | VARCHAR(100) | Yes | Permission type identifier | |
| Description | VARCHAR(255) | Yes | Permission description | |

### Table: PermissionsRole

**Purpose:** Many-to-many relationship between permissions and roles

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | TINYINT | No | Unique identifier | PK, AUTO_INCREMENT |
| PermissionsID | TINYINT | No | Reference to permission | FK → Permissions.ID |
| RoleID | TINYINT | No | Reference to role | FK → Role.ID |

**Relationships:**
- `PermissionsID` → FK to `Permissions.ID`
- `RoleID` → FK to `Role.ID`

### Table: Profile

**Purpose:** User profile linking person data to authentication and school context

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UUID | No | Unique identifier | PK |
| PersonID | UUID | No | Reference to person | FK → Person.ID (User Management) |
| SchoolID | UUID | No | Reference to school | FK → School.ID (School) |
| PasswordHash | VARCHAR(100) | No | Hashed password | |
| RoleID | TINYINT | No | Reference to role | FK → Role.ID |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `PersonID` → FK to `Person.ID` in User Management service
- `SchoolID` → FK to `School.ID` in School service
- `RoleID` → FK to `Role.ID`

### Table: SessionProfile

**Purpose:** Tracks user login sessions

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | INT | No | Unique identifier | PK, AUTO_INCREMENT |
| ProfileID | UUID | No | Reference to profile | FK → Profile.ID |
| DateStart | DATETIME2 | No | Session start time | |
| DateEnd | DATETIME2 | No | Session end time | |
| IPAddress | VARCHAR(50) | No | Client IP address | |
| StatusSession | VARCHAR(50) | No | Session status | |

**Relationships:**
- `ProfileID` → FK to `Profile.ID`

---

## Modeling decisions

- **Profile as identity hub:** Profile links Person (User Management) and School (School) via foreign keys, acting as the central identity entity across services.
- **Role-based access:** Permissions are assigned to roles, not directly to profiles, enabling standard RBAC patterns.
