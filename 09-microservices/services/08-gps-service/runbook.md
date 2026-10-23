# GPS Service — Runbook

## 1. Purpose

This runbook provides basic operational instructions for starting, checking and troubleshooting the GPS Service in a Docker-based environment.

The service has two relevant network interfaces:

- HTTP REST API on container port `8080`.
- TCP listener for GPS devices on container port `8842`.

## 2. Prerequisites

Before starting the service, verify that:

- Docker and Docker Compose are installed.
- The GPS Service repository has been cloned.
- The Docker network `sg-services-network` exists.
- The host allows inbound TCP traffic on port `8842` from the GPS devices.
- The GPS devices are configured to send data to the correct server address and port.

The Compose file declares `sg-services-network` as an external network. Docker Compose will not create that network automatically as part of this service's configuration.

To create it if the deployment environment has not already created it, run:

```bash
docker network create sg-services-network
```

Do not create a duplicate network if the shared network already exists.

## 3. Start the Service

From the directory containing the service's `docker-compose.yml`, build and start the container:

```bash
docker compose up --build -d
```

Check the container status:

```bash
docker compose ps
```

Review the service logs:

```bash
docker compose logs -f ms-gps
```

Use `Ctrl+C` to stop following the logs. This does not, by itself, stop the container.

## 4. Network Ports

| Port | Protocol | Purpose |
|---|---|---|
| `8080` | HTTP | REST API inside the container and loopback-only host mapping |
| `8842` | TCP | Incoming GPS device data |

The current host mapping for HTTP is `127.0.0.1:8080:8080`. For local debugging, the API can be reached through the host loopback interface if the application is running correctly.

From another container on `sg-services-network`, the service address is:

`http://ms-gps:8080`

The TCP mapping `8842:8842` publishes the listener on the host's network interfaces. Verify firewall and routing rules if devices cannot connect.

## 5. Basic HTTP Connectivity Check

On the Docker host, check whether the HTTP port accepts connections:

```bash
curl -i http://127.0.0.1:8080/
```

This is only a connectivity check. The root path `/` may not be a valid application endpoint, so an HTTP `404` response does not necessarily mean that the service is down.

To verify business functionality, use an endpoint confirmed in the service's controller implementation or its API documentation. Do not assume a specific endpoint path without verifying it.

## 6. Troubleshooting

### The container does not start

1. Check the container status with `docker compose ps`.
2. Read the logs with `docker compose logs --tail=200 ms-gps`.
3. Check whether the image builds successfully.
4. Verify that the configured Docker network exists.
5. Review the Java exception reported in the logs.

### GPS devices cannot connect

1. Verify that the device is configured with the correct public IP address or hostname.
2. Verify that the device uses TCP port `8842`.
3. Confirm that the container is running.
4. Confirm that port `8842` is published by Docker.
5. Check the host firewall, network routing and any intervening firewall rules.
6. Confirm that the device is sending data in a format supported by the TCP listener.
7. Review the service logs for incoming messages or parsing errors.

A successful TCP connection does not necessarily mean that the service can parse the device's messages or extract a valid location.

### The API cannot be reached through Kong

1. Confirm that the GPS Service container is running.
2. Confirm that the service listens on port `8080` inside the container.
3. Confirm that Kong and the GPS Service share `sg-services-network`.
4. Confirm that the Kong service configuration targets `http://ms-gps:8080`.
5. Verify that the corresponding Kong route exists and points to the correct service.
6. Review Kong logs and the GPS Service logs.

The host mapping `127.0.0.1:8080:8080` is intended for local debugging. Other containers should use the service address on the shared Docker network instead of relying on the host's loopback interface.

### The location is unavailable after a restart

The current location state is maintained in memory. Restarting the service clears it.

Verify that the device reconnects and sends a new message. Confirm that the service processes that message before checking the location through the API.

This behavior is consistent with ADR-010, which defers GPS location persistence.

## 7. Stop and Restart

Stop the service:

```bash
docker compose down
```

Start it again:

```bash
docker compose up -d
```

Rebuild and restart after code changes:

```bash
docker compose up --build -d
```

Restarting the service clears in-memory GPS state. The latest location must be received again from a device.

## 8. Operational Limitations

- No persisted GPS location history is available.
- In-memory location state is lost on restart.
- The exact health-check endpoint has not been verified.
- The exact GPS API routes must be confirmed against the current source code.
- Database-related dependencies are declared, but database auto-configuration is excluded in the current application properties.

