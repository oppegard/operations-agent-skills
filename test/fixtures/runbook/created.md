# Runbook: Checkout queue stalled: pending jobs stop draining

> Pending checkout jobs remain queued; this procedure confirms the stall and restarts the worker safely.

- **Severity:** SEV-2
- **Triggers:** `CheckoutQueueStalled` ([alert](https://monitoring.example.test/alerts/checkout-queue-stalled))
- **Reversible:** Yes - see Rollback
- **Last validated:** Not yet validated
- **Last edited:** 2026-07-30
- **Owner:** Checkout on-call
- **Origin:** [Incident INC-142](https://incidents.example.test/INC-142)

## Symptoms

- The `CheckoutQueueStalled` alert fires after pending jobs remain unchanged for 10 minutes.
- The checkout worker dashboard shows no successful jobs during the same window.

## Prerequisites

- Production read access for `queuectl` 2.4 or newer.
- Checkout on-call permission to restart the worker deployment.

## Resolve

### 1. Confirm the queue is stalled

```text
$ queuectl inspect checkout --environment production
```

Expected result:

```text
pending: greater than 0
completed_last_10m: 0
```

If you see something different: stop and verify that this is the correct runbook.

### 2. Restart the checkout worker

```text
$ queuectl workers restart checkout --environment production
```

Expected result:

```text
restart accepted for checkout
```

If you see something different: escalate to the Checkout incident commander.

## Verify the fix landed

- Run `queuectl inspect checkout --environment production` and confirm `completed_last_10m` increases.
- Confirm the `CheckoutQueueStalled` alert clears within 10 minutes.

## Escalate

1. **If the restart is rejected:** page the Checkout incident commander through PagerDuty service `checkout-primary`.
2. **If jobs do not complete within 10 minutes:** contact the Database on-call in Slack `#incident-checkout`.

## Rollback

Restart the previous worker revision:

```text
$ queuectl workers restart checkout --environment production --revision previous
```

Expected result:

```text
restart accepted for checkout at previous revision
```

## Live links

- Checkout worker dashboard: https://monitoring.example.test/dashboards/checkout-workers
- Firing alert: https://monitoring.example.test/alerts/checkout-queue-stalled

## Change history

- **2026-07-30** - Alex Operator: Created from incident INC-142 [validated: no - procedure transcribed from incident evidence but not exercised end to end during authoring]
