# Local Project Setup

> This document ensures that any developer can have a functional local environment
> in less than 1 hour. If it takes longer, the document is incomplete.
> **Rule:** If you have to guess something or look elsewhere, add what's missing here.

---

## Prerequisites

### Universal tools (all stacks)

| Tool | Minimum version | Install from | Verify with |
|------|----------------|--------------|-------------|
| Docker | 24.0+ | docker.com | `docker --version` |
| Docker Compose | 2.20+ | Included with Docker Desktop | `docker compose version` |
| Git | 2.40+ | git-scm.com | `git --version` |

### Project language tool

> Add here the specific tool for the chosen stack and remove this instruction.
> See your stack guide in `_stacks/` for recommended versions.

| Tool | Minimum version | Install from | Verify with |
|------|----------------|--------------|-------------|
| [Language / Runtime] | [LTS version] | [Official URL] | `[command --version]` |
| [Package manager] | [version] | [included / URL] | `[command --version]` |
| [Additional tool] | [version] | [URL] | [command] |

**Stack tool reference:**
- Node.js + TypeScript → [`_stacks/node-typescript.md`](../_stacks/node-typescript.md)
- Java + Spring Boot → [`_stacks/java-spring.md`](../_stacks/java-spring.md)
- Python + FastAPI → [`_stacks/python-fastapi.md`](../_stacks/python-fastapi.md)
- .NET 10 → [`_stacks/dotnet-aspnet.md`](../_stacks/dotnet-aspnet.md)
- Java → [`_stacks/java-spring.md`](../_stacks/java-spring.md)

**Recommended (not required):**
- Team editor: [VS Code / IntelliJ IDEA / PyCharm]
- Postman or Insomnia for manually testing endpoints

---

## Local ports in use

Verify these ports are free before starting:

| Port | Service | Description |
|------|---------|-------------|
| 8000 | api-gateway (Kong OSS) | Public entry point |
| 8080 | business services | each microservice (Docker DNS by name) |
| 1433 | SQL Server | Relational database (monolith instance) |
| 9092 | Kafka | Message broker (ADR-004) |

**Check free ports:**
```bash
# Windows
netstat -ano | findstr ":[PORT]"

# macOS / Linux
lsof -i :[PORT]
```

---

## Step-by-step installation

### Step 1: Clone the repository

```bash
git clone https://github.com/[org]/[repo].git
cd [repo]
```

### Step 2: Environment variables

```bash
# Copy the example environment variables
cp .env.example .env

# Edit .env if you need to change any value
# (for local, the .env.example defaults should work)
```

**Required variables to configure in .env:**

| Variable | Description | Value for local |
|----------|-------------|----------------|
| `ConnectionStrings__Default` / `MSSQL_*` | SQL Server connection | `Server=localhost,1433;Database=school_guardian;User Id=sa;Password=***;TrustServerCertificate=True` |
| `JWT_SECRET` | Key for signing JWT | `[generate with: openssl rand -base64 32]` |
| `[VARIABLE]` | [description] | [example value] |

> **NEVER** commit the `.env` file. It is in `.gitignore` for a reason.

### Step 3: Start the infrastructure

```bash
# Start databases and brokers in Docker
docker compose up -d

# Verify they are healthy
docker compose ps
```

The command should show all containers in `healthy` or `running` state.

### Step 4: Install dependencies

> Commands depend on the project stack. See `_stacks/[your-stack].md → Project commands`.

| Stack | Command |
|-------|---------|
| **.NET 10 (project stack)** | `dotnet restore` |
| Node.js + npm | `npm install` |
| Java + Maven | `mvn install -DskipTests` |
| Python + Poetry | `poetry install` |
| .NET 10 | `dotnet restore` |

> For .NET services the Docker images already run `dotnet restore` at build time,
> so this step is only needed when you develop outside Docker.

### Step 5: Run migrations

