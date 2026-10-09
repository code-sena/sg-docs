# Domain Events

> **What to fill in here:** A domain event is a fact that occurred in the Guardian Escolar business domain.
> They are the backbone of asynchronous communication between bounded contexts.
> The name is ALWAYS in past tense and in the ubiquitous language of the domain.

---

## What is a domain event?

A **Domain Event** communicates that something important occurred in the Guardian Escolar business domain.
It is an immutable message that describes a fact that has already happened.

```
✓ PersonRegistered
✓ FamilyCreated
✓ RouteCreated
✓ BoardingRegistered
✓ GpsLocationReceived
✓ AlertCreated

✗ RegisterPerson (this is a command, not an event)
✗ CreateRoute (this is a command, not an event)
✗ RegisterBoarding (this is a command, not an event)
✗ RouteEvent (does not indicate what occurred)
```

### Difference between Command and Event

| Concept     | Intent                                  | Tense   | Can fail?                |
| ----------- | --------------------------------------- | ------- | ------------------------ |
| **Command** | Instruction to do something             | Present | Yes                      |
| **Event**   | Notification of something that occurred | Past    | No (it already happened) |

```
Administrator → [CreateRoute] → RouteService → [RouteCreated] → Other contexts
                   (Command)                       (Event)
```

---

## Event catalog

### Event: PersonRegistered

| Field                  | Value                                                 |
| ---------------------- | ----------------------------------------------------- |
| **Name**               | `StudentCreate`                                    |
| **Bounded Context**    | UserManagementService                                 |
| **Aggregate**          | Person                                                |
| **Trigger**            | A new person is successfully registered in the system |
| **Consumers**          | Iam                                |
| **Channel (topic)**    | `student.created`                              |
| **Schema version**     | `v1`                                                  |
| **Delivery guarantee** | At-least-once                                         |

**Payload (JSON schema):**

```json
{
  "eventType": "student.created",
  "aggregateId": "550e8400-e29b-41d4-a716-446655440001",
  "aggregateType": "Person",
  "occurredAt": "2026-09-03T10:30:00Z",
  "version": 1,
  "payload": {
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "personId": "UUID",
    "email": "string",
    "identificationNumber": "string"
  },
  "metadata": {
    "correlationId": "550e8400-e29b-41d4-a716-446655440002",
    "causationId": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440004"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "PersonRegistered",
  "aggregateId": "person-uuid",
  "aggregateType": "Person",
  "occurredAt": "2026-09-03T10:30:00Z",
  "version": 1,
  "payload": {
    "personId": "person-123",
    "firstName": "Juan",
    "lastName": "Perez",
    "email": "juan@example.com",
    "phone": "+573001234567"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                               | Idempotent?                           |
| ----------------- | ---------------------------------------------------- | ------------------------------------- |
| SecurityService   | Creates or associates the corresponding user profile | Yes — uses eventId as idempotency key |

---

### Event: FamilyCreated

| Field                  | Value                        |
| ---------------------- | ---------------------------- |
| **Name**               | `FamilyCreated`              |
| **Bounded Context**    | UserManagementService        |
| **Aggregate**          | Family                       |
| **Trigger**            | A new family is created      |
| **Consumers**          | UserManagementService|
| **Channel (topic)**    | `user.family.created`        |
| **Schema version**     | `v1`                         |
| **Delivery guarantee** | At-least-once                |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "FamilyCreated",
  "aggregateId": "UUID",
  "aggregateType": "Family",
  "occurredAt": "2026-09-03T10:35:00Z",
  "version": 1,
  "payload": {
    "familyId": "UUID",
    "familyName": "string"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "FamilyCreated",
  "aggregateId": "family-uuid",
  "aggregateType": "Family",
  "occurredAt": "2026-09-03T10:35:00Z",
  "version": 1,
  "payload": {
    "familyId": "family-123",
    "familyName": "Perez Family"
  }
}
```

**What do consumers do with this event?**

| Consuming service     | Action                             | Idempotent?                           |
| --------------------- | ---------------------------------- | ------------------------------------- |
| UserManagementService | Updates family-related information | Yes — uses eventId as idempotency key |

---

### Event: ProfileCreated

