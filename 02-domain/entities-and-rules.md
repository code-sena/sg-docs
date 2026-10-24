# Entities, Value Objects, and Business Rules

> **What to document here:** The building blocks of the Guardian Escolar domain following the DDD tactical model.
> This document translates the domain knowledge identified during Event Storming into domain models that can later be implemented in code.

> **Stack note:** Entity, Value Object, Aggregate, and Domain Service are language-independent concepts.
> Code examples are written in pseudo-TypeScript to illustrate the concepts.

---

## Tactical DDD concepts

### Entity

An **Entity** is an object defined by its identity rather than only by its attributes.

Two entities may have the same attributes but are still different entities if they have different IDs.

Examples in Guardian Escolar:

```text
✓ Entity: Person
✓ Entity: Profile
✓ Entity: Family
✓ Entity: School
✓ Entity: Bus
✓ Entity: Route
✓ Entity: Stop
✓ Entity: GpsDevice
✓ Entity: Boarding
✓ Entity: Alert

✗ Not an Entity: Email
✗ Not an Entity: PhoneNumber
✗ Not an Entity: Coordinates
```

---

### Value Object (VO)

A **Value Object** is an object defined by its attributes and has no identity of its own.

Value Objects should be immutable. If their value changes, a new Value Object should be created.

Examples in Guardian Escolar:

```text
✓ Value Object: Email
✓ Value Object: PhoneNumber
✓ Value Object: Coordinates
✓ Value Object: GpsPosition
✓ Value Object: DocumentNumber
✓ Value Object: DateTimeRange
```

---

### Aggregate

An **Aggregate** is a cluster of Entities and Value Objects that must remain consistent as a single business unit.

Each Aggregate has an **Aggregate Root**, which is the main entry point used to modify the Aggregate.

Example:

```text
Route (Aggregate Root)
  ├── RouteStop[]
  └── RouteStudentAssignment[]
```

Another example:

```text
Bus (Aggregate Root)
  └── RouteBusAssignment
```

**Golden rule of the Aggregate:**

> A transaction should not directly modify multiple Aggregates.

When multiple Aggregates need to coordinate, Domain Events can be used. For more complex long-running workflows, a Saga can be introduced.

---

## Business Rules

**Business Rules** are constraints that must always be satisfied by the domain.

They should be protected by the domain model and not depend exclusively on database constraints.

Examples:

```text
INV-001:
A route must belong to a school.

INV-002:
A bus cannot be assigned to the same route more than once.

INV-003:
A boarding record must be associated with a student, a bus, and a stop.

INV-004:
A GPS location must belong to a registered GPS device.

INV-005:
A student assigned to a route must belong to the corresponding school context.

INV-006:
A GPS device must have a unique identifier.

INV-007:
A person document number must be unique.
```

---

# System Entities

## Entity: Person

**Context:** User Management (`user-management-service`)

**Description:** Represents a person registered in the Guardian Escolar system.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated on creation |
| firstName | String | Person's first name | Yes | Cannot be empty |
| lastName | String | Person's last name | Yes | Cannot be empty |
| documentNumber | String | Identification document number | Yes | Must be unique |
| email | Email | Person's email address | Yes | Must have a valid format |
| phone | PhoneNumber | Person's phone number | No | Must have a valid format |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification date | Yes | Updated automatically |

**Invariants:**

```text
INV-PER-001:
The document number must be unique.

INV-PER-002:
First name and last name cannot be empty.

INV-PER-003:
Email must have a valid format.
```

---

## Entity: Family

**Context:** User Management (`user-management-service`)

**Description:** Represents a family group associated with one or more system users.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| name | String | Family name or reference | Yes | Cannot be empty |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification | Yes | Updated automatically |

**Invariants:**

```text
INV-FAM-001:
A family must have a valid identifier.

INV-FAM-002:
A family must have at least one valid family member when activated.
```

---

## Entity: Profile

**Context:** Security (`security-service`)

**Description:** Represents the system profile associated with a person and their assigned role.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| personId | UUID | Associated person | Yes | Must reference a valid person |
| roleId | UUID | Assigned role | Yes | Must reference a valid role |
| status | ProfileStatus | Profile state | Yes | Must be a valid state |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification | Yes | Updated automatically |

