# Data Ownership Matrix

> **Purpose:** For each business entity, identify the service that holds the "official version"
> (source of truth) and how other services access it. This document enforces the schema boundary
> defined in ADR-002: each service owns its schema and never accesses another service's schema.

## Schema assignment model

Per [ADR-002](../05-architecture/decisions/records/ADR-002-shared-database-monolithic-db.md),
all services share a single SQL Server instance. Each service owns exactly **one schema**
(the School service additionally owns the `Geographic` schema with the `City` table).

| Schema | Owner service | Status |
|--------|--------------|--------|
| `Iam` | iam | 🟡 In development |
| `UserManagement` | user-management | 🟡 In development |
| `School` | school | 🟡 In development |
| `Geographic` | geographic | 🟡 In development |
| `Notification` | notification | 🟡 In development |
| `Bus` | bus | 🟡 In development |
| `Route` | route | 🟡 In development |
| `Gps` | gps | 🟡 In development |
| `Exceptional` | exceptional | 🟡 In development |
| `Audit` | audit | 🟡 In development |
| `Configuration` | configuration | 🟡 In development |

**API Gateway** is stateless: it does not own any SQL Server schema (it only uses Redis for
tokens/cache/rate-limiting).

## Ownership matrix

| Entity / Data | Owner service | Schema | How other services access |
|---------------|--------------|--------|--------------------------|
| Profile, Role, Permissions, PermissionsRole, SessionProfile | iam | `Iam` | REST API. Never shared directly. |
| Person, Family, FamilyMember, DriverLicense | user-management | `UserManagement` | REST API + `user.*` events |
| Course, CourseGroup | school | `School` | REST API (`GET /courses/:id`) |
| School, SchoolCampus | school | `School` | REST API |
| City | geographic | `Geographic` | REST API |
| Boarding / alighting | notification | `Notification` | Consumes route events; REST API |
| Alert, AlertType, AlertRecipient | notification | `Notification` | REST API + consumed events |
| Bus, Brand, Model | bus | `Bus` | REST API + `bus.*` events |
| Route, Stop, RouteStop | route | `Route` | REST API + `route.*` events |
| RouteBusAssignments, RouteStudentAssignments | route | `Route` | REST API |
| RouteSchedule, RouteExecution | route | `Route` | REST API + `route.*` events |
| GpsDevice, GpsLocation | gps | `Gps` | Consumes GPS stream; REST query |
| ExceptionalDriverUsage, ExceptionalRouteUsage | exceptional | `Exceptional` | REST API |
| Audit, LogErrors | audit | `Audit` | REST API (write-only ingest) |
| SecuritySettings, PasswordPolicies | configuration | `Configuration` | REST API |

> **Rule:** a service never queries ANOTHER service's schema directly. If it needs data,
> it calls the owner's API or subscribes to its events.

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
| `Exceptional` | `svc_exceptional` | SELECT / INSERT / UPDATE on `Exceptional` only |
| `Audit` | `svc_audit` | SELECT / INSERT / UPDATE on `Audit` only |
| `Configuration` | `svc_configuration` | SELECT / INSERT / UPDATE on `Configuration` only |

> One login/user per service, limited to its own schema (see ADR-002 risk mitigation).

## How to update this matrix

1. When a new service or entity appears, assign it to the owning schema/service.
2. If two services need to write to the same entity → redesign (breaking schema boundary).
3. If a schema grows beyond its owner's ability to keep it cohesive, open an ADR
   to split it into its own database (Strangler Fig migration path, ADR-002).

## Correlations

- Schema boundary decision → `05-architecture/decisions/records/ADR-002-shared-database-monolithic-db.md`
- Service inventory and communication → `09-microservices/service-catalog.md`
- Tables per schema → `06-data/models.md`
- Domain bounded contexts → `02-domain/domain-map.md`
