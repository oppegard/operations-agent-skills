# Design Engagement contract

Apply this contract around each selected specialist's shared Role brief. The
candidate design is the review input. Do not replace the specialist's inquiry,
evidence, severity, or remediation behavior with this contract.

## Required perspective evidence

Each perspective must cite the exact candidate design section and quote or
precisely identify the design text supporting every finding. For every cited
item, classify its design state and report:

- decisions, including whether each is resolved or unresolved;
- assumptions, including who or what must validate them;
- constraints, including their source and production consequence; and
- open questions, including the decision owner or the evidence needed to
  answer them.

Require a citation for every reported item, not only findings. A missing or
unverifiable citation is not a blocker; return the report for evidence repair
or retain the item as an advisory with the evidence gap explicit.

## Design blocker gate

Promote a specialist candidate to a Design blocker only when all of these are
true:

1. It identifies an unresolved decision, including a decision expressed as an
   open question.
2. It is proposal-attributed: the proposal requires the behavior, worsens the
   risk, or newly depends on that behavior.
3. The decision is necessary to specify safe production behavior before the
   design can be finalized.
4. The report cites the exact candidate design section and explains the unsafe
   production outcome if the decision remains open.

If any condition fails, the item is not a blocker. Preserve useful,
evidence-backed concerns as Advisories. Pre-existing operational debt remains
an Advisory even when important; the proposal must not become a general debt
gate. A resolved decision, an unattributed question, a preference unrelated to
production safety, or uncertainty without concrete proposal-attributed risk
also remains advisory.

For every blocker, state the one decision that must be made, the acceptable
safe choices or evidence, and the candidate design section that must change.
