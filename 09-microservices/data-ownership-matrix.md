# Data Ownership Matrix

> **Purpose:** For each business entity, identify the service that holds the "official version"
> (source of truth) and how other services access it. This document enforces the schema boundary
> defined in ADR-002: each service owns its schema and accesses its data directly within the shared database instance.

## Schema assignment model

Per [ADR-002](../05-architecture/decisions/records/ADR-002-shared-database-monolithic-db.md),
all services share a single SQL Server instance. Each service owns exactly **one schema**
(the School service additionally owns the `Geographic` schema with the `City` table).

| Schema | Owner service | Domain | Status |
|--------|--------------|--------|--------|
| `Iam` | iam-service | Identity | 🟡 In development |
| `UserManagement` | user-management-service | Identity | 🟡 In development |
| `School` | school-service | School | 🟡 In development |
| `Geographic` | school-service | School | 🟡 In development |
| `Notification` | notification-service | Notifications | 🟡 In development |
| `Bus` | bus-service | Transport | 🟡 In development |
| `Route` | route-service | Transport | 🟡 In development |
| `Gps` | gps-service | Tracking | 🟡 In development |

**API Gateway** is stateless: it does not own any SQL Server schema (no datastore; token revocation lives in iam-service's in-memory deny list).

## Ownership matrix

| Entity / Data | Owner service | Schema | How other services access |
|---------------|--------------|--------|--------------------------|
| Profile, Role, Permissions, PermissionsRole, SessionProfile, TermsAcceptance | iam-service | `Iam` | REST API. Never shared directly. |
| Person, Family, FamilyMember, DriverLicense | user-management-service | `UserManagement` | REST API + `user.*` events |
| School, SchoolCampus, SchoolAdmin | school-service | `School` | REST API |
| City | school-service | `Geographic` | REST API |
| Boarding | notification-service | `Notification` | Consumes route events; REST API |
| Alert, AlertType, AlertRecipient | notification-service | `Notification` | REST API + consumed events |
| Bus, DriverAssignemts, Brand, Model | bus-service | `Bus` | REST API + `bus.*` events |
| Route, Stop, RouteStop | route-service | `Route` | REST API + `route.*` events |
| RouteBusAssignments, RouteStudentAssignments | route-service | `Route` | REST API |
| RouteSchedule, RouteExecution | route-service | `Route` | REST API + `route.*` events |
| GpsDevice, GpsLocation | gps-service | `Gps` | Consumes GPS stream; REST query |

> **Rule:** a service never queries or updates ANOTHER service's schema directly from application code. Cross-schema foreign keys maintain direct relational integrity in SQL Server per ADR-002, while application-level access routes through the owner's API or events.

## Access control per schema (SQL Server)

| Schema | DB login/user | Rights |
|--------|--------------|--------|
| `Iam` | `svc_iam` | SELECT / INSERT / UPDATE on `Iam` only |
| `UserManagement` | `svc_user_management` | SELECT / INSERT / UPDATE on `UserManagement` only |
| `School` | `svc_school` | SELECT / INSERT / UPDATE on `School` only |
| `Geographic` | `svc_school` | SELECT / INSERT / UPDATE on `Geographic` only |
| `Notification` | `svc_notification` | SELECT / INSERT / UPDATE on `Notification` only |
| `Bus` | `svc_bus` | SELECT / INSERT / UPDATE on `Bus` only |
| `Route` | `svc_route` | SELECT / INSERT / UPDATE on `Route` only |
| `Gps` | `svc_gps` | SELECT / INSERT / UPDATE on `Gps` only |

> One login/user per service, limited to its own schema (see ADR-002 risk mitigation).

## How to update this matrix

1. When a new service or entity appears, assign it to the owning schema/service and domain.
2. If two services need to write to the same entity → redesign (breaking schema boundary).
3. If a schema grows beyond its owner's ability to keep it cohesive, open an ADR
   to split it into its own database (Strangler Fig migration path, ADR-002).

## Correlations

- Schema boundary decision → `05-architecture/decisions/records/ADR-002-shared-database-monolithic-db.md`
- Service inventory and communication → `09-microservices/service-catalog.md`
- Tables per schema → `06-data/models.md`
- Domain bounded contexts → `02-domain/domain-map.md`
