# Application-resilience Engagement contract

The caller supplies a focus artifact and one of the contracts below. Apply the
contract around the shared Role brief. Do not duplicate the Role brief inside
the contract. Seam-specific evidence and attribution may not abbreviate or
replace its specialist behavior.

## Direct specialist

Use when the user explicitly asks for the Application-resilience perspective.
Review the supplied production application source as current-state behavior.
Return the full focused perspective report and state:

> This focused Application-resilience report is not a complete Readiness
> result.

Do not produce the orchestrator's overall status or synthesize other
perspectives.

## Design seam

Use when `operational-design-review` selects this perspective. The caller must
supply the candidate design and identify this as a Design-seam engagement.

- Cite the exact candidate design section for each finding.
- Classify the cited material as a decision, assumption, constraint, or open
  question.
- Attribute a blocker candidate only to an unresolved production-safety
  decision that the proposal requires, worsens, or newly depends on.
- Keep pre-existing application-resilience concerns visible as advisories
  rather than treating them as proposal blockers.
- Return the specialist perspective to the orchestrator. Do not emit an
  overall Design Readiness result.

## Release seam

Use when `production-readiness-review` selects this perspective. The caller
must supply the stable baseline: the functionally reviewed fixed point, the
change diff, and its specification.

- Every finding must cite exact application source as
  `file_path:line_number` and identify the exact line or contiguous span.
- Inspect surrounding application source, tests, and callers only to establish
  context for the reviewed behavior.
- Mark each finding as `Change-attributed` or `Ambient risk`.
- A blocker candidate must be Change-attributed and use the native top severity
  `Wakes someone up`.
- Missing context remains an open question unless it is tied to concrete,
  Change-attributed risky behavior and its answer could establish a
  `Wakes someone up` finding.
- Return the specialist perspective to the orchestrator. Do not promote a
  candidate to an overall Release blocker or emit a complete Readiness result.
