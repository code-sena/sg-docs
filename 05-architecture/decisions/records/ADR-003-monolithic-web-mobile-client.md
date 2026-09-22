# ADR-003 — Monolithic web and mobile client applications

- **ID:** ADR-003
- **Date:** 2026-09-04
- **Status:** Proposed
- **Authors:** Juan Pablo Chala

---

## Context

School Guardian has **two clients** with different needs:

1. **Web / Desktop** — used by the **school administrator** to manage users (students, drivers,
   parents), buses, routes, and stops.
2. **Mobile** — with **role-based views** for:
   - **Parent/Guardian:** see the bus location, receive pickup/drop-off notifications, and alerts.
   - **Driver:** scan the student's QR code (pickup/drop-off registration) and report GPS position.
   - **Student:** show the QR code on their phone.

With 7 microservices in the backend, the question arises: how do we structure these two client
applications? A single monolith per platform, or a fragmented frontend (micro-frontends)?

**Known constraints:**
- Team of 3 people (shared frontend and backend).
- Few actors and differentiated screens (well-defined roles).
- Current stage: MVP, without high UI complexity.
- The frontend consumes the APIs through the **API Gateway** (see ADR-006), not directly from each microservice.

---

## Decision

**We decided:** to build **two monolithic applications**:
1. A **Web App** (admin) — browser portal for school administration.
2. A single **Mobile App** with **role-based views** (parent, driver, student) — the role is
   determined when authenticated with the JWT.

We do **not** use micro-frontends: both apps share the same frontend approach (or two simple,
independent projects) and consume the services through the API Gateway via REST/JSON.

**Justification:**
- Frontend fragmentation (micro-frontends) only adds value with large teams and large UI domains;
  here we have 2 small clients and 3 people.
- A single frontend per platform reduces build, deployment, and testing complexity.
- Role-based views in mobile avoid maintaining several apps that share 80% of the code base
  (layout, login, notifications).

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| A. Monolith per platform (Web + single Mobile with role-based views) | Simple; one deploy per platform; UI reuse; small team | One mobile app with several roles = conditional UI logic | — (CHOSEN: best trade-off for the project size) |
| B. Micro-frontends | Domain independence; large parallel teams | High orchestration/state cost; useless for 3 people | Excessive for the MVP |
| C. One app per role (Admin Web + Parent/Mobile + Driver/Mobile + Student/Mobile) | Full screen and permission isolation | Multiplies builds/deploys/stores; duplicates code base | Duplicated maintenance for 3 people |

---

## Consequences

**Positive:**
- A single project per platform: simple build, test, and deploy.
- The role (JWT) decides which sections are shown in the mobile app; the backend already
  validates permissions.
- Less UI surface to maintain.

**Negative / Trade-offs:**
- If role-based views grow a lot in the future, the mobile app may need to be split.
- Conditional role logic must stay organized (do not break the inner "monolith").

**Impact on the system:**
- Affected services: client applications (web and mobile).
- Documents that must be updated:
  - `05-architecture/overview.md` (architecture diagram with the clients)
  - `12-ux-ui/` (UX/UI guidelines per role)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| The monolithic mobile app becomes hard to maintain if roles grow | Medium | Medium | Review post-MVP; separate by features from the start (clean modules/repos) |
| Duplication of business logic in the frontend (validations in 2 apps) | Medium | Medium | Keep business validations in the backend; the frontend only presents |

---

## References

- Related to: ADR-002 (shared database), ADR-004 (Apache Kafka), ADR-006 (API Gateway)
- Frontend patterns → `05-architecture/pattern-guide.md`