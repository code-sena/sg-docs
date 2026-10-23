# GPS Service — Events and Messaging

## 1. Purpose

This document describes the communication mechanisms currently identified for the GPS Service and clarifies the distinction between device communication, HTTP API access and asynchronous event messaging.

## 2. TCP Device Communication

The GPS Service exposes a TCP listener on port `8842` for incoming messages from GPS tracking devices.

The Docker Compose configuration publishes this port using:

`8842:8842`

This mapping makes the container's TCP listener reachable through the host's network interfaces, subject to firewall rules, routing and device configuration.

TCP provides a transport connection between the device and the service. It is not a Kafka topic or a RabbitMQ queue.

The exact GPS packet format, delimiters, parsing rules, authentication mechanism and acknowledgment behavior must be documented from the implemented TCP listener and parser.

## 3. HTTP REST Communication

The service exposes an HTTP API through Spring Boot on container port `8080`.

The Docker Compose configuration binds the host's HTTP port to loopback:

`127.0.0.1:8080:8080`

Within the shared Docker network, Kong can reach the service at:

`http://ms-gps:8080`

External clients should use the configured gateway route when one is available. The exact public route and its security requirements must be confirmed in the Kong configuration.

The HTTP API is separate from the TCP connection used by GPS tracking devices.

## 4. Kafka and RabbitMQ

The reviewed GPS Service configuration does not establish an implemented Kafka producer, Kafka consumer, RabbitMQ publisher or RabbitMQ consumer.

Therefore, this document does not define GPS Kafka topics, RabbitMQ exchanges, queues, event schemas or delivery guarantees.

The absence of a documented event contract should not be interpreted as proof that no other microservice uses Kafka or RabbitMQ elsewhere in Guardian Escolar. It means that such integration has not been verified for this service.

## 5. Current Location Update Flow

The documented flow is:

1. A GPS device sends tracking data over TCP.
2. The GPS Service processes the incoming message.
3. The latest location is retained in application memory.
4. A client requests the location through the REST API.

This flow does not require a message broker. The REST API provides request-response communication, while TCP carries incoming device messages.

## 6. Reliability and Operational Considerations

- The TCP port must be reachable from the GPS device's network.
- The service must be running and listening on the configured port.
- Network access alone does not guarantee that the device's message format is supported.
- The service's in-memory location state is lost on restart.
- No persisted message history or GPS event replay mechanism is documented.
- Kafka or RabbitMQ integration must not be assumed unless it is verified in the source code and configuration.

## 7. Documentation Requirements for Future Messaging

If asynchronous GPS event publishing is introduced, the implementation should document:

- The broker and topic or queue name.
- The event schema and version.
- The producer and consumer services.
- Delivery, retry and duplicate-handling behavior.
- Security and access-control requirements.
- Monitoring and failure-recovery procedures.

