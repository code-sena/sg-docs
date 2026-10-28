# ADR-015 — Arrival Notification for Students Without a Phone

- **ID:** ADR-015
- **Date:** 2026-10-27
- **Status:** Accepted
- **Authors:** Sharik Dayanna Rojas Ibarra

---

## Context

Student boarding and drop-off are recorded using QR codes. However, some students are young and do not have a phone to use this method. In those cases, parents or guardians can accompany them when they board, but families also need to know when the vehicle reaches the school.

A future improvement could send guardians a notification when the vehicle arrives at the school. This notification would confirm that the vehicle arrived; it would **not** confirm that a specific student got off. Confirming that would require an additional record.

**Known constraints:**

- Arrival notifications are not implemented in the current version.
- The vehicle’s location must allow the system to identify when it reaches its destination.
- The system must distinguish between the vehicle’s arrival and an individual student getting off.
- Some students do not have a phone to scan a QR code.

---

## Decision

We propose adding a notification to guardians in a future version when the vehicle reaches the school, without presenting it as confirmation that an individual student got off.

**Justification:**

This option gives families of young students useful information without requiring each student to have a phone. It preserves the distinction between two events: the vehicle reaching its destination and a student getting off or being received. This avoids sending a confirmation that the system cannot yet verify.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|---|---|---|---|
| Notify guardians when the vehicle reaches the school — proposed option | Informs guardians of the vehicle’s arrival without requiring the student to have a phone. | Does not, by itself, confirm that an individual student got off. | — Proposed |
| Require every student to scan a QR code when getting off | Associates the record with a specific student. | Does not work well for young students who do not have a phone or cannot scan the code independently. | Does not adequately cover all students. |
| Treat the vehicle’s arrival notification as confirmation that the student got off | Simple for guardians. | Confuses the vehicle’s arrival with the individual student’s drop-off and could provide incorrect information. | Rejected because it does not verify the individual event. |
| Have a school staff member record that the student was received | Could confirm that the student was received. | Requires defining who records the reception and adding that flow to the system. | To be considered as a future complement. |

---

## Consequences

**Positive:**

- Guardians would receive information when the vehicle reaches the school.
- The proposal accounts for young students who do not have a phone.
- The system would preserve the distinction between the vehicle’s location and an individual student’s status.

**Negative / Trade-offs:**

- The notification would not prove that each student got off the vehicle.
- The feature requires future implementation and depends on the system detecting or recording arrival at the destination.
- Confirming individual student reception may require an additional record by school staff.

**Impact on the system:**

- Affected services: GPS, notifications, and—if individual confirmation is implemented—user or student management.
- Documents to update: architecture documentation, the vehicle arrival flow, and notification specifications.

---

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Guardians may interpret the vehicle’s arrival as confirmation that their student got off. | Medium | High | Word the notification to say that the vehicle arrived, not that the student was received. |
| Inaccurate location data may trigger the notification too early or too late. | Medium | Medium | Define and validate how arrival at the destination is detected before implementation. |
| The notification may not reach the guardian. | Medium | Medium | Define how delivery failures are handled and show delivery status when the platform supports it. |

---

## References

- Guardian Escolar project repositories: [https://github.com/school-guardian-project](https://github.com/school-guardian-project)
- Related to: ADR about recording boarding and drop-off with QR codes, if one exists.