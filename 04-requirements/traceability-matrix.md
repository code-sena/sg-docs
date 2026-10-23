# Traceability Matrix

> Traceability connects every line of code to its business justification.
> It allows answering: "Why does this function exist?" and "Which HU covers this part of the system?"
> It also identifies: unimplemented requirements and code without a requirement (possible technical debt).

---

## How to use this matrix

```
Requirement → HU → Test Case → Implementation → Service

If a requirement has no HU: it is not planned
If a HU has no test case: it has no completeness criterion
If a test case has no implementation: there is test technical debt
If there is code without an HU: possible gold-plating or bug introduced without a story
```

> The "Tests that verify it" column names the **existing** automated test files, verified against
> the source tree at the time of writing. A ⚠️ marks a requirement whose implementation exists but
> whose test coverage is partial or missing — those entries are also listed under "Identified gaps".

---

## FR → HU → Test → Service matrix

| FR ID | FR Description | HU(s) | Tests that verify it | Service | Status |
|-------|---------------|-------|---------------------|---------|--------|
| FR-1.1 | Create accounts for students, drivers, guardians, and administrators with their assigned role | HU-USER-004 | user-management `Shared/UserCampusCreationTests.cs` (create student, driver and guardian with campus), `Shared/RoleFilteredListTests.cs`; iam `CreateProfileSchoolAssociationTest.java`; web `students.spec.ts`, `drivers.spec.ts`, `guardians.spec.ts`, `admins.spec.ts` | user-management-service, iam-service | ✅ Done |
| FR-1.2 | Update user data | HU-USER-004 | user-management `Family/UpdateFamilyServiceTests.cs`, `Shared/PersonPhoneTests.cs`, `Shared/PersonUpdateTests.cs` and `Shared/PersonDeleteTests.cs` (PUT and DELETE exercised for the four roles — student, driver, parent and admin; the admin case also asserts `admin.school.updated`); web `update-information.spec.ts` | user-management-service | ✅ Done |
| FR-1.3 | Activate/deactivate user accounts (deactivation must block system access and prevent assignments) | HU-USER-004 | user-management `Shared/ChangePersonStatusServiceTests.cs`; iam `UpdateProfileStatusServiceTest.java`, `PersonStatusChangedConsumerTest.java` | user-management-service, iam-service | ✅ Done (status-change endpoint in user-management; iam-service reactivates/deactivates on user.status.changed) |
| FR-1.4 | Link one or more students to a guardian account | HU-USER-003 | user-management `Family/RegisterFamilyServiceTests.cs`, `GetFamilyServiceTests.cs`, `UpdateFamilyServiceTests.cs`, `DeleteFamilyServiceTests.cs`, `ListFamilyServiceTests.cs`, `SearchFamilyServiceTests.cs`; mobile `familyService.test.mjs` | user-management-service | ✅ Done |
| FR-2.1 | Authenticate users with credentials and issue a JWT carrying the role, identification number, school and permissions (RBAC enforced per endpoint) | HU-IAM-001 | iam `LoginServiceTest.java` (valid credentials, unknown email, wrong password, inactive account); missing: a test for endpoint-level RBAC enforcement | iam-service | ✅ Done (JWT carries permissions; every service enforces them from the gateway headers) |
| FR-2.2 | Sign out and renew the access token with a refresh token (7-day validity) | HU-IAM-001 | iam `RefreshTokenServiceTest.java` (valid, expired, orphaned and deactivated); ⚠️ the documented 7-day refresh / 1-hour access lifetimes do not match the code (30 days / 15 minutes) — see gaps | iam-service | ⚠️ Done with a requirement deviation |
| FR-3.1 | Create a new route entering its data, ordered stops, and schedules | HU-ROUTE-001 | route `Route/CreateRouteServiceTests.cs`, `Route/CreateRouteScheduleServiceTests.cs` | route-service | ✅ Done (routes, ordered stops and schedules write endpoints) |
| FR-3.2 | Validate route uniqueness before persisting it | HU-ROUTE-001 | route `Route/CreateRouteServiceTests.cs` | route-service | ✅ Done |
| FR-3.3 | Update route data | HU-ROUTE-001 | route `Route/UpdateRouteServiceTests.cs` | route-service | ✅ Done |
| FR-3.4 | Delete route data (only when no active trip depends on it) | HU-ROUTE-001 | route `Route/DeleteRouteServiceTests.cs` | route-service | ✅ Done (delete guard rejects routes with an active trip) |
| FR-3.5 | Assign/unassign a bus to a route (one bus per route, one route per bus) | HU-ROUTE-005 | route `Route/AssignBusToRouteServiceTests.cs`, `Route/UnassignBusFromRouteServiceTests.cs` | route-service | ✅ Done (assign and unassign) |
| FR-3.8 | Create, edit, and activate/deactivate buses (unique plate, capacity > 0) | HU-FLEET-001 | fleet `Application/CreateBusServiceTests.cs`, `Domain/BusTests.cs`, `Application/SearchBusesServiceTests.cs`, `Application/BusViewFieldsTests.cs`, `Application/ListBusesTenantFilterTests.cs`; web `buses.service.spec.ts` (PATCH /buses/{id}/status), `buses.spec.ts` | fleet-service | ✅ Done (create/edit plus admin activate/deactivate; PATCH /fleet/api/buses/{id}/status reachable through the gateway — GuardianEscolar PR #109 merged) |
| FR-3.6 | Assign/unassign a driver to a bus (a driver is responsible for that bus until reassigned); route coverage is derived from the bus assigned to the route | HU-BUS-002 | fleet `Application/AssignDriverToBusServiceTests.cs`, `Application/GetBusAssignedToDriverServiceTests.cs` | fleet-service | ✅ Done (assign/unassign via `PUT`/`DELETE /api/buses/{id}/driver` in fleet-service, with the driver's bus reachable at `GET /api/buses/assigned/{profileId}`; the driver name is resolved over gRPC against iam-service, which joins `UserManagement.Person` — the old call to the wrong service was removed in fleet PR #19) |
| FR-3.7 | Assign students to a route indicating their assigned stop, used for both boarding and alighting (the stop must belong to the route) | HU-ROUTE-008 | route `Route/AssignStudentToRouteServiceTests.cs`, `Route/GetStudentStopOnRouteServiceTests.cs` | route-service | ✅ Done |
| FR-4.1 | Generate an individual QR code for each student (encodes the student identifier, resolved on scan) | HU-QR-004 | mobile `notificationApi.test.mjs` (the credential the QR screen requests from ms-notification: the path comes from the environment, the payload is passed through and the backend error is propagated); ⚠️ the QR screen component itself is not rendered (the mobile repo has no renderer) | mobile-client | ✅ Done (test partial) |
| FR-4.2 | Read the student's QR code to register their boarding (validates the student is assigned to the route) | HU-QR-001 | notification `ProcessScanServiceTests.cs` (the boarding persists the boarding, the alert and the event; a student with no assigned route, a student whose stop is not on the route, an invalid credential and a repeated scan inside the idempotency window are all rejected) | notification-service | ✅ Done (sg-ms-notification#17 merged) |
| FR-4.3 | Read the student's QR code to register their alighting (requires an active boarding) | HU-QR-002 | notification `ProcessScanServiceTests.cs` (the alighting uses the second alert type and the alighting wording; an alighting without an active boarding is rejected) | notification-service | ✅ Done (sg-ms-notification#17 merged) |
| FR-5.1 | Detect the student's boarding event | HU-QR-001 | notification `ProcessScanServiceTests.cs` (the scan detects the boarding, persists the boarding and the alert and publishes the event) | notification-service | ✅ Done (sg-ms-notification#17 merged) |
| FR-5.2 | Automatically send a real-time notification to the guardian with boarding time and the location of the assigned stop | HU-NOTIF-001 | notification `AlertDescriptionBuilderTests.cs` (boarding alert text); route `Route/GetStudentStopOnRouteServiceTests.cs` (stop lookup returns the address and coordinates) | notification-service | ✅ Done (the alert names the stop and adds its address as the location, and the guardian reads it at `GET /api/notifications/guardian`) |
| FR-5.3 | Automatically send a real-time notification to the guardian with alighting time and the location of the assigned stop | HU-NOTIF-001 | notification `AlertDescriptionBuilderTests.cs` (alighting alert text); route `Route/GetStudentStopOnRouteServiceTests.cs` (stop lookup returns the address and coordinates) | notification-service | ✅ Done (the alert names the stop and adds its address as the location, and the coordinate of the assigned stop travels in the `student.scanned` event — sg-ms-route#29 and sg-ms-notification#16) |
| FR-6.1 | Continuously capture the bus GPS location | HU-GPS-002 | gps `GpsFrameDecoderTests.java` (GT06-style frame decoding), `GpsLocationServiceTests.java` (latest position per IMEI); ⚠️ positions are kept **in memory** and never written to `Gps.GpsLocation` | gps-service | 🟡 Partially done (TCP :8842 ingestion + `GET /api/gps/devices/{imei}/location` work; persistence in the relational model is missing) |
| FR-6.2 | Display the bus location on an interactive map, updating without manual refresh | HU-GPS-002 | TBD | gps-service | 🔴 Pending (no streaming/last-position endpoint per route and no map view yet; HU-GPS-002 moved back to *In progress*) |
| FR-6.3 | Alert on GPS signal loss, showing the last known position with a "no signal" marker | HU-GPS-002 | TBD | gps-service, notification-service | 🔴 Pending (no signal-loss detection in `sg-ms-gps`; `GET /api/gps/devices/{imei}/connected` is the only availability probe) |
| FR-8.1 | Report an incident/emergency during a trip with type and optional description | HU-INCIDENT-001 | notification `ReportIncidentServiceTests.cs` (16 cases: the report records the alert for the trip with the driver as reporter, an empty description is accepted, and an unknown type, a missing active trip and an over-long description are all rejected — the type is validated against the `AlertType` catalog); mobile `notificationApi.test.mjs` (the report posts the type and the optional detail and does not invent the trip or the recipients), `incidentErrors.test.mjs` (each rejection maps to a message, and an unknown one still leaves the driver with a generic message), `incidents.test.mjs` (the catalog ids match the seed and the four languages are in sync) | notification-service, mobile-client | ✅ Done (sg-ms-notification#19 and code-sena/sg-db#12 merged; the driver's report screen is GuardianEscolar#113) |
| FR-8.2 | Automatically notify the school and the guardians of the students on board | HU-INCIDENT-001 | notification `ReportIncidentServiceTests.cs` (the school admins and the guardians of the students on board each get an `AlertRecipient` row, a student who already got off is skipped, one guardian with two children on board is notified once, the reporting driver is never a recipient, and an `incident.reported` event carries the recipient list and the students on board), `NotifyIncidentReportedServiceTests.cs` (the event's recipients are mapped to their devices and pushed once, non-recipients are never pushed, and a missing device or a missing description is handled without failing) | notification-service | ✅ Done (the in-app row plus the push: the `incident.reported` consumer delivers it — sg-ms-notification#19 and #20; directory lookups are best-effort; the driver's report screen is GuardianEscolar#113 and it tells the driver how many guardians were notified) |
| FR-9.1 | The guardian views their child's route details (bus, driver, ordered stops, and scheduled times) | HU-ROUTE-004 | route `Route/GetStudentRouteServiceTests.cs`; mobile `familyService.test.mjs` (guardian-to-child resolution) | route-service | ✅ Done (mobile view shows bus, driver, ordered stops and scheduled times — PR #107 merged; a guardian with several linked students currently sees the first one, no child picker yet) |
| FR-9.2 | The driver views their assigned route with ordered stops and scheduled times in the app | HU-ROUTE-002 | route `Route/GetDriverRouteTodayServiceTests.cs`, `Route/ListRouteSchedulesServiceTests.cs`, `Route/GetCurrentRouteServiceTests.cs` | route-service | ✅ Done (mobile driver view shows the assigned bus, ordered stops and scheduled times — PR #107 merged) |
| FR-10.1 | Customize the system colors (theme) | HU-UI-001 | web `core/services/theme-context.spec.ts`, `shared/components/modal/themes/themes.spec.ts`; mobile `themeService.test.mjs` (the provider does not expose a theme until the saved one is read, restores the saved theme, ignores one that no longer exists, persists in `changeTheme`, composes light/dark in `changeColor`, flips light/dark in `toggleTheme`, and survives an AsyncStorage failure) | frontend (web + mobile) | ✅ Done (frontend) |
| FR-10.2 | Configure the interface in at least four languages | HU-UI-002 | web `shared/components/modal/language/language.spec.ts`; four locales shipped in both clients (`public/assets/i18n/{es,en,fr,pt}.json` and `src/core/i18n/{es,en,fr,pt}.json`) | frontend (web + mobile) | ✅ Done (frontend) |

---

## NFR → Validation matrix

| NFR ID | Description | How it is validated | Tool | Status |
|--------|-------------|-------------------|------|--------|
| NFR-001 | Performance: P95 < 300 ms and P99 < 500 ms on the critical endpoints, ≥ 50 RPS per service, boarding → guardian notification P95 < 5 s | Load test of the critical endpoints in staging before production | k6 (JMeter / Locust / Gatling) | 🟡 Specified, not validated |
| NFR-002 | Availability: 99.9% monthly in production (≤ 44 min downtime), 95% in staging, weekly maintenance window | Liveness and readiness health checks plus SLO monitoring | K8s probes + Alertmanager | 🟡 Specified, not validated |
| NFR-003 | Scalability: horizontal auto-scaling above 70% CPU, scale-out in < 2 min, up to 10 instances per service (stateless) | Quarterly load and scaling drill | K8s HPA + load test | 🟡 Specified, not validated |
| NFR-004 | Security: JWT on every private endpoint, bcrypt ≥ 12, TLS 1.2+ in production, OWASP Top 10 review, and Ley 1581/2012 for minors' data | SAST + dependency scanning + DAST in staging | SonarQube / Snyk | 🟡 Specified, not validated (the FR-2.2 TTL deviation is open) |
| NFR-005 | Observability: structured JSON logs with a correlation ID, RED metrics per endpoint, distributed traces, alert in < 5 min on an SLO breach | Smoke test in CI | Serilog / Logback + Prometheus & Grafana + OpenTelemetry & Jaeger | 🟡 Specified, not validated |
| NFR-006 | Maintainability: coverage ≥ 80% (≥ 90% in the domain), cyclomatic complexity ≤ 10, technical debt < 1 sprint, build < 5 min | Coverage gate in CI | CI coverage report | 🟡 Specified, not validated |
| NFR-007 | Portability: every service ships as a Docker image, runs on Kubernetes 1.28+, has no host OS dependency, and is configured only through environment variables | Image build in CI | CI | 🟡 Specified, not validated |
| NFR-008 | Disaster recovery: service failure RTO < 2 min / RPO 0, primary DB < 5 min / < 1 s, AZ loss < 15 min / < 5 min, region < 4 h / < 1 h | DR drills | Manual drill | 🟡 Specified, not validated |

> The descriptions mirror `04-requirements/non-functional.md`, which is the source of truth. The ids
> in this table previously drifted from it (004 is **Security**, 007 **Portability**, 008 **Disaster
> Recovery**); they are aligned again. What stays open is *executing* the validations: no load test,
> no SAST/DAST gate and no DR drill have been run yet — see the gap below.

---

## Inverse traceability: HU → FR

| HU | Title | FR(s) it implements | Sprint |
|----|-------|---------------------|--------|
| HU-IAM-001 | Authentication, accounts, and roles (RBAC) | FR-2.1, FR-2.2 | Sprint 1 |
| HU-ROUTE-001 | Administrator creates and manages school routes (stops and schedules) | FR-3.1, FR-3.2, FR-3.3, FR-3.4 | Sprint 1 |
| HU-USER-003 | Assign students to a guardian account (managed by admin) | FR-1.4 | Sprint 1 |
| HU-USER-004 | The administrator manages school ecosystem accounts (students, drivers, and parents) | FR-1.1, FR-1.2, FR-1.3 | Sprint 1 |
| HU-QR-004 | Student views their personal QR code in the mobile app | FR-4.1 | Sprint 1 |
| HU-QR-001 | Driver scans the student's QR code to register their boarding | FR-4.2, FR-5.1 | Sprint 2 |
| HU-QR-002 | Driver scans the student's QR code to register their alighting | FR-4.3 | Sprint 2 |
| HU-ROUTE-002 | Driver views their assigned route with stops and schedules | FR-9.2 | Sprint 2 |
| HU-FLEET-001 | Administrator manages the bus fleet | FR-3.8 | Sprint 2 |
| HU-ROUTE-005 | Administrator assigns a bus to a route | FR-3.5 | Sprint 2 |
| HU-BUS-002 | Administrator assigns a driver to a bus | FR-3.6 | Sprint 2 |
| HU-ROUTE-008 | Administrator assigns students to a route indicating their stop | FR-3.7 | Sprint 2 |
| HU-NOTIF-001 | Real-time pickup/drop-off notifications to guardians | FR-5.2, FR-5.3 | Sprint 3 |
| HU-ROUTE-004 | Guardian views the details of their child's route | FR-9.1 | Sprint 3 |
| HU-GPS-002 | Real-time bus location on the map | FR-6.1, FR-6.2, FR-6.3 | Sprint 4 |
| HU-INCIDENT-001 | Driver reports an incident or emergency during the trip | FR-8.1, FR-8.2 | Sprint 5 |
| HU-UI-001 | User customizes the app theme (colors) | FR-10.1 | Sprint 5 |
| HU-UI-002 | User chooses the interface language | FR-10.2 | Sprint 5 |

---

## Identified gaps (requirements without coverage)

> A gap is: an FR without an HU, or an HU without a test, or a test without implementation.

| Gap type | Description | Required action | Owner | Date |
|----------|-------------|----------------|-------|------|
| Requirement ↔ code deviation | FR-2.2 requires a **7-day** refresh token and HU-IAM-001 a **1-hour** access token (`04-requirements/functional.md`, `non-functional.md`, `user-stories.md`), but `LoginService`, `RefreshTokenService` and the `JwtTokenProvider` default use **30 days / 15 minutes** | Decide which value is authoritative and align the code (or the requirements) | Architect / Dev | 2026-10-15 |
| Missing persistence (RF-06) | `sg-ms-gps` captures positions but stores them in a `ConcurrentHashMap`; the `Gps.GpsLocation` table (with `GpsDeviceId` FK) already exists in the relational model and stays empty. FR-6.1 is therefore only partial and FR-6.2/6.3 cannot start | Add a persistence adapter in `sg-ms-gps` writing to `Gps.GpsLocation`, then build the per-route streaming endpoint and the signal-loss alert | Dev | 2026-10-22 |
| Cross-schema FKs vs stated rule *(resolved)* | `05-architecture/overview.md` (P2) and `06-data/models.md` stated "no cross-schema FKs", but the deployed model has **22** cross-schema foreign keys (`Iam.Profile.PersonId`, `Fleet.Bus.CampuseId`, `Notification.Alert.RouteExecutionId`, …). The DB is the source of truth | ✅ Done — principle P2 reworded to "schema-per-service with controlled cross-schema FKs" and the full model documented in `06-data/models.md` | Architect | 2026-10-22 |
| HU without test | No HU has a full acceptance test, but the unit coverage grew: FR-1.2 now exercises the PUT and DELETE of the four person roles (`Shared/PersonUpdateTests.cs`, `Shared/PersonDeleteTests.cs`), GuardianEscolar's `notificationApi.test.mjs` covers the mobile QR credential (FR-4.1) and `themeService.test.mjs` covers the mobile theme (FR-10.1). What is still missing is component-level rendering: the mobile repo has no renderer (no jest, no React Native Testing Library), so QR/incident/theme *screens* are only covered through the services they call | Define acceptance tests in the `11-quality` phase; add a renderer to the mobile repo if the screens themselves must be covered | QA / Dev | 2026-10-15 |
| Delivery gap (resolved) | FR-8.2 now also **pushes** the incident: the shared `IPushNotifier` port plus the `incident.reported` consumer deliver it to the school and the guardians (sg-ms-notification#20) | — | Dev | 2026-10-15 |
| NFR value not validated | The NFR-001..008 values are defined in `non-functional.md` and mirrored in the matrix above, but none is executed yet: no k6 load test, no SAST/DAST gate and no DR drill | Execute the NFR validations and wire the gates in CI | Architect / DevOps | — |

---

## How to maintain this matrix

1. When an HU is created: add the row in the FR → HU → Test → Service section
2. When a test is written: note the file in the "Tests that verify it" column
3. When an HU is completed: change the status to ✅
4. At each Sprint Planning: review gaps and assign actions

---

## Correlations

- User Stories → `04-requirements/user-stories.md`
- Non-Functional Requirements → `04-requirements/non-functional.md`
- Testing strategy → `11-quality/testing-strategy.md`
- DoD that determines when an HU is Done → `00-governance/definition-of-done.md`
