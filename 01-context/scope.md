# Guardian Escolar - System Scope

> **Why this document exists:** Scope prevents uncontrolled growth and aligns the expectations of the SENA ADSO academic project. It defines what Guardian Escolar builds now, what is planned, and what is deliberately outside the current delivery.

---

## In Scope

What Guardian Escolar builds and maintains for school transportation in Neiva, Huila, Colombia.

### MVP Features

| # | Feature | Description | Responsible area |
|---|---------|-------------|------------------|
| 1 | Identity and roles | Sign-in, role-aware dashboards, and access for guardians, students, drivers, administrators, and superadmins. | Security / Auth |
| 2 | Family and guardian management | Manage families, guardians, family members, and their relationships with students. | UserManagement |
| 3 | Student management | Register students and associate them with families, routes, stops, and transportation assignments. | UserManagement / RouteManagement |
| 4 | Driver management | Manage drivers and related license information. | UserManagement |
| 5 | Vehicle management | Manage buses and their operational assignments. | FleetManagement |
| 6 | Route and stop management | Create and maintain routes, stops, route stops, and route assignments. | RouteManagement |
| 7 | School management | Manage schools, campuses, courses, and course groups. | SchoolManagement |
| 8 | Route consultation | Allow guardians to consult their students, routes, stops, and assigned transportation information. | Web / Mobile frontend |
| 9 | Monitoring and traceability | Record route activity, vehicle status, boarding/drop-off events, and operational history where supported by the current modules. | RouteManagement / BoardingManagement |
| 10 | Notifications and alerts | Communicate delays, deviations, incidents, route start/end, and boarding/drop-off events. The mobile Notifications view currently uses mock data while the full integration is developed. | AlertManagement / Mobile frontend |
| 11 | Profile and data changes | Allow `ADMIN` and `SUPER_ADMIN` to view and change email, password, and contact information. | Security / UserManagement |
| 12 | Web and mobile access | Provide the Angular web experience and the React + Expo mobile experience. | Frontend teams |

### Included integrations and technical capabilities

| System or capability | Integration type | Purpose |
|----------------------|------------------|---------|
| SQL Server | Database connection | Persist users, schools, families, students, buses, routes, stops, alerts, and assignments (ADR-002). |
| API Gateway + microservices | REST/gRPC | Single entry point exposing auth and CRUD to frontends (ADR-006). |
| Angular web frontend | Application integration | Provide administration, super administration, authentication, profile, and route-management screens. |
| React + Expo mobile frontend | Application integration | Provide the mobile experience for guardians and other mobile users, including notifications. |
| Docker + WSL2 | Development/container tooling | Standardize local development and service execution. |
| Location/GPS source | To be defined | Provide vehicle location and route monitoring data when the provider and contract are confirmed. |
| Notification provider | To be defined | Deliver push or other external notifications when the production integration is confirmed. |

### Environments being built

| Environment | Purpose |
|-------------|---------|
| Local | Development on the team's machines using Docker, WSL2, and the project setup. |
| Development | Integration and feature testing during active development. |
| Staging | Pre-production validation and stakeholder acceptance when configured. |
| Production | Operational deployment when the academic project reaches release readiness. |

---

## Out of Scope

The following items are not part of the currently confirmed MVP implementation.

| # | Out-of-scope item | Reason | Future version? |
|---|-------------------|--------|----------------|
| 1 | Payment collection, billing, or school transportation invoicing | Outside the core safety, monitoring, and management purpose. | Possible future module |
| 2 | Fleet maintenance, fuel, and mechanical workshop management | Not represented as a confirmed user flow or current frontend area. | Possible future version |
| 3 | Academic grading, attendance, or school learning management | Guardian Escolar manages transportation, not the complete academic record. | No current commitment |
| 4 | Public transportation and non-school routes | The domain is limited to school transportation. | No |
| 5 | Guaranteed production GPS provider integration | The location provider and API contract are not confirmed in the current project context. | Yes, after provider definition |
| 6 | Guaranteed production push notification provider | The mobile notification view currently contains mocked data. | Yes |
| 7 | Fully automated emergency response or dispatch | Alerts can communicate incidents, but emergency services and human response remain external. | Requires separate agreement |
| 8 | Biometric identification or facial recognition | Not required for the current transportation safety scope and introduces additional privacy obligations. | Undecided |
| 9 | Multi-country regulatory localization | The initial target is Neiva, Huila, Colombia. | Possible future expansion |