**Lifecycle / States:**

```text
[INACTIVE] ──(activate)──▶ [ACTIVE]
                               │
                         (deactivate)
                               ▼
                          [INACTIVE]
```

**Invariants:**

```text
INV-PRO-001:
A profile must reference an existing person.

INV-PRO-002:
A profile must have a valid role.

INV-PRO-003:
An inactive profile cannot start a new authenticated session.
```

---

## Entity: School

**Context:** School Management (`school-service`)

**Description:** Represents a school registered in Guardian Escolar.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| name | String | School name | Yes | Cannot be empty |
| cityId | UUID | Associated city | Yes | Must reference a valid city |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification | Yes | Updated automatically |

**Invariants:**

```text
INV-SCH-001:
A school must have a valid name.

INV-SCH-002:
A school must belong to a valid city.

INV-SCH-003:
A school must have a unique business identity within the system.
```

---

## Entity: Bus

**Context:** Bus Management (`bus-service`)

**Description:** Represents a school bus used to transport students.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| plate | String | Vehicle license plate | Yes | Must be unique |
| driverId | UUID | Assigned driver profile | No | Must reference a valid driver |
| schoolId | UUID | Associated school | Yes | Must reference a valid school |
| gpsDeviceId | UUID | Associated GPS device | No | Must reference a valid GPS device |
| modelId | UUID | Vehicle model | Yes | Must reference a valid model |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification | Yes | Updated automatically |

**Invariants:**

```text
INV-BUS-001:
The bus plate must be unique.

INV-BUS-002:
A bus must belong to a school.

INV-BUS-003:
A driver assigned to a bus must be a valid driver profile.

INV-BUS-004:
A GPS device cannot be assigned to multiple buses simultaneously.
```

---

## Entity: Route

**Context:** Route Management (`route-service`)

**Description:** Represents a school transportation route followed by a bus to transport assigned students.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| name | String | Route name | Yes | Cannot be empty |
| schoolId | UUID | Associated school | Yes | Must reference a valid school |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification | Yes | Updated automatically |

**Lifecycle / States:**

```text
[CREATED] ──(activate)──▶ [ACTIVE]
                             │
                    (deactivate)
                             ▼
                         [INACTIVE]
```

**Invariants:**

```text
INV-ROU-001:
A route must belong to a school.

INV-ROU-002:
A route must have a valid name.

INV-ROU-003:
A route cannot be activated without the required route configuration.

INV-ROU-004:
A route must not contain duplicate stops in the same position.
```

---

## Entity: Stop

**Context:** Route Management (`route-service`)

**Description:** Represents a physical location where students can board or leave a school bus.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| name | String | Stop name | Yes | Cannot be empty |
| address | String | Physical address | Yes | Cannot be empty |
| cityId | UUID | Associated city | Yes | Must reference a valid city |
| schoolId | UUID | Associated school | Yes | Must reference a valid school |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification | Yes | Updated automatically |

**Invariants:**

```text
INV-STP-001:
A stop must have a valid address.

INV-STP-002:
A stop must belong to a valid city.

INV-STP-003:
A stop must belong to a valid school.
```

---

## Entity: GpsDevice

**Context:** GPS Tracking (`gps-service`)

**Description:** Represents a GPS tracking device installed in a school bus.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| imei | String | Device IMEI | Yes | Must be unique |
| deviceType | String | Device model/type | Yes | Must identify a supported device |
| status | GpsDeviceStatus | Device state | Yes | Must be valid |
| createdAt | DateTime | Creation date | Yes | Immutable |
| updatedAt | DateTime | Last modification | Yes | Updated automatically |

**Lifecycle / States:**

```text
[REGISTERED] ──(connect)──▶ [CONNECTED]
                                │
                           (disconnect)
                                ▼
                           [DISCONNECTED]
```

**Invariants:**

```text
INV-GPS-001:
The IMEI must be unique.

INV-GPS-002:
Only registered GPS devices can send valid location data.

INV-GPS-003:
A GPS location must reference a valid GPS device.
```

**Device integration:**

