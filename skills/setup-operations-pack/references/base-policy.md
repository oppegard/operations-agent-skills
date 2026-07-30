<!-- operations-pack:integration-policy:start -->
## Operations Pack Integration Policy

Policy schema: 1
Policy scope: Codex project
Integration profile: base

### Lifecycle events

- **Design:** Before finalizing a specification, invoke
  `operational-design-review` with the candidate design.
- **Release:** After functional review establishes a stable fixed point and
  before an agent-controlled commit or merge, invoke
  `production-readiness-review` with that fixed point, its change diff, and
  the specification.

For either lifecycle event, obey the complete Readiness result:

- `NOT_APPLICABLE`: continue and retain the recorded skip reasons.
- `READY`: continue.
- `READY_WITH_ADVISORIES`: continue and retain the advisories.
- `BLOCKED`: stop the lifecycle event, resolve or explicitly accept every
  blocker, and rerun the operational review against the updated input.

### Risk acceptance

Only a human may explicitly accept a Risk. An agent must never grant, infer,
or impersonate Risk acceptance.
<!-- operations-pack:integration-policy:end -->
