# Domain Map — Bounded Contexts

> **What to fill in here:** The domain map is the central DDD (Domain-Driven Design) artifact.
> It defines the system's boundaries and how they relate to each other.
> Build it first with the team and domain experts in an Event Storming session.

## Before filling in this document: Event Storming

**Event Storming** is a collaborative workshop for modeling the domain before writing code.
It lasts 2–4 hours with the whole team (dev + PO + business expert).

**Materials:** Long wall, 4-color sticky notes, markers.

**Standard colors:**
| Color | Represents | Example |
|-------|-----------|---------|
| 🟠 Orange | **Domain events** (something that happened, past tense) | `RouteCreated`, `BoardingRegistered` |
| 🔵 Blue | **Commands** (action that triggers the event) | `CreateRoute`, `RegisterBoarding` |
| 🟡 Yellow | **Actors** (who executes the command) | `Administrator`, `Student`, `Driver` |
| 🩷 Pink | **External systems** or integration points | `VT03F GPS`, `Notification Provider` |

**Session steps:**
1. (30 min) Post all events that occur in the business, in chronological order, on the wall
2. (30 min) Identify which command or actor triggers each event
3. (45 min) Group related events — each group is a candidate Bounded Context
4. (30 min) Draw relationships between Bounded Contexts (who depends on whom)
5. (30 min) Discuss the resulting map and agree on names

**Result:** The session output directly feeds the 3 documents in `02-domain/`:
- Identified events → `domain-events.md`
- Entities and their rules → `entities-and-rules.md`
- Bounded Contexts and their map → this document

---

---

## 1. Domain overview

> One paragraph of context about the business and what problem the system solves.
> Write it without technical terms — it must be readable by a business expert.

```text
Guardian Escolar manages the daily transportation of students to and from school.
It allows schools to organize buses, drivers, routes, stops, students, and families,
while providing control over student boarding and exit through QR codes. The system
also monitors school buses in real time and notifies responsible guardians about
important transportation events, such as student boarding, exit, or loss of GPS signal.
```

---

## 2. Identified Bounded Contexts

A **Bounded Context** is the explicit boundary within which a particular domain model
has consistent meaning. Each bounded context has its own Ubiquitous Language.

> **Signs of a good bounded context:**
> - Has a clear responsible team
> - Has its own database
> - Can be deployed independently
> - The same term in two different contexts can mean different things

### Bounded Context: User Management

| Field | Value |
|-------|-------|
| **Name** | User Management |
| **Responsibility** | Manages people, families, family members, and driver-related information |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `user-management-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | Person, Family, Family Member, Driver, Driver License |

**Context-specific terms (Ubiquitous Language):**

| Term | Meaning in THIS context | Different in another context? |
|------|------------------------|-------------------------------|
| Person | A real person registered in the school transportation system | Yes — Security uses the person's profile |
| Family | A group of people related to a student | Yes — Boarding focuses on the student's transportation relationship |
| Driver | A person who can be associated with transportation operations | Yes — Bus context focuses on the driver assigned to a bus |
| Family Member | A person associated with a family | No |
| Driver License | Information that validates a driver's authorization | No |

---

### Bounded Context: Security

| Field | Value |
|-------|-------|
| **Name** | Security |
| **Responsibility** | Manages authentication, authorization, profiles, roles, permissions, sessions, and security policies |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `security-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | Profile, Role, Permission, Session, Authentication, Authorization |

---

### Bounded Context: School Management

| Field | Value |
|-------|-------|
| **Name** | School Management |
| **Responsibility** | Manages schools, campuses, courses, and course groups |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `school-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | School, Campus, SchoolAdmin |

---

### Bounded Context: Geography

| Field | Value |
|-------|-------|
| **Name** | Geography |
| **Responsibility** | Manages geographic information required by schools and transportation stops |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `geography-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | City, Location, Geographic Reference |

---

### Bounded Context: Bus Management

| Field | Value |
|-------|-------|
| **Name** | Bus Management |
| **Responsibility** | Manages buses, brands, models, drivers, schools, and GPS device associations |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `bus-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | Bus, Brand, Model, Driver, GPS Device, Assignment |

**Context-specific terms (Ubiquitous Language):**

| Term | Meaning in THIS context | Different in another context? |
|------|------------------------|-------------------------------|
| Bus | A school transportation vehicle registered in the system | Yes — Route uses the bus as a route resource |
| Driver | The person assigned to operate a bus | Yes — User Management manages the person's information |
| GPS Device | Tracking hardware associated with a bus | Yes — GPS context manages its technical data and locations |
| Assignment | Relationship between a bus and its operational information | Yes — Route uses assignment specifically for a route |

---

### Bounded Context: Route Management

| Field | Value |
|-------|-------|
| **Name** | Route Management |
| **Responsibility** | Manages school routes, route stops, assigned buses, and students assigned to routes |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `route-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | Route, Stop, Route Stop, Route Assignment, Student Assignment |

**Context-specific terms (Ubiquitous Language):**

