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
| FR-1.2 | Update user data | HU-USER-004 | user-management `Family/UpdateFamilyServiceTests.cs`, `Shared/PersonPhoneTests.cs`; web `update-information.spec.ts`; ⚠️ no test updates a student, driver or parent (`UpdateStudentService`, `UpdateDriverService`, `UpdateParentService` are uncovered) | user-management-service | ✅ Done (tests partial) |
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
| FR-4.1 | Generate an individual QR code for each student (encodes the student identifier, resolved on scan) | HU-QR-004 | ⚠️ no automated test covers the mobile QR screen | mobile-client | ✅ Done (test missing) |
| FR-4.2 | Read the student's QR code to register their boarding (validates the student is assigned to the route) | HU-QR-001 | ⚠️ `ProcessScanService` is uncovered; only `AlertDescriptionBuilderTests.cs` (alert text) exists | notification-service | ✅ Done (test missing) |
| FR-4.3 | Read the student's QR code to register their alighting (requires an active boarding) | HU-QR-002 | ⚠️ `ProcessScanService` is uncovered; only `AlertDescriptionBuilderTests.cs` (alert text) exists | notification-service | ✅ Done (test missing) |
| FR-5.1 | Detect the student's boarding event | HU-QR-001 | ⚠️ `ProcessScanService` is uncovered; only `AlertDescriptionBuilderTests.cs` (alert text) exists | notification-service | ✅ Done (test missing) |
| FR-5.2 | Automatically send a real-time notification to the guardian with boarding time and the location of the assigned stop | HU-NOTIF-001 | notification `AlertDescriptionBuilderTests.cs` (boarding alert text); route `Route/GetStudentStopOnRouteServiceTests.cs` (stop lookup returns the address and coordinates) | notification-service | ✅ Done (the alert names the stop and adds its address as the location, and the guardian reads it at `GET /api/notifications/guardian`) |
| FR-5.3 | Automatically send a real-time notification to the guardian with alighting time and the location of the assigned stop | HU-NOTIF-001 | notification `AlertDescriptionBuilderTests.cs` (alighting alert text); route `Route/GetStudentStopOnRouteServiceTests.cs` (stop lookup returns the address and coordinates) | notification-service | ✅ Done (the alert names the stop and adds its address as the location, and the coordinate of the assigned stop travels in the `student.scanned` event — sg-ms-route#29 and sg-ms-notification#16) |
| FR-6.1 | Continuously capture the bus GPS location | HU-GPS-002 | TBD | gps-service | 🔴 Pending (gps-service not implemented yet) |
| FR-6.2 | Display the bus location on an interactive map, updating without manual refresh | HU-GPS-002 | TBD | gps-service | 🔴 Pending (gps-service not implemented yet) |
| FR-6.3 | Alert on GPS signal loss, showing the last known position with a "no signal" marker | HU-GPS-002 | TBD | gps-service | 🔴 Pending (gps-service not implemented yet) |
| FR-8.1 | Report an incident/emergency during a trip with type and optional description | HU-INCIDENT-001 | TBD | notification-service | 🔴 Pending |
| FR-8.2 | Automatically notify the school and the guardians of the students on board | HU-INCIDENT-001 | TBD | notification-service | 🔴 Pending |
| FR-9.1 | The guardian views their child's route details (bus, driver, ordered stops, and scheduled times) | HU-ROUTE-004 | route `Route/GetStudentRouteServiceTests.cs`; mobile `familyService.test.mjs` (guardian-to-child resolution) | route-service | ✅ Done (mobile view shows bus, driver, ordered stops and scheduled times — PR #107 merged; a guardian with several linked students currently sees the first one, no child picker yet) |
| FR-9.2 | The driver views their assigned route with ordered stops and scheduled times in the app | HU-ROUTE-002 | route `Route/GetDriverRouteTodayServiceTests.cs`, `Route/ListRouteSchedulesServiceTests.cs`, `Route/GetCurrentRouteServiceTests.cs` | route-service | ✅ Done (mobile driver view shows the assigned bus, ordered stops and scheduled times — PR #107 merged) |
| FR-10.1 | Customize the system colors (theme) | HU-UI-001 | web `core/services/theme-context.spec.ts`, `shared/components/modal/themes/themes.spec.ts`; ⚠️ the mobile `ThemeService.js` has no test | frontend (web + mobile) | ✅ Done (frontend) |
| FR-10.2 | Configure the interface in at least four languages | HU-UI-002 | web `shared/components/modal/language/language.spec.ts`; four locales shipped in both clients (`public/assets/i18n/{es,en,fr,pt}.json` and `src/core/i18n/{es,en,fr,pt}.json`) | frontend (web + mobile) | ✅ Done (frontend) |

---

## NFR → Validation matrix

| NFR ID | Description | How it is validated | Tool | Status |
|--------|-------------|-------------------|------|--------|
| NFR-001 | Performance: [value TBD] | TBD | TBD | 🔴 Pending |
| NFR-002 | Availability: [value TBD] | TBD | TBD | 🔴 Pending |
| NFR-003 | Scalability for [N] concurrent users: [value TBD] | TBD | TBD | 🔴 Pending |
| NFR-004 | Legal compliance: [list TBD] | TBD | TBD | 🔴 Pending |
| NFR-005 | Security: [value TBD] | TBD | TBD | 🔴 Pending |
| NFR-006 | Maintainability: [value TBD] | TBD | TBD | 🔴 Pending |
| NFR-007 | Observability: [value TBD] | TBD | TBD | 🔴 Pending |
| NFR-008 | Technical constraints: [list TBD] | TBD | TBD | 🔴 Pending |

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
| HU without test | No HU has a full acceptance test; unit coverage now exists for FR-2.1/2.2 (`LoginServiceTest`, `RefreshTokenServiceTest`) but is partial for FR-1.2 and absent for FR-4.1/4.2/4.3/5.1 (the notification scan flow) and the mobile theme | Define acceptance tests in the `11-quality` phase; add `ProcessScanService` tests first (it is the scan entry point) | QA / Dev | 2026-10-15 |
| NFR without value | NFR-001..008 are still the generic template (values [N] / [list]) | Define values in `non-functional.md` | Architect | — |

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
