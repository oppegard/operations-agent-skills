# Design Applicability gate

Evaluate the candidate design, not the breadth of the user's wording. Select
each perspective independently from concrete Operational signals in the
proposal.

## Infrastructure readiness

Select Infrastructure readiness when the design affects any of:

- containers or their runtime;
- deployment manifests or infrastructure as code;
- CI/CD, deployment sequencing, progressive delivery, or rollback behavior;
- observability or alert configuration;
- feature flags or other operational controls; or
- any other artifact or decision that changes rollout behavior.

Otherwise skip it and record:

> No Infrastructure-readiness signal: the candidate design does not affect
> infrastructure, delivery, observability, operational controls, or rollout
> behavior.

## Application resilience

Select Application resilience when either:

- the design changes production application source involving one or more of
  the signals below; or
- the design introduces a new production runtime path.

The application-source signals are:

- remote calls, dependencies, latency, timeouts, or cancellation;
- retries or degradation behavior;
- queues, buffers, or backpressure;
- concurrency, error paths, fan-out, or partial failure;
- idempotency or repeated delivery; and
- co-deployed schema migrations.

Documentation, generated files, pure configuration, infrastructure, pipelines,
and observability-platform artifacts do not activate Application resilience.
These artifacts remain eligible for Infrastructure readiness when they carry
an Infrastructure signal.

When the Application-source boundary excludes the candidate material, record:

> Application-source boundary: documentation, generated files, pure
> configuration, infrastructure, pipelines, and observability-platform
> artifacts do not activate Application resilience.

When the material is production application source but no listed signal is
present, record:

> No Application-resilience signal: the candidate design does not change
> production application source with a listed failure-behavior signal.

## Gate result

Record an explicit skip reason for every perspective not selected. When
neither perspective applies, do not invoke either specialist. Return the
stable Readiness result with `Status: NOT_APPLICABLE`, both skip reasons, no
blockers, and the next action to continue specification finalization.
