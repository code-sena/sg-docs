# Guardian Escolar - System Overview

## What is Guardian Escolar?

Guardian Escolar is an academic project developed by SENA ADSO, cohort 3145556, for Neiva, Huila, Colombia. It is a web and mobile platform for managing, monitoring, and improving the safety of school transportation.

The platform connects families, students, drivers, administrators, and super administrators around school transportation operations. It centralizes families and guardians, students, vehicles, routes, stops, assignments, notifications, and safety alerts.

## Problem it solves

Families and school operators need reliable information about school transportation. Without a shared platform, it is difficult to know:

- Which route and stop belong to each student.
- Whether a vehicle is active, delayed, or deviating from its route.
- When a student boards or leaves a vehicle.
- How to communicate delays, incidents, and safety events to families.
- Who is responsible for each vehicle, route, assignment, or operational action.

Guardian Escolar addresses this gap with route management, vehicle monitoring, traceability, notifications, and role-based access.

## Main users

| Role | Main responsibilities |
|------|-----------------------|
| Parent/Guardian | View their students, assigned routes and stops, vehicle location/status, notifications, and alerts. |
| Student | Belongs to a family and is associated with routes and stops; participates in boarding and drop-off events. |
| Driver | Operates an assigned vehicle and route, and is associated with route operations and incidents. |
| Administrator | Manages the operational data: users, families, drivers, buses, stops, routes, and related assignments. |
| Superadmin | Has global privileges, including administrator and school management. |

## Core capabilities

- Manage families and guardians.
- Manage students and their family relationships.
- Manage drivers, vehicles, routes, stops, and assignments.
- Allow guardians to consult routes, stops, vehicle location/status, notifications, and alerts.
- Monitor route progress and record operational events.
- Support alerts for delays, deviations, incidents, route start/end, and student boarding/drop-off.
- Provide administration and global super administration dashboards.
- Support profile information, email, password, and contact changes for `ADMIN` and `SUPER_ADMIN`.
- Provide a responsive web frontend and a mobile experience.

## Technology stack

- **Web frontend:** Angular 21.
- **Mobile frontend:** React + Expo.
- **Backend and services:** .NET + C#.
- **Database:** PostgreSQL.
- **Development and containers:** Docker + WSL2.
- **Additional technology under consideration:** .NET MAUI.
- **Repository workflow:** Git, including `develop` and `docs` branches.

## Current status

Guardian Escolar is under active academic development. The web frontend contains public, authentication, administration, super administration, and profile areas. The backend is organized as a modular ASP.NET Core application with modules such as Security, UserManagement, FleetManagement, RouteManagement, SchoolManagement, AlertManagement, and BoardingManagement.

The mobile frontend uses React + Expo. A Notifications view has recently been created with mocked data, search filters, and highlighted notifications. Some integrations and operational monitoring behaviors remain under development or require confirmation through API contracts.

## Product priorities

1. Transportation safety.
2. Route monitoring and traceability.
3. Clear communication with families.
4. Reliable operational management.
5. Ease of use and accessibility.
6. Consistent web and mobile experiences.

## Language and documentation

The product is planned for internationalization in Spanish, English, French, and Portuguese. Project documentation covers UX/UI, Navigation Map, Design System, database, microservices, QA, quality planning, terms and conditions, and the project brochure.

## Correlations

- Scope: `scope.md`
- Domain glossary: `glossary.md`
- Navigation Map: `../12-ux-ui/navigation-map-guardian-escolar.md`
- Design System: `../12-ux-ui/design-system-guardian-escolar.md`
- Product vision: `../03-product/vision.md`
- Security policy: `../00-governance/security-policy.md`
- Backend source: `../../GuardianEscolar/dvlp-back/src/backend/`
- Web frontend source: `../../GuardianEscolar/dvlp-front/dvlp-web/`
