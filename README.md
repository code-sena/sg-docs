# School Guardian - Documentation Portal

This is the official technical documentation for **School Guardian**, a professional school transport management platform.

## 🚀 Project Essence
School Guardian provides real-time tracking, route management, and security for school transport, ensuring the safety of students and peace of mind for parents and administrators.

## 🛠️ Confirmed Tech Stack
The system is built using a **Polyglot Microservices Architecture** following **Hexagonal (Ports & Adapters)** principles.

| Component | Technology |
|---|---|
| **Primary Backend** | .NET 10 / C# 14 |
| **Identity & GPS** | Java 21 / Spring Boot 3.x |
| **API Gateway** | Kong OSS (with custom `sg-jwt` plugin) |
| **Database** | AWS RDS - SQL Server 2022 (Schema-per-service) |
| **Messaging** | Apache Kafka |
| **Frontend** | Angular 21 (Web) / React + Expo (Mobile) |
| **Infrastructure** | AWS EC2 (Docker Compose + Portainer) |

---

## 🗺️ Documentation Map

| # | Folder | Purpose |
|---|--------|---------|
| 00 | [00-governance](./00-governance/README.md) | Team rules: Git, naming, security policy |
| 01 | [01-context](./01-context/README.md) | Project vision, scope and glossary |
| 02 | [02-domain](./02-domain/README.md) | DDD: Entities, business rules and domain events |
| 03 | [03-product](./03-product/README.md) | PRD, product vision and roadmap |
| 04 | [04-requirements](./04-requirements/README.md) | Functional and Non-Functional requirements |
| 05 | [05-architecture](./05-architecture/README.md) | ADRs, C4 diagrams and Hexagonal patterns |
| 06 | [06-data](./06-data/README.md) | RDS Models, Data Dictionary and Liquibase strategy |
| 07 | [07-api](./07-api/README.md) | API Contracts (v1), Auth and REST guidelines |
| 08 | [08-uml](./08-uml/README.md) | Technical diagrams (Sequence, Class, ER) |
| 09 | [09-microservices](./09-microservices/README.md) | Detailed microservices catalog and runbooks |
| 10 | [10-devops](./10-devops/README.md) | AWS Setup, Local environment and Deployment |
| 11 | [11-quality](./11-quality/README.md) | Testing strategy and Quality gates |
| 12 | [12-ux-ui](./12-ux-ui/README.md) | Design system and Wireframes |
| 13 | [13-operations](./13-operations/README.md) | Backups, Observability and Incidents |
| 14 | [14-training](./14-training/README.md) | Onboarding and User manuals |
| 15 | [15-project-control](./15-project-control/README.md) | Risks and Technical Backlog |

---

## ⚖️ The Golden Rule
> **The code is the only absolute truth.** Any discrepancy between these documents and the implementation in `/backend` must be reported and corrected immediately.

## 🔗 Quick Links
- **Architecture Decisions:** [`docs/05-architecture/decisions`](./05-architecture/decisions)
- **API Contracts:** [`docs/07-api/contracts`](./07-api/contracts)
- **Deployment Guide:** [`docs/05-architecture/deployment.md`](./05-architecture/deployment.md)
