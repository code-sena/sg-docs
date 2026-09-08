# Microservices Catalog

> **What to fill in here:** The complete inventory of system services.
> For the detail of each service, go to `09-microservices/services/NN-service-name/`.
> This catalog is the executive view — one row per service.

---

## Services map

```
                          ┌─────────────────┐
  External clients        │   API Gateway   │
  (Web, Mobile, API)  ──▶ │   :8080         │
                          └────────┬────────┘
                                   │ routes by path
                                   ▼
         ┌──────────┬──────────┬───┴──────┬──────────┬─────────┐
         ▼          ▼          ▼          ▼          ▼         ▼
  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ ┌─────────┐
  │iam       │ │user-mgmt │ │school   │ │notif    │ │bus    │ │route    │
  └──────────┘ └──────────┘ └─────────┘ └─────────┘ └───────┘ └─────────┘
         ┌──────────┬──────────┬──────────┬──────────┬─────────┐
         ▼          ▼          ▼          ▼          ▼         ▼
  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐
  │gps       │ │exception │ │audit    │ │config   │ │       │
  └──────────┘ └──────────┘ └─────────┘ └─────────┘ └───────┘
```

---

## Service registry

> All services share a **single SQL Server instance** (ADR-002), each with its own schema for
> logical isolation. The API Gateway is the only stateless service (uses Redis).

| # | Service | Main responsibility | Port | Schema | DB type | Status |
|---|---------|-------------------|------|--------|---------|--------|
| 01 | `api-gateway` | Routing, authentication, rate limiting | 8080 | — (Redis cache) | Cache | 🟢 Active |
| 02 | `iam` | Identity, auth, roles, permissions, sessions | 3001 | `Iam` | Relational (shared) | 🟢 Active |
| 03 | `user-management` | Persons, families, family members, driver licenses | 3002 | `UserManagement` | Relational (shared) | 🟡 In development |
| 04 | `school` | Schools, campuses, courses, cities | 3003 | `School` + `Geographic` | Relational (shared) | 🟡 In development |
| 05 | `notification` | Boarding/alighting events, alerts and recipients | 3004 | `Notification` | Relational (shared) | 🟡 In development |
| 06 | `bus` | Bus fleet, brands, models | 3005 | `Bus` | Relational (shared) | 🟡 In development |
| 07 | `route` | Routes, stops, schedules, executions, assignments | 3006 | `Route` | Relational (shared) | 🟡 In development |
| 08 | `gps` | GPS devices and position history | 3007 | `Gps` | Relational (shared) | 🟡 In development |
| 09 | `exceptional` | Exceptional driver and route usage | 3008 | `Exceptional` | Relational (shared) | 🟡 In development |
| 10 | `audit` | Audit trail and error logs | 3009 | `Audit` | Relational (shared) | 🟡 In development |
| 11 | `configuration` | Security settings and password policies | 3010 | `Configuration` | Relational (shared) | 🟡 In development |

**Statuses:** 🟢 Active in prod | 🟡 In development | 🔴 Planned | ⏸ Deprecated

> **Data note (ADR-002):** All services share a **single SQL Server instance** (monolithic DB),
> each with its own schema for logical isolation. Neither PostgreSQL nor MongoDB are used.

---

## Detail per service

### 01 — `api-gateway`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/01-api-gateway/` |
| **Responsibility** | Single entry point. Routes, authenticates, and applies rate limiting |
| **Type** | Infrastructure service (not domain) |
| **Port** | 8080 (HTTPS 8443) |
| **DB** | Redis (token cache, rate limiting) |
| **Communicates with** | All internal services |
| **Externally exposed** | Yes — it is the only entry point |

**Key endpoints:**
- `/*` — Proxy to internal services based on path

---

### 02 — `iam`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/02-iam/` |
| **Responsibility** | Identity and access: auth, JWT, roles/permissions (RBAC), sessions |
| **Schema** | `Iam` |
| **Tables** | Role, Permissions, PermissionsRole, Profile, SessionProfile |
| **Consumed by** | api-gateway (token verification), all other services |
| **Externally exposed** | Only through the API Gateway |

---

### 03 — `user-management`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/03-user-management/` |
| **Responsibility** | Persons, families, family members, driver licenses |
| **Schema** | `UserManagement` |
| **Tables** | Person, Family, FamilyMember, DriverLicense |

