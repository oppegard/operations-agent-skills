# Production-readiness-review capability boundary

## Invocation boundary

Broad release-readiness or production-readiness intent selects
`production-readiness-review`. A focused request for only the
Infrastructure-readiness or Application-resilience perspective selects that
specialist instead.

Run this orchestrator at the Release seam after functional review and before an
agent-controlled commit or merge.

## Baseline precondition

Accept the functionally reviewed fixed point, the change diff from that fixed
point, and its specification as one stable baseline. If the fixed point, diff,
or specification is missing, request the missing input and do not emit
`BLOCKED`; the review has not started.

## Applicability gate

Evaluate the reviewed change, including newly relied-upon behavior, for these
Operational signals. Select every applicable perspective and record a skip
reason for every skipped perspective.

Select Infrastructure readiness for rollout-affecting material, including:

- containers and container build behavior;
- deployment manifests and environment configuration;
- infrastructure as code;
- CI/CD, delivery, deployment, and rollback behavior;
- rollout strategy and release controls;
- observability or alert configuration;
- feature flags and operational controls; and
- production scale, cost, recovery, or fitness concerns expressed in those
  artifacts.

Select Application resilience for production application source involving:

- remote calls, retries, timeouts, cancellation, or degradation;
- queues, buffers, backpressure, concurrency, or error paths;
- fan-out or partial failure;
- idempotency or repeated delivery;
- co-deployed schema migrations; or
- a new production runtime path.

Documentation, generated files, pure configuration, infrastructure,
deployment manifests, pipelines, and observability-platform artifacts do not
activate Application resilience. Route qualifying operational artifacts to
Infrastructure readiness instead.

When neither perspective applies, return `NOT_APPLICABLE`, list both skipped
perspectives, and record the skip reason for each. Do not run a specialist to
prove a negative.

## Ownership boundary

The orchestrator selects perspectives, validates Change attribution and
evidence, synthesizes their reports, and returns the complete Release-seam
Readiness result. Specialists retain their own Role briefs, Engagement
contracts, evidence rules, finding identifiers, and native severities.

Do not embed fallback copies of specialist behavior and do not turn this
orchestrator into a general functional, style, exploit-path security, or
runbook-authoring review.
