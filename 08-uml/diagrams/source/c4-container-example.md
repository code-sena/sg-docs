# Example: C4 Container Diagram

> This file shows how to document the system with a C4 Level 2 (Container) diagram.
> The diagram uses Mermaid, which renders natively on GitHub, GitLab, and most modern
> editors (VS Code with an extension, Obsidian, etc.).
>
> **Instruction:** Copy this structure, replace the example services (api-gateway,
> iam-service) with your project's real services, and move it to `diagrams/source/c4-container.md`.

---

## Example system: [X] management platform

```mermaid
C4Container
    title Container Diagram — [System Name]

    Person(user, "User / Client", "Accesses the system from browser or mobile app")
    Person(admin, "Administrator", "Manages system configuration and users")

    System_Boundary(system, "[System Name]") {

        Container(frontend, "Web Frontend", "React / Vue / Angular", "User interface. SPA served as static files.")

        Container(gateway, "API Gateway", "[Your framework]", "Single entry point. Validates JWT tokens, routes to the correct service, applies rate limiting.")

        Container(auth, "Auth Service", "[Your stack]", "Handles authentication (login/register/refresh). Owner of the User and Role entities.")

        Container(service_a, "[Service A]", "[Your stack]", "[Service A primary responsibility. Owner of [Entity A].]")

        Container(service_b, "[Service B]", "[Your stack]", "[Service B primary responsibility. Owner of [Entity B].]")

        ContainerDb(db_auth, "SQL Server (schema Iam)", "SQL Server", "Users, roles, refresh tokens.")
        ContainerDb(db_a, "DB [Service A]", "[Chosen engine]", "[Service A] domain data.")
        ContainerDb(db_b, "DB [Service B]", "[Chosen engine]", "[Service B] domain data.")
        ContainerDb(redis, "Redis", "Redis", "Token blacklist, rate limiting, shared cache.")
        ContainerDb(broker, "Message Broker", "Kafka / RabbitMQ", "Domain events between services.")
    }

    System_Ext(ext_email, "Email Service", "Sendgrid / SES / SMTP")
    System_Ext(ext_payment, "Payment gateway", "[If applicable to the project]")

    %% User → System
    Rel(user, frontend, "Uses", "HTTPS")
    Rel(admin, frontend, "Administers", "HTTPS")
    Rel(frontend, gateway, "API calls", "HTTPS / REST")

    %% Gateway → Services
    Rel(gateway, auth, "Validates tokens / routes", "Internal HTTP")
    Rel(gateway, service_a, "Routes requests", "Internal HTTP")
    Rel(gateway, service_b, "Routes requests", "Internal HTTP")

    %% Services → DB (each service has its own DB)
    Rel(auth, db_auth, "Reads / writes", "SQL")
    Rel(auth, redis, "Token blacklist", "Redis protocol")
    Rel(gateway, redis, "Rate limiting", "Redis protocol")
    Rel(service_a, db_a, "Reads / writes", "SQL / NoSQL")
    Rel(service_b, db_b, "Reads / writes", "SQL / NoSQL")

    %% Async communication
    Rel(auth, broker, "Publishes events (user.registered)", "Async")
    Rel(service_a, broker, "Publishes / consumes events", "Async")
    Rel(service_b, broker, "Consumes events from [Service A]", "Async")

    %% External systems
    Rel(service_b, ext_email, "Sends notifications", "HTTPS / SMTP")
    Rel(service_a, ext_payment, "Processes payments", "HTTPS")
```

---

## How to use this diagram

1. **Render on GitHub:** The diagram renders automatically on push. No extra tooling required.

2. **Render in VS Code:** Install the "Markdown Preview Mermaid Support" extension or the official Mermaid extension.

3. **Export as image:** Use the [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli):
```bash
mmdc -i c4-container-example.md -o ../exports/c4-container.svg
```

4. **Update the diagram:** The diagram lives in Git next to the code. When the architecture changes (new service, new DB engine), update the diagram in the same PR.

---

## Conventions for this project

| Element | Color / Style | When to use |
|----------|---------------|-------------|
| `Container` | Blue | Microservice or deployable application |
| `ContainerDb` | Blue cylinder | Database, cache, broker |
| `Person` | Person icon | Human actor |
| `System_Ext` | Gray | Third-party system you do not control |

---

## Correlations

- Service catalog → `09-microservices/service-catalog.md`
- Per-service details → `09-microservices/services/`
- Index of all diagrams → `08-uml/diagram-index.md`
