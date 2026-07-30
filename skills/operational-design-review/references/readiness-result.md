# Design Readiness synthesis and result

## Synthesis rules

Synthesize only specialist reports that satisfy the Design Engagement
contract.

- Deduplicate candidates by the unresolved decision and production outcome,
  not by title or wording. Preserve all supporting citations and perspective
  attribution.
- Resolve by evidence, not by votes, report count, completion order, or
  severity labels alone.
- When one position is supported by the candidate design and the other is
  speculative, retain the evidenced position and record why.
- Preserve every material disagreement with each perspective's position and
  citation. Do not flatten conflicting evidence into a consensus statement.
- An unresolved disagreement about proposal-attributed critical
  production safety becomes a Blocker only when the Design blocker gate is
  met.
  Otherwise preserve it as an advisory tension.

Do not silently raise a specialist severity or turn missing context into a
blocker. Do not discard an advisory because the other perspective is clear.

## Status rules

- `NOT_APPLICABLE`: the Applicability gate selected no perspectives.
- `BLOCKED`: at least one item passes every Design blocker condition.
- `READY_WITH_ADVISORIES`: at least one perspective ran, no blocker remains,
  and at least one Advisory or advisory tension remains.
- `READY`: at least one perspective ran and no Blocker or Advisory remains.

## Stable Markdown envelope

Emit every section below in this order. Use `None.` for an empty section.

```markdown
# Operational Design Readiness result

## Status

[NOT_APPLICABLE | READY | READY_WITH_ADVISORIES | BLOCKED]

## Perspectives

### Executed

- [Infrastructure readiness | Application resilience]: [scope examined]

### Skipped

- [Infrastructure readiness | Application resilience]: [explicit
  Applicability skip reason]

## Blockers

**DESIGN-BLOCKER-001: [unresolved decision]**

- **Perspectives:** [attributed perspective names]
- **Design citation:** [exact candidate design section and supporting text]
- **Proposal attribution:** [requires | worsens | newly depends on]
- **Unsafe outcome:** [concrete production behavior left unspecified]
- **Decision needed:** [one decision, safe choices, or evidence required]
- **Design update:** [section that must change]

## Advisories

**DESIGN-ADVISORY-001: [finding or advisory tension]**

- **Perspectives:** [attributed position or positions]
- **Design citation:** [exact candidate design section]
- **Reason non-blocking:** [failed blocker condition, resolved decision,
  pre-existing debt, or non-critical disagreement]
- **Follow-up:** [smallest useful next step and owner when known]

## Ambient risks

- [Contextual operational condition that is not a Design finding, with source
  and relationship to the proposal. Do not duplicate pre-existing debt already
  recorded as an Advisory.]

## Next action

[Status-specific lifecycle action.]
```

For `NOT_APPLICABLE`, continue specification finalization and retain the skip
reasons. For `READY`, continue specification finalization. For
`READY_WITH_ADVISORIES`, continue while recording the advisory follow-up.

For `BLOCKED`, return one decision at a time to the design decision loop. After
the user resolves it, update the candidate design, then rerun
`operational-design-review` against the complete updated design before
specification finalization. Never grant Risk acceptance on the user's behalf.
