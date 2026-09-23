# Navigation Map - Guardian Escolar

> Navigation reference for the Guardian Escolar web frontend. This document reflects the routes declared in web frontend application and its child routes.
>
> **Source:** `GuardianEscolar` project, Angular web frontend frontend, and microservices backend (`backend/ms-*`).

---

## Frontend route structure

```text
/                               -> Redirects to /home
├── /home                       -> Public home
├── /auth
│   ├── /login                  -> Sign-in
│   └── /forgot-password        -> Password recovery
│       ├── /email              -> Request recovery by email
│       ├── /code               -> Validate recovery code
│       └── /reset              -> Reset password
│
├── /dashboard-admin            -> Administrator dashboard
├── /admin
│   ├── /usuarios               -> Student/user management (route path mirrors app code)
│   ├── /padres                 -> Parent management
│   ├── /conductores            -> Driver management
│   ├── /familias               -> Family management
│   ├── /buses                  -> Bus management
│   ├── /paradas                -> Stop management
│   ├── /rutas                  -> Route management
│   ├── /informacion            -> ADMIN and SUPER_ADMIN profile information
│   ├── /change-email           -> Email change
│   │   ├── /email              -> Request the associated email change
│   │   ├── /code-first         -> Validate the first code
│   │   ├── /reset              -> Enter the new email
│   │   └── /code-second        -> Validate the final code
│   ├── /change-password        -> Authenticated password change
│   │   ├── /email              -> Request the change
│   │   ├── /code               -> Validate the code
│   │   └── /reset              -> Set the new password
│   └── /change-contact         -> Phone/contact change
│       ├── /telephone          -> Request the assigned phone change
│       ├── /code-first         -> Validate the first code
│       ├── /reset              -> Enter the new phone number
│       └── /code-second        -> Validate the final code
│
├── /dashboard-superadmin       -> Super administrator dashboard
├── /superadmin
│   ├── /admins                 -> Administrator management
│   └── /schools                -> School management
│
├── /contact                    -> Public contact
└── /*                          -> Redirects to /home
```

### Default routes

| Route | Behavior |
|-------|----------|
| `/` | Redirects to `/home` |
| `/auth/forgot-password` | Redirects to `/auth/forgot-password/email` |
| `/admin/change-email` | Redirects to `/admin/change-email/email` |
| `/admin/change-password` | Redirects to `/admin/change-password/email` |
| `/admin/change-contact` | Redirects to `/admin/change-contact/telephone` |
| Undefined route | Redirects to `/home` |

## Screen map

| Screen | Route | Component | Expected role | Backend module |
|--------|-------|-----------|---------------|----------------|
| Home | `/home` | `Home` | Public | — |
| Sign-in | `/auth/login` | `Login` | Public | `Security` (`POST /api/login`) |
| Recovery request | `/auth/forgot-password/email` | `Email` | Public | `Security` |
| Recovery validation | `/auth/forgot-password/code` | `Code` | Public | `Security` |
| Password reset | `/auth/forgot-password/reset` | `Reset` | Public | `Security` |
| Administrator dashboard | `/dashboard-admin` | `DashboardAdmin` | `ADMIN` | `Security` + administration modules |
| Students/users | `/admin/usuarios` | `Students` (app: `Estudiantes`) | `ADMIN` | `UserManagement` (`/api/person`) |
| Parents | `/admin/padres` | `Parents` (app: `Padres`) | `ADMIN` | `UserManagement` |
| Drivers | `/admin/conductores` | `Drivers` (app: `Conductores`) | `ADMIN` | `UserManagement` |
| Families | `/admin/familias` | `Families` (app: `Familia`) | `ADMIN` | `UserManagement` |
| Buses | `/admin/buses` | `Buses` | `ADMIN` | `FleetManagement` (`/api/bus`) |
| Stops | `/admin/paradas` | `Stops` (app: `Paradas`) | `ADMIN` | `RouteManagement` (`/api/stop`) |
| Routes | `/admin/rutas` | `Routes` (app: `Rutas`) | `ADMIN` | `RouteManagement` (`/api/route`) |
| Profile information | `/admin/informacion` | `InformationAdmin` | `ADMIN`, `SUPER_ADMIN` | `Security` / `UserManagement` |
| Email change | `/admin/change-email/*` | `ChangeEmail` + steps | `ADMIN`, `SUPER_ADMIN` | `Security` / `UserManagement` |
| Password change | `/admin/change-password/*` | `ChangePassword` + steps | `ADMIN`, `SUPER_ADMIN` | `Security` |
| Contact change | `/admin/change-contact/*` | `ChangeContact` + steps | `ADMIN`, `SUPER_ADMIN` | `UserManagement` |
| Super administrator dashboard | `/dashboard-superadmin` | `DashboardSuperadmin` | `SUPER_ADMIN` | `Security` + administration modules |
| Administrators | `/superadmin/admins` | `Admins` | `SUPER_ADMIN` | `UserManagement` / `Security` |
| Schools | `/superadmin/schools` | `Schools` | `SUPER_ADMIN` | `SchoolManagement` (`/api/school`) |
| Contact | `/contact` | `Contact` | Public | — |

> The listed roles are the expected functional roles based on the separation of dashboards and menus. The current Angular routing does not declare `canActivate` or other guards; effective protection must be validated or implemented before treating these restrictions as frontend enforcement.

## Backend API route map

The backend is a set of microservices behind the API Gateway (see `09-microservices/service-catalog.md`); legacy microservices backend module layout maps to those services.

