# GPS Service — Data Model

## 1. Purpose

This document describes the GPS Service's current data handling approach and its relationship with the Guardian Escolar database.

The service receives location information from GPS tracking devices and retains the latest processed location in application memory. Persistent GPS location storage is not part of the current implementation.

## 2. Device Identification

GPS tracking devices are identified using their IMEI (International Mobile Equipment Identity).

The IMEI is used to associate incoming device messages with the corresponding tracking device. The precise validation rules and the fields extracted from each incoming message must be confirmed against the TCP listener and message parser implementation.

## 3. Current Storage Strategy

The latest received GPS location is maintained in application memory.

| Data | Current handling | Persistence |
|---|---|---|
| Device IMEI | Used to identify the tracking device | No persistence confirmed by the reviewed configuration |
| Latest GPS location | Retained by the running service | In memory |
| GPS location history | Not maintained as a persisted history | Not implemented |
| Device status | Must be verified against the current source implementation | Not confirmed as persisted |

Because the latest location is stored in memory, it is temporary. Restarting the service clears this state until new tracking data is received.

## 4. SQL Server Integration

The Maven configuration declares dependencies for JPA and the Microsoft SQL Server JDBC driver. However, `application.properties` explicitly excludes the database and JPA auto-configuration classes.

Consequently, the presence of these dependencies alone does not establish that the service connects to SQL Server or saves GPS locations there.

The existing database schema includes the following GPS-related tables:

- `Gps.GpsDevice`
- `Gps.GpsLocation`

Their existence in the schema does not mean that the current GPS Service writes to them. The current implementation's location handling is in memory, and the reviewed configuration does not activate database persistence.

These tables should not be deleted as part of documenting the service. Any future database changes must follow the project's database change and architecture decision processes.

## 5. Persistence Decision

According to **ADR-012**, implementing GPS location persistence is not required for the current scope.

The application needs to display the latest location of a vehicle, rather than provide a historical route report. Persisting every location update would introduce repeated database writes without a current requirement for historical consultation.

The decision is therefore to leave the existing schema intact while not implementing GPS location persistence in the service at this stage.

## 6. Data Lifecycle

1. A GPS device sends a message to the service over TCP.
2. The service processes the incoming message and identifies the device using its IMEI.
3. The latest location is maintained in memory.
4. A client can request location information through the REST API, subject to the implemented endpoint contract.
5. When the service restarts, its in-memory location state is cleared.
6. The latest location becomes available again after the service receives and processes another GPS message.

## 7. Future Considerations

If the project later requires historical routes, location reports, auditing or recovery of the latest position after a restart, the team should reassess the persistence decision.

Any future implementation should define the required retention period, write frequency, query patterns, data ownership and database impact before changing the current design.

