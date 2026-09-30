# User Stories — Backlog

> **Document status:** Living draft — requirements are being refined and are not evidence
> that the corresponding functionality has been implemented.
>
> Each HU uses the standard format with acceptance criteria in Given/When/Then.
> A story enters a sprint only after refinement and dependency validation.

### How to maintain this backlog

1. The Product Owner updates the story, priority, sprint, and dependencies when scope changes.
2. The service owner updates proposed API/event details when the design is approved.
3. The developer updates the story status and links tests when implementation starts or finishes.
4. A completed story must also update the traceability matrix and affected domain, data, API,
   service, and operational documents.

> Unless a story is explicitly marked **Done**, fields named "Endpoint(s) implemented" and
> "Events generated" describe the intended contract, not a verified implementation.

---

## Backlog status

| Cut | Sprint | Total HUs | Refined | In progress | Completed |
|-----|--------|-----------|---------|-------------|-----------|
| Cut 1 | Sprint 1-2 | 20 | 0 | 0 | 0 |
| Cut 2 | Sprint 3-4 | 0 | 0 | 0 | 0 |

---

## Epics

| ID | Epic | Description |
|----|------|-------------|
| EP-001 | QR Boarding / Alighting | Register student boarding and alighting by scanning their QR code |
| EP-002 | Notifications | Notify guardians about student boarding/alighting and route alerts |
| EP-003 | Route & Fleet Management | Manage routes, buses, stops, and driver/student assignments |
| EP-004 | User Management / Family | Manage users and link students to guardian accounts |
| EP-005 | Live Tracking | Show the school bus location on a map in real time |
| EP-006 | Incidents | Report and notify incidents/emergencies that occur during a trip |
| EP-007 | UI & Personalization | Customize the app theme (colors) and interface language |

---

## User Stories

### HU-IAM-001 — Authentication, accounts, and roles (RBAC) {#HU-IAM-001}

**Epic:** EP-004 (User Management / Family)

> **As** a system user (student, driver, guardian, or administrator)
> **I want** to sign in and access only the features allowed by my role
> **so that** my information and the school's operations are protected.

**Acceptance Criteria:**

```gherkin
Scenario 1: Sign in with valid credentials (happy path)
  Given I have an active account with a role assigned
  When I enter my credentials
  Then the system validates them and issues a JWT token
  And I am able to access only the features allowed by my role (RBAC)

Scenario 2: Invalid credentials (error case)
  Given my credentials are incorrect or the account is deactivated
  When I try to sign in
  Then the system rejects the attempt with the message "Invalid credentials"
  And no token is issued
```

**Technical notes:**

> There is no self-registration: the administrator creates the accounts (HU-USER-004)
> and the system delivers the initial password through a secure channel. The account is
> composed of `Person` (user-management-service) and `Profile` with `Role` (iam-service).
> JWT expires in 1 hour, refresh token in 7 days.

- **Responsible service(s):** iam-service
- **Endpoint(s) implemented:** `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`
- **Events generated:** `SessionStarted`, `SessionEnded`
- **Required permissions:** public (login), authenticated (refresh/logout)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] RBAC matrix defined and validated by the team
- [ ] Initial password flow (generation / secure delivery) documented
- [ ] Remove this section if there are no additional checks

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | High |
| Target sprint | Sprint 1 |
| Dependencies | HU-USER-004 (accounts created by the admin) |

---

### HU-ROUTE-001 — Administrator creates and manages school routes (stops and schedules) {#HU-ROUTE-001}

**Epic:** EP-003 (Route & Fleet Management)

> **As** an administrator
> **I want** to create and edit school routes with their stops in order and their schedules
> **so that** drivers, students, and families have a defined and consistent itinerary.

**Acceptance Criteria:**

```gherkin
Scenario 1: Create a route with stops and schedules (happy path)
  Given the administrator has access to route management
  When they create route R-01 with its ordered stops and schedules
  Then the route is registered with its stops and scheduled times
  And it appears in the route list

Scenario 2: Duplicate route name (error case)
  Given a route with the same name already exists
  When the administrator tries to create it again
  Then the system rejects it with the message "Route already exists"
```