| Term | Meaning in THIS context | Different in another context? |
|------|------------------------|-------------------------------|
| Route | A planned sequence of transportation stops for a school | Yes — GPS uses route information for tracking |
| Stop | A predefined place where students can board or exit | Yes — Boarding uses it as the place of a boarding event |
| Route Assignment | Relationship between a route and a bus or student | No |
| Student Assignment | Relationship between a student and a route | Yes — Boarding uses the result for boarding validation |

---

### Bounded Context: GPS Tracking

| Field | Value |
|-------|-------|
| **Name** | GPS Tracking |
| **Responsibility** | Receives, processes, and manages the real-time location information of school buses |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `gps-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | GPS Device, GPS Location, Latitude, Longitude, Speed, Course, GPS Signal, Location Received |

**Context-specific terms (Ubiquitous Language):**

| Term | Meaning in THIS context | Different in another context? |
|------|------------------------|-------------------------------|
| GPS Device | A physical tracking device installed in a bus | Yes — Bus Management treats it as an associated device |
| GPS Location | A geographic position received from the tracking device | Yes — Route uses geographic information differently |
| GPS Signal | The availability of valid location information | No |
| Location Received | A location successfully received from the GPS device | No |

> The GPS context integrates with the VT03F device through TCP communication. The device sends location information such as latitude, longitude, speed, course, and GPS timestamp.

---

### Bounded Context: Boarding

| Field | Value |
|-------|-------|
| **Name** | Boarding |
| **Responsibility** | Controls and records student boarding and exit operations using QR codes |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `boarding-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | QR Code, QR Scan, Boarding, Student, Bus, Stop, On Board, Off Board |

**Context-specific terms (Ubiquitous Language):**

| Term | Meaning in THIS context | Different in another context? |
|------|------------------------|-------------------------------|
| Student | A person authorized to use school transportation | Yes — User Management manages the person's information |
| Boarding | The business event of a student entering or leaving a bus | No |
| QR Code | Identifier used to validate a student's transportation operation | No |
| Stop | The location where the boarding operation occurs | Yes — Route manages the stop as part of a route |
| Bus | The vehicle involved in the boarding operation | Yes — Bus Management manages the vehicle itself |

---

### Bounded Context: Alerts

| Field | Value |
|-------|-------|
| **Name** | Alerts |
| **Responsibility** | Detects and manages relevant transportation alerts generated by system events |
| **Owning team** | Guardian Escolar Development Team |
| **Microservice(s)** | `alert-service` |
| **Database** | SQL Server |
| **Ubiquitous Language** | Alert, Alert Type, Saved Alert, GPS Signal Loss, Route Deviation |

---

## 3. Context Map

The Context Map shows relationships between bounded contexts. Relationships define
how contexts communicate and who holds the "power" in the integration.

```text
                         ┌─────────────────────────┐
                         │   Security Context      │
                         │                         │
                         │ Authentication, Roles,  │
                         │ Permissions, Sessions   │
                         └────────────┬────────────┘
                                      │
                                  U → D
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │  User Management        │
                         │                         │
                         │ People, Families,       │
                         │ Drivers                 │
                         └────────────┬────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                   U → D            U → D            U → D
                     │                │                │
                     ▼                ▼                ▼
              ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
              │   School    │  │    Bus      │  │ Geography   │
              │ Management  │  │ Management  │  │             │
              └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                     │                │                │
                     └────────┬───────┴────────┬───────┘
                              │                │
                            U → D            U → D
                              │                │
                              ▼                ▼
                       ┌─────────────┐  ┌─────────────┐
                       │    Route    │  │     GPS     │
                       │ Management  │  │   Tracking  │
                       └──────┬──────┘  └──────┬──────┘
                              │                │
                              │                │
                              └───────┬────────┘
                                      │
                                    U → D
                                      │
                                      ▼
                              ┌─────────────┐
                              │  Boarding   │
                              │             │
                              │ QR +        │
                              │ Boarding    │
                              └──────┬──────┘
                                     │
                                   U → D
                                     │
                                     ▼
                              ┌─────────────┐
                              │   Alerts    │
                              │             │
                              │ Detection + │
                              │ Management  │
                              └──────┬──────┘
                                     │
                                   U → D
                                     │
                                     ▼
                              ┌─────────────┐
                              │ Notification│
                              │   Channel   │
                              └─────────────┘
```

### Context relationship types

| Type | Symbol | Description | Example |
|------|--------|-------------|---------|
| **Upstream → Downstream** | `U → D` | U provides, D consumes. D depends on U. | Route Management → Boarding |
| **Shared Kernel** | `SK` | Two teams share part of the model | Shared identifiers such as Profile ID |
| **Customer/Supplier** | `C/S` | Supplier (U) negotiates with Customer (D) | Route Management → Boarding |
| **Conformist** | `CONF` | D adopts U's model without negotiating | Legacy GPS integration |
| **Anti-Corruption Layer** | `ACL` | D translates U's model to protect itself | GPS → External Tracking Format |
| **Open Host Service** | `OHS` | U publishes a published protocol | REST API / Event Bus |
| **Published Language** | `PL` | Explicit shared language | Domain Events / API contracts |

