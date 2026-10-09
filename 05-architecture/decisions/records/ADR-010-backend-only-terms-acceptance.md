# ADR-010 — Institutional acceptance of terms recorded backend-only

- **ID:** ADR-010
- **Date:** 2026-10-09
- **Status:** Proposed
- **Authors:** [Team]
- **Superseded by:** ADR-011

---

## Context

Guardian Escolar operates as a **closed school ecosystem**: accounts for students, drivers and parents are created by the institution administrator (web), never by self-registration. There is no public signup, and the mobile app has no register screen.

The Terms and Conditions (`Terminos_y_Condiciones_Guardian_Escolar.md`, numerals 3 and 8) and the SRS (§6.4 Table 55) require prior, express and informed authorization for personal data processing, with special handling of minors' data through their parent or legal guardian.

The team needs to decide **where and how acceptance is captured**, given that:

- Adding a blocking consent gate in the mobile app contradicts the product model ("credentials issued by the school imply acceptance of its rules").
- Showing a checkbox in any frontend adds friction to flows operated by the school, not by the data subject.
- With zero evidence recorded, "credentials imply acceptance" is an unenforceable claim before an audit (SIC) or academic evaluation.

**Known constraints:**
- SENA formative project: small team, academic demonstration scope.
- No self-registration exists in either client; all accounts are provisioned by admins.
- Frontends must stay visually unchanged in their flows (no new blocking steps).

---

## Decision

**We decided:** acceptance of the Terms and Conditions and of personal data processing is **institutional and implicit**: holding active credentials provisioned by the school administrator constitutes acceptance, and the evidence is recorded **backend-only, invisible to every user**.

**Justification:**
- The school acts as intermediary: enrollment (matrícula) is the real-world act where families accept institutional rules; the admin account provisioning mirrors that act in the system.
- Recording `termsVersion + acceptedAt + acceptedBy(adminId)` at account creation turns an unenforceable claim into auditable evidence without changing any user-facing flow.
- Frontend stays clean: clients only *display* the terms and the data-processing notice (read-only views); they never ask, because the school already asked.
- Data-subject rights are preserved through the admin contact channel (T&C numeral 17): revocation or deletion requests suspend the account (§14).

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|------------|------|------|-----------------------|
| **Institutional acceptance, backend-only evidence (CHOSEN)** | Zero friction; matches closed-ecosystem operation; auditable evidence | Weaker than direct digital consent; relies on school's enrollment process | — (chosen) |
| Blocking consent gate at first mobile login | Strongest legal proof; direct informed consent | Contradicts product model; blocks services until tapped; two clients to maintain | Breaks "credentials imply acceptance" model |
| Visible checkbox in admin register form | Explicit per-account act | Exposes legal machinery in UI; checkbox fatigue; still not the data subject signing | Evidence equivalent to backend record, worse UX |
| No record at all (status quo) | No work | No proof of acceptance or authorization; SRS §6.4 non-compliance | Fails audit and academic evaluation |

---

## Consequences

**Positive:**
- Every active account carries proof of which terms version was accepted, when, and by which admin.
- No frontend flow changes; views are read-only and informational.
- Minor accounts inherit the same evidence through the parent link (family), satisfying the "express authorization" trace.

**Negative / Trade-offs:**
- Evidence is indirect (admin attests on behalf of the enrollment act, not a tap by the data subject).
- If a family disputes acceptance, resolution is administrative (school records), not cryptographic.

**Impact on the system:**
- Affected services: user-management (account creation), iam (profile creation via events).
- Documents that must be updated: `06-data` models, affected `data-model.md` files, OpenAPI where version is exposed.

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Family claims they never accepted | Medium | Medium | Evidence fields + school enrollment records; contact channel for revocation (numeral 17) |
| Terms updated, old evidence stale | Medium | Low | `termsVersion` per acceptance; re-acceptance on continued use (numeral 15) |
| Admin creates account without real authorization | Low | High | Admin accountability (§6.2); suspension flow (§14) |

---

## References

- `Terminos_y_Condiciones_Guardian_Escolar.md`, numerals 3, 8, 14, 15, 17
- SRS `01_Informe_Especificacion_Requisitos_Software.md`, §6.4 Table 55
- Ley 1581 de 2012, art. 7 (minors' data); Decreto 1377 de 2013
- Related to: ADR-002 (shared DB), ADR-008 (JWT RS256)
