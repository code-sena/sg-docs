# Functional Requirements (FR)

> Functional requirements define **what the system does**: functions, behaviors, and
> data transformations. Each requirement originates from one or more User Stories.
> The traceability matrix (`traceability-matrix.md`) connects each FR to its HU, test case, and service.
> The `Service` column references the microservice responsible for the FR, as defined in `09-microservices/service-catalog.md`.

---

## RF-01 — User Management

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-1.1 | Create accounts for students, drivers, guardians, and administrators with their assigned role | user-management-service, iam-service | HU-USER-004 | High |
| FR-1.2 | Update user data | user-management-service | HU-USER-004 | High |
| FR-1.3 | Activate/deactivate user accounts (deactivation must block system access and prevent assignments) | user-management-service, iam-service | HU-USER-004 | High |
| FR-1.4 | Link one or more students to a guardian account | user-management-service | HU-USER-003 | High |

> **Note:** The account is split in the data model: `Person` data belongs to `user-management-service`;
> the `Profile` (authentication, role, password hash) belongs to `iam-service`. FR-1.1 and FR-1.3 touch both.

---

## RF-02 — Authentication

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-2.1 | Authenticate users with credentials and issue a JWT carrying the role, identification number, school and permissions (RBAC enforced per endpoint) | iam-service | HU-IAM-001 | High |
| FR-2.2 | Sign out and renew the access token with a refresh token (7-day validity) | iam-service | HU-IAM-001 | High |

> **Note:** User accounts are not self-registered. The administrator creates all accounts
> (see FR-1.1). There is no public "Register" flow.

---

## RF-03 — School Route Management

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-3.1 | Create a new route entering its data, ordered stops, and schedules | route-service | HU-ROUTE-001 | High |
| FR-3.2 | Validate route uniqueness before persisting it | route-service | HU-ROUTE-001 | Medium |
| FR-3.3 | Update route data | route-service | HU-ROUTE-001 | Medium |
| FR-3.4 | Delete route data (only when no active trip depends on it) | route-service | HU-ROUTE-001 | Medium |
| FR-3.5 | Assign/unassign a bus to a route (one bus per route, one route per bus) | route-service | HU-ROUTE-005 | Medium |
| FR-3.8 | Create, edit, and activate/deactivate buses (unique plate, capacity > 0) | fleet-service | HU-FLEET-001 | Medium |
| FR-3.6 | Assign/unassign a driver to a bus (a driver is responsible for that bus until reassigned); route coverage is derived from the bus assigned to the route | bus-service | HU-BUS-002 | High |
| FR-3.7 | Assign students to a route indicating their assigned stop, used for both boarding and alighting (the stop must belong to the route) | route-service | HU-ROUTE-008 | High |

> **Decision (FR-3.6 / HU-BUS-002):** The driver is assigned to the bus (`DriverAssignemts`,
> bus-service) and reaches their routes transitively through the bus assigned to the route
> (`RouteBusAssignments`, route-service). No driver→route table exists, and none is needed.

---

## RF-04 — QR Scanning Management (Boarding/Alighting Control)

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-4.1 | Generate an individual QR code for each student, with rotation/expiration policy | iam-service | HU-QR-004 | Medium |
| FR-4.2 | Read the student's QR code to register their boarding (validates the student is assigned to the route) | notification-service | HU-QR-001 | High |
| FR-4.3 | Read the student's QR code to register their alighting (requires an active boarding) | notification-service | HU-QR-002 | High |

---

## RF-05 — Boarding Notifications

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-5.1 | Detect the student's boarding event | notification-service | HU-QR-001 | High |
| FR-5.2 | Automatically send a real-time notification to the guardian with boarding time and the location of the assigned stop | notification-service | HU-NOTIF-001 | High |
| FR-5.3 | Automatically send a real-time notification to the guardian with alighting time and the location of the assigned stop | notification-service | HU-NOTIF-001 | High |

---

## RF-06 — Real-Time Bus Tracking

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-6.1 | Continuously capture the bus GPS location | gps-service | HU-GPS-002 | High |
| FR-6.2 | Display the bus location on an interactive map, updating without manual refresh | gps-service | HU-GPS-002 | High |
| FR-6.3 | Alert on GPS signal loss, showing the last known position with a "no signal" marker | gps-service | HU-GPS-002 | Medium |

> **Note:** FR-6.3 detection is done by gps-service; the alert delivery to the guardian is handled by notification-service.

---

## RF-08 — Incidents

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-8.1 | Report an incident/emergency during a trip with type and optional description | notification-service | HU-INCIDENT-001 | Medium |
| FR-8.2 | Automatically notify the school and the guardians of the students on board | notification-service | HU-INCIDENT-001 | High |

> **Note:** The incident report is modeled as the `Alert` entity in `notification-service` (`AlertType`, `Alert`, `AlertRecipient`).

---

## RF-09 — Route Inquiry

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-9.1 | The guardian views their child's route details (bus, driver, ordered stops, and scheduled times) | route-service | HU-ROUTE-004 | Medium |
| FR-9.2 | The driver views their assigned route with ordered stops and scheduled times in the app | route-service | HU-ROUTE-002 | High |

---

## RF-10 — Personalization

| ID | Requirement | Service | Source (HU) | Priority |
|----|-------------|---------|-------------|----------|
| FR-10.1 | Customize the system colors (theme) | no apply | HU-UI-001 | Low |
| FR-10.2 | Configure the interface in at least four languages | no apply | HU-UI-002 | Low |

> **Note:** RF-10 is part of the product scope but its User Stories are not yet defined.
> They must be added to the backlog (`user-stories.md`) before the traceability matrix can close.

---

## Correlations

- User Stories that originate these FRs → `04-requirements/user-stories.md`
- Traceability FR → HU → Test → Service → `04-requirements/traceability-matrix.md`
- Non-functional constraints that apply to these FRs → `04-requirements/non-functional.md`
- Service responsibilities and data models → `09-microservices/`
- API contracts derived from the FRs' endpoints → `07-api/contracts/openapi/`