| Field                  | Value                                      |
| ---------------------- | ------------------------------------------ |
| **Name**               | `ProfileCreated`                           |
| **Bounded Context**    | SecurityService                            |
| **Aggregate**          | Profile                                    |
| **Trigger**            | A security profile is created for a person |
| **Consumers**          | UserManagementService|
| **Channel (topic)**    | `security.profile.created`                 |
| **Schema version**     | `v1`                                       |
| **Delivery guarantee** | At-least-once                              |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "ProfileCreated",
  "aggregateId": "UUID",
  "aggregateType": "Profile",
  "occurredAt": "2026-09-03T10:40:00Z",
  "version": 1,
  "payload": {
    "profileId": "UUID",
    "personId": "UUID",
    "roleId": "UUID"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "ProfileCreated",
  "aggregateId": "profile-uuid",
  "aggregateType": "Profile",
  "occurredAt": "2026-09-03T10:40:00Z",
  "version": 1,
  "payload": {
    "profileId": "profile-123",
    "personId": "person-123",
    "roleId": "role-student"
  }
}
```

**What do consumers do with this event?**

| Consuming service     | Action                                 | Idempotent?                           |
| --------------------- | -------------------------------------- | ------------------------------------- |
| UserManagementService | Associates the profile with the person | Yes — uses eventId as idempotency key |

---

### Event: SessionStarted

| Field                  | Value                             |
| ---------------------- | --------------------------------- |
| **Name**               | `SessionStarted`                  |
| **Bounded Context**    | SecurityService                   |
| **Aggregate**          | SessionProfile                    |
| **Trigger**            | A user successfully authenticates |
| **Consumers**          | —                                 |
| **Channel (topic)**    | `security.session.started`        |
| **Schema version**     | `v1`                              |
| **Delivery guarantee** | At-least-once                     |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "SessionStarted",
  "aggregateId": "UUID",
  "aggregateType": "SessionProfile",
  "occurredAt": "2026-09-03T10:45:00Z",
  "version": 1,
  "payload": {
    "sessionId": "UUID",
    "profileId": "UUID"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "SessionStarted",
  "aggregateId": "session-uuid",
  "aggregateType": "SessionProfile",
  "occurredAt": "2026-09-03T10:45:00Z",
  "version": 1,
  "payload": {
    "sessionId": "session-123",
    "profileId": "profile-123"
  }
}
```

---

### Event: SchoolCreated

