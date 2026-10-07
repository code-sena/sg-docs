# Problem Framing — Problem Definition

> **Why this document exists:** Before designing solutions, the team must be aligned on the problem it solves. This document captures that alignment.

---

## 1. The problem in one sentence

**Parents and guardians of students who use school transportation** and **need to know and control their children's trip during the service** have difficulty **knowing in real time where the bus is, whether the student boarded or alighted correctly, and receiving timely updates on exceptions**, due to **the lack of a centralized system that integrates GPS tracking, QR access control, and notifications**, which can cause **uncertainty for guardians, difficulty controlling operations for institutions, and a lack of traceability over routes and student boarding/alighting**.

> **Note:** Exact quantitative impact must be validated with interviews, observation, and real institutional data. No percentage is claimed without evidence.

---

## 2. Affected users

| Segment | Description | Estimated size | Priority |
|---------|-------------|---------------|---------|
| Parents and guardians | Responsible for students who use school transportation and need to know location and status during the trip. | TBD | High |
| Drivers | Responsible for running routes and controlling student boarding and alighting. | TBD | High |
| Institution administrators | Manage students, guardians, drivers, buses, routes, and stops. | TBD | High |
| Students | Users transported on school routes. | TBD | High |

> Only **four** principal roles: Admin (web) · Parent/guardian (mobile) · Student (mobile) · Driver (mobile).

### Jobs-to-be-done (JTBD)

**Parents and guardians**

> **When** my child uses school transportation,  
> **I want** to know the bus location and receive information about boarding, alighting, or exceptions,  
> **so that** I have greater peace of mind and know the trip is being completed correctly.

**Drivers**

> **When** I start and run a school route,  
> **I want** to identify students boarding and alighting via QR,  
> **so that** I keep a record of transported students and trigger the corresponding notifications.

**Administrators**

> **When** I manage the school transportation service,  
> **I want** to manage students, guardians, drivers, buses, routes, and stops from a centralized system,  
> **so that** I have control and traceability of transportation operations.

**Students**

> **When** I board or get off the school bus,  
> **I want** to show my personal QR code in the app,  
> **so that** the driver can reliably register my boarding and alighting.

---

## 3. Evidence of the problem

> Available evidence currently comes mainly from project discovery. Quantitative data must be validated later.

| Evidence type | Source | Date | Key finding |
|--------------|--------|------|------------|
| User interviews | Interviews/discovery with users related to school transportation | 2026 | Identified the need to know bus location and keep guardians informed. |
| User interviews | Discovery with people responsible for the service | 2026 | Identified the need to control who boards and alights the bus. |
| Direct observation | Analysis of the current process | 2026 | There is currently no integrated mechanism to register student boarding/alighting via QR. |
| Benchmarking | Analysis of tracking solutions such as Protrack | 2026 | Vehicle tracking on maps identified as a reference for route and location visualization. |
| Technical validation | Tests with VT03F GPS device | 2026 | Technical feasibility confirmed of receiving GPS data over TCP to obtain vehicle location. |

---

## 4. Current user solution (and its problems)

| Current solution | Limitations | Cost/Friction |
|-----------------|------------|--------------|
| Direct communication among institution, driver, and guardians | Information depends on manual communication; there is no centralized source of truth. | Extra time and possible delays in communication. |
| Manual check of trip status | Does not provide a centralized view of the current bus location. | Uncertainty and dependence on third parties to get information. |
| Manual control of students during boarding/alighting | No automated mechanism records each student-associated event. | Risk of human error and lack of traceability. |
| External GPS tracking systems/platforms | May show vehicles, but do not necessarily integrate students, guardians, routes, and boarding/alighting events in one system. | Need to consult different tools or adapt processes manually. |

---

## 5. Solution hypothesis

**We believe that** a school transportation management platform that integrates **GPS bus tracking, boarding and alighting control via QR codes, route and stop management, and guardian notifications**

**for** parents and guardians, drivers, and administrators of educational institutions

**will achieve** greater visibility, control, and traceability of school transportation, enabling guardians to know bus location and receive information about events related to their students.

**We will know we succeeded when** users can check bus location, correctly register boarding/alighting events via QR, and receive the corresponding notifications, with reduced dependence on manual processes.

---

## 6. Success metrics (North Star)

| Metric | Current baseline | 6-month target | How to measure it |
|--------|----------------|---------------|-------------------|
| Students with registered boarding/alighting events | No centralized measurement | ≥ 95% of events registered via QR | System-generated records |
| Routes with active GPS tracking | TBD | ≥ 95% of operational routes with GPS active | Data received by gps-service |
| Notifications generated correctly | No measurement | ≥ 95% of configured events generate their notification | Event and notification logs |
| App usage by guardians | No measurement | TBD via pilot | Authentication and activity metrics |
| Incidents of unavailable trip information | TBD | Reduction vs baseline | Incident and support logs |

### North Star Metric

**Percentage of school trips in which critical service events — bus location and student boarding/alighting — are registered and available to the corresponding users.**

This metric represents the core value of the system: **give visibility and traceability to school transportation.**

---

## 7. Hypothesis risks

| Risk | Probability | Impact | Experiment to validate |
|------|-------------|--------|----------------------|
| Guardians do not use the app frequently | Medium | High | Run a pilot with guardians and measure access/query frequency. |
| Drivers do not scan QR correctly | Medium | High | Test boarding/alighting on real trips and measure correctly registered events. |
| GPS signal is not stable enough during trips | Medium | High | Test the VT03F on different trips and measure TCP/GPS data continuity. |
| Users do not need location queries as often as assumed | Medium | Medium | Measure how many location queries guardians make in a pilot. |
| Notifications are not timely or relevant | Medium | High | Measure generation/delivery times and collect user feedback. |
| GPS integration has connectivity issues | Medium | High | Test connection, data reception, and device reconnection. |
| Current transportation process varies by institution | Medium | Medium | Validate the flow with different institutions before standardizing. |

---

## 8. Out of scope (we do not solve)

This version of the system **does not aim to solve**:

- Automatic planning of students' academic schedules.
- Academic management of educational institutions.
- Mechanical maintenance of buses.
- Purchase, administration, or physical installation of GPS devices.
- Management of general public transportation services.
- Autonomous driver navigation.
- Automatic generation of optimal routes via artificial intelligence.
- Payment or billing for the school transportation service.
- Direct phone calls between guardians and drivers as a core feature.
- Replacing emergency procedures established by each institution.

---

## Correlations

- Product vision → `03-product/vision.md`
- HUs that implement this solution → `04-requirements/user-stories.md`
- Detailed KPIs → `13-operations/README.md`
- Domain → `02-domain/`
- GPS / tracking → GPS tracking service/module
- QR → boarding and alighting control module

---

## Product roles (canonical)

Only **four** principal roles:

1. **Admin** (web)
2. **Parent / father / guardian** (mobile)
3. **Student** (mobile)
4. **Driver** (mobile)

Formal HUs live in [`../04-requirements/user-stories.md`](../04-requirements/user-stories.md); the product backlog uses the same IDs (`HU-*`).

_Updated: 2026-09-22_
