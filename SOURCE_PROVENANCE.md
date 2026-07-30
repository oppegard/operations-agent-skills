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

Issue #2 introduces the installable pack boundary but does not yet introduce
adapted Han content. The faithful extractions scheduled for the `runbook`,
`infrastructure-readiness`, and `application-resilience` capability directories
must add file-by-file mappings here when they land.

| Operations Pack artifact | Upstream artifact | Adaptation |
| --- | --- | --- |
| None in the installable-pack contract | — | — |

## Original Operations Pack work

The following artifact groups originate in Operations Pack:

| Artifact | Purpose |
| --- | --- |
| `skills/*/SKILL.md` | Stable public capability names, discovery metadata, and invocation boundaries |
| `skills/*/references/capability-boundary.md` | Portable v1 capability boundaries |
| `test/public-pack.test.mjs` | Consumer-visible pack contract |
| `README.md` | Whole-pack installation and verification guidance |
| `.github/workflows/ci.yml` | Deterministic public-boundary CI entry point |

Original Operations Pack work is licensed under the repository
[MIT License](LICENSE).
