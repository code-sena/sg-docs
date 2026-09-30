# Stack: ASP.NET Core (.NET 10, C# 14)

> This guide is for teams building microservices with **ASP.NET Core** on **.NET 10**
> using **C# 14**. It follows the hexagonal / Clean Architecture conventions used
> across this scaffold.
>
> The packages listed here are the **minimum baseline** (SDK, Entity Framework Core,
> JWT authentication). Add more packages as your services require them.

---

## Tools and minimum versions

| Tool | Version | Verify with |
|------|---------|------------|
| .NET SDK | 10.0 | `dotnet --version` |
| C# | 14 | included with the SDK |
| EF Core | 10.x | `dotnet ef --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |

---

## Microservice folder structure (Hexagonal)

Each microservice lives in its own solution and follows the convention
`ms-<name-service>/src/ms-<name-service>.Api/`. Modules (bounded contexts such as
`Admin`, `Driver`, `Family`, `Parent`, `Student`) live inside the `.Api` project,
each following the hexagonal layers.

```
ms-{name-service}/
└── src/
    └── ms-{name-service}.Api/
        ├── {Module}/                 # One folder per bounded context (Admin, Driver, Family...)
        │   ├── Domain/               # No external dependencies — the heart of the system
        │   │   └── Model/            # Entities and Aggregates
        │   │       └── MyEntity.cs
        │   │   └── ValueObjects/     # Immutable Value Objects (records)
        │   │       └── MyValueObject.cs
        │   │   └── Ports/            # Interfaces defined by the domain
        │   │       ├── In/           # Primary ports (use cases)
        │   │       │   └── ICreateMyEntityUseCase.cs
        │   │       └── Out/          # Secondary ports (repositories, external services)
        │   │           ├── IMyEntityRepository.cs
        │   │           └── IEventPublisher.cs
        │   ├── Application/          # Orchestrates the domain — only depends on Domain/
        │   │   └── UseCases/
        │   │       └── CreateMyEntityUseCase.cs
        │   └── Infrastructure/       # Adapters — depends on Application/ and Domain/
        │       ├── Http/             # Primary adapter: HTTP (controllers, middleware)
        │       │   └── Controllers/
        │       │       └── MyEntityController.cs
        │       ├── Persistence/      # Secondary adapter: Database (EF Core DbContext + repositories)
        │       │   └── NameEntity.cs   # implements IMyEntityRepository
        │       ├── Repository
        │           └── EntityRepositoryImpl
        │       └── External/         # Secondary adapter: External APIs (e.g. Google Maps)
        ├── Shared/                   # Cross-cutting shared code across modules
        │   └── Domain/Model/         # e.g. common value objects (Person, Status...)
        └── Program.cs                # Bootstrap: composition root, DI wiring
```

**Dependency rule:** `Infrastructure → Application → Domain`. The domain does not import anything from outside.

---

## Dependencies (NuGet packages)

Minimum baseline — run these per project/service:

```bash
# HTTP infrastructure (ASP.NET Core ships with the web templates)
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer   # JWT tokens
dotnet add package Swashbuckle.AspNetCore                          # Swagger UI + API docs

# Data infrastructure — Entity Framework Core
dotnet add package Microsoft.EntityFrameworkCore.SqlServer          # or Microsoft.Data.SqlClient provider
dotnet add package Microsoft.EntityFrameworkCore.Design             # migrations tooling

# Validation (primary adapter)
dotnet add package FluentValidation                                 # or built-in DataAnnotations

# Observability (optional baseline)
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package Serilog
```

```xml
<!-- Directory.Packages.props — production dependencies (baseline) -->
<Project>
  <ItemGroup>
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.*" />
    <PackageVersion Include="Swashbuckle.AspNetCore" Version="7.*" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.*" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.*" />
    <PackageVersion Include="FluentValidation" Version="12.*" />
  </ItemGroup>
</Project>
```

---

## Example: Input port (Use Case Interface)

```csharp
// src/service.Api/Domain/Ports/In/ICreateAppointmentUseCase.cs

namespace service.Api.Domain.Ports.In;

public record CreateAppointmentCommand(
    string PatientId,
    string DoctorId,
    DateTime ScheduledAt);

public interface ICreateAppointmentUseCase
{
    Task<string> ExecuteAsync(CreateAppointmentCommand command); // returns the ID
}
```

## Example: Output port (Repository Interface)

```csharp
// src/service.Api/Domain/Ports/Out/IAppointmentRepository.cs

using service.Api.Domain.Model;

namespace service.Api.Domain.Ports.Out;