```text
VT03F GPS
    │
    │ TCP
    ▼
GPS Tracking Service
    │
    ▼
GpsDevice
    │
    ▼
GpsLocation
```

---

## Entity: GpsLocation

**Context:** GPS Tracking (`gps-service`)

**Description:** Represents a GPS position received from a tracking device.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| gpsDeviceId | UUID | Source GPS device | Yes | Must reference a valid device |
| latitude | Decimal | Geographic latitude | Yes | Must be between -90 and 90 |
| longitude | Decimal | Geographic longitude | Yes | Must be between -180 and 180 |
| speed | Decimal | Vehicle speed | Yes | Must not be negative |
| course | Decimal | Vehicle direction | No | Valid directional range |
| gpsDateTime | DateTime | Device GPS timestamp | Yes | Must be valid |
| receivedAt | DateTime | Server reception timestamp | Yes | Automatically generated |

**Invariants:**

```text
INV-LOC-001:
Latitude must be between -90 and 90.

INV-LOC-002:
Longitude must be between -180 and 180.

INV-LOC-003:
Speed cannot be negative.

INV-LOC-004:
Every location must reference a registered GPS device.
```

---

## Entity: Boarding

**Context:** Boarding (`boarding-service`)

**Description:** Represents a student's boarding or exit event from a school bus.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| studentId | UUID | Student profile | Yes | Must reference a valid student |
| busId | UUID | Bus used | Yes | Must reference a valid bus |
| stopId | UUID | Stop where the event occurred | Yes | Must reference a valid stop |
| type | BoardingType | Boarding or exit | Yes | Must be a valid type |
| occurredAt | DateTime | Date and time of event | Yes | Must be valid |
| createdAt | DateTime | Record creation date | Yes | Immutable |

**Lifecycle / States:**

```text
[QR_SCANNED]
      │
      ▼
[BOARDING_REGISTERED]
```

**Invariants:**

```text
INV-BRD-001:
A boarding event must reference a valid student.

INV-BRD-002:
A boarding event must reference a valid bus.

INV-BRD-003:
A boarding event must reference a valid stop.

INV-BRD-004:
The boarding type must be either BOARDING or EXIT.

INV-BRD-005:
The boarding event must have a valid timestamp.
```

---

## Entity: Alert

**Context:** Alerts (`alert-service`)

**Description:** Represents a system alert generated from a significant event in Guardian Escolar.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| alertTypeId | UUID | Type of alert | Yes | Must reference a valid alert type |
| busId | UUID | Related bus | Yes | Must reference a valid bus |
| message | String | Alert description | Yes | Cannot be empty |
| createdAt | DateTime | Alert creation date | Yes | Immutable |

**Invariants:**

```text
INV-ALT-001:
Every alert must have a valid alert type.

INV-ALT-002:
Every alert must reference a valid bus.

INV-ALT-003:
The alert message cannot be empty.
```

---

## Entity: RouteBusAssignment

**Context:** Route Management (`route-service`)

**Description:** Represents the assignment of a bus to a school transportation route.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| routeId | UUID | Assigned route | Yes | Must reference a valid route |
| busId | UUID | Assigned bus | Yes | Must reference a valid bus |
| assignedAt | DateTime | Assignment date | Yes | Automatically generated |

**Invariants:**

```text
INV-RBA-001:
A route must not have duplicate bus assignments.

INV-RBA-002:
The assigned bus must belong to a compatible school context.

INV-RBA-003:
The route and bus must both exist before the assignment is created.
```

---

## Entity: RouteStudentAssignment

**Context:** Route Management (`route-service`)

**Description:** Represents the assignment of a student to a school transportation route.

**Attributes:**

| Attribute | Type | Description | Required | Rules |
|-----------|------|-------------|---------|-------|
| id | UUID | Unique identifier | Yes | Auto-generated |
| routeId | UUID | Assigned route | Yes | Must reference a valid route |
| studentId | UUID | Assigned student | Yes | Must reference a valid student |
| assignedAt | DateTime | Assignment date | Yes | Automatically generated |

**Invariants:**

```text
INV-RSA-001:
A student cannot be duplicated in the same route assignment.

INV-RSA-002:
The student must belong to the appropriate school context.

INV-RSA-003:
The route must exist before the assignment is created.
```

