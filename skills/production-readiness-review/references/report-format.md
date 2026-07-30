# Production-readiness-review result format

Only the orchestrator emits this stable Markdown envelope. Keep every heading,
using `None` when a section has no entries.

Status values:

- `NOT_APPLICABLE`: no operational perspective applies.
- `READY`: applicable perspectives ran and found no blocker, advisory, Ambient
  risk, or unresolved question.
- `READY_WITH_ADVISORIES`: no blocker remains, but non-blocking findings,
  questions, disagreement, Ambient risks, or human-accepted risks remain.
- `BLOCKED`: a validated Change-attributed critical risk, qualifying critical
  open question, or qualifying critical unresolved disagreement remains.

```markdown
# Production readiness: [change]

## Status

[NOT_APPLICABLE | READY | READY_WITH_ADVISORIES | BLOCKED]

- **Functionally reviewed fixed point:** [immutable identifier]
- **Change diff:** [range or artifact]
- **Specification:** [issue, path, or immutable identifier]
- **Reviewed at:** [timestamp if available]

## Perspectives

### Executed

- [infrastructure-readiness | application-resilience]: [scope reviewed]

### Skipped

- [perspective]: [Applicability-gate reason]

## Blockers

**REL-001: [title]**

- **Source perspective:** [perspective and native finding ID]
- **Native severity:** [Blocks rollout | Wakes someone up]
- **Attribution:** Change-attributed
- **Changed behavior:** [introduced, modified, or newly relied-upon behavior]
- **Exact evidence:** [`file_path:line_number`, contiguous span, or exact
  rollout-affecting artifact evidence]
- **Validation:** [how evidence and attribution were checked against the diff]
- **Production impact:** [trigger, affected users or operators, and blast
  radius]
- **Required resolution:** [smallest safe remediation, concrete question whose
  answer may establish the risk, or explicit human Risk acceptance]

## Advisories

**ADV-001: [finding, open question, advisory tension, or accepted risk]**

- **Source:** [perspective and finding or question ID]
- **Evidence:** [exact evidence or attributed disagreement]
- **Why non-blocking:** [lower severity, insufficient critical evidence,
  non-critical disagreement, or human Risk acceptance]
- **Follow-up:** [owner, evidence, decision, remediation, or reopen trigger]
- **Risk acceptance:** [human actor, exact risk, fixed point, and scope, or
  `None`]

## Ambient risks

**AMB-001: [pre-existing risk]**

- **Source:** [perspective and native finding ID]
- **Evidence:** [exact pre-existing evidence]
- **Why Ambient:** [proof that the reviewed change did not introduce, modify,
  or newly rely upon the behavior]
- **Follow-up:** [separate tracking or `None`]

## Next action

[Proceed to agent-controlled commit or merge | remediate REL-### | obtain
explicit human Risk acceptance for REL-### | answer the qualifying question |
repeat functional review and production-readiness-review against a new
baseline | no operational review required]
```