| Field                  | Value                      |
| ---------------------- | -------------------------- |
| **Name**               | `SchoolCreated`            |
| **Bounded Context**    | SchoolService              |
| **Aggregate**          | School                     |
| **Trigger**            | A new school is registered |
| **Consumers**          | RouteService, BusService   |
| **Channel (topic)**    | `school.created`           |
| **Schema version**     | `v1`                       |
| **Delivery guarantee** | At-least-once              |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "SchoolCreated",
  "aggregateId": "UUID",
  "aggregateType": "School",
  "occurredAt": "2026-09-03T11:00:00Z",
  "version": 1,
  "payload": {
    "schoolId": "UUID",
    "name": "string",
    "cityId": "UUID"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "SchoolCreated",
  "aggregateId": "school-uuid",
  "aggregateType": "School",
  "occurredAt": "2026-09-03T11:00:00Z",
  "version": 1,
  "payload": {
    "schoolId": "school-123",
    "name": "Guardian Escolar",
    "cityId": "city-123"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                          | Idempotent?                           |
| ----------------- | ----------------------------------------------- | ------------------------------------- |
| RouteService      | Makes the school available for route management | Yes — uses eventId as idempotency key |
| BusService        | Makes the school available for bus association  | Yes — uses eventId as idempotency key |

---

### Event: BusRegistered

| Field                  | Value                             |
| ---------------------- | --------------------------------- |
| **Name**               | `BusRegistered`                   |
| **Bounded Context**    | BusService                        |
| **Aggregate**          | Bus                               |
| **Trigger**            | A bus is registered in the system |
| **Consumers**          | RouteService, GpsService          |
| **Channel (topic)**    | `bus.registered`                  |
| **Schema version**     | `v1`                              |
| **Delivery guarantee** | At-least-once                     |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "BusRegistered",
  "aggregateId": "UUID",
  "aggregateType": "Bus",
  "occurredAt": "2026-09-03T11:10:00Z",
  "version": 1,
  "payload": {
    "busId": "UUID",
    "plate": "string",
    "schoolId": "UUID",
    "driverProfileId": "UUID",
    "gpsDeviceId": "UUID"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "BusRegistered",
  "aggregateId": "bus-uuid",
  "aggregateType": "Bus",
  "occurredAt": "2026-09-03T11:10:00Z",
  "version": 1,
  "payload": {
    "busId": "bus-123",
    "plate": "ABC123",
    "schoolId": "school-123",
    "driverProfileId": "driver-123",
    "gpsDeviceId": "gps-123"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                       | Idempotent?                           |
| ----------------- | -------------------------------------------- | ------------------------------------- |
| RouteService      | Makes the bus available for route assignment | Yes — uses eventId as idempotency key |
| GpsService        | Associates the GPS device with the bus       | Yes — uses eventId as idempotency key |

---

### Event: RouteCreated

| Field                  | Value                                   |
| ---------------------- | --------------------------------------- |
| **Name**               | `RouteCreated`                          |
| **Bounded Context**    | RouteService                            |
| **Aggregate**          | Route                                   |
| **Trigger**            | An administrator creates a school route |
| **Consumers**          | BusService, BoardingService             |
| **Channel (topic)**    | `route.created`                         |
| **Schema version**     | `v1`                                    |
| **Delivery guarantee** | At-least-once                           |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "RouteCreated",
  "aggregateId": "UUID",
  "aggregateType": "Route",
  "occurredAt": "2026-09-03T11:20:00Z",
  "version": 1,
  "payload": {
    "routeId": "UUID",
    "name": "string",
    "schoolId": "UUID",
    "startTime": "time",
    "endTime": "time"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "RouteCreated",
  "aggregateId": "route-uuid",
  "aggregateType": "Route",
  "occurredAt": "2026-09-03T11:20:00Z",
  "version": 1,
  "payload": {
    "routeId": "route-123",
    "name": "Route 01",
    "schoolId": "school-123",
    "startTime": "06:30:00",
    "endTime": "08:00:00"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                            | Idempotent?                           |
| ----------------- | ------------------------------------------------- | ------------------------------------- |
| BusService        | Makes the route available for bus assignment      | Yes — uses eventId as idempotency key |
| BoardingService   | Makes the route available for boarding operations | Yes — uses eventId as idempotency key |

---

### Event: RouteBusAssigned

| Field                  | Value                        |
| ---------------------- | ---------------------------- |
| **Name**               | `RouteBusAssigned`           |
| **Bounded Context**    | RouteService                 |
| **Aggregate**          | RouteBusAssignments          |
| **Trigger**            | A bus is assigned to a route |
| **Consumers**          | BusService, GpsService       |
| **Channel (topic)**    | `route.bus.assigned`         |
| **Schema version**     | `v1`                         |
| **Delivery guarantee** | At-least-once                |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "RouteBusAssigned",
  "aggregateId": "UUID",
  "aggregateType": "RouteBusAssignments",
  "occurredAt": "2026-09-03T11:30:00Z",
  "version": 1,
  "payload": {
    "routeId": "UUID",
    "busId": "UUID"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "RouteBusAssigned",
  "aggregateId": "assignment-uuid",
  "aggregateType": "RouteBusAssignments",
  "occurredAt": "2026-09-03T11:30:00Z",
  "version": 1,
  "payload": {
    "routeId": "route-123",
    "busId": "bus-123"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                                  | Idempotent?                           |
| ----------------- | ------------------------------------------------------- | ------------------------------------- |
| BusService        | Updates the bus-route relationship in its local model   | Yes — uses eventId as idempotency key |
| GpsService        | Associates GPS tracking with the assigned bus and route | Yes — uses eventId as idempotency key |

---

### Event: StudentAssignedToRoute

| Field                  | Value                                    |
| ---------------------- | ---------------------------------------- |
| **Name**               | `StudentAssignedToRoute`                 |
| **Bounded Context**    | RouteService                             |
| **Aggregate**          | RouteStudentAssignments                  |
| **Trigger**            | A student profile is assigned to a route |
| **Consumers**          | BoardingService                          |
| **Channel (topic)**    | `route.student.assigned`                 |
| **Schema version**     | `v1`                                     |
| **Delivery guarantee** | At-least-once                            |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "StudentAssignedToRoute",
  "aggregateId": "UUID",
  "aggregateType": "RouteStudentAssignments",
  "occurredAt": "2026-09-03T11:35:00Z",
  "version": 1,
  "payload": {
    "routeId": "UUID",
    "studentProfileId": "UUID"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "StudentAssignedToRoute",
  "aggregateId": "assignment-uuid",
  "aggregateType": "RouteStudentAssignments",
  "occurredAt": "2026-09-03T11:35:00Z",
  "version": 1,
  "payload": {
    "routeId": "route-123",
    "studentProfileId": "student-123"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                                        | Idempotent?                           |
| ----------------- | ------------------------------------------------------------- | ------------------------------------- |
| BoardingService   | Makes the student eligible for boarding on the assigned route | Yes — uses eventId as idempotency key |

---

### Event: RouteStopAdded

| Field                  | Value                       |
| ---------------------- | --------------------------- |
| **Name**               | `RouteStopAdded`            |
| **Bounded Context**    | RouteService                |
| **Aggregate**          | RouteStop                   |
| **Trigger**            | A stop is added to a route  |
| **Consumers**          | BoardingService, GpsService |
| **Channel (topic)**    | `route.stop.added`          |
| **Schema version**     | `v1`                        |
| **Delivery guarantee** | At-least-once               |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "RouteStopAdded",
  "aggregateId": "UUID",
  "aggregateType": "RouteStop",
  "occurredAt": "2026-09-03T11:40:00Z",
  "version": 1,
  "payload": {
    "routeId": "UUID",
    "stopId": "UUID",
    "sequence": "integer"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "RouteStopAdded",
  "aggregateId": "route-stop-uuid",
  "aggregateType": "RouteStop",
  "occurredAt": "2026-09-03T11:40:00Z",
  "version": 1,
  "payload": {
    "routeId": "route-123",
    "stopId": "stop-123",
    "sequence": 1
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                          | Idempotent?                           |
| ----------------- | ----------------------------------------------- | ------------------------------------- |
| BoardingService   | Updates the available boarding stop information | Yes — uses eventId as idempotency key |
| GpsService        | Uses the stop information for route tracking    | Yes — uses eventId as idempotency key |

---

### Event: StudentQrCodeGenerated

| Field                  | Value                                |
| ---------------------- | ------------------------------------ |
| **Name**               | `StudentQrCodeGenerated`             |
| **Bounded Context**    | BoardingService                      |
| **Aggregate**          | Student QR identity                  |
| **Trigger**            | A QR code is generated for a student |
| **Consumers**          | BoardingService                      |
| **Channel (topic)**    | `boarding.qr.generated`              |
| **Schema version**     | `v1`                                 |
| **Delivery guarantee** | At-least-once                        |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "StudentQrCodeGenerated",
  "aggregateId": "UUID",
  "aggregateType": "StudentQrIdentity",
  "occurredAt": "2026-09-03T11:45:00Z",
  "version": 1,
  "payload": {
    "profileId": "UUID",
    "qrIdentifier": "string"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "StudentQrCodeGenerated",
  "aggregateId": "student-uuid",
  "aggregateType": "StudentQrIdentity",
  "occurredAt": "2026-09-03T11:45:00Z",
  "version": 1,
  "payload": {
    "profileId": "student-123",
    "qrIdentifier": "QR-STUDENT-001"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                         | Idempotent?                           |
| ----------------- | ---------------------------------------------- | ------------------------------------- |
| BoardingService   | Makes the QR identifier available for scanning | Yes — uses eventId as idempotency key |

> **Note:** This event is a candidate because the current database model does not contain a dedicated QR entity. The final aggregate must be confirmed during implementation.

---

### Event: BoardingQrScanned

| Field                  | Value                          |
| ---------------------- | ------------------------------ |
| **Name**               | `BoardingQrScanned`            |
| **Bounded Context**    | BoardingService                |
| **Aggregate**          | Boarding                       |
| **Trigger**            | A student's QR code is scanned |
| **Consumers**          | BoardingService                |
| **Channel (topic)**    | `boarding.qr.scanned`          |
| **Schema version**     | `v1`                           |
| **Delivery guarantee** | At-least-once                  |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "BoardingQrScanned",
  "aggregateId": "UUID",
  "aggregateType": "Boarding",
  "occurredAt": "2026-09-03T12:00:00Z",
  "version": 1,
  "payload": {
    "profileId": "UUID",
    "busId": "UUID",
    "stopId": "UUID",
    "scanType": "ON_BOARD | OFF_BOARD"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "BoardingQrScanned",
  "aggregateId": "boarding-uuid",
  "aggregateType": "Boarding",
  "occurredAt": "2026-09-03T12:00:00Z",
  "version": 1,
  "payload": {
    "profileId": "student-123",
    "busId": "bus-123",
    "stopId": "stop-123",
    "scanType": "ON_BOARD"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                         | Idempotent?                           |
| ----------------- | ---------------------------------------------- | ------------------------------------- |
| BoardingService   | Validates and processes the boarding operation | Yes — uses eventId as idempotency key |

---

### Event: BoardingRegistered

| Field                  | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| **Name**               | `BoardingRegistered`                                    |
| **Bounded Context**    | BoardingService                                         |
| **Aggregate**          | Boarding                                                |
| **Trigger**            | A student's boarding or exit is successfully registered |
| **Consumers**          | AlertsService, Notification component                   |
| **Channel (topic)**    | `boarding.registered`                                   |
| **Schema version**     | `v1`                                                    |
| **Delivery guarantee** | At-least-once                                           |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "BoardingRegistered",
  "aggregateId": "UUID",
  "aggregateType": "Boarding",
  "occurredAt": "2026-09-03T12:01:00Z",
  "version": 1,
  "payload": {
    "boardingId": "UUID",
    "profileId": "UUID",
    "busId": "UUID",
    "stopId": "UUID",
    "type": "ON_BOARD | OFF_BOARD"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "BoardingRegistered",
  "aggregateId": "boarding-uuid",
  "aggregateType": "Boarding",
  "occurredAt": "2026-09-03T12:01:00Z",
  "version": 1,
  "payload": {
    "boardingId": "boarding-123",
    "profileId": "student-123",
    "busId": "bus-123",
    "stopId": "stop-123",
    "type": "ON_BOARD"
  }
}
```

**What do consumers do with this event?**

| Consuming service      | Action                                     | Idempotent?                           |
| ---------------------- | ------------------------------------------ | ------------------------------------- |
| AlertsService          | Evaluates whether an alert must be created | Yes — uses eventId as idempotency key |
| Notification component | Notifies the corresponding guardian        | Yes — uses eventId as idempotency key |

---

### Event: GpsDeviceRegistered

| Field                  | Value                                    |
| ---------------------- | ---------------------------------------- |
| **Name**               | `GpsDeviceRegistered`                    |
| **Bounded Context**    | GpsService                               |
| **Aggregate**          | GpsDevice                                |
| **Trigger**            | A GPS device is registered in the system |
| **Consumers**          | BusService                               |
| **Channel (topic)**    | `gps.device.registered`                  |
| **Schema version**     | `v1`                                     |
| **Delivery guarantee** | At-least-once                            |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "GpsDeviceRegistered",
  "aggregateId": "UUID",
  "aggregateType": "GpsDevice",
  "occurredAt": "2026-09-03T12:05:00Z",
  "version": 1,
  "payload": {
    "gpsDeviceId": "UUID",
    "imei": "string"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "GpsDeviceRegistered",
  "aggregateId": "gps-device-uuid",
  "aggregateType": "GpsDevice",
  "occurredAt": "2026-09-03T12:05:00Z",
  "version": 1,
  "payload": {
    "gpsDeviceId": "gps-123",
    "imei": "355468590730586"
  }
}
```

**What do consumers do with this event?**

| Consuming service | Action                                               | Idempotent?                           |
| ----------------- | ---------------------------------------------------- | ------------------------------------- |
| BusService        | Associates the GPS device with the corresponding bus | Yes — uses eventId as idempotency key |

---

### Event: GpsLocationReceived

| Field                  | Value                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| **Name**               | `GpsLocationReceived`                                            |
| **Bounded Context**    | GpsService                                                       |
| **Aggregate**          | GpsDevice                                                        |
| **Trigger**            | The VT03F GPS device sends a location through the TCP connection |
| **Consumers**          | BusService, AlertsService, Tracking component                    |
| **Channel (topic)**    | `gps.location.received`                                          |
| **Schema version**     | `v1`                                                             |
| **Delivery guarantee** | At-least-once                                                    |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "GpsLocationReceived",
  "aggregateId": "UUID",
  "aggregateType": "GpsDevice",
  "occurredAt": "2026-09-03T12:10:02Z",
  "version": 1,
  "payload": {
    "locationId": "UUID",
    "deviceId": "UUID",
    "latitude": "number",
    "longitude": "number",
    "speed": "number",
    "course": "number",
    "gpsDateTime": "ISO 8601",
    "receivedAt": "ISO 8601"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "GpsLocationReceived",
  "aggregateId": "gps-device-uuid",
  "aggregateType": "GpsDevice",
  "occurredAt": "2026-09-03T12:10:02Z",
  "version": 1,
  "payload": {
    "locationId": "location-123",
    "deviceId": "gps-123",
    "latitude": 2.9273,
    "longitude": -75.2819,
    "speed": 35.5,
    "course": 180.0,
    "gpsDateTime": "2026-09-03T12:10:00Z",
    "receivedAt": "2026-09-03T12:10:02Z"
  }
}
```

**What do consumers do with this event?**

| Consuming service  | Action                                 | Idempotent?                           |
| ------------------ | -------------------------------------- | ------------------------------------- |
| BusService         | Updates the current bus location       | Yes — uses eventId as idempotency key |
| AlertsService      | Evaluates GPS-related alert conditions | Yes — uses eventId as idempotency key |
| Tracking component | Updates the real-time map position     | Yes — uses eventId as idempotency key |

---

### Event: GpsSignalLost

| Field                  | Value                                                           |
| ---------------------- | --------------------------------------------------------------- |
| **Name**               | `GpsSignalLost`                                                 |
| **Bounded Context**    | GpsService                                                      |
| **Aggregate**          | GpsDevice                                                       |
| **Trigger**            | No valid GPS location is received during the configured timeout |
| **Consumers**          | AlertsService, Notification component                           |
| **Channel (topic)**    | `gps.signal.lost`                                               |
| **Schema version**     | `v1`                                                            |
| **Delivery guarantee** | At-least-once                                                   |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "GpsSignalLost",
  "aggregateId": "UUID",
  "aggregateType": "GpsDevice",
  "occurredAt": "2026-09-03T12:15:02Z",
  "version": 1,
  "payload": {
    "deviceId": "UUID",
    "busId": "UUID",
    "lastLatitude": "number",
    "lastLongitude": "number",
    "lastReceivedAt": "ISO 8601"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "GpsSignalLost",
  "aggregateId": "gps-device-uuid",
  "aggregateType": "GpsDevice",
  "occurredAt": "2026-09-03T12:15:02Z",
  "version": 1,
  "payload": {
    "deviceId": "gps-123",
    "busId": "bus-123",
    "lastLatitude": 2.9273,
    "lastLongitude": -75.2819,
    "lastReceivedAt": "2026-09-03T12:10:02Z"
  }
}
```

**What do consumers do with this event?**

| Consuming service      | Action                                 | Idempotent?                           |
| ---------------------- | -------------------------------------- | ------------------------------------- |
| AlertsService          | Creates a GPS signal-loss alert        | Yes — uses eventId as idempotency key |
| Notification component | Notifies responsible users if required | Yes — uses eventId as idempotency key |

---

### Event: AlertCreated

| Field                  | Value                                  |
| ---------------------- | -------------------------------------- |
| **Name**               | `AlertCreated`                         |
| **Bounded Context**    | AlertsService                          |
| **Aggregate**          | Alert                                  |
| **Trigger**            | A business condition requires an alert |
| **Consumers**          | Notification component, Frontend       |
| **Channel (topic)**    | `alert.created`                        |
| **Schema version**     | `v1`                                   |
| **Delivery guarantee** | At-least-once                          |

**Payload (JSON schema):**

```json
{
  "eventId": "UUID",
  "eventType": "AlertCreated",
  "aggregateId": "UUID",
  "aggregateType": "Alert",
  "occurredAt": "2026-09-03T12:20:00Z",
  "version": 1,
  "payload": {
    "alertId": "UUID",
    "alertTypeId": "UUID",
    "busId": "UUID",
    "message": "string"
  },
  "metadata": {
    "correlationId": "UUID",
    "causationId": "UUID",
    "userId": "UUID"
  }
}
```

**Real payload example:**

```json
{
  "eventId": "generated-uuid",
  "eventType": "AlertCreated",
  "aggregateId": "alert-uuid",
  "aggregateType": "Alert",
  "occurredAt": "2026-09-03T12:20:00Z",
  "version": 1,
  "payload": {
    "alertId": "alert-123",
    "alertTypeId": "gps-signal-lost",
    "busId": "bus-123",
    "message": "GPS signal lost"
  }
}
```

**What do consumers do with this event?**

| Consuming service      | Action                                            | Idempotent?                           |
| ---------------------- | ------------------------------------------------- | ------------------------------------- |
| Notification component | Sends the alert notification to responsible users | Yes — uses eventId as idempotency key |
| Frontend               | Updates the alert view when applicable            | Yes — uses eventId as idempotency key |

---

## Standard fields for all events

All events must include these fields in the envelope:

| Field                    | Type     | Description                                       |
| ------------------------ | -------- | ------------------------------------------------- |
| `eventId`                | UUID     | Unique event ID used as an idempotency key        |
| `eventType`              | string   | Event name in PascalCase                          |
| `aggregateId`            | UUID     | ID of the aggregate that generated the event      |
| `aggregateType`          | string   | Aggregate type                                    |
| `occurredAt`             | ISO 8601 | When the business fact occurred                   |
| `version`                | integer  | Schema version used for event evolution           |
| `payload`                | object   | Event data specific to each event type            |
| `metadata.correlationId` | UUID     | Used to trace a transaction across services       |
| `metadata.causationId`   | UUID     | ID of the event or command that caused this event |
| `metadata.userId`        | UUID     | User who initiated the chain, if applicable       |

---

## Event flow: School transportation monitoring

> The following flow represents the main real-time transportation process in Guardian Escolar.
> The GPS device sends location information through TCP, the GpsService processes it, and the resulting event is consumed by other contexts.

```text
VT03F GPS Device
  │
  │ ReceiveGpsLocation (command)
  ▼
[Aggregate: GpsDevice]
  │
  │ GpsLocationReceived (event)
  ▼
[Message Broker]
  │
  ├──────────────────────────────┐
  │                              │
  ▼                              ▼
[Service: BusService]      [Service: AlertsService]
  │                              │
  │ UpdateBusLocation             │ Evaluate GPS conditions
  │                              │
  ▼                              ▼
[Bus Location Model]       GpsSignalLost (event)
                                 │
                                 ▼
                          [Service: AlertsService]
                                 │
                                 │ CreateAlert (command)
                                 ▼
                            AlertCreated
                                 │
                                 ▼
                       [Service: Notification]
```

### Example: QR boarding flow

```text
Student
  │
  │ ScanStudentQr (command)
  ▼
[Aggregate: Boarding]
  │
  │ BoardingQrScanned (event)
  ▼
[BoardingService]
  │
  │ RegisterBoarding (command)
  ▼
[Aggregate: Boarding]
  │
  │ BoardingRegistered (event)
  ├──────────────────────────────────┐
  │                                  │
  ▼                                  ▼
[Service: AlertsService]      [Service: Notification]
  │                                  │
  │ Evaluate boarding rules          │
  │                                  │
  ▼                                  ▼
[AlertCreated]                 Sends notification
```

### Example: Route creation flow

```text
Administrator
  │
  │ CreateRoute (command)
  ▼
[Aggregate: Route]
  │
  │ RouteCreated (event)
  ├──────────────────────────────────┐
  │                                  │
  ▼                                  ▼
[Service: BusService]        [Service: BoardingService]
  │                                  │
  │ Makes route available             │ Makes route available
  │ for bus assignment                │ for boarding
```

---

## Schema evolution strategy

Events are contracts. Changing them in an incompatible way breaks consumers.

### What is a compatible change (does not break)?

```
✓ Add a new optional field to the payload
✓ Add a new event type
✓ Change a required field → optional
```

### What is an incompatible change (breaks)?

```
✗ Remove a field from the payload
✗ Change the type of a field (string → number)
✗ Change an optional field → required
✗ Change the event name
```

### How to evolve a schema without breaking consumers

**Strategy: Version the event**

```text
Step 1: Publish EventV2 (new type with incompatible changes)
Step 2: Publish both EventV1 and EventV2 during the migration period
Step 3: Migrate consumers to V2 one by one
Step 4: Deprecate EventV1 (announce 1 sprint in advance)
Step 5: Stop publishing EventV1
```

For example:

```text
GpsLocationReceivedV1
GpsLocationReceivedV2
```

Versioning is especially important for `GpsLocationReceived` because the GPS payload may evolve as the tracking system receives additional information from the VT03F device.

---

## Event summary table

| Event                       | Origin context           | Topic                         | Consumers                           | Version |
| --------------------------- | ------------------------ | ----------------------------- | ----------------------------------- | ------- |
| `PersonRegistered`          | UserManagementService    | `user.person.registered`      | SecurityService| v1      |
| `FamilyCreated`             | UserManagementService    | `user.family.created`         | UserManagementService| v1      |
| `ProfileCreated`            | SecurityService          | `security.profile.created`    | UserManagementService| v1      |
| `SessionStarted`            | SecurityService          | `security.session.started`    | —                                  | v1      |
| `SchoolCreated`             | SchoolService            | `school.created`              | RouteService, BusService            | v1      |
| `BusRegistered`             | BusService               | `bus.registered`              | RouteService, GpsService            | v1      |
| `RouteCreated`              | RouteService             | `route.created`               | BusService, BoardingService         | v1      |
| `RouteBusAssigned`          | RouteService             | `route.bus.assigned`          | BusService, GpsService              | v1      |
| `StudentAssignedToRoute`    | RouteService             | `route.student.assigned`      | BoardingService                     | v1      |
| `RouteStopAdded`            | RouteService             | `route.stop.added`            | BoardingService, GpsService         | v1      |
| `StudentQrCodeGenerated`    | BoardingService          | `boarding.qr.generated`       | BoardingService                     | v1      |
| `BoardingQrScanned`         | BoardingService          | `boarding.qr.scanned`         | BoardingService                     | v1      |
| `BoardingRegistered`        | BoardingService          | `boarding.registered`         | AlertsService, Notification         | v1      |
| `GpsDeviceRegistered`       | GpsService               | `gps.device.registered`       | BusService                          | v1      |
| `GpsLocationReceived`       | GpsService               | `gps.location.received`       | BusService, AlertsService, Tracking | v1      |
| `GpsSignalLost`             | GpsService               | `gps.signal.lost`             | AlertsService, Notification         | v1      |
| `AlertCreated`              | AlertsService            | `alert.created`               | Notification, Frontend              | v1      |

---

## Policies — Reactions to events

A **Policy** (or Saga step) describes what happens automatically when an event arrives.
It is the logic of "whenever X occurs, do Y".

```text
Event:  BoardingRegistered
Policy: Whenever a BoardingRegistered event arrives with
        type=ON_BOARD, emit the command SendBoardingNotification
```

| Trigger event               | Policy                                                                      | Emitted command            | Service         |
| --------------------------- | --------------------------------------------------------------------------- | -------------------------- | --------------- |
| `PersonRegistered`          | Whenever a person is registered, create the corresponding security profile  | `CreateProfile`            | SecurityService |
| `RouteCreated`              | Whenever a route is created, make it available for related route operations | `PrepareRoute`             | RouteService    |
| `RouteBusAssigned`          | Whenever a bus is assigned to a route, associate its GPS tracking           | `AssociateGpsDevice`       | GpsService      |
| `StudentAssignedToRoute`    | Whenever a student is assigned to a route, enable boarding authorization    | `PrepareBoardingAccess`    | BoardingService |
| `BoardingRegistered`        | Whenever a boarding occurs, notify the student's guardian                   | `SendBoardingNotification` | Notification    |
| `GpsLocationReceived`       | Whenever a GPS location arrives, update the current bus position            | `UpdateBusLocation`        | BusService      |
| `GpsSignalLost`             | Whenever GPS signal is lost, create a GPS alert                             | `CreateAlert`              | AlertsService   |
| `AlertCreated`              | Whenever an alert is created, notify responsible users                      | `SendNotification`         | Notification    |

> The `Notification` service is currently a candidate bounded context because it is not represented as an independent database schema in the current model.

---

## Resilience patterns for events

### At-least-once delivery + Idempotency

The message broker guarantees the event is delivered **at least once** but it may be
delivered more than once in case of retries. Consumers must be **idempotent**.

For Guardian Escolar, this is particularly important for GPS locations, boarding records, and alerts.

```typescript
// Idempotent consumer — stores the processed eventId
async function processGpsLocationReceivedEvent(
  event: GpsLocationReceived
): Promise<void> {

  // 1. Check if already processed
  if (await isEventAlreadyProcessed(event.eventId)) {
    logger.info(`Event ${event.eventId} already processed, ignoring`);
    return;
  }

  // 2. Process the event
  await updateBusLocation(event.payload);

  // 3. Mark as processed in the same transaction
  await markEventProcessed(event.eventId);
}
```

### Dead Letter Queue (DLQ)

When an event fails after N retries, it goes to the DLQ.

| Configuration      | Recommended value               |
| ------------------ | ------------------------------- |
| Retries before DLQ | 3-5                             |
| Backoff            | Exponential (1s → 2s → 4s → 8s) |
| DLQ retention      | 7 days                          |
| Alert              | When DLQ has > 0 messages       |

> See DLQ runbook in `09-microservices/services/XX-service/runbook.md`
