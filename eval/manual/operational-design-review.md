# Operational-design-review manual prompt cases

Run each case against a whole-pack installation in both Codex and Claude Code.
Repeat at global and project scope before a release. Record the host, scope,
pack revision, observed result, and pass or fail. These live-model evaluations
are release evidence, not a CI gate.

Use disposable candidate designs. Do not point prompts at production systems
or authorize infrastructure changes.

## infrastructure-only

Supply a design that changes a deployment manifest and adds a rollout canary.
Expect only Infrastructure readiness to execute and an explicit
Application-source boundary skip.

## application-only

Supply a design that adds bounded retries and cancellation to production
application source. Expect only Application resilience to execute and an
explicit Infrastructure-readiness skip.

## both-perspectives

Supply a design for a repeatedly delivered queue consumer controlled by a
progressive rollout flag. Expect both perspectives to review the same design.

## documentation-only

Supply a documentation-only design. Expect `NOT_APPLICABLE` with explicit
skip reasons for both perspectives.

## generated-source

Supply a generated-client refresh with no generator or runtime change. Expect
`NOT_APPLICABLE`; generated files must not activate Application resilience.

## pure-config

Supply a local formatter-setting change with no production effect. Expect
`NOT_APPLICABLE`; pure configuration must not be a false positive.

## no-signal

Supply a terminology-only design with no production behavior change. Expect
`NOT_APPLICABLE` and both no-signal reasons.

## missing-infrastructure

Remove `infrastructure-readiness` from a disposable installation, then supply
an infrastructure-only design. Expect orchestration to stop with the exact
whole-pack installation remedy and no specialist report.

## missing-application

Remove `application-resilience` from a disposable installation, then supply an
application-only design. Expect orchestration to stop with the exact
whole-pack installation remedy and no specialist report.

## missing-both

Remove both specialist skills from a disposable installation, then supply a
dual-perspective design. Expect both missing names, one whole-pack remedy, and
no embedded fallback review.

## concurrent-independent

On a host with independent subagents, supply a dual-perspective design. Expect
concurrent perspectives with the same input and no intermediate report shared.

## sequential-independent

On a host without subagents, supply the same dual-perspective design. Expect
the same Role briefs to run sequentially in clean contexts without sharing
intermediate findings.

## valid-design-blocker

Supply a proposal-attributed one-step deployment whose rollback signal is an
unresolved decision. Expect a cited blocker that names the decision and design
section to update.

## pre-existing-debt

Supply a design that mentions an existing alert without a runbook but neither
requires nor worsens it. Expect a non-blocking Advisory.

## resolved-decision

Supply a design with a resolved error stop threshold and rollback action.
Expect no blocker from that decision.

## not-production-safety

Leave dashboard colors undecided. Expect a non-blocking Advisory because the
choice is not necessary for safe production behavior.

## unattributed-question

Include an unanswered recovery-ownership question without tying it to behavior
the proposal requires, worsens, or newly depends on. Expect an Advisory, not a
blocker.

## not-applicable

Supply a design with no Operational signals. Expect the complete stable
envelope, `NOT_APPLICABLE`, both skip reasons, and a continue action.

## ready

Supply an applicable design whose executed perspective reports no findings.
Expect `READY`, all stable sections, and a continue action.

## advisory-only

Supply an applicable design with one pre-existing concern. Expect
`READY_WITH_ADVISORIES`, the cited Advisory, and a follow-up that does not stop
specification finalization.

## valid-blocker

Supply one candidate that passes every Design blocker condition. Expect
`BLOCKED` and one decision returned to the design loop.

## advisory-disagreement

Have the perspectives disagree about a non-critical dashboard requirement.
Expect both attributed positions to remain as an advisory tension; do not vote.

## critical-disagreement

Have the perspectives disagree about a proposal-attributed rollout stop
decision needed for safe production behavior. Expect both cited positions to
remain and the unresolved decision to block.