> **This project runs no migrations from the services.** The schema lives in the
> isolated `database/` repository and is applied with **Liquibase** (ADR-009):
>
> ```bash
> cd database && docker compose up -d
> ```
>
> That single file starts SQL Server, creates the database and runs the 11
> Liquibase changelogs (one per service schema). Never add `Migrations/` or
> Liquibase files inside a microservice.
>
> The table below is the generic reference for other stacks.

| Stack / Tool | Command |
|--------------|---------|
| Node.js + knex/Prisma | `npm run db:migrate` |
| Java + Flyway | `mvn flyway:migrate` (or automatic on startup) |
| Python + Alembic | `alembic upgrade head` |
| .NET 10 + Liquibase | `make migrate-up` |

```bash
# Optionally: load initial test data (seed)
# [see command in your stack guide]
```

### Step 6: Start the services

> Startup commands depend on the stack. See `_stacks/[your-stack].md → Project commands`.

| Stack | Development command |
|-------|---------------------|
| **.NET 10 (project stack)** | `dotnet run --project src/<service>.Api` or `docker compose up -d --build` |
| Node.js | `npm run dev` |
| Java | `mvn spring-boot:run` or `java -jar target/app.jar` |
| Python | `uvicorn main:app --reload` |
| .NET 10 | `dotnet run` or `make dev` |

### Step 7: Verify it works

```bash
# Health check of the API Gateway (Kong OSS)
curl http://localhost:8000/health

# Expected response:
# {"status": "ok", "timestamp": "2024-01-15T10:30:00Z"}
```

Open your browser at `http://localhost:9092` — Kafka listens there (ADR-004 chose Kafka over RabbitMQ; there is no RabbitMQ container in this project).

---

## Daily workflow

```bash
# At the start of the day
git pull origin develop
# Install dependencies if they changed (see stack):
#   npm install / mvn install / poetry install / go mod download
# Run migrations if there are new ones (see stack):
#   npm run db:migrate / alembic upgrade head / make migrate-up
# Start the service (see stack):
#   npm run dev / mvn spring-boot:run / uvicorn main:app --reload / make dev

# At the end
git add [specific files]
git commit -m "feat(scope): description"
```

---

## Common issues

### "Port already in use"

```bash
# Find which process is using the port
lsof -i :1433    # macOS/Linux
netstat -ano | findstr :1433  # Windows

# Kill the process (replace PID)
kill -9 [PID]    # macOS/Linux
taskkill /PID [PID] /F  # Windows
```

### "Docker containers not starting"

```bash
# View logs of the failing container
docker compose logs [service-name]

# Restart from scratch (deletes volumes)
docker compose down -v
docker compose up -d
```

### "Database connection refused"

```bash
# Verify SQL Server is running
docker compose ps | grep postgres

# View SQL Server logs
docker compose logs postgres
```

### "Migration failed"

```bash
# View migration status
npm run db:migrate:status

# Revert the last migration
npm run db:migrate:revert

# Run from a specific version
npm run db:migrate -- --from V005
```

### "JWT_SECRET not set" or authentication errors

```bash
# Generate a valid JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the result into .env
```

---

## Utility commands

```bash
# Tests
npm test                    # All tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:coverage       # With coverage report

# Database
npm run db:migrate          # Apply pending migrations
npm run db:seed             # Load test data
npm run db:reset            # Revert everything and start over (DELETES DATA!)

# Code quality
npm run lint                # Check ESLint
npm run lint:fix            # Auto-fix
npm run format              # Apply Prettier

# Build
npm run build               # Compile TypeScript
npm run build:docker        # Build local Docker image
```

---

## Useful local URLs

| Service | URL | Credentials (local only) |
|---------|-----|--------------------------|
| API Gateway (Kong OSS) | http://localhost:8000 | |
| Scalar API docs | http://localhost:8000/docs | |

---

## Correlations

- Environment variables per environment → `10-devops/environments.md`
- CI/CD pipeline → `10-devops/README.md`
- Production troubleshooting → `09-microservices/services/XX/runbook.md`
