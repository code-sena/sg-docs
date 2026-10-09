# Microservices Catalog

> **What to fill in here:** The complete inventory of system services grouped by business domain.
> For the detail of each service, go to `09-microservices/services/NN-service-name/`.
> This catalog is the executive view — one row per service.

---

## Business Domains & Services Map

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               1. IDENTITY                                                │
│ ┌──────────────────────────────────────────┐   ┌───────────────────────────────────────┐ │
│ │ 02 - iam-service                         │   │ 03 - user-management-service          │ │
│ │ (Autenticación, Roles, Perfiles, JWT)    │   │ (Personas, Familias, Conductores)     │ │
│ └──────────────────────────────────────────┘   └───────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               2. SCHOOL                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 04 - school-service                                                                  │ │
│ │ (Colegios, Sedes, Administradores, Ciudades)                                        │ │
│ └──────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               3. TRANSPORT                                               │
│ ┌──────────────────────┐   ┌───────────────────────────┐                               │
│ │ 06 - bus-service     │   │ 07 - route-service        │                               │
│ │ (Vehículos, Asignación)  │ (Rutas, Paradas, Viajes)  │                               │
│ └──────────────────────┘   └───────────────────────────┘                               │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               4. TRACKING                                                │
│ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 08 - gps-service                                                                     │ │
│ │ (Ingesta TCP VT03F, Telemetría e Historial de Coordenadas)                           │ │
│ └──────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               5. NOTIFICATION                                            │
│ ┌──────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 05 - notification-service                                                            │ │
│ │ (Abordajes QR, Alertas Operativas, Bandeja Web/Mobile, Despacho)                     │ │
│ └──────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               6. INFRASTRUCTURE                                          │
│ ┌──────────────────────┐   ┌───────────────────────────┐                               │
│ │ 01 - api-gateway     │   │ 11 - configuration-service│                               │
│ │ (Punto de Entrada)   │   │ (Parámetros y Políticas)│                                 │
│ └──────────────────────┘   └───────────────────────────┘                               │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Service registry

> All services share a **single SQL Server instance** (ADR-002), each with its own schema for logical isolation and direct relational constraints (Foreign Keys) between schemas. All services listen on host port **8080**; on the Docker network they are reached by service name (DNS), so host port collisions do not occur. The API Gateway is Kong OSS (language-neutral) and is the only stateless service (uses Redis).

| # | Service | Domain | Main responsibility | Port | Schema | DB type | Stack | Status |
|---|---------|--------|---------------------|------|--------|---------|-------|--------|
| 01 | `api-gateway` | Infra | Routing, authentication, rate limiting | 8000 | — (Redis cache) | Redis (ephemeral) | Kong OSS | 🟡 In development |
| 02 | `iam-service` | Identity | Identity, auth, roles, permissions, profiles, sessions | 8080 | `Iam` | Relational (shared) | Java + Spring Boot | 🟡 In development |
| 03 | `user-management-service` | Identity | Persons, families, family members, driver licenses | 8080 | `UserManagement` | Relational (shared) | C# + ASP.NET | 🟡 In development |
| 04 | `school-service` | School | Schools, campuses, school admins, cities | 8080 | `School` + `Geographic` | Relational (shared) | C# + ASP.NET | 🟡 In development |
| 05 | `notification-service` | Notifications | Boarding/alighting events (QR), alerts, and recipients | 8080 | `Notification` | Relational (shared) | C# + ASP.NET | 🟡 In development |
| 06 | `bus-service` | Transport | Bus fleet, brands, models, driver assignments | 8080 | `Bus` | Relational (shared) | C# + ASP.NET | 🟡 In development |
| 07 | `route-service` | Transport | Routes, stops, schedules, executions, assignments | 8080 | `Route` | Relational (shared) | C# + ASP.NET | 🟡 In development |
| 08 | `gps-service` | Tracking | GPS devices (VT03F protocol) and position history | 8080 | `Gps` | Relational (shared) | Java + Spring Boot | 🟡 In development |
| 11 | `configuration-service` | Infra | Security settings and password policies | 8080 | `Settings` | Relational (shared) | C# + ASP.NET | 🟡 In development |

**Statuses:** 🟢 Active in prod | 🟡 In development | 🔴 Planned | ⏸ Deprecated

