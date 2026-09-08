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
| 01 | `api-gateway` | Routing, authentication, rate limiting | 8080 | — (Redis cache) | Cache | 🟡 In development |
| 02 | `iam-service` | Identity, auth, roles, permissions, sessions | 8081 | `Iam` | Relational (shared) | 🟡 In development |
| 03 | `user-management-service` | Persons, families, family members, driver licenses | 8082 | `UserManagement` | Relational (shared) | 🟡 In development |
| 04 | `school-service` | Schools, campuses, courses, cities | 8083 | `School` + `Geographic` | Relational (shared) | 🟡 In development |
| 05 | `notification-service` | Boarding/alighting events, alerts and recipients | 8084 | `Notification` | Relational (shared) | 🟡 In development |
| 06 | `bus-service` | Bus fleet, brands, models | 8085 | `Bus` | Relational (shared) | 🟡 In development |
| 07 | `route-service` | Routes, stops, schedules, executions, assignments | 8086 | `Route` | Relational (shared) | 🟡 In development |
| 08 | `gps-service` | GPS devices and position history | 8087 | `Gps` | Relational (shared) | 🟡 In development |
| 09 | `exceptional-service` | Exceptional driver and route usage | 8088 | `Exceptional` | Relational (shared) | 🟡 In development |
| 10 | `audit-service` | Audit trail and error logs | 8089 | `Audit` | Relational (shared) | 🟡 In development |
| 11 | `configuration-service` | Security settings and password policies | 8090 | `Configuration` | Relational (shared) | 🟡 In development |

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

### 02 — `iam-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/02-iam-service/` |
| **Responsibility** | Identity and access: auth, JWT, roles/permissions (RBAC), sessions |
| **Schema** | `Iam` |
| **Tables** | Role, Permissions, PermissionsRole, Profile, SessionProfile |
| **Consumed by** | api-gateway (token verification), all other services |
| **Externally exposed** | Only through the API Gateway |

---

### 03 — `user-management-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/03-user-management-service/` |
| **Responsibility** | Persons, families, family members, driver licenses |
| **Schema** | `UserManagement` |
| **Tables** | Person, Family, FamilyMember, DriverLicense |

---

### 04 — `school-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/04-school-service/` |
| **Responsibility** | Schools, campuses, courses, course groups, cities |
| **Schema** | `School` + `Geographic` |
| **Tables** | School, SchoolCampus, Course, CourseGroup, City |

---

### 05 — `notification-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/05-notification-service/` |
| **Responsibility** | Boarding/alighting events, alerts, alert types, recipients |
| **Schema** | `Notification` |
| **Tables** | Boarding, Alert, AlertType, AlertRecipient |

---

### 06 — `bus-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/06-bus-service/` |
| **Responsibility** | Bus fleet, brands, models |
| **Schema** | `Bus` |
| **Tables** | Bus, Brand, Model |

---

### 07 — `route-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/07-route-service/` |
| **Responsibility** | Routes, stops, schedules, executions, assignments |
| **Schema** | `Route` |
| **Tables** | Route, Stop, RouteStop, RouteBusAssignments, RouteStudentAssignments, RouteSchedule, RouteExecution |

---

### 08 — `gps-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/08-gps-service/` |
| **Responsibility** | GPS devices and position history |
| **Schema** | `Gps` |
| **Tables** | GpsDevice, GpsLocation |

---

### 09 — `exceptional-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/09-exceptional-service/` |
| **Responsibility** | Exceptional driver and route usage |
| **Schema** | `Exceptional` |
| **Tables** | ExceptionalDriverUsage, ExceptionalRouteUsage |

---

### 10 — `audit-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/10-audit-service/` |
| **Responsibility** | Audit trail and error logs |
| **Schema** | `Audit` |
| **Tables** | Audit, LogErrors |

---

### 11 — `configuration-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/11-configuration-service/` |
| **Responsibility** | Security settings and password policies |
| **Schema** | `Configuration` |
| **Tables** | SecuritySettings, PasswordPolicies |

---

## Service communication matrix

> Who calls whom and through which channel.

| Source service | Destination service | Channel | Type | Description |
|----------------|--------------------|---------|----- |-------------|
| api-gateway | iam-service | HTTP/REST | Synchronous | Validate JWT on each request |
| notification-service | iam-service | HTTP/REST | Synchronous | Resolve profile identity for events |
| notification-service | route-service | HTTP/REST | Synchronous | Reference route executions/stops |
| notification-service | bus-service | HTTP/REST | Synchronous | Reference bus fleet |
| [svc-a] | [svc-b] | Event | Asynchronous | Notify of [event] |
| [svc-b] | [svc-c] | HTTP/REST | Synchronous | Query [data] |

---

## Data ownership matrix

Each business entity has a single owner service.
Others access via API or events, never directly to the DB.

| Entity / Data | Owner service (Source of Truth) | How other services access |
|---------------|--------------------------------|--------------------------|
| Profile, Role, Permissions, Sessions | iam-service | REST API |
| Person, Family, DriverLicense | user-management-service | REST API |
| School, Campus, Course, City | school-service | REST API |
| Boarding, Alert | notification-service | REST API + consumed events |
| Bus, Brand, Model | bus-service | REST API |
| Route, Stop, Schedule, Execution | route-service | REST API + events |
| GpsDevice, GpsLocation | gps-service | REST query |
| Exceptional usage | exceptional-service | REST API |
| Audit, LogErrors | audit-service | REST API (write-only ingest) |
| SecuritySettings, PasswordPolicies | configuration-service | REST API |

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