---

### 04 — `school`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/04-school/` |
| **Responsibility** | Schools, campuses, courses, course groups, cities |
| **Schema** | `School` + `Geographic` |
| **Tables** | School, SchoolCampus, Course, CourseGroup, City |

---

### 05 — `notification`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/05-notification/` |
| **Responsibility** | Boarding/alighting events, alerts, alert types, recipients |
| **Schema** | `Notification` |
| **Tables** | Boarding, Alert, AlertType, AlertRecipient |

---

### 06 — `bus`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/06-bus/` |
| **Responsibility** | Bus fleet, brands, models |
| **Schema** | `Bus` |
| **Tables** | Bus, Brand, Model |

---

### 07 — `route`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/07-route/` |
| **Responsibility** | Routes, stops, schedules, executions, assignments |
| **Schema** | `Route` |
| **Tables** | Route, Stop, RouteStop, RouteBusAssignments, RouteStudentAssignments, RouteSchedule, RouteExecution |

---

### 08 — `gps`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/08-gps/` |
| **Responsibility** | GPS devices and position history |
| **Schema** | `Gps` |
| **Tables** | GpsDevice, GpsLocation |

---

### 09 — `exceptional`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/09-exceptional/` |
| **Responsibility** | Exceptional driver and route usage |
| **Schema** | `Exceptional` |
| **Tables** | ExceptionalDriverUsage, ExceptionalRouteUsage |

---

### 10 — `audit`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/10-audit/` |
| **Responsibility** | Audit trail and error logs |
| **Schema** | `Audit` |
| **Tables** | Audit, LogErrors |

---

### 11 — `configuration`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/11-configuration/` |
| **Responsibility** | Security settings and password policies |
| **Schema** | `Configuration` |
| **Tables** | SecuritySettings, PasswordPolicies |

---

## Service communication matrix

> Who calls whom and through which channel.

| Source service | Destination service | Channel | Type | Description |
|----------------|--------------------|---------|----- |-------------|
| api-gateway | iam | HTTP/REST | Synchronous | Validate JWT on each request |
| notification | iam | HTTP/REST | Synchronous | Resolve profile identity for events |
| notification | route | HTTP/REST | Synchronous | Reference route executions/stops |
| notification | bus | HTTP/REST | Synchronous | Reference bus fleet |
| [svc-a] | [svc-b] | Event | Asynchronous | Notify of [event] |
| [svc-b] | [svc-c] | HTTP/REST | Synchronous | Query [data] |

---

## Data ownership matrix

Each business entity has a single owner service.
Others access via API or events, never directly to the DB.

| Entity / Data | Owner service (Source of Truth) | How other services access |
|---------------|--------------------------------|--------------------------|
| Profile, Role, Permissions, Sessions | iam | REST API |
| Person, Family, DriverLicense | user-management | REST API |
| School, Campus, Course, City | school | REST API |
| Boarding, Alert | notification | REST API + consumed events |
| Bus, Brand, Model | bus | REST API |
| Route, Stop, Schedule, Execution | route | REST API + events |
| GpsDevice, GpsLocation | gps | REST query |
| Exceptional usage | exceptional | REST API |
| Audit, LogErrors | audit | REST API (write-only ingest) |
| SecuritySettings, PasswordPolicies | configuration | REST API |

> Full ownership per schema → `09-microservices/data-ownership-matrix.md`

---

## How to add a new service

1. Assign the next available number in this catalog
2. Create the folder: `cp -r 09-microservices/_template/service 09-microservices/services/NN-new-service`
3. Fill in the README, data-model, events, and decisions of the new service
4. Create the OpenAPI contract in `07-api/contracts/openapi/NN-new-service.yaml`
5. Add the service to this catalog
6. Add the ADR for the decision to create the service in `05-architecture/decisions/`
7. Update the diagram in `05-architecture/overview.md`

---

## Correlations

- Architecture and patterns → `05-architecture/`
- API contracts per service → `07-api/contracts/openapi/`
- System events → `02-domain/domain-events.md`
- Template for creating services → `09-microservices/_template/service/`
- Full detail per service → `09-microservices/services/NN-[name]/`