### Relationships table

| Context A | Relationship | Context B | Communication channel | Contract |
|-----------|-------------|-----------|----------------------|---------|
| Security | U → D | User Management | REST / Event | OpenAPI / Events |
| User Management | U → D | School Management | Event | Published Event |
| User Management | U → D | Bus Management | Event | Published Event |
| School Management | U → D | Route Management | REST / Event | OpenAPI / Events |
| Geography | U → D | School Management | REST / Event | OpenAPI / Events |
| Geography | U → D | Route Management | REST / Event | OpenAPI / Events |
| Bus Management | U → D | Route Management | REST / Event | OpenAPI / Events |
| Bus Management | U → D | GPS Tracking | Event | Published Event |
| Route Management | U → D | Boarding | Event | `RouteCreated`, `StudentAssignedToRoute`, `RouteStopAdded` |
| GPS Tracking | U → D | Alerts | Event | `GpsLocationReceived`, `GpsSignalLost` |
| Boarding | U → D | Alerts | Event | `BoardingRegistered` |
| Alerts | U → D | Notification | Event | `AlertCreated` |
| VT03F GPS | U → D | GPS Tracking | TCP | GPS device protocol |

---

## 4. Core Domain, Supporting, Generic

DDD classifies subdomains by their strategic value:

| Type | Description | Investment | Example |
|------|-------------|-----------|---------|
| **Core Domain** | Where the business competitive advantage lies. What differentiates us. | MAXIMUM — build, don't buy | Real-time school transportation monitoring and student safety |
| **Supporting Subdomain** | Necessary for the core but not differentiating. Can be outsourced. | MEDIUM | Route and bus management |
| **Generic Subdomain** | Commodity. Off-the-shelf solution exists. | MINIMUM — buy/use OSS | Authentication, notifications |

### Classification of this project's bounded contexts

| Bounded Context | Type | Justification |
|----------------|------|---------------|
| GPS Tracking | Core | Real-time bus tracking is one of the main capabilities that differentiates Guardian Escolar and provides transportation visibility |
| Boarding | Core | QR-based student boarding and exit control directly supports student safety and transportation traceability |
| Route Management | Supporting | Routes are essential for transportation operations but are not the main differentiating capability |
| Bus Management | Supporting | Bus and driver information is necessary to operate transportation services |
| User Management | Supporting | People and family information supports the main transportation processes |
| School Management | Supporting | School information is required to organize transportation |
| Alerts | Supporting | Alerts support the core transportation monitoring and safety processes |
| Geography | Generic | Geographic information such as cities is a common domain capability |
| Security | Generic | Authentication, roles, permissions, and sessions are common capabilities with standard solutions available |

---

## 5. Modeling decisions

### How were these decisions made?

> The bounded contexts were identified from the project's functional requirements,
> database model, domain events, and the migration from the existing monolithic system
> toward independently deployable microservices.

- **Event Storming session:** To be completed with the development team and domain experts
- **Tool used:** Miro / physical whiteboard
- **Map iterations:** v1 — initial domain decomposition, v2 — microservice migration refinement

### Key decisions and discarded alternatives

| Decision | Discarded alternative | Reason |
|----------|----------------------|--------|
| Separate Security from User Management | Keep authentication and user information in one context | Authentication and authorization have different responsibilities from business user management |
| Separate GPS Tracking from Bus Management | Keep GPS logic inside Bus Management | GPS has its own protocol, real-time processing, location history, and signal-loss rules |
| Separate Boarding from Route Management | Manage QR boarding inside Route Management | Boarding represents a different business process with its own events and rules |
| Separate Alerts from GPS and Boarding | Generate notifications directly inside GPS or Boarding | Alerts are a cross-cutting business capability that can consume events from several contexts |
| Separate School Management from Route Management | Keep schools and routes in the same context | School administration and transportation route planning have different business responsibilities |
| Keep Geography as a separate context | Duplicate city information in School and Route | Avoids unnecessary duplication of geographic reference data |
| Use domain events for cross-context notifications | Use direct database access between services | Microservices must not depend on another service's database |
| Keep each bounded context with its own database | Share one database across all services | Independent persistence reduces coupling and allows services to evolve independently |
| Treat the VT03F as an external integration | Put GPS device protocol logic in other contexts | The TCP/device protocol belongs to the GPS Tracking context |
| Keep QR identity inside Boarding | Create a separate QR microservice | The current domain does not justify an independent bounded context only for QR generation |

---

## 6. How to update this map

1. Before adding a new microservice, verify whether it belongs to an existing bounded context.
2. If a context's ubiquitous language is changing, review whether the context should be split.
3. Run an Event Storming session every time the domain changes significantly.
4. The context map MUST be synchronized with the C4 system-level diagram (`05-architecture/overview.md`).

> **Important correlation:** The bounded contexts in this document →
> Microservices in `09-microservices/service-catalog.md` →
> C4 diagrams in `08-uml/` →
> Service separation ADRs in `05-architecture/decisions/`