**Technical notes:**

> A route is composed of `Route` (name, target sector), `Stop` (address, coordinates),
> `RouteStop` (ordered stops), `RouteSchedule` (day, direction, and time), and
> `RouteBusAssignments`. Uniqueness is validated by route name.

- **Responsible service(s):** route-service
- **Endpoint(s) implemented:** `POST /api/v1/routes`, `PUT /api/v1/routes/{id}`, `DELETE /api/v1/routes/{id}`, `GET /api/v1/routes`
- **Events generated:** `RouteCreated`, `RouteUpdated`, `RouteDeleted`
- **Required permissions:** administrator (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] School/campus/city master data available (school-service)
- [ ] Stops ordered by itinerary, not by creation order
- [ ] Remove this section if there are no additional checks

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | High |
| Target sprint | Sprint 1 |
| Dependencies | HU-IAM-001 (authentication), HU-USER-004 (admin), school-service master data |

---

### HU-NOTIF-001 — Real-time pickup/drop-off notifications to guardians {#HU-NOTIF-001}

**Epic:** EP-002 (Notifications)

> **As** a parent
> **I want** to receive real-time notifications when the school route picks up or drops off my child
> **so that** I have certainty that they arrived at or left the school safely.

**Acceptance Criteria:**

```gherkin
Scenario 1: Student boards the bus (happy path)
  Given my child is registered on route R-01
  When the driver scans the QR code generated by the system on my child's phone
  Then the boarding (pickup) is registered
  And I receive a real-time notification with the pickup time and stop

Scenario 2: Student alights the bus (happy path)
  Given my child is on the bus of route R-01 returning home
  When the driver scans the QR code generated by the system on my child's phone
  Then the alighting (drop-off) is registered
  And I receive a real-time notification with the drop-off time and location
```

**Technical notes:**

> Notifications are triggered asynchronously by the boarding/alighting events. Delivery
> must be real-time (target p95 under 30s). Reuse the in-app push channel of the mobile app.

- **Responsible service(s):** notification-service
- **Endpoint(s) implemented:** `POST /api/v1/notifications/send`
- **Events generated:** consumes `BoardingRegistered`, `AlightingRegistered`
- **Required permissions:** authenticated guardian (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] In-app push notification channel configured and tested on a real device
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | High |
| Target sprint | Sprint 3 |
| Dependencies | HU-IAM-001 (accounts), boarding registration (pending route story) |

---

### HU-GPS-002 — Real-time bus location on the map {#HU-GPS-002}

**Epic:** EP-005 (Live Tracking)

> **As** a guardian
> **I want** to see the school bus location on a map in real time
> **so that** I know if there are delays or detours on the route.

**Acceptance Criteria:**

```gherkin
Scenario 1: See the bus on the map (happy path)
  Given my child is assigned to route R-01
  When I open the bus map in the application
  Then I see the bus current location on the map in real time
  And the position updates without requiring a manual refresh

Scenario 2: Bus without GPS signal (error case)
  Given the bus loses its GPS signal
  When I check the location
  Then the last known location is shown with a "no signal" marker
```

**Technical notes:**

> Live location is streamed from the GPS service; the map is rendered with Google Maps API.
> Position updates should be received without manual refresh (push/WebSocket/streaming).

