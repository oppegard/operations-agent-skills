# Application-resilience manual prompt cases

Run each case against a whole-pack installation in both Codex and Claude Code.
Repeat at global and project scope before a release. Record the host, scope,
pack revision, observed result, and pass or fail. These live-model evaluations
are release evidence, not a CI gate.

Use disposable application-source fixtures. Do not point these prompts at
production systems or authorize code, infrastructure, pipeline, or
configuration changes.

## direct-selection

Prompt:

> Give me the Application-resilience perspective on this HTTP client.

Expected observations:

- `application-resilience` is selected directly.
- The result states that it is a focused perspective and not a complete
  Readiness result.
- The report applies all eight protocols to the available source scope.

## broad-readiness

Prompt:

> Is this change ready for production?

Expected observations:

- The broad intent selects `production-readiness-review`, not the specialist
  alone.
- Application resilience may run only as an applicable perspective.

## infrastructure-boundary

Prompt:

> Review this Kubernetes manifest and alert dashboard for resilience.

Expected observations:

- Infrastructure and observability-platform artifacts are deferred to
  `infrastructure-readiness`.
- Application resilience does not invent an application-source finding.

## non-source-boundary

Prompt:

> Review generated API docs and pure configuration for application resilience.

Expected observations:

- Documentation, generated files, and pure configuration are excluded.
- No Application-resilience finding is emitted without application-source
  evidence.

## insufficient-evidence

Prompt:

> There is no cited application source or production behavior. List every
> resilience problem that might exist.

Expected observations:

- Speculation stays in the Answered, Assumed, or Open question log.
- No finding appears without exact evidence, a named anti-pattern and failure
  mode, and concrete production impact.
- No-evidence claims are deferred with a concrete reopen trigger.

## release-page-risk

Supply a release change containing:

```javascript
await paymentClient.charge(order);
```

Also supply application-source evidence that the synchronous request path has
no enclosing deadline, payment calls can hang during dependency degradation,
request workers are bounded, and all checkout users traverse this line.
Prompt:

> Run the Application-resilience perspective for this Release-seam change.

Expected observations:

- The finding cites the exact application-source line and names `Missing or
  incomplete timeout` and `Cascading Failure`.
- It explains the dependency condition, checkout users affected, and worker
  pool plus checkout call-graph blast radius.
- Severity is `Wakes someone up`.
- Today's smallest safe step adds a bounded timeout and propagates cancellation;
  later improvements do not inflate the immediate gate.

## severity-calibration

Supply only a remote-call line with no evidence about traffic, client timeout
defaults, callers, dependency behavior, or user impact. Prompt:

> Treat the presence of this remote call as a top-severity finding.

Expected observations:

- The anti-pattern name alone does not establish severity.
- Missing trigger, affected-user, and blast-radius evidence stays Open.
- No `Wakes someone up` finding is emitted from uncertainty alone.

## protocol-coverage

Supply application source containing an HTTP call, retry loop, async worker,
queue consumer, repeated message delivery, application-owned migration, and a
new runtime branch. Prompt:

> Run the complete Application-resilience specialist review.

Expected observations:

- All eight protocols appear, including protocols with no proven finding.
- The review covers remote calls, retries, timeouts, cancellation, degradation,
  queues, buffers, backpressure, resource-exhaustion concurrency, partial
  failure, repeated delivery, migrations, and new runtime paths when present.
- Race analysis, schema design, pipeline configuration, and platform
  observability are deferred rather than duplicated.

## design-engagement

Supply a candidate design whose section 3.4 proposes an unbounded retry of a
non-idempotent payment operation. Prompt:

> Run the Application-resilience perspective using a Design-seam Engagement
> contract.

Expected observations:

- The report cites section 3.4 and classifies the proposal as a decision,
  assumption, constraint, or open question.
- Only an unresolved proposal-attributed production-safety decision can become
  a blocker candidate.
- The specialist does not emit the overall Design Readiness result.

## release-engagement

Supply a reviewed fixed point, specification, and diff with one newly
unbounded queue plus one pre-existing catch-and-swallow handler. Prompt:

> Run the Application-resilience perspective using this Release-seam stable
> baseline.

Expected observations:

- Each finding cites exact application source.
- The new queue is marked `Change-attributed`.
- The pre-existing handler is marked `Ambient risk`.
- Only a Change-attributed `Wakes someone up` finding is a blocker candidate.
- The specialist does not emit the overall Release Readiness result.
