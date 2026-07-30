# Source provenance

This ledger records whether a tracked Operations Pack artifact is adapted from
upstream work or is original portability and orchestration work. Update the
artifact mappings in the same change that introduces or modifies an
adaptation.

## Pinned upstream sources

| Source | Revision | License and notice |
| --- | --- | --- |
| [`testdouble/han`](https://github.com/testdouble/han) | `a90cb0993d774f921ae945ffc58f9eb69df07fdf` | MIT; Copyright 2026 Test Double, Inc.; preserved in [`third_party/testdouble-han-LICENSE`](third_party/testdouble-han-LICENSE) |

## Adapted upstream work

Every upstream path in this table refers to the pinned Han revision above.
The Operations Pack keeps Han's substantive behavior while replacing
plugin-qualified agents, Claude-specific tool declarations, and dynamic command
injection with host-neutral skill instructions.

| Operations Pack artifact | Upstream artifact | Adaptation |
| --- | --- | --- |
| `skills/runbook/SKILL.md` | `han-core/skills/runbook/SKILL.md` | Preserves explicit intent, the one-runbook boundary, modes, and progressive reference loading behind the stable public capability. |
| `skills/runbook/references/authoring-workflow.md` | `han-core/skills/runbook/SKILL.md` | Extracts create, update, validate, project-discovery, integration, and validation behavior without host-specific tools or registered agents. |
| `skills/runbook/references/evidence-gate.md` | `han-core/skills/runbook/SKILL.md`; `han-core/references/yagni-rule.md`; `han-core/references/evidence-rule.md` | Preserves the evidence-based YAGNI decision, trust classes, explicit deferral, revisit trigger, and recorded human override in a runbook-specific reference. |
| `skills/runbook/references/runbook-template.md` | `han-core/skills/runbook/references/runbook-template.md` | Preserves the procedural metadata, action and expected-result pairing, verification, escalation, rollback, live links, optional-section rules, and change history with host-neutral wording. |
| `skills/runbook/references/quality-check.md` | `han-core/skills/runbook/SKILL.md`; `han-core/references/readability-rule.md`; `han-core/references/writing-voice.md` | Extracts the final completeness and readability checks, including the rule that editing must preserve every factual condition. |
| `skills/runbook/references/writing-blocklist.md` | `han-core/references/readability-rule.md`; `han-core/references/writing-voice.md` | Preserves the complete vocabulary blocklist used by Han's runbook readability self-check. |
| `skills/infrastructure-readiness/SKILL.md` | `han-core/agents/devops-engineer.md` | Exposes Han's DevOps and SRE judgment through the stable, directly invocable capability while replacing registered-agent behavior with host-neutral references. |
| `skills/infrastructure-readiness/references/role-brief.md` | `han-core/agents/devops-engineer.md`; `han-core/references/evidence-rule.md`; `han-core/references/yagni-rule.md` | Preserves the inquiry-first posture, operational vocabulary, named anti-patterns and failure modes, twelve protocols, evidence discipline, native severity, evidence-based YAGNI gate, and P0/P1/P2 sequencing. |
| `skills/infrastructure-readiness/references/report-format.md` | `han-core/agents/devops-engineer.md` | Preserves the question log, assumptions, open questions, exact finding fields, native severity summary, protocol-clear records, and improvement summary in a portable perspective-report contract. |
| `skills/application-resilience/SKILL.md` | `han-core/agents/on-call-engineer.md` | Exposes Han's on-call application-source judgment through the stable, directly invocable capability while replacing registered-agent behavior with host-neutral references. |
| `skills/application-resilience/references/role-brief.md` | `han-core/agents/on-call-engineer.md`; `han-core/references/evidence-rule.md`; `han-core/references/yagni-rule.md` | Preserves the inquiry-first posture, production-failure vocabulary, named source anti-patterns, eight protocols, tone discipline, evidence standard, native severity, YAGNI gate, and sequenced smallest-safe remediation. |
| `skills/application-resilience/references/report-format.md` | `han-core/agents/on-call-engineer.md` | Preserves the failure profile, question log, assumptions, open questions, exact finding fields, native severity summary, protocol-clear records, and on-call improvement summary in a portable perspective-report contract. |

## Original Operations Pack work

The following artifact groups originate in Operations Pack:

| Artifact | Purpose |
| --- | --- |
| `skills/*/SKILL.md` except `skills/runbook/SKILL.md`, `skills/infrastructure-readiness/SKILL.md`, and `skills/application-resilience/SKILL.md` | Stable public capability names, discovery metadata, and invocation boundaries not yet adapted from Han |
| `skills/*/references/capability-boundary.md` | Portable v1 capability boundaries |
| `skills/infrastructure-readiness/references/engagement-contract.md` | Portable Direct, Design-seam, and Release-seam contracts layered around the shared specialist behavior |
| `skills/application-resilience/references/engagement-contract.md` | Portable Direct, Design-seam, and Release-seam contracts layered around the shared specialist behavior |
| `test/public-pack.test.mjs` | Consumer-visible pack contract |
| `test/runbook.test.mjs` and `test/fixtures/runbook/` | Deterministic public-boundary verification for the extracted runbook contract |
| `test/infrastructure-readiness.test.mjs` and `test/fixtures/infrastructure-readiness/` | Deterministic routing, boundary, evidence, severity, and engagement verification for Infrastructure readiness |
| `test/application-resilience.test.mjs` and `test/fixtures/application-resilience/` | Deterministic routing, boundary, evidence, protocol, severity, and engagement verification for Application resilience |
| `eval/manual/runbook.md` | Cross-host manual prompt corpus and expected observations |
| `eval/manual/infrastructure-readiness.md` | Cross-host direct-selection, boundary, evidence, severity, and seam-engagement prompt corpus |
| `eval/manual/application-resilience.md` | Cross-host direct-selection, source-boundary, evidence, protocol, severity-calibration, and seam-engagement prompt corpus |
| `README.md` | Whole-pack installation and verification guidance |
| `.github/workflows/ci.yml` | Deterministic public-boundary CI entry point |

Original Operations Pack work is licensed under the repository
[MIT License](LICENSE).
