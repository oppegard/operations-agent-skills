# Design review orchestration

## Preflight

After Applicability, verify that every selected perspective's skill is
available:

- Infrastructure readiness requires `infrastructure-readiness`.
- Application resilience requires `application-resilience`.

If any selected skill is missing, stop orchestration before invoking any
specialist. Name every missing skill and return this exact whole-pack
installation remedy for the active host:

For Codex:

```sh
npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent codex
```

For Claude Code:

```sh
npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent claude-code
```

Tell the user to rerun the review after installing. Do not emit a Readiness
result from a partial pack, and do not embed or improvise a fallback copy of
specialist behavior.

## Perspective briefs

Give every selected specialist:

1. the same candidate design, without summarizing it differently per
   perspective;
2. this orchestrator's same Design Engagement contract;
3. the Design-seam contract from that specialist's bundled
   `references/engagement-contract.md`; and
4. its own Role brief and report format from the selected specialist skill.

Require findings to cite an exact candidate design section and classify the
cited material as a decision, assumption, constraint, or open question.
Specialists return perspective reports only, never an overall Readiness
status.

## Independent execution

When the host supports subagents, run all selected perspectives concurrently
with independent subagents. Give each subagent only its perspective brief and
the common input.

Otherwise use the sequential fallback: execute the same perspective briefs
one at a time in clean, perspective-specific contexts. Do not share one
perspective's intermediate findings with the other perspective. Preserve
independence by withholding accumulated reports until specialist execution is
complete.

Synthesize only after all selected reports have returned. Execution order,
completion time, or majority agreement is not evidence.
