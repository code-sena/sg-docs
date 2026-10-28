# ADR-014 — Use of HTTP Polling for GPS Location Updates

> **Proposed path:** `records/ADR-014-http-polling-vs-websockets.md`

- **ID:** ADR-014
- **Date:** 2026-10-27
- **Status:** Accepted
- **Authors:** Sharik Dayanna Rojas Ibarra

---

## Context

Guardian Escolar needs to display the available location of the school bus on a map within the mobile application, allowing parents and guardians to monitor the vehicle during its route. The system uses a physical VT03F GPS device that provides coordinates to the backend. The mobile application periodically requests the available location to update the map.

A communication mechanism had to be selected between the mobile application and the backend to retrieve location updates. The main alternatives considered were HTTP polling and WebSockets.

HTTP polling allows the client to send periodic requests to the server to retrieve the latest available location. WebSockets, on the other hand, establish a persistent connection through which the server can send updates to the client without requiring a separate HTTP request for each update.

This decision is important because it affects implementation complexity, communication resource consumption, and how frequently the application reflects location changes.

**Known constraints:**

- The current testing scope uses a physical VT03F GPS device.
- The mobile application requests the available location through HTTP every 5 seconds.
- The current scope requires periodic vehicle location visualization, rather than guaranteed instantaneous communication.
- The implementation should remain simple and consistent with the existing architecture.
- No comparative load or performance test results are available to demonstrate the quantitative superiority of either alternative.

---

## Decision

HTTP polling with a 5-second interval was selected to retrieve the GPS location available in the backend and update its visualization in the mobile application.

**We decided:** to implement periodic HTTP requests every 5 seconds instead of WebSockets for the current vehicle location update mechanism.

**Justification:**

The decision is primarily based on implementation simplicity and suitability for the current scope of Guardian Escolar.

HTTP polling allows the system to reuse its existing HTTP communication mechanism and retrieve the latest available location without introducing the additional management of persistent connections, reconnections, and communication events that a WebSocket-based solution would require.

The 5-second interval establishes a defined request frequency that is appropriate for the currently implemented periodic tracking strategy. However, this interval does not guarantee that the GPS device generates a new coordinate for every request or that the displayed location is never more than 5 seconds old.

WebSockets remains a technically valid alternative if future requirements call for event-driven updates, lower communication latency, or optimization under higher concurrent usage. Its adoption should be evaluated based on the system's requirements and actual measurements.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|---|---|---|---|
| **HTTP polling every 5 seconds — selected** | Simple implementation; uses HTTP requests; defined request frequency; straightforward integration with the existing backend mechanism. | Generates periodic requests even when the location has not changed; may increase network and server load as the number of clients grows. | Not discarded; selected for the current scope. |
| WebSockets | Allows the server to send updates when new data becomes available; avoids a separate HTTP request for every update; can reduce delivery latency. | Requires management of persistent connections, reconnections, disconnections, and event distribution; introduces additional complexity. | Not selected because periodic requests meet current needs, and continuous real-time communication has not been established as a requirement. |
| Server-Sent Events (SSE) | Allows the server to send events to the client over a persistent connection; may be suitable for one-way updates. | Requires implementation and maintenance of an event stream; integration with the existing clients and infrastructure must be evaluated. | Not selected because it introduces a communication mechanism that is not necessary for the implemented scope. |

---

## Consequences

**Positive:**

- Maintains a simple implementation for retrieving available GPS locations.
- Reuses HTTP communication between the mobile application and the backend.
- Establishes a known request interval of 5 seconds.
- Avoids introducing the complexity of managing persistent WebSocket connections at this stage.
- Allows the update mechanism to evolve if project requirements change.

**Negative / Trade-offs:**

- Periodic requests are made even when the location has not changed.
- The displayed position may be delayed by GPS transmission, backend processing, HTTP polling, and interface rendering.
- Resource consumption may increase when many clients send requests simultaneously.
- Polling requires the application to have connectivity to the backend to retrieve updates.
- A 5-second interval does not guarantee real-time updates or a new coordinate for every request.

**Impact on the system:**

- **Affected services:** Guardian Escolar mobile application, GPS backend service, and HTTP location retrieval mechanism.
- **Documents that must be updated:** architecture documentation, GPS tracking technical description, and architectural decision records (ADRs).
- **Future considerations:** measure behavior with multiple clients, evaluate backend load, and consider WebSockets or another communication mechanism if latency or scalability requirements change.

---

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Increased HTTP request volume as the number of connected users grows. | Medium | Medium | Measure backend load, review the polling interval, and evaluate more efficient update mechanisms if necessary. |
| Displaying an outdated location when the GPS device stops transmitting. | Medium | High | Check the age of the last coordinate, detect signal loss, and communicate the location status in the interface. |
| Delays in map updates. | Medium | Medium | Review GPS transmission time, backend processing, and the client's polling interval. |
| Network disconnection between the application and the backend. | Medium | Medium | Handle HTTP errors and connection states; verify and document the implemented recovery behavior. |

*Probabilities and impacts are initial qualitative estimates, not results from production measurements.*

---

## References

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [MDN — WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- Related to: ADR-013 — Use of a Single GPS Device for Initial Testing.