public interface IAppointmentRepository
{
    Task SaveAsync(Appointment appointment);
    Task<Appointment?> FindByIdAsync(string id);
    Task<IReadOnlyList<Appointment>> FindByPatientAsync(string patientId);
}
```

## Example: Use Case (Application layer)

```csharp
// src/Application/UseCases/CreateAppointmentUseCase.cs

using service.Api.Domain.Model;
using service.Api.Domain.Ports.In;
using service.Api.Domain.Ports.Out;

namespace service.Api.Application.UseCases;

public sealed class CreateAppointmentUseCase : ICreateAppointmentUseCase
{
    private readonly IAppointmentRepository _repository;

    public CreateAppointmentUseCase(IAppointmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<string> ExecuteAsync(CreateAppointmentCommand command)
    {
        var appointment = Appointment.Create(command); // invariants in the factory
        await _repository.SaveAsync(appointment);
        return appointment.Id;
    }
}
```

---

## Domain unit test (xUnit)

```csharp
// tests/Domain.Tests/AppointmentTests.cs

using service.Api.Domain.Model;

namespace service.Tests.Domain;

public class AppointmentTests
{
    [Fact]
    public void Create_WithPastDate_ShouldThrow()
    {
        var yesterday = DateTime.UtcNow.AddDays(-1);

        Assert.Throws<ArgumentException>(() =>
            Appointment.Create(new CreateAppointmentCommand("p1", "d1", yesterday)));
    }
}
```

## Use Case test with Fake (no real DB)

```csharp
// tests/Application.Tests/CreateAppointmentUseCaseTests.cs

using service.Api.Application.UseCases;
using service.Api.Tests.Support;

public class CreateAppointmentUseCaseTests
{
    [Fact]
    public async Task ExecuteAsync_ShouldPersistAppointment()
    {
        var repo = new InMemoryAppointmentRepository();
        var useCase = new CreateAppointmentUseCase(repo);

        var id = await useCase.ExecuteAsync(new CreateAppointmentCommand(
            "p1", "d1", DateTime.UtcNow.AddDays(1)));

        Assert.NotNull(await repo.FindByIdAsync(id));
    }
}
```

---

## Project commands

Commands follow the real solution layout of the project:
`ms-{name-service}/ms-{name-service}.slnx` with the API project at
`ms-{name-service}/src/ms-{name-service}.Api/`.

```bash
# From the service root (ms-user-management/), create/maintain a new microservice
# Create the solution and the API project (already made for ms-user-management)
dotnet new sln -n ms-{name-service}
dotnet new webapi -n ms-{name-service}.Api -o src/ms-{name-service}.Api
dotnet sln add src/ms-{name-service}.Api/ms-{name-service}.Api.csproj

# Restore packages
dotnet restore

# Development with hot-reload (run the API project)
dotnet watch --project src/ms-{name-service}.Api

# Tests
dotnet test
dotnet test --filter "FullyQualifiedName~Domain"     # unit tests only
dotnet test --collect:"XPlat Code Coverage"          # coverage

# Build for production
dotnet build -c Release

# EF Core migrations (package Microsoft.EntityFrameworkCore.Design)
dotnet ef migrations add InitialCreate -p src/ms-{name-service}.Api -s src/ms-{name-service}.Api
dotnet ef database update -p src/ms-{name-service}.Api -s src/ms-{name-service}.Api
```

---

## Naming conventions (C#)

| Artifact | Convention | Example |
|----------|-----------|---------|
| Interfaces | `PascalCase` with `I` prefix | `IAppointmentRepository` |
| Classes | `PascalCase` | `CreateAppointmentUseCase` |
| Files | `PascalCase.cs` | `Appointment.cs` |
| Namespaces | `PascalCase`, dot-separated | `SchoolGuardian.Domain.Ports.In` |
| Methods | `PascalCase` | `ExecuteAsync`, `FindByIdAsync` |
| Local variables and parameters | `camelCase` | `repository`, `command` |
| Private fields | `_camelCase` with underscore | `_repository` |
| Records (value objects, DTOs) | `PascalCase` | `CreateAppointmentCommand` |
| Enums | `PascalCase` type, `PascalCase` values | `AppointmentStatus.Confirmed` |

---

## Correlations with scaffold documents

- Hexagonal concepts → `05-architecture/hexagonal-architecture.md`
- TDD and test doubles → `11-quality/tdd-guide.md`
- Pattern guide (concepts) → `05-architecture/pattern-guide.md`
- Local setup → `10-devops/local-setup.md`