---

# System Value Objects

## Value Object: Email

**Context:** User Management / Security

**Description:** Represents a validated email address.

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| value | String | Email address |

**Validation rules:**

```text
- Must contain a valid email structure.
- Cannot contain whitespace.
- The value is normalized to lowercase.
```

**Example:**

```typescript
class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new DomainException('Invalid email format');
    }

    this.value = email.toLowerCase();
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

---

## Value Object: PhoneNumber

**Context:** User Management

**Description:** Represents a validated telephone number.

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| value | String | Phone number |

**Validation rules:**

```text
- Must contain a valid phone number format.
- Must not be empty when the field is required.
- Should be normalized before storage.
```

---

## Value Object: Coordinates

**Context:** GPS Tracking / Route Management

**Description:** Represents a geographic position using latitude and longitude.

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| latitude | Decimal | Geographic latitude |
| longitude | Decimal | Geographic longitude |

**Validation rules:**

```text
- Latitude must be between -90 and 90.
- Longitude must be between -180 and 180.
```

**Example:**

```typescript
class Coordinates {
  constructor(
    readonly latitude: number,
    readonly longitude: number
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new DomainException('Invalid latitude');
    }

    if (longitude < -180 || longitude > 180) {
      throw new DomainException('Invalid longitude');
    }
  }

  equals(other: Coordinates): boolean {
    return (
      this.latitude === other.latitude &&
      this.longitude === other.longitude
    );
  }
}
```

---

## Value Object: DocumentNumber

**Context:** User Management

**Description:** Represents a person's identification document number.

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| value | String | Identification number |

**Validation rules:**

```text
- Cannot be empty.
- Must follow the identification format supported by the system.
- Must be unique at the Person entity level.
```

---

# System Aggregates

## Aggregate: Route Aggregate

**Aggregate Root:** `Route`

**Internal entities:**

- `RouteStudentAssignment` — belongs to the route because student assignments are managed as part of route configuration.
- `RouteStop` — belongs to the route because stops define the route sequence.
- `RouteBusAssignment` — represents the relationship between the route and assigned buses.

**Value Objects:**

- Route name
- Route status
- Stop position/order

**Aggregate invariants:**

```text
AGGR-INV-001:
A route must belong to a school.

AGGR-INV-002:
A route cannot contain duplicate stops in the same position.

AGGR-INV-003:
A student cannot be assigned to the same route more than once.

AGGR-INV-004:
A bus cannot be assigned to the same route more than once.
```

**Why do these objects form an aggregate?**

> A Route and its route configuration must remain consistent. Stops, student assignments, and bus assignments define the operational configuration of a route and are therefore managed through the Route aggregate.

---

## Aggregate: Bus Aggregate

**Aggregate Root:** `Bus`

**Internal entities:**

- `RouteBusAssignment` — represents the route assignments associated with the bus.

**Value Objects:**

- License plate
- Vehicle identification data

**Aggregate invariants:**

```text
AGGR-INV-005:
A bus must have a unique license plate.

AGGR-INV-006:
A bus must belong to a school.

AGGR-INV-007:
A GPS device cannot be simultaneously assigned to multiple buses.
```

**Why do these objects form an aggregate?**

> The Bus represents the operational vehicle used by Guardian Escolar. Its assignments and vehicle information must remain consistent with the bus identity and its school association.

---

## Aggregate: GpsDevice Aggregate

**Aggregate Root:** `GpsDevice`

**Internal entities:**

- `GpsLocation` — represents location information received from the device.

**Value Objects:**

- `Coordinates`
- GPS timestamp

**Aggregate invariants:**

```text
AGGR-INV-008:
A GPS device must have a unique IMEI.

AGGR-INV-009:
A GPS location must belong to a registered GPS device.

AGGR-INV-010:
Latitude and longitude must contain valid geographic values.
```

**Why do these objects form an aggregate?**

> A GPS device is the source of the location information used by the system. The device identity and its received GPS information must remain traceable to the same source.

---

## Aggregate: Boarding Aggregate

**Aggregate Root:** `Boarding`

**Internal entities:**

- No internal entities are currently required.

**Value Objects:**

- `BoardingType`
- Event timestamp

**Aggregate invariants:**

```text
AGGR-INV-011:
A boarding event must reference a student.

