# ADR-013 — Use of a Single GPS Device for Initial Testing

- **ID:** ADR-013
- **Date:** 2026-10-26
- **Status:** Accepted
- **Proposed path:** `records/ADR-013-single-gps-initial-testing.md`
- **Authors:** Sharik Dayanna Rojas Ibarra
---

## Context

Guardian Escolar includes a GPS tracking feature that allows families to view the location of a school bus through the mobile application.

During the initial testing stage, the development team needs to validate the GPS location reception and display flow within the existing system, using the available test users, families, and routes.

For this stage, only one physical GPS device is available. Therefore, the device will be used as a shared reference for the initial tests rather than assigning individual GPS devices to different buses or routes.

The current objective is to validate the initial GPS tracking functionality and its integration with the existing application and infrastructure. Supporting multiple GPS devices and establishing individual device assignments are outside the scope of this initial testing stage.

**Known constraints:**

- Only one physical GPS device is available for initial testing.
- The GPS device will serve as the shared reference device for the initial test environment.
- Existing microservices and infrastructure must be reused wherever applicable.
- Test users, families, and routes must use the existing data model and valid relationships.
- No fictitious routes, route executions, or relationships will be created solely to accommodate the GPS device.
- This decision does not establish that every possible user, family, or route association has been implemented or validated.
- Support for multiple GPS devices and individual device assignments may be evaluated in a future development stage.

---

## Decision

**We decided:** To use a single physical GPS device for the initial Guardian Escolar testing stage, allowing the team to validate GPS location reception and display while testing the application with the available users, families, and routes.

**Justification:**

Using one GPS device reduces the scope and complexity of the initial implementation. It allows the team to focus on validating the existing GPS tracking flow and its integration with the application without introducing additional device-management functionality that is not required for the current testing scenario.

The device will be used as a shared reference for testing. This does not mean that the system currently supports independent GPS tracking for multiple buses or that the device is automatically associated with every family or route.

Any relationships required for the test must follow the existing data model and constraints.

This decision defines the scope of the initial testing stage. It does not imply that all GPS-related scenarios or the complete end-to-end functionality have already been verified.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for decision |
|---|---|---|---|
| **Option A — Use a single GPS device for initial testing (chosen)** | Reduces implementation complexity; allows testing with the available infrastructure; focuses on the current project scope. | Does not validate independent tracking across multiple buses. | Selected because it meets the needs of the initial testing stage. |
| Option B — Implement support for multiple GPS devices from the beginning | Supports independent tracking for multiple buses and future device assignments. | Increases development scope, data-management requirements, integration work, and testing effort. | Deferred because it is not necessary for the initial tests. |
| Option C — Simulate multiple GPS devices and routes | Allows testing scenarios involving multiple devices without purchasing additional hardware. | Requires additional simulation logic and test scenarios. | Deferred until the initial GPS tracking functionality has been validated. |

---

## Consequences

**Positive:**

- Reduces the scope of the initial implementation.
- Allows the team to test GPS location reception and display using the available physical device.
- Supports initial application testing with the available test users, families, and routes.
- Reuses the existing GPS microservice and infrastructure.
- Avoids introducing premature complexity related to managing multiple GPS devices.
- Establishes a clear scope for the initial demonstration and functional validation.

**Negative / Trade-offs:**

- Does not demonstrate independent GPS tracking for multiple buses.
- Does not validate the assignment of separate GPS devices to individual routes.
- The shared device does not, by itself, establish which bus or route a location belongs to.
- Additional design and implementation work may be required when multiple physical GPS devices are introduced.

**Impact on the system:**

- **Affected services:**
  - `sg-ms-gps`: receives GPS location updates from the available device.
  - `broker-kafka`: existing infrastructure may be reused where required by the current GPS integration.
  - Mobile application: displays GPS tracking information through the existing functionality.
  - Existing user, family, and route services: provide the data required for the test environment, subject to their current implementation and relationships.

- **Documents that may need updating:**
  - Guardian Escolar architecture documentation.
  - GPS tracking technical documentation.
  - Functional test plan for initial GPS tracking.
  - Related GPS architecture decision records, if applicable.

---

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| The single device cannot represent the behavior of multiple buses. | High | Medium | Document this limitation and validate multi-device behavior in a future stage. |
| Test data does not contain the relationships required to display the expected information. | Medium | High | Verify the existing user, family, and route relationships before testing. |
| The shared GPS location may be interpreted as representing a specific bus or route without a verified association. | Medium | High | Clearly identify the scope of the test and avoid claiming individual device-to-route assignment where it is not implemented. |
| Future multi-device support requires changes to the current design. | Medium | Medium | Review device identification and its relationships with buses and routes when the functionality enters the project scope. |

---

## References

- `sg-ms-gps` source code.
- Existing GPS location reception and display implementation.
- Existing mobile application GPS tracking functionality.
- Existing user, family, and route data models.
- Related GPS architecture decision records, if available.