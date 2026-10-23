# GPS Service — Architecture Decisions

## 1. Purpose

This document records the architecture decisions relevant to the GPS Service and links them to the project's formal Architecture Decision Records (ADRs).

## 2. ADR-012 — GPS Location Persistence

**Status:** Accepted, according to the project decision supplied for this documentation.

**Decision:** Do not implement GPS location persistence in the database for the current scope.

### Context

The GPS Service receives tracking data from vehicle GPS devices and makes the latest location available to the application.

The current functional requirement is to display the latest vehicle location. The project does not currently require persisted GPS history or historical route reports.

Persisting every location update would introduce repeated database writes and additional storage and query requirements that are not needed for the current scope.

### Decision

The service retains the latest received location in application memory instead of writing GPS locations to SQL Server.

The existing `Gps.GpsDevice` and `Gps.GpsLocation` tables remain in the database schema. Their existence does not imply that the current service uses them for persistence.

### Consequences

**Benefits**

- Avoids repeated database writes for GPS updates.
- Reduces the current implementation's database requirements.
- Keeps the implementation aligned with the requirement to display the latest location.
- Avoids introducing a GPS history feature that is not currently required.

**Limitations**

- The latest location is lost when the service restarts.
- The service must receive a new GPS message before the latest location can be populated again.
- The application cannot rely on this service for persisted historical routes.
- Historical reporting would require a new technical decision and implementation.

### Conditions for Reassessment

The decision should be reviewed if Guardian Escolar requires:

- Historical route consultation.
- Persisted location reports.
- Recovery of the last location after a service restart.
- Auditing or long-term retention of tracking data.

### Related Record

The formal record should be maintained at:

`05-architecture/decisions/records/ADR-010-Implement-GPS-location-persistence-in-the-database.md`

## 3. API Gateway Integration

The GPS Service is configured to share the external Docker network `sg-services-network`.

The Docker Compose configuration indicates that Kong can reach the service through:

`http://ms-gps:8080`

The host mapping for the HTTP port is restricted to loopback for local debugging. Kong-to-service communication should use the container service address and port over the shared Docker network.

The existence of this network configuration does not, by itself, prove that a particular public Kong route has been configured. The route, authentication requirements and public path must be confirmed in the gateway configuration.

## 4. Database Configuration

The Maven configuration declares JPA and Microsoft SQL Server JDBC dependencies. However, the service configuration excludes database and JPA auto-configuration.

These dependencies must not be interpreted as evidence that the service currently persists GPS locations.

Any change to database persistence must be evaluated against ADR-010 and documented before implementation.

## 5. Messaging

No GPS-specific Kafka or RabbitMQ event contract is documented for the current implementation.

If the service later publishes GPS events, the team must document the event schema, broker configuration, consumers, delivery behavior and failure handling before treating that integration as part of the architecture.

