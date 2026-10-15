# ADR-011 — Direct parental acceptance of terms at mobile login

- **ID:** ADR-011
- **Date:** 2026-10-09
- **Status:** Accepted
- **Authors:** [Team]
- **Supersedes:** ADR-010

---

## Context

ADR-010 proposed institutional, implicit acceptance recorded backend-only at account provisioning. On review, the team concluded that model leaves the parent out of the act: credentials prove the admin created the account, not that the data subject (or the minor's representative) was informed and agreed.

To avoid legal exposure under Ley 1581 de 2012 (art. 7, minors' data) and Decreto 1377 de 2013, the acceptance must be a **direct, informed act by the parent**, captured where the parent operates: the mobile app, around login.

**Known constraints:**
- No self-registration exists; accounts are still provisioned by admins.
- Acceptance must not live only in the frontend: evidence has to be server-side and auditable (SRS §6.4 Table 55).

---

## Decision

**We decided:** the parent is shown the Terms and the data-processing notice **before login** (read-only links), and acceptance is recorded **automatically on login** in `Iam.TermsAcceptance` (profile, minor, version, timestamp, IP, channel). Logging in constitutes acceptance; no checkbox or extra tap exists anywhere.

**Justification:**
- Pre-login display guarantees the parent knows what applies before authenticating.
- Automatic recording on authenticated login binds the act to a profile, producing real evidence (who, on whose behalf, which version, when) with zero friction.
- Append-only history satisfies the traceability requirement without complicating the model.
- A newer `TermsVersion` voids older acceptances, covering numeral 15 (modifications).

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|------------|------|------|-----------------------|
| **Direct parental acceptance, pre-login display + post-login record (CHOSEN)** | Real informed consent; auditable; matches where the parent operates | New table, endpoint and mobile flow | — (chosen) |
| Institutional implicit acceptance (ADR-010) | Zero friction | No act by the data subject; weak before SIC | Superseded by this ADR |
| Blocking gate without pre-login display | Evidence exists | Parent accepts blind; weaker "informed" claim | Display first is strictly better |

---

## Consequences

**Positive:**
- Per-profile, per-minor, per-version evidence of acceptance.
- Terms updates re-trigger acceptance naturally at next login.
- Web untouched (parents do not use it).

**Negative / Trade-offs:**
- Login flow gains a silent recording step for parents with pending acceptances.
- Mobile must resolve the parent's minors (family) to compute pending items.

**Impact on the system:**
- Affected services: iam (new table, two endpoints); mobile (pre-login modal, acceptance gate).
- Documents that must be updated: `06-data/domain/iam.md`, service catalogs, OpenAPI iam contract, DBML.

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Parent refuses to accept | Low | Medium | Account stays provisioned but minor monitoring stays locked; admin follows up |
| TermsVersion drift between app and server | Low | Low | Server is the authority on the current version |

---

## References

- Supersedes ADR-010 (kept for history, do not delete)
- `Terminos_y_Condiciones_Guardian_Escolar.md`, numerals 3, 8, 15, 17
- SRS `01_Informe_Especificacion_Requisitos_Software.md`, §6.4 Table 55
- Related to: ADR-002 (shared DB), ADR-008 (JWT RS256)