> **Data note (ADR-002):** All services share a **single SQL Server instance** (monolithic DB),
> each with its own schema for logical isolation. Foreign keys connect tables across schemas directly. The API Gateway uses Redis for ephemeral cache only.

---

## Detail per service

### 01 — `api-gateway`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/01-api-gateway/` |
| **Domain** | Infrastructure |
| **Responsibility** | Single entry point. Routes, authenticates, and applies rate limiting |
| **Type** | Infrastructure service (not domain) |
| **Stack** | Kong OSS |
| **Port** | 8000 (HTTPS 8443) |
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
| **Domain** | Identity |
| **Responsibility** | Identity and access: auth, JWT, roles/permissions (RBAC), profiles, sessions |
| **Stack** | Java + Spring Boot |
| **Schema** | `Iam` |
| **Tables** | Role, Permissions, PermissionsRole, Profile, SessionProfile |
| **Direct FK Relationships** | `Profile.PersonID` → `UserManagement.Person(ID)`, `Profile.SchoolID` → `School.School(ID)`, `Profile.RoleID` → `Role(ID)` |
| **Consumed by** | api-gateway (token verification), all other services |
| **Externally exposed** | Only through the API Gateway |

---

### 03 — `user-management-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/03-user-management-service/` |
| **Domain** | Identity |
| **Responsibility** | Persons, families, family members, driver licenses |
| **Stack** | C# + ASP.NET |
| **Schema** | `UserManagement` |
| **Tables** | Person, Family, FamilyMember, DriverLicense |
| **Direct FK Relationships** | `FamilyMember.FamilyID` → `Family(ID)`, `FamilyMember.ProfileID` → `Iam.Profile(ID)`, `DriverLicense.ProfileID` → `Iam.Profile(ID)` |

---

### 04 — `school-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/04-school-service/` |
| **Domain** | School |
| **Responsibility** | Schools, campuses, school admins, cities |
| **Stack** | C# + ASP.NET |
| **Schema** | `School` + `Geographic` |
| **Tables** | School, SchoolCampus, SchoolAdmin, City |
| **Direct FK Relationships** | `School.CityID` → `Geographic.City(ID)`, `SchoolCampus.SchoolID` → `School(ID)`, `SchoolAdmin.SchoolID` → `School(ID)`, `SchoolAdmin.ProfileID` → `Iam.Profile(ID)` |

---

### 05 — `notification-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/05-notification-service/` |
| **Domain** | Notifications |
| **Responsibility** | Boarding/alighting events (QR scanning), alerts, alert types, recipients |
| **Stack** | C# + ASP.NET |
| **Schema** | `Notification` |
| **Tables** | Boarding, Alert, AlertType, AlertRecipient |
| **Direct FK Relationships** | `Boarding.RouteExecutionID` → `Route.RouteExecution(ID)`, `Boarding.ProfileID` → `Iam.Profile(ID)`, `Boarding.BusID` → `Bus.Bus(ID)`, `Boarding.StopID` → `Route.Stop(ID)`, `Alert.RouteExecutionID` → `Route.RouteExecution(ID)`, `Alert.AlertTypeID` → `AlertType(ID)`, `Alert.ProfileId` → `Iam.Profile(ID)`, `AlertRecipient.AlertID` → `Alert(ID)`, `AlertRecipient.ProfileID` → `Iam.Profile(ID)` |

---

### 06 — `bus-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/06-bus-service/` |
| **Domain** | Transport |
| **Responsibility** | Bus fleet, brands, models, driver assignments |
| **Stack** | C# + ASP.NET |
| **Schema** | `Bus` |
| **Tables** | Bus, DriverAssignemts, Brand, Model |
| **Direct FK Relationships** | `Bus.SchoolID` → `School.School(ID)`, `Bus.GpsDeviceID` → `Gps.GpsDevice(ID)`, `Bus.ModelId` → `Model(ID)`, `DriverAssignemts.ProfileID` → `Iam.Profile(ID)`, `DriverAssignemts.BusID` → `Bus(ID)`, `Model.BrandID` → `Brand(ID)` |

---

