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

```
src/
├── Domain/                      # No external dependencies — the heart of the system
│   ├── Entities/                # Entities and Aggregates
│   │   └── MyEntity.cs
│   ├── ValueObjects/            # Immutable Value Objects (records)
│   │   └── MyValueObject.cs
│   ├── Events/                  # Domain Events (interfaces or simple classes)
│   │   └── MyEntityCreated.cs
│   ├── Ports/                   # Interfaces defined by the domain
│   │   ├── In/                  # Primary ports (use cases)
│   │   │   └── ICreateMyEntityUseCase.cs
│   │   └── Out/                 # Secondary ports (repositories, external services)
│   │       ├── IMyEntityRepository.cs
│   │       └── IEventPublisher.cs
│   └── Services/                # Domain Services (logic that doesn't fit in one entity)
│
├── Application/                 # Orchestrates the domain — only depends on Domain/
│   └── UseCases/
│       └── CreateMyEntityUseCase.cs
│
├── Infrastructure/              # Adapters — depends on Application/ and Domain/
│   ├── Http/                    # Primary adapter: HTTP (controllers, middleware)
│   │   └── Controllers/
│   │       └── MyEntityController.cs
│   ├── Persistence/             # Secondary adapter: Database (EF Core DbContext + repositories)
│   │   ├── AppDbContext.cs
│   │   └── MyEntityRepository.cs   # implements IMyEntityRepository
│   ├── Messaging/               # Secondary adapter: Message broker
│   │   └── EventPublisher.cs    #     implements IEventPublisher
│   └── External/                # Secondary adapter: External APIs (e.g. Google Maps)
│
└── Api/                         # Bootstrap: composition root, Program.cs wiring, DI
    └── Program.cs
```

**Dependency rule:** `Infrastructure → Application → Domain`. The domain does not import anything from outside.

---

## Dependencies (NuGet packages)

Minimum baseline — run these per project/service:

```bash
# HTTP infrastructure (ASP.NET Core ships with the web templates)
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer   # JWT tokens

# Data infrastructure — Entity Framework Core
dotnet add package Microsoft.EntityFrameworkCore.SqlServer          # or Npgsql provider
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
    <PackageVersion Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.*" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.*" />
    <PackageVersion Include="FluentValidation" Version="12.*" />
  </ItemGroup>
</Project>
```

---

## Example: Input port (Use Case Interface)

```csharp
// src/Domain/Ports/In/ICreateAppointmentUseCase.cs

namespace SchoolGuardian.Domain.Ports.In;

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
// src/Domain/Ports/Out/IAppointmentRepository.cs

using SchoolGuardian.Domain.Entities;

namespace SchoolGuardian.Domain.Ports.Out;

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

using SchoolGuardian.Domain.Entities;
using SchoolGuardian.Domain.Ports.In;
using SchoolGuardian.Domain.Ports.Out;

namespace SchoolGuardian.Application.UseCases;

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

## JWT setup (primary adapter / auth)

```csharp
// src/Infrastructure/Http/Configuration/JwtConfig.cs

namespace SchoolGuardian.Infrastructure.Http.Configuration;

public class JwtConfig
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
}
```

```csharp
// src/Api/Program.cs — JWT registration

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection("Jwt"));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SecretKey))
        };
    });
```

---

## Domain unit test (xUnit)

```csharp
// tests/Domain.Tests/AppointmentTests.cs

using SchoolGuardian.Domain.Entities;

namespace SchoolGuardian.Tests.Domain;

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

using SchoolGuardian.Application.UseCases;
using SchoolGuardian.Tests.Support;

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

```bash
# Create a new microservice (solution + API project)
dotnet new sln -n ms-{name-service}
dotnet new webapi -n ms-{name-service}.Api -o src/Api
dotnet new classlib -n ms-{name-service}.Domain -o src/Domain
dotnet new classlib -n ms-{name-service}.Application -o src/Application
dotnet new classlib -n ms-{name-service}.Infrastructure -o src/Infrastructure
dotnet sln add src/Api src/Domain src/Application src/Infrastructure

# Restore packages
dotnet restore

# Development with hot-reload
dotnet watch --project src/Api

# Tests
dotnet test
dotnet test --filter "FullyQualifiedName~Domain"     # unit tests only
dotnet test --collect:"XPlat Code Coverage"          # coverage

# Build for production
dotnet build -c Release

# EF Core migrations (package Microsoft.EntityFrameworkCore.Design)
dotnet ef migrations add InitialCreate -p src/Infrastructure -s src/Api
dotnet ef database update -p src/Infrastructure -s src/Api
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
