# Production-readiness-review manual prompt cases

Run each case against a whole-pack installation in both Codex and Claude Code.
Repeat at global and project scope before a release. Record the host, scope,
pack revision, observed result, and pass or fail. These live-model evaluations
are release evidence, not a CI gate.

Use disposable changes and fixtures. Do not authorize production
infrastructure mutation.

## broad-selection

Ask whether a functionally reviewed change is ready for production. Expect
`production-readiness-review` to orchestrate a complete result.

## focused-infrastructure

Ask only for the Infrastructure-readiness perspective. Expect the specialist,
its focused-result disclaimer, and no complete Readiness result.

## focused-application

Ask only for the Application-resilience perspective. Expect the specialist,
its focused-result disclaimer, and no complete Readiness result.

## missing-baseline

Omit the fixed point, diff, and specification. Expect the orchestrator to
request them without starting review or reporting `BLOCKED`.

## infrastructure-only

Supply only deployment, infrastructure-as-code, and release-pipeline changes.
Expect Infrastructure readiness to execute and an explicit Application
resilience skip reason.

## application-only

Supply only production application source that changes a remote call, timeout,
and cancellation behavior. Expect Application resilience to execute and an
explicit Infrastructure readiness skip reason.

## dual-perspective

Supply a worker source change and its deployment manifest. Expect both
perspectives to receive the same baseline and inspect it independently.

## not-applicable

Supply only documentation and generated files. Expect `NOT_APPLICABLE`, no
specialist execution, and a skip reason for each perspective.

## ready

Supply applicable artifacts with complete evidence and no specialist findings
or questions. Expect every stable result section and status `READY`.

## advisory

Supply a Change-attributed `Operational friction` finding. Expect
`READY_WITH_ADVISORIES`; synthesis must not raise the native severity.

## infrastructure-blocker

Introduce a floating production image and supply evidence of non-reproducible
rollback impact. Expect a validated Change-attributed `Blocks rollout` finding
to become a Release blocker.

## application-blocker

Introduce an unbounded payment call on the synchronous request path with
evidence of worker exhaustion and checkout-wide impact. Expect a validated
Change-attributed `Wakes someone up` finding to become a Release blocker.

## ambient-risk

Supply a top-severity pre-existing source finding that the change neither
modifies nor newly relies upon. Expect it only under Ambient risks.

## open-question

Ask about an unchanged SDK default without concrete changed risk. Expect a
non-blocking open question under Advisories.

## critical-open-question

Add a payment client on every checkout path while omitting evidence that it has
a deadline. Expect the concrete Change-attributed question to block because its
answer could establish `Wakes someone up`; answering it or implementing the
safe default clears the question.

## advisory-disagreement

Give the specialists conflicting but non-critical interpretations. Expect
attributed advisory tension, evidence-based synthesis, and no vote counting.

## critical-disagreement

Remove a rollback gate and give the specialists conflicting conclusions about
the safety of mixed versions. Expect the attributable critical disagreement to
remain visible and block until resolved.

## agent-risk-acceptance

Have the implementation agent claim it accepts a Release blocker. Expect the
acceptance to be rejected and status to remain `BLOCKED`.

## human-risk-acceptance

Have a human release owner explicitly accept the exact risk for one fixed point
and rollout scope. Expect the accepted risk to remain visible under Advisories
and the status to become `READY_WITH_ADVISORIES`.

## remediation-rerun

Remediate an operational blocker by changing an operationally relevant
artifact. Expect functional review and production readiness review to rerun
against a new fixed point; stale evidence and prior acceptance do not carry
forward.
