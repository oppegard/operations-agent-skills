# Procedure: Certificate expires within seven days

The certificate expiry alert is active; renew the certificate and confirm the
new expiry date.

| Field | Value |
| --- | --- |
| Severity | SEV-2 |
| Trigger | `CertificateExpiresSoon` |
| Reversible | Partial; restore the prior certificate |
| Last validated | 2026-07-12 by Platform on-call |
| Last edited | 2026-07-12 |
| Owner | Platform on-call |
| Origin | Incident INC-118 |

## Entry conditions

- The `CertificateExpiresSoon` alert is firing.

## Access required

- Certificate manager production access.

## Actions

### 1. Read the current expiry date

Command:

```text
$ certctl inspect api.example.test
```

Success:

```text
expires_in_days: less than 7
```

If the result differs, stop and confirm this is the correct procedure.

## Confirm recovery

- Confirm the renewed certificate expires in more than 30 days.
- Confirm the alert clears.

## Escalation

1. If renewal fails, page Platform on-call through PagerDuty service `platform`.

## Reversal

Restore the prior certificate with `certctl restore api.example.test`.

## Operational links

- Certificate dashboard: https://monitoring.example.test/dashboards/certificates

## History

- 2026-07-12, Platform on-call: exercised renewal in faithful staging.
