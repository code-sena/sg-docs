# Project Glossary

> **Instructions:** Define here all technical and business terms used in the project.
> This is the official dictionary — if there is ambiguity, this document wins.
> Add terms throughout the project, not only at the start.

---

## How to use this glossary

1. Before using a technical or business term in code, docs, or conversations: look it up here.
2. If it's not there: add it with its definition.
3. If there is disagreement about the definition: discuss it as a team and update this document.

---

## Domain terms

| Term | Definition | Notes / Synonyms |
|------|-----------|-----------------|
| Parent / Father | Adult responsible for a student who receives notifications and tracks the student's school transport | Synonym: "Guardian". Use exactly one term consistently; "Guardian" is preferred |
| Student | Person enrolled in the institution who uses the school transport service | |
| Driver | Person who operates a vehicle on a school route | |
| School | Educational institution that provides or contracts the transport service | |
| Route | Journey that a vehicle follows to pick up and drop off students | Spanish: "ruta" |
| Stop | Fixed point where a student boards or alights from the vehicle | Spanish: "parada" |
| Boarding | The action of getting on the vehicle, recorded as the pickup check-in | Spanish: "abordaje" |
| Attendance | Record of which students boarded or alighted at each leg of the trip | |
| Vehicle | Transport unit assigned to a route | |

---

## Technical terms of the project

| Term | Definition |
|------|-----------|
| Microservice | Independent service with a single responsibility, its own process, and its own database |
| Domain Event | A fact that occurred in the business that other services can observe. Name always in past tense. |
| Bounded Context | Boundary within which a particular domain model has consistent meaning |
| API Gateway | Single entry point to the system that routes requests to the corresponding microservices |
| Circuit Breaker | Pattern that stops calls to a failing service, preventing failure cascades |
| Saga | Sequence of local transactions across different services with compensating transactions on failure |
| Dead Letter Queue | Queue where messages that could not be processed after several retries are sent |
| Idempotence | Property of an operation to produce the same result if executed multiple times |

---

## Acronyms

| Acronym | Meaning |
|---------|---------|
| IAM | Identity and Access Management |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DTO | Data Transfer Object |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| SLO | Service Level Objective |
| SLA | Service Level Agreement |
| ADR | Architecture Decision Record |
| PR | Pull Request |
| DoD | Definition of Done |
| CI/CD | Continuous Integration / Continuous Delivery |
