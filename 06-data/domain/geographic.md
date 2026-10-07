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

## Migration strategy

Same as other schemas: **Liquibase** under `database/ms-geographic-db/` (ADR-009).
Reference data changes are data-only changesets (see [../migration-strategy.md](../migration-strategy.md)).

## Correlations

| Document | Relationship |
|----------|--------------|
| `school.md` | Schools reference places/geography where applicable |
| `../data-dictionary.md` | Geographic labels as shared concepts |
| `09-microservices/` | Supporting schema; not a standalone microservice in the 11-service catalog |

_Last updated: 2026-09-22_
