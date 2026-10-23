# GPS Service

## 1. Overview

The GPS Service is a microservice in the Guardian Escolar platform responsible for receiving GPS tracking data from vehicle tracking devices and making location information available through an HTTP REST API.

The service uses two communication channels:

- **TCP:** receives data sent by GPS tracking devices.
- **HTTP/REST:** exposes the service API for other components of Guardian Escolar.

The service is implemented with Spring Boot and Java 21 and can be deployed using Docker.

## 2. Responsibilities

The GPS Service is responsible for:

- Receiving GPS device messages through a TCP listener.
- Identifying devices using their IMEI.
- Processing incoming tracking information.
- Maintaining the latest received location in memory.
- Exposing GPS information through its REST API.

The service is not currently responsible for storing a historical GPS trail in SQL Server or publishing GPS events through Kafka.

## 3. Technology Stack

| Component | Technology |
|---|---|
| Programming language | Java 21 |
| Framework | Spring Boot 4.1.1 |
| Build tool | Maven |
| HTTP API | Spring Web MVC |
| Device communication | TCP |
| Containerization | Docker |
| Database dependencies | JPA and Microsoft SQL Server JDBC driver declared in `pom.xml` |

Although database-related dependencies are declared in the Maven configuration, the current `application.properties` excludes database and JPA auto-configuration. Therefore, these dependencies do not mean that GPS locations are currently being persisted in SQL Server.

## 4. Network Configuration

The Docker Compose configuration publishes the following ports:

| Protocol | Container port | Host mapping | Purpose |
|---|---:|---|---|
| HTTP | `8080` | `127.0.0.1:8080:8080` | REST API and local debugging |
| TCP | `8842` | `8842:8842` | Incoming GPS device communication |

The HTTP port is bound to the host's loopback interface. It is intended for local debugging and is not directly published on every host network interface.

The TCP port is published on all host interfaces so that GPS devices can reach the listener, subject to the host firewall and network configuration.

Within the shared Docker network, Kong can reach the service using:

`http://ms-gps:8080`

The `sg-services-network` Docker network must exist because the Compose configuration declares it as an external network.

## 5. Communication Flow

1. A GPS tracking device sends tracking data to the TCP listener on port `8842`.
2. The service processes the received data and associates it with the device IMEI.
3. The most recent location is retained in application memory.
4. An authorized or permitted client accesses GPS information through the REST API, directly within the configured environment or through Kong when the corresponding gateway route is configured.

The exact REST endpoint paths, request parameters, response fields and device message format must be documented from the implementation's controllers, DTOs and TCP parser.

## 6. Data Persistence

The current implementation retains the latest GPS location in memory rather than persisting it in SQL Server.

As a result:

- The latest received location is available while the service maintains it in memory.
- Restarting the service clears the in-memory location data.
- A new GPS message must be received before the latest location becomes available again.
- The service does not currently provide a persisted GPS history.

The decision not to implement GPS location persistence is documented in **ADR-010**.

## 7. Kafka and Event Messaging

The GPS Service documentation does not define any Kafka event contract because the reviewed configuration does not establish a GPS event producer or consumer.

TCP is used for communication with GPS devices, while HTTP is used for API requests. These communication channels should not be confused with Kafka messaging.

## 8. Configuration

The current `application.properties` defines:

- Application name: `gps-backend`
- HTTP server port: `8080`
- Exclusions for database and JPA auto-configuration during GPS testing

The TCP listener configuration and its internal implementation must be verified in the Java source before documenting additional configuration properties.

## 9. Known Limitations

- GPS locations are not persisted to SQL Server.
- No persisted GPS history is available.
- In-memory location information is lost when the service restarts.
- Exact REST routes and response contracts require verification against the source code.
- The service's TCP listener must be reachable from the GPS devices.
- Kong can proxy the HTTP API only when the gateway route and shared Docker networking are configured correctly.

## 10. Related Documentation

- [Data Model](data-model.md)
- [Events and Messaging](events.md)
- [Architecture Decisions](decisions.md)
- [Runbook](runbook.md)

