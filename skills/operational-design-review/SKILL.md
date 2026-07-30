---
name: operational-design-review
description: Assess a candidate design at the Design seam when production behavior must be decided before specification finalization.
disable-model-invocation: false
---

# Operational design review

Assess the candidate design through the applicable independent operational
perspectives and return the Design-seam Readiness result.

Broad design-readiness intent selects `operational-design-review`. A focused
request for one named specialist remains a direct specialist engagement.

Read the bundled [Capability boundary](references/capability-boundary.md),
[Applicability gate](references/applicability-gate.md), and
[Orchestration](references/orchestration.md) instructions. Apply the
[Engagement contract](references/engagement-contract.md) to every selected
perspective and apply the
[Readiness result](references/readiness-result.md) contract when synthesizing
the review.

The bundled [Control contract](references/control-contract.json) is normative
for runtime routing values, Operational signals, exclusions, skip reasons,
specialist names, installation remedies, blocker predicates, statuses, and
next actions. The Markdown references define procedure and evidence semantics;
they must not redefine a conflicting control value.
