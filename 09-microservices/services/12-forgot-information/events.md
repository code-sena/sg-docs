# Events — Forgot Information

> **Status: planned, not implemented.** The service does **not** publish Kafka events today
> (there is no Kafka client in the code). This document is the target contract for when it is
> added. The communication that exists now is synchronous REST to `ms-iam` (see `decisions.md`).

> Events are how microservices communicate asynchronously.
> This service is a **producer only** at this stage — it does not consume events from
> other services.

---

## Events this service PUBLISHES

> Emitted only after the downstream update (password hash / email / phone) has been
> confirmed by `ms-iam` or `ms-iam`/`ms-user-management` — never on OTP generation or
> verification alone.

| Event | Topic | When it is emitted | Payload (key fields) |
|-------|-------|--------------------|---------------------|
| PasswordResetCompleted | `forgot-information.password-reset.completed` | A password recovery flow (forgot → OTP → new password) finishes successfully | `{profileId, occurredAt}` |
| PasswordChanged | `forgot-information.password.changed` | An authenticated password change finishes successfully | `{profileId, occurredAt}` |
| UserEmailChanged | `forgot-information.email.changed` | A verified new email has been applied in `ms-iam`/`ms-user-management` | `{profileId, occurredAt}` — never the email address itself (PII minimization) |
| UserPhoneChanged | `forgot-information.phone.changed` | A verified new phone has been applied in `ms-iam`/`ms-user-management` | `{profileId, occurredAt}` — never the phone number itself (PII minimization) |

### Event schema: PasswordResetCompleted

```json
{
  "eventId": "uuid",
  "eventType": "PasswordResetCompleted",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0",
  "source": "forgot-information-service",
  "payload": {
    "profileId": "uuid — the profile whose password was reset",
    "occurredAt": "ISO-8601 timestamp of the completed reset"
  }
}
```

### Event schema: PasswordChanged

```json
{
  "eventId": "uuid",
  "eventType": "PasswordChanged",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0",
  "source": "forgot-information-service",
  "payload": {
    "profileId": "uuid — the profile whose password was changed",
    "occurredAt": "ISO-8601 timestamp of the completed change"
  }
}
```

### Event schema: UserEmailChanged / UserPhoneChanged

```json
{
  "eventId": "uuid",
  "eventType": "UserEmailChanged",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0",
  "source": "forgot-information-service",
  "payload": {
    "profileId": "uuid — the profile whose contact data changed",
    "occurredAt": "ISO-8601 timestamp of the completed change"
  }
}
```

> **Why no email/phone value in the payload:** consumers (`audit-service`,
> `notification-service`) only need to know *that* a change happened and *who* it happened
> to. The new value is already authoritative in `ms-iam`/`ms-user-management`; re-broadcasting
> it would create a second copy of PII across Kafka topics and consumer logs.

---

## Events this service CONSUMES

None at this stage. If a future requirement needs this service to react to another service's
event (e.g. a `ProfileDeactivated` event from `ms-iam` to invalidate pending verification
requests), it must be added here before being implemented.

---

## Delivery guarantees

| Guarantee | Value | Implication |
|-----------|-------|-------------|
| At-least-once | Yes | `audit-service` and `notification-service` consumers must be idempotent (dedupe by `eventId`) |
| At-most-once | No | — |
| Exactly-once | No | Not required — all four events are informational, not financial/transactional |

---

## Error handling

- **Dead Letter Topic:** `forgot-information.events.dlq`
- **Retries:** 3 retries with exponential backoff before routing to the DLQ
- **Alerts:** the team is alerted (per `13-operations/` conventions) when a message lands in the DLQ, since a missed event means `audit-service` loses a record of a credential change
