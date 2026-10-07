# Product Vision

> The vision is the team's north star. All sprints, design decisions, and trade-offs are evaluated against this vision.

---

## Vision statement

**For** parents and guardians of students who use school transportation,

**who** need greater visibility and control over their children's journeys and currently have limited real-time information about the transportation service,

**the** **Guardian Escolar**

**is a** school transportation management and monitoring platform

**that** provides real-time visibility of routes, student boarding and drop-off events, and relevant notifications,

**unlike** traditional manual processes or isolated vehicle tracking solutions,

**our product** integrates GPS tracking, QR-based student control, route management, and communication between the institution, drivers, and guardians in a single platform.

---

## Team mission

Our team exists to improve the safety, visibility, and organization of school transportation through technology.

We seek to give institutions, drivers, and guardians reliable information about each journey, creating greater control and confidence throughout the transportation process.

---

## Strategic pillars

| Pillar | Description | Success metrics |
|--------|-------------|----------------|
| **Safety and traceability** | Ensure that student boarding and drop-off events are recorded and associated with the corresponding transportation route. | % of boarding/drop-off events correctly registered |
| **Real-time visibility** | Provide guardians and authorized users with current information about the location and status of school buses. | % of active routes with GPS data available |
| **Effective communication** | Notify guardians about relevant events during the student's transportation journey. | % of relevant events generating notifications |
| **Operational management** | Centralize the administration of students, guardians, drivers, buses, routes, and stops. | % of transportation data managed through the platform |

---

## High-level roadmap

The product will evolve progressively, prioritizing the validation of the core transportation problem before expanding into more advanced capabilities.

```text
H1 (0-3 months) ───── H2 (3-6 months) ───── H3 (6-12 months)

       [MVP]                  [Expansion]              [Scale]
          │                       │                       │
     Validate core          Improve experience       Expand capabilities
     transportation         and operational          and reliability
        flow                    control
```

| Horizon | Period | Objective | Epics / Features | Uncertainty |
|---------|--------|-----------|------------------|-------------|
| **H1 — Now** | 0-3 months | Validate the core transportation monitoring and control flow. | User management, students, guardians, drivers, buses, routes, stops, QR boarding/drop-off, GPS tracking, basic notifications. | Low |
| **H2 — Next** | 3-6 months | Improve the experience and operational visibility. | Advanced route monitoring, notification improvements, transportation history, incident management, reports and dashboards. | Medium |
| **H3 — Later** | 6-12 months | Scale and deepen the value of the platform. | Advanced analytics, optimization of routes, operational indicators, integrations and scalability improvements. | High |

---

## Product principles

These principles guide design and prioritization decisions when there are trade-offs.

1. **Safety first:**  
   Features that improve student safety, identification, traceability, or transportation control take priority over secondary functionality.

2. **Information when it matters:**  
   Users should receive relevant transportation information at the moment it is useful, without unnecessary complexity or excessive notifications.

3. **Simple for every user:**  
   The platform must be easy to understand for guardians, drivers, and administrators, even when they have different technical abilities.

4. **Traceability by default:**  
   Important transportation events should leave a reliable record that can be consulted when necessary.

5. **Reliable before advanced:**  
   Core functionality such as GPS tracking, QR registration, routes, and notifications must be reliable before adding more complex features.

---

## Product Definition of Done

> The product is considered successful when the core school transportation process can be managed and monitored digitally, providing reliable information to the people who need it.

**Objective:**  
Provide a reliable platform that improves visibility, control, and traceability throughout school transportation journeys.

| Key Result | Baseline | Target | Date |
|------------|----------|--------|------|
| **KR1: Boarding and drop-off events correctly registered** | No centralized digital registration | ≥ 95% of events registered through QR | 6 months |
| **KR2: Active routes with available GPS tracking** | No centralized monitoring | ≥ 95% of active routes | 6 months |
| **KR3: Relevant transportation events generating notifications** | No centralized measurement | ≥ 95% | 6 months |
| **KR4: Transportation information managed through the platform** | Distributed/manual processes | ≥ 90% of operational records managed through the platform | 6 months |

> The baselines marked as "No centralized..." should be replaced with real measurements once the pilot and evidence collection are completed.

---

## Correlations

- Problem framing (the why) → `03-product/problem-framing.md`
- Backlog that implements the vision → `04-requirements/user-stories.md`
- KPIs in operations → `13-operations/README.md`

---

## Principal roles

Only four: **Admin (web)** · **Parent/guardian (mobile)** · **Student (mobile)** · **Driver (mobile)**.

_Aligned with HUs: `04-requirements/user-stories.md` · 2026-09-22_
