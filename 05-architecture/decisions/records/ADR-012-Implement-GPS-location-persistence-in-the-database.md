# ADDR-010 — Do Not Implement GPS Location Persistence in the Database

- **ID:** ADDR-012
- **Date:** 2026-10-23
- **Status:** Accepted
- **Authors:** Guardian Escolar Development Team

---

## Context

Guardian Escolar needs to display the current location of school transportation vehicles to parents and guardians while the vehicle is in transit. The `sg-ms-gps` service receives GPS coordinates from the tracking device over TCP and exposes the current location through its existing REST API.

The current functional scope requires real-time location tracking, but it does not require historical route tracking, location history reports, or the reconstruction of previously traveled routes.

The database schema contains the `Gps.GpsDevice` and `Gps.GpsLocation` tables. However, their existence does not mean that the GPS service must persist every received location. Implementing this persistence would introduce recurring database write operations, additional storage consumption, and maintenance requirements without providing a necessary benefit for the current functionality.

Because the service only needs to provide the latest known location, keeping the current position in memory is sufficient for the existing requirements.

**Known constraints:**
- The current requirement is to display the vehicle's latest GPS location.
- Historical location tracking is not currently required.
- The existing TCP receiver and REST API must continue working.
- The implementation should avoid unnecessary database operations and architectural complexity.
- This decision may be reconsidered if the functional requirements change.

---

## Decision

**We decided:** Not to implement GPS location persistence in the `Gps.GpsDevice` and `Gps.GpsLocation` database tables at this stage. The `sg-ms-gps` service will retain the latest location in memory and expose it through the existing REST API.

**Justification:**

Persisting every GPS update is unnecessary when the system only needs to display the vehicle's current position. Keeping the latest location in memory avoids repeated database writes for incoming coordinates and prevents the accumulation of location records that are not currently used by any required functionality.

This approach also keeps the implementation simpler and reduces the GPS service's dependency on SQL Server for real-time location updates.

The decision is not based on the assumption that two database tables inherently cause performance degradation. The main consideration is that continuous location persistence introduces additional write workload and data growth without satisfying a current business requirement.

The database tables will remain in the existing schema. This decision only means that the GPS service will not use them to persist incoming location updates as part of the current implementation.

If historical tracking, route auditing, or location-based reporting becomes a requirement in the future, the team will evaluate a dedicated persistence strategy through a new or revised architectural decision.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|---|---|---|---|
| Keep the latest location in memory — **Selected** | Avoids continuous database writes; supports current-location display; simple implementation | The latest location is lost when the service restarts; no historical data is available | Selected because it satisfies the current functional scope |
| Persist every location in `Gps.GpsLocation` | Enables historical tracking, auditing, and route analysis | Generates frequent writes, increases data volume, and requires additional maintenance | Not selected because historical tracking is not currently required |
| Persist only the latest location for each device | Preserves the latest location across restarts without retaining every update | Still requires database writes and update operations; does not provide route history | Not selected because persistence of the latest location is not a current requirement |
| Remove the GPS tables from the database schema | Removes unused schema objects | Could affect other components, existing scripts, documentation, or future functionality | Not selected because the tables can remain without being used by the GPS service |

---

## Consequences

**Positive:**
- Avoids repeated SQL Server writes for incoming GPS locations.
- Prevents unnecessary growth of GPS location records.
- Keeps the real-time tracking implementation simpler.
- Reduces the GPS service's dependency on database availability for updating and retrieving the current location.
- Avoids the need for JPA entities and repositories dedicated to location persistence at this stage.

**Negative / Trade-offs:**
- The latest in-memory location is lost when the GPS service restarts.
- Historical routes and location reports cannot be generated from locations that were never persisted.
- Future auditing or historical tracking requirements will require a new persistence implementation.
- Documentation must clearly state that historical GPS persistence is outside the current scope.

**Impact on the system:**
- **Affected service:** `sg-ms-gps`.
- **TCP GPS receiver:** Remains unchanged.
- **REST API:** The existing endpoint for retrieving the current location remains unchanged.
- **In-memory cache:** Retained as the mechanism for storing the latest location.
- **SQL Server:** The GPS location flow will not write location updates to the database.
- **Database schema:** `Gps.GpsDevice` and `Gps.GpsLocation` remain in place; this decision does not require deleting them.
- **Documents to update:** GPS service documentation, architecture documentation, and related architectural decision records, where applicable.

---

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| The latest location is lost after a service restart | Medium | Medium | Allow the service to receive a new location from the GPS device and refresh the in-memory cache |
| Historical tracking becomes a future requirement | Medium | Medium | Reassess this decision and approve a suitable persistence strategy |
| Other components assume GPS history is available in SQL Server | Low | Medium | Document that location history is not provided by the current GPS implementation |
| GPS update frequency increases | Medium | Low | Monitor memory usage and ensure that only the latest required location per device is retained |

---

## References

- `sg-ms-gps` source code.
- Existing TCP GPS receiver and REST API for retrieving the current location.
- Guardian Escolar database schema: `Gps.GpsDevice` and `Gps.GpsLocation`.
- Related Guardian Escolar architectural decisions concerning real-time GPS tracking.