### 07 — `route-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/07-route-service/` |
| **Domain** | Transport |
| **Responsibility** | Routes, stops, schedules, executions, assignments |
| **Stack** | C# + ASP.NET |
| **Schema** | `Route` |
| **Tables** | Route, Stop, RouteStop, RouteBusAssignments, RouteStudentAssignments, RouteSchedule, RouteExecution |
| **Direct FK Relationships** | `Route.SchoolID` → `School.School(ID)`, `Stop.CityID` → `Geographic.City(ID)`, `Stop.SchoolID` → `School.School(ID)`, `RouteStop.RouteID` → `Route(ID)`, `RouteStop.StopID` → `Stop(ID)`, `RouteBusAssignments.BusID` → `Bus.Bus(ID)`, `RouteBusAssignments.RouteID` → `Route(ID)`, `RouteStudentAssignments.ProfileID` → `Iam.Profile(ID)`, `RouteStudentAssignments.RouteStopID` → `RouteStop(ID)`, `RouteSchedule.RouteBusAssignmentsId` → `RouteBusAssignments(ID)`, `RouteExecution.RouteScheduleId` → `RouteSchedule(ID)` |

---

### 08 — `gps-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/08-gps-service/` |
| **Domain** | Tracking |
| **Responsibility** | GPS devices and position history |
| **Stack** | Java + Spring Boot |
| **Schema** | `Gps` |
| **Tables** | GpsDevice, GpsLocation |
| **Direct FK Relationships** | `GpsLocation.GpsDeviceID` → `GpsDevice(ID)` |

---

### 11 — `configuration-service`

| Field | Value |
|-------|-------|
| **Folder** | `09-microservices/services/11-configuration-service/` |
| **Domain** | Infrastructure |
| **Responsibility** | Security settings and password policies |
| **Stack** | C# + ASP.NET |
| **Schema** | `Settings` |
| **Tables** | SecuritySettings, PasswordPolicies |

---

## Service communication matrix

> **Channels:** synchronous **gRPC** (ADR-005) and asynchronous **Kafka** (ADR-004). Client-facing REST goes only through the Kong gateway.

> Who calls whom and through which channel.

| Source service | Destination service | Channel | Type | Description |
|----------------|--------------------|---------|------|-------------|
| api-gateway | iam-service | HTTP/REST | Synchronous | Validate JWT on each request |
| notification-service | iam-service | HTTP/REST | Synchronous | Resolve profile identity for events |
| notification-service | route-service | HTTP/REST | Synchronous | Reference route executions/stops |
| notification-service | bus-service | HTTP/REST | Synchronous | Reference bus fleet |
| route-service | notification-service | Kafka | Asynchronous | Notify route executed events (boarding/alighting) |
| gps-service | notification-service | Kafka | Asynchronous | Alert on GPS anomalies (route deviation, signal loss) |
| notification-service | iam-service | Kafka | Asynchronous | Notify delivery status of alerts |
| school-service | route-service | gRPC | Synchronous | Query school stop locations |
| user-management-service | iam-service | gRPC | Synchronous | Resolve person identity for profiles |
| configuration-service | all services | Kafka | Asynchronous | Broadcast security setting changes |

---

## Data ownership matrix

Each business entity has a single owner service.
Others access via API or events, never directly to the DB.

| Entity / Data | Owner service (Source of Truth) | How other services access |
|---------------|--------------------------------|--------------------------|
| Profile, Role, Permissions, PermissionsRole, SessionProfile | iam-service | REST API |
| Person, Family, FamilyMember, DriverLicense | user-management-service | REST API |
| School, SchoolCampus, SchoolAdmin | school-service | REST API |
| City | school-service (`Geographic`) | REST API |
| Boarding, Alert, AlertType, AlertRecipient | notification-service | REST API + consumed events |
| Bus, DriverAssignemts, Brand, Model | bus-service | REST API |
| Route, Stop, RouteStop, RouteBusAssignments, RouteStudentAssignments, RouteSchedule, RouteExecution | route-service | REST API + events |
| GpsDevice, GpsLocation | gps-service | REST query |
| SecuritySettings, PasswordPolicies | configuration-service | REST API |

---

## Correlations

- Architecture and patterns → `05-architecture/`
- API contracts per service → `07-api/contracts/openapi/`
- System events → `02-domain/domain-events.md`
- Template for creating services → `09-microservices/_template/service/`
- Full detail per service → `09-microservices/services/NN-[name]/`
