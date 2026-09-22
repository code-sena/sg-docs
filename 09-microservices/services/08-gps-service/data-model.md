# Data Model — GPS

> This service is the **authoritative owner** of the data described here.
> No other service should read these tables directly.

---

## Database engine

**Engine:** SQL Server
**Schema:** `Gps`
**Justification:** Shared SQL Server instance with logical schema isolation (ADR-002)

---

## Schema

### Table: GpsDevice

**Purpose:** Registry of physical GPS devices mounted on buses

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| Imei | VARCHAR(20) | Yes | Device IMEI | |
| LastConnection | DATETIME | Yes | Last connection time | |
| Status | STATUS | No | Record status | Default: ACTIVE |

### Table: GpsLocation

**Purpose:** Stores position data reported by GPS devices

| Field | Type | Nullable | Description | Constraints |
|-------|------|----------|-------------|-------------|
| ID | UNIQUEIDENTIFIER | No | Unique identifier | PK |
| GpsDeviceID | UNIQUEIDENTIFIER | No | Reference to GPS device | FK → GpsDevice.ID |
| Latitude | DECIMAL(10,7) | Yes | Latitude coordinate | |
| Longitude | DECIMAL(10,7) | Yes | Longitude coordinate | |
| Speed | DECIMAL(8,2) | Yes | Vehicle speed | |
| Course | DECIMAL(8,2) | Yes | Heading/direction | |
| DateTime | DATETIME | Yes | Position timestamp | |
| Status | STATUS | No | Record status | Default: ACTIVE |

**Relationships:**
- `GpsDeviceID` → FK to `GpsDevice.ID`

---

## Modeling decisions

- **High-precision coordinates:** DECIMAL(10,7) for latitude/longitude supports GPS-grade precision.
- **LastConnection on device:** GpsDevice tracks LastConnection to detect offline devices, while GpsLocation keeps the full history.
