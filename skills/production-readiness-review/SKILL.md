---
name: production-readiness-review
description: Assess broad release- or production-readiness intent against a functionally reviewed change before an agent-controlled commit or merge.
disable-model-invocation: false
---

# Production readiness review

Use this orchestrator when a user broadly asks whether a change is ready for
release or production. Broad release-readiness intent selects
`production-readiness-review`; focused intent for an Infrastructure-readiness
or Application-resilience perspective continues to select that specialist
directly.

Read the bundled [Capability boundary](references/capability-boundary.md)
before selecting perspectives. Return only the stable
[Readiness result](references/report-format.md).

## Establish the Release baseline

Require all three inputs before review:

1. the functionally reviewed fixed point;
2. the change diff from that fixed point; and
3. the specification the functional review used.

Record immutable identifiers where the host exposes them, such as the fixed
point commit and specification issue or path. If an input is absent, request
it. A missing review input is an unmet precondition, not a Release blocker.

Every applicable perspective receives the same stable baseline and its own
Release-seam Engagement contract. Do not let one perspective revise the input
for another.

## Orchestrate the perspectives

1. Apply the Capability boundary's Applicability gate. Record every selected
   and skipped perspective, including a skip reason.
2. Verify each selected skill is installed. Do not embed a fallback copy of
   specialist behavior. If a selected skill is missing, stop and give the
   whole-pack installation remedy:

   ```sh
   npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent codex
   npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent claude-code
   ```

   Show only the command for the active host unless the host is unknown.
3. Invoke `infrastructure-readiness`, when selected, with its Release-seam
   Engagement contract and the stable baseline.
4. Invoke `application-resilience`, when selected, with its Release-seam
   Engagement contract and the same stable baseline.

When subagents are available, run applicable perspectives concurrently. When
they are not, run the same Role briefs sequentially and withhold intermediate
findings: do not share one perspective's findings with the next. Perspectives
must inspect the change independently and return their native report and
source-evidence conventions. Specialists do not emit the overall status.

## Validate and synthesize

Synthesize evidence, not votes. Preserve specialist finding identifiers,
native severity, exact evidence, and material disagreement.

### Change attribution

Specialists may inspect surrounding source, tests, callers, configuration, and
history for context. Surrounding context is not by itself the source or basis
of a blocker. A blocker candidate must arise from introduced, modified, or
newly relied-upon behavior in the reviewed change.

Validate the candidate's exact evidence and Change attribution against the
fixed-point diff before promotion. Separate a pre-existing finding as an
`Ambient risk` only when the change neither modifies nor newly relies upon that
behavior; an Ambient risk cannot block an unrelated change.

### Blocker promotion

Only these native top severities are blocker candidates:

- `Blocks rollout` from Infrastructure-readiness; and
- `Wakes someone up` from Application-resilience.

Promote a candidate only after validating both its exact specialist evidence
and its Change attribution. Lower severities remain advisories. Do not raise a
specialist's severity during synthesis.

Missing context alone does not block. An open question can block only when it
identifies concrete Change-attributed risky behavior and the answer could
establish a native top-severity finding. Otherwise retain it as an advisory
with the evidence or decision needed to resolve it.

Resolve overlaps and disagreements through evidence, not voting or finding
counts. Keep material disagreement attributed to its source perspectives. An
unresolved disagreement blocks only when it concerns attributable critical
production risk; otherwise retain it as an advisory tension.

### Status

Use the definitions in the Readiness-result format:

- `NOT_APPLICABLE` when the gate selects no perspective;
- `READY` when executed perspectives produce no blockers, advisories, Ambient
  risks, or unresolved questions;
- `READY_WITH_ADVISORIES` when no blocker remains but non-blocking findings,
  questions, tensions, Ambient risks, or accepted risks remain; and
- `BLOCKED` when a validated Release blocker, critical open question, or
  critical unresolved disagreement remains.

## Enforce the Release gate

A `BLOCKED` result stops an agent-controlled commit or merge. Clearing it
requires remediation or explicit human Risk acceptance. An agent cannot grant
its own Risk acceptance, infer acceptance from silence, or accept on behalf of
a human. Record the human actor, exact accepted risk, reviewed fixed point, and
scope; report the accepted risk as an advisory in the final result.

When remediation changes operationally relevant artifacts, require both
functional and operational review against a new baseline. Rerun this review
with the new fixed point, its diff, and the specification; do not carry forward
stale findings, evidence, or acceptance to changed behavior. If the rerun is
clear, emit the new status and retain only still-supported Ambient risks and
advisories.
