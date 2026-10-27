# Diagram Index

> PlantUML sources live in `08-uml/diagrams/source/`. They are the editable source
> of truth; GitHub renders the Mermaid diagrams kept in the architecture and data docs.

## Architecture

| ID | Name | Type | Source | Purpose |
|----|------|------|--------|---------|
| C4-01 | System context | C4 L1 / PlantUML | [c1-system-context.puml](./diagrams/source/c1-system-context.puml) | Actors, School Guardian and external providers |
| C4-02 | Container diagram | C4 L2 / PlantUML | [c2-container-diagram.puml](./diagrams/source/c2-container-diagram.puml) | Web/mobile, Kong, 8 services, Kafka and shared SQL Server |
| C4-03 | Deployed topology | C4 deployment / Mermaid | [deployment.md](../05-architecture/deployment.md) | AWS EC2, RDS and runtime boundaries |
| C4-04 | Service domain map | Mermaid | [service-catalog.md](../09-microservices/service-catalog.md) | Services, ownership, schemas and communication |

## Sequence diagrams

| ID | Name | Source | Purpose |
|----|------|--------|---------|
| SEQ-01 | Login with JWT RS256 | [seq-login.puml](./diagrams/source/seq-login.puml) | Credentials, IAM, access and refresh tokens |
| SEQ-02 | QR boarding / alighting | [seq-qr-boarding.puml](./diagrams/source/seq-qr-boarding.puml) | Synchronous scan validation followed by asynchronous guardian push |
| SEQ-03 | GPS ingestion | [seq-gps-ingestion.puml](./diagrams/source/seq-gps-ingestion.puml) | GT06 packet processing and current in-memory location lookup |
| SEQ-04 | Incident report | [communication-patterns.md](../09-microservices/communication-patterns.md) | Incident persistence and recipient notification (Flow B) |

## Data model

| ID | Name | Type | Source | Purpose |
|----|------|------|--------|---------|
| UML-01 | Core domain relationships | UML class / PlantUML | [class-domain-core.puml](./diagrams/source/class-domain-core.puml) | Partial view of school, identity, fleet, routes, boarding and alerts |
| ERD-01 | Full relational model | Mermaid ER | [models.md](../06-data/models.md) §1 | All 33 deployed tables and their foreign keys |
| ERD-02 | Schema overview | Mermaid | [models.md](../06-data/models.md) §0 | Nine schemas and migration dependencies |

## Maintenance

- Keep sources aligned with [architecture overview](../05-architecture/overview.md),
  [service catalog](../09-microservices/service-catalog.md), [communication patterns](../09-microservices/communication-patterns.md)
  and [data models](../06-data/models.md).
- The GPS diagram records the current behavior, including the documented in-memory-only limitation.
- Update a diagram in the same change as its architecture, API or data-model change.
- Render PlantUML locally with `plantuml -tsvg 08-uml/diagrams/source/*.puml`.
