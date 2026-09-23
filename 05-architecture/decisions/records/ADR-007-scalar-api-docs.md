# ADR-007 — Scalar for interactive API documentation

- **ID:** ADR-007
- **Date:** 2026-09-08
- **Status:** Accepted
- **Authors:** [Team]

---

## Context

School Guardian has OpenAPI contracts defined in `07-api/contracts/openapi/` for the API Gateway
and iam-service. We need an **interactive documentation UI** where developers and testers can
explore endpoints, read schemas, and execute live requests against the API. The OpenAPI spec
already exists (YAML files); we need to choose the rendering/testing tool that displays it.

**Known constraints:**
- OpenAPI 3.1 specs already written (see `07-api/contracts/openapi/`).
- Must support authentication headers (JWT Bearer) for testing protected endpoints.
- Should work with self-hosted deployment (no external dependency on a hosted SaaS).
- Team of 3: the tool must be simple to integrate, not a maintenance burden.

---

## Decision

**We decided:** to use **Scalar** as the interactive API documentation UI for School Guardian.

**Justification:**
- **Native OpenAPI 3.1 support:** Scalar is built for OpenAPI 3.x — renders schemas, examples, and descriptions cleanly without extra configuration.
- **Modern UI:** clean, fast, dark/light theme — better developer experience than Swagger UI.
- **Self-hosted:** can be deployed as a static site or embedded in a service (no SaaS dependency).
- **API reference + testing:** built-in "Try it" panel with header/body editing — replaces Postman for quick tests.
- **轻量:** no backend runtime needed — just serves static HTML/JS from an OpenAPI spec file.

---

## Evaluated alternatives

| Tool | OpenAPI 3.1 | Self-hosted | Interactive testing | UI quality | Setup complexity | Rating (1-10) |
|------|------------|------------|--------------------|-----------| ---------------|---------------|
| Scalar (CHOSEN) | Yes (native) | Yes (static) | Yes | Excellent | Low (static file) | 9 |
| Swagger UI | Partial (3.0+) | Yes | Yes | Good (dated) | Low | 7 |
| Redoc | Yes | Yes | No (read-only) | Excellent | Low | 6 |
| Stoplight Elements | Yes | Yes | Yes | Excellent | Medium | 7 |
| ReadyAPI | N/A (commercial) | Yes (desktop) | Yes | Good | High (license) | 5 |

---

## Consequences

**Positive:**
- Developers get a modern, interactive API reference with minimal setup.
- OpenAPI spec is the single source of truth (no duplicate docs).
- Self-hosted: no external SaaS dependency, works offline.
- Easy to embed in CI pipelines as a deployment artifact.

**Negative / Trade-offs:**
- Scalar is newer than Swagger UI — smaller community, less third-party content.
- No built-in mock server (Swagger UI has one via Prism).
- Static deployment means no server-side rendering for large specs (acceptable for our scale).

**Impact on the system:**
- Affected services: all externally exposed services (API Gateway routes).
- Documents that must be updated:
  - `07-api/README.md` (add Scalar as the documentation UI tool)
  - `10-devops/local-setup.md` (Scalar container in Docker Compose)
  - `10-devops/environments.md` (Scalar URL per environment)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Scalar lacks features compared to Swagger UI | Low | Low | Scalar is actively developed; fallback to Swagger UI if needed |
| OpenAPI spec rendering issues with complex schemas | Low | Medium | Test with all our specs early; pin Scalar version |
| No built-in mock server for contract testing | Medium | Low | Use Prism or custom mock separately if needed |

---

## References

- Scalar official docs: https://docs.scalar.com/
- Related to: `07-api/contracts/openapi/` (OpenAPI specs)
- API documentation guidelines: `07-api/README.md`
