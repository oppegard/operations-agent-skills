# Infrastructure-readiness manual prompt cases

Run each case against a whole-pack installation in both Codex and Claude Code.
Repeat at global and project scope before a release. Record the host, scope,
pack revision, observed result, and pass or fail. These live-model evaluations
are release evidence, not a CI gate.

Use disposable artifacts. Do not point these prompts at production systems or
authorize infrastructure changes.

## direct-selection

Prompt:

> Give me the Infrastructure-readiness perspective on this Terraform module.

Expected observations:

- `infrastructure-readiness` is selected directly.
- The result states that it is a focused perspective and not a complete
  Readiness result.
- The report applies all twelve protocols to the available scope.

## broad-readiness

Prompt:

> Is this change ready for production?

Expected observations:

- The broad intent selects `production-readiness-review`, not the specialist
  alone.
- Infrastructure readiness may run only as an applicable perspective.

## application-source-boundary

Prompt:

> Review retry and timeout behavior in this HTTP client implementation.

Expected observations:

- Source-level failure behavior is deferred to `application-resilience`.
- Infrastructure readiness does not duplicate a resilience finding.

## exploit-path-boundary

Prompt:

> Trace whether this request parameter reaches a shell command.

Expected observations:

- Exploit-path analysis is deferred to the host's security review capability.
- Infrastructure readiness does not claim a vulnerability result.

## insufficient-evidence

Prompt:

> The repository contains no rollout, environment, traffic, or recovery
> evidence. List whatever might go wrong.

Expected observations:

- Speculation stays in the Answered, Assumed, or Open question log.
- No finding appears without exact artifact evidence, a named principle or
  failure mode, and concrete production impact.
- No-evidence claims are deferred with a concrete reopen trigger.

## release-blocker

Supply a release change containing this line:

```yaml
image: checkout:latest
```

Prompt:

> Run the Infrastructure-readiness perspective for this Release-seam change.

Expected observations:

- The finding cites the exact line, names `Latest Tag in Production`, and
  explains the rollback and blast-radius impact.
- Severity is `Blocks rollout`.
- P0 pins the reviewed image by digest today; P1 and P2 do not inflate the
  immediate rollout gate.

## design-engagement

Supply a candidate design whose section 4.2 proposes a single-step production
deployment without rollback signals. Prompt:

> Run the Infrastructure-readiness perspective using a Design-seam Engagement
> contract.

Expected observations:

- The report cites section 4.2 and classifies the proposal as a decision,
  assumption, constraint, or open question.
- Only an unresolved proposal-attributed production-safety decision can become
  a blocker candidate.
- The specialist does not emit the overall Design Readiness result.

## release-engagement

Supply a reviewed fixed point, specification, and diff with one newly floating
image plus one pre-existing alert without a runbook. Prompt:

> Run the Infrastructure-readiness perspective using this Release-seam stable
> baseline.

Expected observations:

- The floating image is marked `Change-attributed`.
- The pre-existing alert concern is marked `Ambient risk`.
- Only the Change-attributed `Blocks rollout` finding is a blocker candidate.
- The specialist does not emit the overall Release Readiness result.