AGGR-INV-012:
A boarding event must reference a bus.

AGGR-INV-013:
A boarding event must reference a stop.

AGGR-INV-014:
The boarding type must be valid.
```

**Why does this form an aggregate?**

> A boarding event represents a complete business fact: a specific student boarded or left a specific bus at a specific stop and time. The event must therefore remain consistent as a single unit.

---

# Summary table of tactical building blocks

| Name | Type | Bounded Context | Aggregate Root? |
|------|------|-----------------|-----------------|
| Person | Entity | User Management | Yes |
| Family | Entity | User Management | Yes |
| Profile | Entity | Security | Yes |
| School | Entity | School Management | Yes |
| Bus | Entity | Bus Management | Yes |
| Route | Entity | Route Management | Yes |
| Stop | Entity | Route Management | Yes |
| GpsDevice | Entity | GPS Tracking | Yes |
| GpsLocation | Entity | GPS Tracking | No |
| Boarding | Entity | Boarding | Yes |
| Alert | Entity | Alerts | Yes |
| RouteBusAssignment | Entity | Route Management | No |
| RouteStudentAssignment | Entity | Route Management | No |
| Email | Value Object | User Management / Security | N/A |
| PhoneNumber | Value Object | User Management | N/A |
| Coordinates | Value Object | GPS Tracking | N/A |
| DocumentNumber | Value Object | User Management | N/A |

---

# Domain Services

A **Domain Service** contains business logic that does not naturally belong to a single Entity or Aggregate.

Use a Domain Service when:

- The operation involves multiple Entities or Aggregates.
- The operation would be unnatural inside a single Entity.
- The operation contains domain logic but does not require its own persistent state.

## Route Assignment Service

**Context:** Route Management

Responsible for validating business rules when assigning buses or students to routes.

```typescript
class RouteAssignmentService {

  validateStudentAssignment(
    route: Route,
    studentId: string
  ): void {

    if (route.hasStudent(studentId)) {
      throw new DomainException(
        'The student is already assigned to this route'
      );
    }
  }

  validateBusAssignment(
    route: Route,
    busId: string
  ): void {

    if (route.hasBus(busId)) {
      throw new DomainException(
        'The bus is already assigned to this route'
      );
    }
  }
}
```

---

## GPS Signal Service

**Context:** GPS Tracking

Responsible for evaluating GPS communication conditions and identifying possible signal loss.

```typescript
class GpsSignalService {

  detectSignalLoss(
    lastReceivedAt: Date,
    currentTime: Date,
    thresholdInMinutes: number
  ): boolean {

    const difference =
      currentTime.getTime() - lastReceivedAt.getTime();

    return difference >
      thresholdInMinutes * 60 * 1000;
  }
}
```

This service can generate the domain event:

```text
GpsSignalLost
```

which can then be consumed by the Alerts context.

---

## Boarding Validation Service

**Context:** Boarding

Responsible for validating whether a boarding operation is allowed.

```typescript
class BoardingValidationService {

