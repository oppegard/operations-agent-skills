# Application-resilience report format

Start every direct report with:

> This focused Application-resilience report is not a complete Readiness
> result.

For an orchestrated engagement, return the same report sections without
claiming an overall Readiness status. Include the engagement seam and the
attribution required by its contract.

```markdown
# Application resilience: [focus]

## Scope

[Application source, tests, callers, migration source, branch, or design
sections examined. List excluded artifacts and their destination capability.]

## Failure profile

- **Change under review:** [one sentence]
- **Most likely production failure shape:** [latency cascade, retry storm,
  gray failure, data corruption, queue runaway, metastable failure, or other]
- **Triggering conditions:** [traffic, dependency state, cache temperature,
  repeated delivery, rollout state, or calendar boundary]
- **Affected users:** [who feels the failure first]
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
- **Findings affected:** OCE-###
- **How to resolve:** [source, test, history, owner, or decision]

## Summary

[One to three sentences describing the focused Application-resilience posture
without claiming overall Readiness.]

| Severity | Count |
| --- | ---: |
| Wakes someone up | N |
| Degrades reliability | N |
| On-call friction | N |
| Polish | N |
| YAGNI candidate | N |

Open Questions: N

## Findings

**OCE-001: [title]**

- **Anti-pattern:** [named application-source anti-pattern]
- **Production failure mode:** [named failure mode]
- **Operability principle:** [specific Nygard, Brooker, SRE, ODD, USE,
  SLI/SLO, or systems-thinking principle]
- **Location:** `file_path:line_number` or exact candidate design section
- **Evidence:** [exact source line, contiguous span, or design text]
- **Triggering conditions:** [traffic, timing, dependency, queue, cache, or
  rollout state]
- **Affected users:** [first affected and propagation]
- **Blast radius:** [call graph, workload, tenant, or data scope]
- **Related questions:** [Answered, Assumed, and Open question IDs]
- **Attribution:** [Direct | Design proposal | Change-attributed | Ambient risk]
- **Severity:** Wakes someone up | Degrades reliability | On-call friction |
  Polish | YAGNI candidate
- **YAGNI applicability:** [only for a YAGNI candidate: failed gate and reopen
  trigger]
- **Remediation (today - smallest safe step):** [smallest shippable risk
  reduction]
- **Remediation (next iteration):** [incremental improvement]
- **Remediation (next quarter - paved path):** [safe codebase default]

> **Protocol N - Name:** No proven source-level resilience risk found.
> Checked: [application source behavior examined].

## On-call improvement summary

- **What was found:** [finding IDs and facts, without blame]
- **How to improve:** [today, next iteration, and paved-path sequence]
- **How to prevent:** [wrappers, helpers, defaults, or checks justified now]
- **Shipping vs improving:** [blockers versus tracked improvements, calibrated
  to likelihood and impact]
- **Premature operability machinery:** [YAGNI candidates, deletion or deferral,
  and reopen triggers, or "No premature operability machinery found."]
```