- **Responsible service(s):** gps-service
- **Endpoint(s) implemented:** `GET /api/v1/tracking/{routeId}/location`
- **Events generated:** consumes GPS position events from the bus
- **Required permissions:** authenticated guardian (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Google Maps API credentials configured and working
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 8 |
| Priority | Medium |
| Target sprint | Sprint 4 |
| Dependencies | HU-ROUTE-001 (route definition), Google Maps API |

---

### HU-USER-003 — Assign students to a guardian account (managed by admin) {#HU-USER-003}

**Epic:** EP-004 (User Management / Family)

> **As** an administrator
> **I want** to assign one or more students to a guardian's account
> **so that** a guardian can follow up on all their children from a single account.

**Acceptance Criteria:**

```gherkin
Scenario 1: Assign multiple students to a guardian (happy path)
  Given the administrator has access to user management
  When the administrator assigns a student to the guardian's account
  Then the student is linked to the guardian's account
  And the guardian can view that student's information and notifications from their account

Scenario 2: Student already linked to another guardian account (error case)
  Given the student is already linked to another guardian's account
  When the administrator tries to assign the student to a different account
  Then the system rejects the assignment with a "student already associated" error
```

**Technical notes:**

> The assignment is done by an administrator; the relationship is stored in the user-management
> service. The guardian account must already exist to link students to it.

- **Responsible service(s):** user-management
- **Endpoint(s) implemented:** `POST /api/v1/guardians/{id}/students`
- **Required permissions:** administrator (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Link history (audit) recorded when a student is assigned
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | High |
| Target sprint | Sprint 1 |
| Dependencies | HU-IAM-001 (accounts and roles), student records management |

---

### HU-USER-004 — The administrator manages school ecosystem accounts (students, drivers, and parents) {#HU-USER-004}

**Epic:** EP-004 (User Management / Family)

> **As** an administrator
> **I want** to create, edit, and activate/deactivate the accounts of the school's students, drivers, and parents
> **so that** the school can manage the users of its school transport ecosystem.

**Acceptance Criteria:**

```gherkin
Scenario 1: Create a user account (happy path)
  Given the administrator has access to user management
  When the administrator creates an account for a student with valid data
  Then the account is created with the corresponding role
  And the user appears in the user list

Scenario 2: Deactivate an existing account
  Given there is an active driver account
  When the administrator deactivates the account
  Then the account can no longer access the system
  And the driver is no longer available for assignment to a route
```

**Technical notes:**

> The administrator account is created directly by the development team (bootstrap), not by the system.
> Users do not self-register: the administrator creates all student, driver, and parent accounts.
> The initial password is generated by the system (or reset by the admin) and delivered to the user through a secure channel.

- **Responsible service(s):** user-management
- **Endpoint(s) implemented:** `POST /api/v1/users`, `PUT /api/v1/users/{id}`, `PATCH /api/v1/users/{id}/status`
- **Events generated:** `UserCreated`, `UserUpdated`, `UserStatusChanged`
- **Required permissions:** administrator (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Initial password flow (generation/secure delivery) defined
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | High |
| Target sprint | Sprint 1 |
| Dependencies | HU-IAM-001 (accounts and roles) |

---

### HU-NOTIF-005 — Alert when the bus stays stopped too long {#HU-NOTIF-005}

**Epic:** EP-002 (Notifications)

> **As** a parent
> **I want** to receive an alert if the school route stops for longer than usual
> **so that** I know if there is an emergency, traffic jam, or technical problem.

**Acceptance Criteria:**

```gherkin
Scenario 1: Bus stops longer than the allowed time (happy path)
  Given the bus of route R-01 is stopped more than X minutes at a point
  When the configured threshold is exceeded
  Then I receive an alert notifying about the prolonged stop
  And the alert includes the bus location

Scenario 2: Bus resumes before the threshold (no alert)
  Given the bus stops for a few minutes but continues within the allowed time
  When it resumes its journey
  Then no alert is sent to the guardian
```

**Technical notes:**

> The prolonged-stop detection uses the same GPS location stream as HU-GPS-002 plus a
> configurable time threshold. When exceeded, an alert notification is sent to the guardian.

- **Responsible service(s):** notification-service (detection logic), gps-service (location source)
- **Endpoint(s) implemented:** `POST /api/v1/notifications/alert`
- **Events generated:** consumes GPS position events; publishes `ProlongedStopAlert`
- **Required permissions:** authenticated guardian (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Stop time threshold configurable per route, not hard-coded
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Medium |
| Target sprint | Sprint 5 |
| Dependencies | HU-GPS-002 (live location), HU-NOTIF-001 (notification channel) |

---

### HU-QR-001 — Driver scans the student's QR code to register their boarding {#HU-QR-001}

**Epic:** EP-001 (QR Boarding / Alighting)

> **As** a driver
> **I want** to scan the student's QR code when they board the bus
> **so that** the boarding is registered on the route and the parents are notified in real time.

**Acceptance Criteria:**

```gherkin
Scenario 1: Successful boarding (happy path)
  Given the student is assigned to route R-01 with their stop registered
  When the driver scans the student's QR code in the app
  Then the system registers the boarding with the current time and stop
  And publishes the BoardingRegistered event

Scenario 2: Student not assigned to this route (error case)
  Given the QR code belongs to a student assigned to another route
  When the driver scans it in the app
  Then the system rejects the registration with the message "Student not assigned to this route"
```

**Technical notes:**

> The boarding is registered synchronously and its event is published asynchronously
> to trigger the notification to the guardian. The QR code must be readable in low-light
> conditions and the flow must handle brief loss of connectivity (local queue with retry).

- **Responsible service(s):** boarding-service
- **Endpoint(s) implemented:** `POST /api/v1/boarding`
- **Events generated:** `BoardingRegistered`
- **Required permissions:** authenticated driver (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] QR scanning tested on real devices in low-light conditions
- [ ] Offline scenario defined (local queue and retry) and documented
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | High |
| Target sprint | Sprint 2 |
| Dependencies | HU-IAM-001 (accounts and roles), HU-QR-004 (student QR), HU-ROUTE-003 (active trip) |

---

### HU-QR-002 — Driver scans the student's QR code to register their alighting {#HU-QR-002}

**Epic:** EP-001 (QR Boarding / Alighting)

> **As** a driver
> **I want** to scan the student's QR code when they alight at their destination stop
> **so that** the alighting is recorded and the parents know their child arrived safely.

**Acceptance Criteria:**

```gherkin
Scenario 1: Successful alighting (happy path)
  Given the student has an active boarding on the current trip
  When the driver scans their QR code at the destination stop
  Then the system records the alighting with the current time and location
  And publishes the AlightingRegistered event

Scenario 2: Scanning without a previous boarding (error case)
  Given the student has no active boarding on the current trip
  When the driver attempts to register the alighting
  Then the system rejects it with the message "No active boarding for the student"
```

**Technical notes:**

> The alighting can only be registered for a student who has an active boarding on the
> current trip. The event is consumed by the notification service to alert the guardian
> with the drop-off time and location.

- **Responsible service(s):** boarding-service
- **Endpoint(s) implemented:** `POST /api/v1/alighting`
- **Events generated:** `AlightingRegistered`
- **Required permissions:** authenticated driver (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Validation of active boarding before registering the alighting
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 5 |
| Priority | High |
| Target sprint | Sprint 2 |
| Dependencies | HU-QR-001 (boarding), HU-ROUTE-003 (active trip) |

---

### HU-ROUTE-002 — Driver views their assigned route with stops and schedules {#HU-ROUTE-002}

**Epic:** EP-003 (Route & Fleet Management)

> **As** a driver
> **I want** to see my assigned route with its stops, order, and scheduled times in the app
> **so that** I know the exact itinerary and can prepare before starting the trip.

**Acceptance Criteria:**

```gherkin
Scenario 1: Driver with an assigned and active route (happy path)
  Given the driver has an assigned and active route
  When they open "My route" in the app
  Then they see the ordered list of stops with their scheduled times
  And the bus assigned to the route

Scenario 2: Driver without an assigned route (error case)
  Given the driver has no route assigned
  When they open "My route" in the app
  Then they see the message "No route assigned"
```

**Technical notes:**

> The route data comes from the route-service. The endpoint returns the route currently
> assigned to the authenticated driver, including ordered stops, scheduled times, and bus.

- **Responsible service(s):** route-service
- **Endpoint(s) implemented:** `GET /api/v1/routes/current`
- **Events generated:** —
- **Required permissions:** authenticated driver (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Stops sorted by itinerary order, not by creation order
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | High |
| Target sprint | Sprint 2 |
| Dependencies | HU-ROUTE-001 (route definition), HU-BUS-002 (driver assigned to the bus) |

---

### HU-ROUTE-003 — Driver starts and finishes the route trip {#HU-ROUTE-003}

**Epic:** EP-003 (Route & Fleet Management)

> **As** a driver
> **I want** to start and finish the trip of my route from the app
> **so that** the system knows when the route is in operation and notifications are triggered meaningfully.

**Acceptance Criteria:**

```gherkin
Scenario 1: Start the trip (happy path)
  Given the driver has an assigned route valid for the current schedule
  When the driver taps "Start trip"
  Then the system marks the trip as active
  And publishes the TripStarted event

Scenario 2: Finish the trip
  Given the trip is active
  When the driver taps "Finish trip"
  Then the system closes the trip and validates that there are no pending alightings
  And publishes the TripEnded event

Scenario 3: Start a second concurrent trip (error case)
  Given the bus already has an active trip
  When the driver attempts to start a new trip
  Then the system rejects it with the message "There is already an active trip for this bus"
```

**Technical notes:**

> A bus can only have one active trip at a time. Trip lifecycle events signal the
> boarding-flow and notification services when the route is operational.

- **Responsible service(s):** route-service
- **Endpoint(s) implemented:** `POST /api/v1/trips/start`, `POST /api/v1/trips/end`
- **Events generated:** `TripStarted`, `TripEnded`
- **Required permissions:** authenticated driver (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Block of concurrent active trips per bus
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Medium |
| Target sprint | Sprint 2 |
| Dependencies | HU-ROUTE-002 (assigned route view) |

---

### HU-INCIDENT-001 — Driver reports an incident or emergency during the trip {#HU-INCIDENT-001}

**Epic:** EP-006 (Incidents)

> **As** a driver
> **I want** to report an incident or emergency during the trip
> **so that** the school and the parents of the students on board are notified quickly.

**Acceptance Criteria:**

```gherkin
Scenario 1: Successful report (happy path)
  Given the driver is on an active trip
  When the driver reports an incident selecting a type and an optional description
  Then the system records the incident with the current trip and location
  And notifies the school and the parents of the students on board

Scenario 2: Report outside an active trip (error case)
  Given the driver has no active trip
  When the driver attempts to report an incident without selecting a trip
  Then the system requires the trip as a mandatory field and rejects the report
```

**Technical notes:**

> The incident type list must be configurable by the school. The report attaches the GPS
> location at the moment of the event and triggers an alert to guardians of students on board.

- **Responsible service(s):** incident-service
- **Endpoint(s) implemented:** `POST /api/v1/incidents`
- **Events generated:** `IncidentReported`
- **Required permissions:** authenticated driver (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Configurable incident types (not hard-coded)
- [ ] GPS location attached to the report
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Medium |
| Target sprint | Sprint 5 |
| Dependencies | HU-ROUTE-003 (active trip), HU-GPS-002 (location source) |

---

### HU-ROUTE-004 — Guardian views the details of their child's route {#HU-ROUTE-004}

**Epic:** EP-003 (Route & Fleet Management)

> **As** a guardian
> **I want** to see the details of my child's route, including schedules, stops, bus, and driver
> **so that** I know when and where to pick them up or drop them off with certainty.

**Acceptance Criteria:**

```gherkin
Scenario 1: Child with an assigned route (happy path)
  Given my child is linked to my account and has an assigned route
  When I open the route details of my child
  Then I see the bus, the driver, the stops, and the scheduled times

Scenario 2: Child without an assigned route (error case)
  Given my child has no route assigned yet
  When I open the route details of my child
  Then I see the message "No route assigned yet"
```

**Technical notes:**

> The guardian can only view routes of students linked to their account. The endpoint
> returns the route configuration of the student, not the live position (see HU-GPS-002).

- **Responsible service(s):** route-service
- **Endpoint(s) implemented:** `GET /api/v1/students/{studentId}/route`
- **Events generated:** —
- **Required permissions:** authenticated guardian (JWT), only for linked students

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Authorization check that the student is linked to the requesting guardian
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 2 |
| Priority | Medium |
| Target sprint | Sprint 3 |
| Dependencies | HU-USER-003 (student-linked to guardian), HU-ROUTE-001 (route definition) |

---

### HU-QR-004 — Student views their personal QR code in the mobile app {#HU-QR-004}

**Epic:** EP-001 (QR Boarding / Alighting)

> **As** a student
> **I want** to see my personal QR code in the mobile app
> **so that** the driver can scan it when I board and alight from the bus.

**Acceptance Criteria:**

```gherkin
Scenario 1: View a valid QR code (happy path)
  Given the student has an active account
  When the student opens the "My QR" section in the app
  Then they see the generated QR code with a unique identifier
  And the screen shows their name for visual verification

Scenario 2: QR not available (error case)
  Given the student's QR code has expired or the student has been deactivated
  When the student attempts to view their QR code
  Then the app shows the message "QR not available"
```

**Technical notes:**

> The QR code encodes a unique student identifier that the boarding-service resolves.
> It must support rotation/expiration and be regenerated when credentials are replaced.

- **Responsible service(s):** student-service
- **Endpoint(s) implemented:** `GET /api/v1/students/{studentId}/qr`
- **Events generated:** —
- **Required permissions:** authenticated student (JWT), only their own QR code

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] QR rotation/expiration policy defined and implemented
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 2 |
| Priority | Medium |
| Target sprint | Sprint 1 |
| Dependencies | HU-IAM-001 (accounts and roles), HU-USER-004 (student account) |

---

### HU-FLEET-001 — Administrator manages the bus fleet {#HU-FLEET-001}

**Epic:** EP-003 (Route & Fleet Management)

> **As** an administrator
> **I want** to create, edit, and activate/deactivate buses in the fleet
> **so that** the fleet stays up to date and ready for route assignment.

**Acceptance Criteria:**

```gherkin
Scenario 1: Create a bus (happy path)
  Given the administrator has access to fleet management
  When they create a bus with a valid plate and capacity
  Then the bus is registered with status "Available"
  And it appears in the bus list

Scenario 2: Duplicate plate (error case)
  Given a bus with plate "ABC-123" already exists
  When the administrator tries to create another bus with the same plate
  Then the system rejects it with the message "Plate already exists"
```

**Technical notes:**

> The bus plate must be unique and the capacity greater than zero. A bus can be
> assigned to one route at a time (handled by route-service). Assigning an inactive
> bus is not allowed.

- **Responsible service(s):** fleet-service
- **Endpoint(s) implemented:** `POST /api/v1/buses`, `PUT /api/v1/buses/{id}`, `PATCH /api/v1/buses/{id}/status`
- **Events generated:** `BusCreated`, `BusUpdated`, `BusStatusChanged`
- **Required permissions:** administrator (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Unique plate constraint enforced at the data level
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | Medium |
| Target sprint | Sprint 2 |
| Dependencies | HU-ROUTE-001 (route definition) |

---

### HU-ROUTE-005 — Administrator assigns a bus to a route {#HU-ROUTE-005}

**Epic:** EP-003 (Route & Fleet Management)

> **As** an administrator
> **I want** to assign a bus to a route
> **so that** every route has an available bus for its operation.

**Acceptance Criteria:**

```gherkin
Scenario 1: Assign a bus to a route (happy path)
  Given an active bus exists and route R-01 has no bus assigned
  When the administrator assigns the bus to route R-01
  Then the bus is linked to the route
  And the bus status changes to "On route"

Scenario 2: Route already has a bus (error case)
  Given route R-01 already has an active bus assigned
  When the administrator tries to assign a different bus to route R-01
  Then the system rejects it with the message "The route already has a bus assigned"
```

**Technical notes:**

> A bus can only be assigned to one route at a time. The assignment is stored in
> `RouteBusAssignments` (route-service). The bus must be active to be assigned.

- **Responsible service(s):** route-service
- **Endpoint(s) implemented:** `PUT /api/v1/routes/{routeId}/bus`
- **Events generated:** `BusAssignedToRoute`
- **Required permissions:** administrator (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] 1:1 invariant: a bus is assigned to a single route at a time
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 2 |
| Priority | Medium |
| Target sprint | Sprint 2 |
| Dependencies | HU-FLEET-001 (bus fleet), HU-ROUTE-001 (route definition) |

---

### HU-BUS-002 — Administrator assigns a driver to a bus {#HU-BUS-002}

**Epic:** EP-003 (Route & Fleet Management)

> **As** an administrator
> **I want** to assign and unassign a driver to a bus
> **so that** each bus has a responsible driver and the routes covered by that bus are served by that driver.

**Acceptance Criteria:**

```gherkin
Scenario 1: Successful assignment (happy path)
  Given an active driver exists and a bus has no driver assigned
  When the administrator assigns the driver to the bus
  Then the bus is registered with that driver as responsible
  And the driver sees the routes covered by their bus in the app (HU-ROUTE-002)

Scenario 2: Driver already responsible for another bus (error case)
  Given the driver is already the responsible driver of another bus
  When the administrator attempts to assign the driver to a different bus
  Then the system rejects the assignment with the message "Driver already assigned to a bus"
```

**Technical notes:**

> The bus is the assignment anchor: a driver is responsible for one bus at a time, until the
> administrator reassigns or unassigns them (`DriverAssignemts`, bus-service). The driver reaches
> their routes transitively through the bus assigned to the route (`RouteBusAssignments`,
> route-service); there is no driver→route assignment table. Inactive drivers cannot be assigned.

- **Responsible service(s):** bus-service
- **Endpoint(s) implemented:** `PUT /api/v1/buses/{busId}/driver`, `DELETE /api/v1/buses/{busId}/driver`
- **Events generated:** `DriverAssignedToBus`, `DriverUnassignedFromBus`
- **Required permissions:** administrator (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] 1:1 invariant: a driver is responsible for a single bus at a time
- [ ] Assignment changes recorded for audit (audit-service)

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | High |
| Target sprint | Sprint 2 |
| Dependencies | HU-USER-004 (driver accounts), HU-FLEET-001 (bus fleet) |

---

### HU-ROUTE-008 — Administrator assigns students to a route indicating their stop {#HU-ROUTE-008}

**Epic:** EP-003 (Route & Fleet Management)

> **As** an administrator
> **I want** to assign students to a route indicating their boarding and alighting stop
> **so that** the system knows whom to expect, at which stop, and at what time.

**Acceptance Criteria:**

```gherkin
Scenario 1: Successful assignment (happy path)
  Given the student exists and route R-01 is active
  When the administrator assigns the student with their boarding and alighting stops
  Then the student is linked to the route
  And the guardian can see the child's route (HU-ROUTE-004)

Scenario 2: Stop that does not belong to the route (error case)
  Given the administrator selects a stop that is not on route R-01
  When the administrator attempts to complete the assignment
  Then the system rejects it with the message "The stop does not belong to this route"
```

**Technical notes:**

> The selected stops must belong to the route. A student can only have one active route
> at a time. The assignment enables the guardian and the QR boarding flow.

- **Responsible service(s):** route-service
- **Endpoint(s) implemented:** `POST /api/v1/routes/{routeId}/students`
- **Events generated:** `StudentAssignedToRoute`
- **Required permissions:** administrator (JWT)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Validation that stops belong to the route
- [ ] Uniqueness of one active route per student
- [ ] Additional checks reviewed by the service owner

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 3 |
| Priority | High |
| Target sprint | Sprint 2 |
| Dependencies | HU-ROUTE-001 (route definition), HU-USER-003/004 (student accounts) |

---

### HU-UI-001 — User customizes the app theme (colors) {#HU-UI-001}

**Epic:** EP-007 (UI & Personalization)

> **As** a user (student, driver, guardian, or administrator)
> **I want** to customize the theme colors of the app
> **so that** the application matches my preferences and the school's branding.

**Acceptance Criteria:**

```gherkin
Scenario 1: Change the theme color (happy path)
  Given I have an active account
  When I select a new color for the theme
  Then the change is applied to all screens of the app

Scenario 2: The preference persists (happy path)
  Given I selected a theme color
  When I close and reopen the app
  Then the selected color is kept
```

**Technical notes:**

> This is a frontend-only concern: no backend service owns it. The theme is applied
> by the app base (web admin and mobile apps) and the preference is stored on the
> client side (local settings of the user's device).

- **Responsible service(s):** Frontend (web admin and mobile apps) — no backend service
- **Endpoint(s) implemented:** none
- **Events generated:** none
- **Required permissions:** authenticated user (any role)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] Theme contrast passes WCAG accessibility checks
- [ ] Remove this section if there are no additional checks

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 2 |
| Priority | Low |
| Target sprint | Sprint 5 |
| Dependencies | HU-IAM-001 (authentication) |

---

### HU-UI-002 — User chooses the interface language {#HU-UI-002}

**Epic:** EP-007 (UI & Personalization)

> **As** a user (student, driver, guardian, or administrator)
> **I want** to choose the interface language among at least four supported languages
> **so that** I can use the app in my preferred language.

**Acceptance Criteria:**

```gherkin
Scenario 1: Select a supported language (happy path)
  Given I have an active account and the app supports at least four languages
  When I select one of the supported languages
  Then the interface labels are loaded from that language's dictionary

Scenario 2: Default language on first use (happy path)
  Given I have no stored language preference
  When I open the app for the first time
  Then the interface is shown in the default language
```

**Technical notes:**

> This is a frontend-only concern: no backend service owns it. Each app (web admin
> and mobile) ships its i18n dictionaries and resolves the active language on the
> client side; the preference is stored per device.

- **Responsible service(s):** Frontend (web admin and mobile apps) — no backend service
- **Endpoint(s) implemented:** none
- **Events generated:** none
- **Required permissions:** authenticated user (any role)

**Definition of Done (DoD):**

> This HU can only be closed when it meets the team's full DoD.
> See: [`00-governance/definition-of-done.md`](../00-governance/definition-of-done.md)

**Additional checks specific to this HU (if applicable):**
- [ ] All four language dictionaries reviewed by a native speaker
- [ ] Remove this section if there are no additional checks

**Estimation and priority:**

| Field | Value |
|-------|-------|
| Story Points | 2 |
| Priority | Low |
| Target sprint | Sprint 5 |
| Dependencies | HU-IAM-001 (authentication) |

---

## Rules for writing HUs

### 1. The role matters
Do not write "As a user" — that says nothing. Use the specific role:
```
✓ As a system administrator
✓ As a registered customer
✓ As an inventory operator
✗ As a user
✗ As a person
```

### 2. The benefit justifies the work
The "so that" must describe a business benefit, not redescribe the action:
```
✓ so that I can manage my orders without calling support
✗ so that I can see my orders (this only describes the feature)
```

### 3. ACs are verifiable
Each AC must be verifiable manually or automatable as a test:
```
✓ Then the system shows a message "Order #123 confirmed"
✓ Then the confirmation email arrives in less than 30 seconds
✗ Then the system works well (not verifiable)
✗ Then the user is satisfied (not verifiable)
```

### 4. One HU = one unit of value
If the HU has 15 ACs, it is probably 3 HUs.
The team must be able to complete it in one sprint (maximum 2 weeks).

---

## Ready-to-copy HU template

```markdown
### HU-00X — [Name] {#HU-00X}

**Epic:** EP-00X

> **As** [role]
> **I want** [action]
> **so that** [benefit]

**Acceptance Criteria:**

\```gherkin
Scenario 1: [name]
  Given [context]
  When  [action]
  Then  [result]
\```

| Field | Value |
|-------|-------|
| Story Points | |
| Priority | |
| Target sprint | |
| Status | Backlog |
| Dependencies | |
```

---

## Correlations

- Full template with DoD checklist → `04-requirements/_template-hu.md`
- Non-functional requirements → `04-requirements/non-functional.md`
- Traceability matrix → `04-requirements/traceability-matrix.md`
- API contracts derived from these HUs → `07-api/contracts/openapi/`
