# Data Models per Service

## Service: Geographic

**DB Engine:** SQL Server 16.

### Table: City

**Purpose:** Provides geographic city reference data.

```sql
CREATE TABLE City (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Name VARCHAR(40) NOT NULL, 
    Country VARCHAR(30) NOT NULL, 
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Inactive')) DEFAULT 'Active'
);
```

**Data dictionary:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Id | UNIQUEIDENTIFIER | City identifier | `550e8400-...` |
| Name | VARCHAR(40) | City name | `Bogota` |
| Country | VARCHAR(30) | Country name | `Colombia` |
| Status | VARCHAR(20) | Lifecycle status | `Active` |

**Modeling decisions:**
1. City is shared by School and correlated by Route without direct cross-service joins.
2. Status supports controlled reference-data retirement.