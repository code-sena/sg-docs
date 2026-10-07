# Forgot Information

> Owns the **recovery, verification, and secure-change flows** for account credentials and
> sensitive contact data (password, email, phone). It is the authoritative owner of
> verification/OTP requests only — it is **not** a second Person/Profile service.

---

## Responsibility

Handles password recovery (public, no session), authenticated password change, and
authenticated email/phone change. Every flow is gated behind a one-time verification code.
Email codes are generated and verified here (sent by SMTP); SMS codes are generated, sent and
verified by **Twilio Verify**. The service orchestrates the flow and owns the verification data;
the person/credential data stays in `ms-iam` (profile, password hash) and
`ms-user-management` (Person email/phone, updated through IAM).

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 12 |
| Local port | 8091 (container 8080) |
| Repository | `ms-forgot-information` (its own repository, sibling of `ms-iam` and `ms-user-management`) |
| Stack | .NET 10, EF Core, SQL Server |
| Schema | `ForgotInformation` |
| DB engine | SQL Server (shared instance, see ADR-002) |
| Calls | `ms-iam` over **REST** (`http://ms-iam:8080/api/profiles/...`) authenticated with the shared `INTERNAL_API_KEY` |
| External providers | SMTP (email codes) and Twilio Verify (SMS codes) |
| Consumed by | Web (Angular) and mobile (Expo) clients directly. It is **not** behind Kong; the mobile app reaches it through the `sg-cloudflared-forgot` tunnel |
| Status | 🟢 Implemented (REST endpoints below). Kafka events are still planned, see `events.md` |

---

## Flows and purposes

| Flow | Session | Purpose values used | Verification |
|------|---------|---------------------|--------------|
| Password reset ("Restablecer contraseña") | No | `PasswordReset` | Email OTP, then one-time `resetToken` |
| Password change ("Cambiar contraseña") | Yes (web/mobile profile) | `PasswordReset` with `isPasswordChange: true` | Same endpoints; only the email wording differs |
| Email change | Yes | `EmailChange` (current mailbox) → `EmailChangeConfirm` (new mailbox) | Email OTP twice |
| Phone change | Yes | `PhoneChange` ledger + `PhoneChangeConfirm` | SMS by Twilio Verify to the current phone, then to the new phone (E.164) |

The password reset and password change flows share the endpoints. `isPasswordChange` (default
`false`) only selects the email copy: "Código para recuperar tu contraseña / Restablecer
contraseña" versus "Código para cambiar tu contraseña / Confirma el cambio de contraseña".

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/password/forgot` | Send the reset/change code `{email, isPasswordChange?}` |
| POST | `/api/v1/password/forgot/verify` | Verify `{email, code}` → `{resetToken}` |
| POST | `/api/v1/password/reset` | Set the new password with `resetToken` |
| POST | `/api/v1/email/change/request` · `verify` · `new` · `resend-new` · `verify-new` · `confirm` | Email change steps |
| POST | `/api/v1/phone/change/request` · `verify` · `verification/request` · `verification/resend` · `verification/check` | Phone change steps (Twilio Verify) |
| GET | `/health` | Service health |

## Error contract

Every failure returns `{ "message": "...", "code": "..." }` so web and mobile can explain why a
code was not sent.

| HTTP | `code` | Meaning |
|------|--------|---------|
| 404 | `account_not_found` | No active profile for that email |
| 400 | `phone_mismatch` | The phone does not match the profile phone |
| 503 | `delivery_failed` | SMTP or Twilio failed or is not configured |
| 429 | `rate_limited` | Too many requests/attempts |
| 400 | (none) | Invalid format, wrong or expired code |

This intentionally reveals whether an account or phone exists (see DEC-005).

---

## Responsibilities (what this service DOES)

- Generate, hash (HMAC-SHA256 + salt + pepper), expire, and rate-limit email verification codes
- Delegate SMS codes to Twilio Verify and track the challenge ledger (target, expiry, attempts)
- Enforce single-use codes and one-time reset tokens
- Resolve profiles in `ms-iam` and ask it to update password, email and phone only after verification succeeds
- Send branded, light-theme HTML emails (shared template)
- Return explicit error codes for every failure to deliver a code

## Out of scope (what it does NOT do)

- Does not store Person data or the password hash
- Does not implement login, logout, JWT or RBAC (`ms-iam`)
- Does not generate or store SMS codes (Twilio does)
- Does not duplicate the user table; it only keeps short-lived verification requests

---

## How to run it locally

```powershell
# From the ms-forgot-information repository (needs ms-iam, SQL Server and the sg-services-network)
docker compose up -d --build
Invoke-RestMethod http://localhost:8091/health
```

Configuration lives in `.env` (see the service `.env.example`): SMTP, `OTP_HASH_PEPPER`,
`INTERNAL_API_KEY` (same value as `ms-iam`), CORS origin and the `TWILIO_*` variables.
Without Twilio variables the service starts and only the SMS endpoints answer 503.

The mobile app uses the public tunnel `sg-cloudflared-forgot` (defined in the project
`docker-compose.yml`); `start-mobile.ps1` writes its URL into the mobile `.env`.

---

## Related documents

- [data-model.md](./data-model.md) — `VerificationRequest` table (the only table this service owns)
- [events.md](./events.md) — planned domain events (not implemented yet)
- [decisions.md](./decisions.md) — OTP storage, IAM communication, providers, error policy
- [API Contract](../../../07-api/contracts/openapi/forgot-information-service.yaml) — to be created
- Service repository: `README.md` and `TESTING.md`