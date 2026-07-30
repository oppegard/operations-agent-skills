# Operations Pack

Operations Pack is a portable set of operational-review capabilities for
Codex, Claude Code, and other Agent Skills-compatible hosts. It keeps skill
installation separate from the explicit setup of consumer-owned Integration
Policy.

## Install

Whole-pack installation is the supported path. After `v1.0.0` is published,
install the tagged pack and select all six skills:

```sh
npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent codex
npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent claude-code
```

For a local checkout, replace the repository source with its local path:

```sh
npx skills add . --skill '*' --agent codex
```

Selective installation is unsupported. The orchestrators rely on the
complete, stable capability inventory; the Skills CLI does not resolve
dependencies among individually selected skills.

Installation only installs skill files. It does not run setup and does not
change `AGENTS.md`, `CLAUDE.md`, or any other consumer instruction file. After
installation, invoke `setup-operations-pack` explicitly to inspect or manage
Integration Policy.

## Stable v1 capabilities

| Skill | Invocation boundary |
| --- | --- |
| `setup-operations-pack` | Manual-only Integration Policy management |
| `operational-design-review` | Complete Design-seam operational review |
| `production-readiness-review` | Complete Release-seam readiness review |
| `infrastructure-readiness` | Focused Infrastructure-readiness perspective |
| `application-resilience` | Focused Application-resilience perspective |
| `runbook` | Explicit create, update, or validate intent for one runbook |

## Verify

The deterministic public-boundary suite uses the pinned Skills CLI to perform
a real local consumer installation and validate the repository contract:

```sh
npm ci
npm test
```

The suite checks the exact inventory, discovery metadata, invocation controls,
bundled references, instruction-file isolation, package documentation,
licensing, and source provenance. It makes no live model calls.

Manual prompt cases under [`eval/manual/`](eval/manual/) supplement the
deterministic suite. Run them in each supported host as release evidence; they
are not a CI gate.

## License and provenance

Operations Pack is available under the [MIT License](LICENSE). Adapted source
and original-work boundaries are recorded in the
[Source provenance ledger](SOURCE_PROVENANCE.md), with upstream notices kept
under [`third_party/`](third_party/).
