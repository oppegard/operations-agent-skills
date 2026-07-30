# Infrastructure-readiness report format

Start every direct report with:

> This focused Infrastructure-readiness report is not a complete Readiness
> result.

For an orchestrated engagement, return the same report sections without
claiming an overall Readiness status. Include the engagement seam and the
attribution required by its contract.

```markdown
# Infrastructure readiness: [focus]

## Scope

[Artifacts, services, pipelines, manifests, environments, branch or design
sections examined.]

## Production context

- **Change under review:** [one sentence]
- **Production profile:** [traffic, criticality, regulated data, and
  error-budget status, declared or inferred]
- **Persona of impact:** [who feels a failure]
- **Engagement:** [Direct specialist | Design seam | Release seam]

## Question log

- **Q1 [Answered]:** [question] - [answer and exact citation]
- **Q2 [Assumed]:** [question] - [explicit assumption]
- **Q3 [Open]:** [question] - [why it matters and affected findings]

## Assumptions

[Every explicit assumption used.]

## Open questions

**OQ1: [question]**

- **Why it matters:** [effect on existence, severity, or remediation]
- **Findings affected:** DOR-###
- **How to resolve:** [artifact, query, test, owner, or decision]

## Summary

[One to three sentences describing the focused Infrastructure-readiness
posture without claiming overall Readiness.]

| Severity | Count |
| --- | ---: |
| Blocks rollout | N |
| Degrades reliability | N |
| Operational friction | N |
| Polish | N |
| YAGNI candidate | N |

Open Questions: N

## Findings

**DOR-001: [title]**

- **Principle:** [framework, control, or named failure mode]
- **Location:** `file_path:line_number` or exact design section
- **Evidence:** [exact code, manifest, pipeline step, config, or design text]
- **Production impact:** [what breaks, when, who is affected, blast radius]
- **Related questions:** [Answered, Assumed, and Open question IDs]
- **Attribution:** [Direct | Design proposal | Change-attributed | Ambient risk]
- **Severity:** Blocks rollout | Degrades reliability | Operational friction |
  Polish | YAGNI candidate
- **YAGNI applicability:** [only for a YAGNI candidate: failed gate and reopen
  trigger]
- **Remediation (P0 - today):** [smallest safe next step]
- **Remediation (P1 - next sprint):** [incremental improvement]
- **Remediation (P2 - next quarter):** [longer-horizon strengthening]

> **Protocol N - Name:** No proven operational risk found. Checked: [artifacts
> examined].

## DevOps improvement summary

- **What was found:** [finding IDs, facts, no blame]
- **How to improve:** [P0, P1, and P2 sequence]
- **How to prevent:** [applicable practices or controls]
- **Shipping vs improving:** [blockers versus tracked improvements]
- **Premature operational machinery:** [YAGNI candidates, deletion or deferral,
  and reopen triggers, or "No premature operational machinery found."]
```