  validate(
    studentId: string,
    busId: string,
    stopId: string
  ): void {

    if (!studentId) {
      throw new DomainException(
        'A student is required'
      );
    }

    if (!busId) {
      throw new DomainException(
        'A bus is required'
      );
    }

    if (!stopId) {
      throw new DomainException(
        'A stop is required'
      );
    }
  }
}
```

---

# Domain Events related to the tactical model

The Entities and Aggregates can generate Domain Events when meaningful business facts occur.

Examples:

| Event | Aggregate | Context |
|-------|-----------|---------|
| `PersonRegistered` | Person | User Management |
| `FamilyCreated` | Family | User Management |
| `ProfileCreated` | Profile | Security |
| `SessionStarted` | Profile | Security |
| `SchoolCreated` | School | School Management |
| `BusRegistered` | Bus | Bus Management |
| `RouteCreated` | Route | Route Management |
| `RouteBusAssigned` | Route | Route Management |
| `StudentAssignedToRoute` | Route | Route Management |
| `RouteStopAdded` | Route | Route Management |
| `BoardingQrScanned` | Boarding | Boarding |
| `BoardingRegistered` | Boarding | Boarding |
| `GpsDeviceRegistered` | GpsDevice | GPS Tracking |
| `GpsLocationReceived` | GpsDevice | GPS Tracking |
| `GpsSignalLost` | GpsDevice | GPS Tracking |
| `AlertCreated` | Alert | Alerts |

---

# Correlation with code

| Domain artifact | Package / folder in code | File |
|----------------|--------------------------|------|
| Aggregate Root `Person` | `src/domain/person/` | `Person.java` |
| Aggregate Root `School` | `src/domain/school/` | `School.java` |
| Aggregate Root `Bus` | `src/domain/bus/` | `Bus.java` |
| Aggregate Root `Route` | `src/domain/route/` | `Route.java` |
| Aggregate Root `GpsDevice` | `src/domain/gps/` | `GpsDevice.java` |
| Aggregate Root `Boarding` | `src/domain/boarding/` | `Boarding.java` |
| Aggregate Root `Alert` | `src/domain/alert/` | `Alert.java` |
| Value Object `Email` | `src/domain/shared/value-objects/` | `Email.java` |
| Value Object `PhoneNumber` | `src/domain/shared/value-objects/` | `PhoneNumber.java` |
| Value Object `Coordinates` | `src/domain/shared/value-objects/` | `Coordinates.java` |
| Domain Service `RouteAssignmentService` | `src/domain/route/services/` | `RouteAssignmentService.java` |
| Domain Service `GpsSignalService` | `src/domain/gps/services/` | `GpsSignalService.java` |

> **Implementation note:** Guardian Escolar is **polyglot**: each entity lives in the stack of its owning microservice (C# or Java/Spring Boot — see `09-microservices/service-catalog.md`). Java services follow `05-architecture/hexagonal-architecture.md`; C# services use the same ports/adapters layout under each `ms-*` project.

---

## Relationship with the database

The tactical DDD model is not a direct copy of the database.

The database contains persistence structures, while the domain model represents business concepts and rules.

For example:

```text
Database
   │
   ├── Route
   ├── RouteStop
   ├── RouteStudentAssignments
   └── RouteBusAssignments
             │
             ▼
      Route Aggregate
             │
             ├── Route
             ├── RouteStop
             ├── RouteStudentAssignment
             └── RouteBusAssignment
```

The same principle applies to the other bounded contexts.

---

## Important modeling decisions

1. **Security and User Management remain separate contexts.**
   - User Management handles people and families.
   - Security handles authentication, roles, permissions, profiles, and sessions.

2. **GPS Tracking remains separate from Bus Management.**
   - Bus Management manages the vehicle.
   - GPS Tracking manages device communication, location processing, and GPS events.

3. **Boarding remains separate from Route Management.**
   - Routes define where buses operate.
   - Boarding records what happens when a student boards or leaves a bus.

4. **Alerts remain separate from the contexts that generate the events.**
   - GPS and Boarding can generate events.
   - Alerts consumes those events and creates alerts.

5. **QR functionality remains inside Boarding.**
   - The current domain does not justify a separate QR microservice.
   - `StudentQrCodeGenerated` remains a domain event rather than requiring a dedicated QR aggregate.

6. **Each microservice owns its domain data.**
   - Services should not directly modify another service's database.

7. **Domain Events are used for cross-context communication.**
   - This reduces direct coupling between bounded contexts.

---

## Final tactical model

```text
                    Guardian Escolar
                           │
             ┌─────────────┴─────────────┐
             │                           │
       User Management               Security
             │                           │
       Person / Family              Profile / Role
             │
       ┌─────┴─────┐
       │           │
     School       Bus
       │           │
       └─────┬─────┘
             │
           Route
       ┌─────┼─────┐
       │     │     │
    Stops Students Bus
             │
             ▼
         Boarding
             │
             ▼
           Alerts
             ▲
             │
        GPS Tracking
             │
          GpsDevice
             │
        GpsLocation
             │
             ▼
          VT03F
           TCP
```

> See the complete bounded-context relationships in `domain-map.md`.
>
> See the complete list of business events in `domain-events.md`.
>
> See the architectural implementation in `05-architecture/hexagonal-architecture.md`.