### What another system, provider, or team handles

| Feature | Responsible party | Why it is not owned by Guardian Escolar |
|---------|-------------------|------------------------------------------|
| Internet, GPS, and mobile network availability | Telecommunications and infrastructure providers | The platform can consume location data but cannot guarantee network coverage. |
| Emergency response | Families, schools, transport operators, and public emergency services | Human and institutional response is outside software execution. |
| App stores and device operating systems | Google Play, Apple App Store, Android, and iOS | Distribution and OS capabilities are external platform responsibilities. |
| School policies and transport authorization | Schools and authorized operators | Business and legal decisions belong to the institution. |
| Production infrastructure operations | DevOps or deployment team | The project provides Docker and development configuration, not a final infrastructure agreement. |

---

## Scope assumptions

| # | Assumption | Consequence if false |
|---|------------|---------------------|
| 1 | Families and schools provide correct student, guardian, driver, vehicle, route, and stop data. | Route assignments and safety notifications may be incorrect. |
| 2 | Users have access to a compatible web browser or mobile device. | A separate assisted or offline channel would be required. |
| 3 | SQL Server is available for persistent project data. | Persistence and deployment architecture would need to change. |
| 4 | The API can expose the data required by the Angular and React/Expo frontends. | Frontend flows, contracts, and delivery dates would change. |
| 5 | A GPS/location provider can expose vehicle position and status when monitoring is enabled. | Location features would remain unavailable or use a different source. |
| 6 | Notification delivery is available through a future provider or configured platform service. | Notifications would remain in-app or mocked. |
| 7 | Roles and permissions are defined consistently across frontend and backend. | Unauthorized access and inconsistent dashboards could occur. |
| 8 | The initial deployment targets Neiva, Huila, Colombia. | Data, language, regulatory, and operational assumptions would need review. |

---

## Constraints

| Type | Description |
|------|-------------|
| **Academic** | The project is developed under SENA ADSO, cohort 3145556. |
| **Geographic** | The initial operational context is Neiva, Huila, Colombia. |
| **Technology** | Web frontend: Angular 21; mobile: React + Expo; backend: polyglot microservices (C#, Java) + Kong gateway; database: SQL Server (ADR-002). |
| **Development** | Docker and WSL2 are part of the development and container workflow. |
| **Security** | Student and family data is sensitive. Access control, secure transport, and privacy requirements must be considered. |
| **Regulatory** | Colombian personal-data requirements apply, with additional care for minors' data. |
| **Delivery** | The system is under active development; mocked mobile notifications and unconfirmed external integrations cannot be treated as production-ready. |
| **Process** | Git branches include `develop` and `docs`; commits follow Conventional Commits. |

---

## External dependencies

| Dependency | Team / Provider | Required date | Status |
|-----------|-----------------|---------------|--------|
| SQL Server environment | Backend / DevOps | Before integrated testing | Available in project architecture |
| Docker and WSL2 setup | Development / DevOps | During local setup | Required |
| GPS/location API | External provider or transport operator | Before live vehicle monitoring | To be defined |
| Push notification service | Mobile / DevOps | Before production notifications | To be defined |
| Valid school and transportation data | Schools and transport operators | Before acceptance testing | Required |
| Role and authorization contract | Backend and frontend teams | Before protected release | Requires alignment |

---

## How to update the scope

Scope can change, but every change must be reviewed:

1. Document the proposed change in this file.
2. Identify affected roles, routes, entities, APIs, privacy requirements, and screens.
3. Evaluate schedule, effort, security, data, and operational impact.
4. Obtain approval from the Product Owner and Tech Lead or academic project leadership.
5. Update `03-product/vision.md` and the relevant roadmap items.
6. Create or update user stories in `04-requirements/user-stories.md`.
7. Update the Navigation Map, Design System, API contracts, database documentation, and QA plan when applicable.
8. Record whether the change belongs to the MVP or a future version.

---

## Correlations

- Vision and roadmap: `03-product/vision.md`
- Domain glossary: `01-context/glossary.md`
- System overview: `01-context/overview.md`
- Requirements: `04-requirements/`
- Security policy: `00-governance/security-policy.md`
- UX navigation: `12-ux-ui/navigation-map-guardian-escolar.md`
- UX design system: `12-ux-ui/design-system-guardian-escolar.md`
- Scope-related risks: `15-project-control/risks.md`
