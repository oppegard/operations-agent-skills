# Incident notes: INC-142

- Date: 2026-07-29
- Severity: SEV-2
- Owner: Checkout on-call
- Fired alert: `CheckoutQueueStalled`
- Alert record: https://monitoring.example.test/alerts/checkout-queue-stalled
- Incident record: https://incidents.example.test/INC-142

The alert fired after pending checkout jobs stayed unchanged for 10 minutes.
The worker dashboard showed no successful jobs in the same window.

The operator used `queuectl` 2.4 with production read access and Checkout
on-call permission. They confirmed the stall with:

```text
$ queuectl inspect checkout --environment production
```

The command reported a positive pending count and
`completed_last_10m: 0`. The operator then ran:

```text
$ queuectl workers restart checkout --environment production
```

The service returned `restart accepted for checkout`. Completed jobs began
increasing, and the alert cleared within 10 minutes.

If a restart is rejected, the operator pages the Checkout incident commander
through PagerDuty service `checkout-primary`. If jobs do not complete within
10 minutes, they contact the Database on-call in Slack
`#incident-checkout`.

The rollback is a restart at the previous revision:

```text
$ queuectl workers restart checkout --environment production --revision previous
```

The expected response is
`restart accepted for checkout at previous revision`.

Dashboard: https://monitoring.example.test/dashboards/checkout-workers