| Method | Endpoint | Module | Use |
|--------|----------|--------|-----|
| `POST` | `/api/login` | `Security` | Authentication |
| `GET/POST/PUT/DELETE` | `/api/person` | `UserManagement` | People/users |
| `GET/POST/PUT/DELETE` | `/api/family` | `UserManagement` | Families |
| `GET/POST/PUT/DELETE` | `/api/family-member` | `UserManagement` | Family members |
| `GET/POST/PUT/DELETE` | `/api/driver-license` | `UserManagement` | Driver licenses |
| `GET/POST/PUT/DELETE` | `/api/bus` | `FleetManagement` | Buses |
| `GET/POST/PUT/DELETE` | `/api/route` | `RouteManagement` | Routes |
| `GET/POST/PUT/DELETE` | `/api/stop` | `RouteManagement` | Stops |
| `GET/POST/PUT/DELETE` | `/api/route-bus-assignments` | `RouteManagement` | Bus-to-route assignments |
| `GET/POST/PUT/DELETE` | `/api/route-student-assignments` | `RouteManagement` | Student-to-route assignments |
| `GET/POST/PUT/DELETE` | `/api/school` | `SchoolManagement` | Schools |
| `GET/POST/PUT/DELETE` | `/api/school-campuse` | `SchoolManagement` | Campuses |
| `GET/POST/PUT/DELETE` | `/api/course` | `SchoolManagement` | Courses |
| `GET/POST/PUT/DELETE` | `/api/course-group` | `SchoolManagement` | Course groups |

> The CRUD verbs above correspond to the `ACrudController` base contract. They must be checked against the OpenAPI contracts when they are published.

## Main user flows

### Flow 1 - Authentication

```text
Home (/home)
    |
    | Select sign-in
    v
Login (/auth/login)
    |
    +-- Invalid credentials --> Error message on Login
    |
    +-- Admin role ----------> Administrator dashboard (/dashboard-admin)
    |
    +-- Other role ----------> Home (/home)
```

**Observed implementation:** `Login` calls the authentication service and redirects according to the `roles` response. The current code explicitly checks the `admin` role; other roles return to `/home`.

### Flow 2 - Password recovery

```text
Login (/auth/login)
    |
    v
Email (/auth/forgot-password/email)
    |
    +-- Valid email ----------> Code (/auth/forgot-password/code)
    |
    +-- Invalid email --------> Form validation
                                  |
                                  v
Reset (/auth/forgot-password/reset)
    |
    +-- Reset accepted -------> Login (/auth/login)
```

### Flow 3 - User and transportation administration

```text
Administrator dashboard (/dashboard-admin)
    |
    +--> Users (/admin/usuarios)
    +--> Parents (/admin/padres)
    +--> Drivers (/admin/conductores)
    +--> Families (/admin/familias)
    +--> Buses (/admin/buses)
    +--> Stops (/admin/paradas)
    +--> Routes (/admin/rutas)
    +--> Profile (/admin/informacion)
```

### Flow 4 - Super administration

```text
Super administrator dashboard (/dashboard-superadmin)
    |
    +--> Administrators (/superadmin/admins)
    +--> Schools (/superadmin/schools)
    +--> Profile and data changes (/admin/informacion)
```

### Flow 5 - Profile information changes

```text
Profile information (/admin/informacion)
    |
    | Available to ADMIN and SUPER_ADMIN
    |
    +--> Email change
    |       /admin/change-email/email
    |       -> /code-first -> /reset -> /code-second
    |
    +--> Password change
    |       /admin/change-password/email
    |       -> /code -> /reset
    |
    +--> Contact change
            /admin/change-contact/telephone
            -> /code-first -> /reset -> /code-second
```

## Navigation rules

| Rule | Current behavior |
|------|------------------|
| Root route | `/` redirects to `/home`. |
| Undefined route | The `**` wildcard redirects to `/home`; there is no dedicated 404 screen. |
| Authentication | Login is connected to `AuthService`. No guards are declared in `app.routes.ts`. |
| Authorization | Dashboards and menus functionally separate `ADMIN` and `SUPER_ADMIN`, but no role guards are visible in the current routing. |
| Administrator menu | Exposes users, buses, and profile; parent, driver, family, stop, and route routes exist even though not all appear in the main sidebar. |
| Super administrator menu | Exposes administrators, schools, and profile; the profile also allows email, password, and contact changes through shared `/admin` routes. |
| Cancel/back | Form steps navigate to the previous step or `/admin/informacion`; they use explicit navigation or `Location.back()`. |
| Confirmation | Password reset uses a confirmation component before returning to login. |

## Discrepancies and pending decisions

- `/auth/register` does not exist in the current routing.
- There is no generic `/dashboard`; the application has `/dashboard-admin` and `/dashboard-superadmin`.
- No frontend notification routes are declared.
- There is no dedicated 404 screen: unknown routes return to `/home`.
- There are no `/:id` parameters or explicit detail/edit routes in `app.routes.ts`; current CRUD screens are list or management routes.
- General governance documentation uses `SUPER_ADMIN`, while the frontend explicitly checks `admin` to decide the dashboard. The role contract must be unified.

## Correlations

- Visual design: `12-ux-ui/design-system.md`
- Guardian Escolar design system: `12-ux-ui/design-system-guardian-escolar.md`
- Web frontend: web frontend application
- Backend: `../backend/` (microservices)
- Security and roles: `00-governance/security-policy.md`
- API contracts: `07-api/contracts/openapi/` when available
