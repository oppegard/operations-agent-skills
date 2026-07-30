---
name: setup-operations-pack
description: Preview, apply, update, or inspect Operations Pack Integration Policy only when the user explicitly invokes setup.
disable-model-invocation: true
---

# Setup Operations Pack

Run this workflow only when the user explicitly invokes
`setup-operations-pack`. Never run setup during skill installation or update.
Installing skill files does not authorize an instruction-file change.

Read the bundled [Capability boundary](references/capability-boundary.md)
before performing any setup operation. The exact managed content is the
host-neutral [Base Integration Policy](references/base-policy.md).

## Manage Codex project policy

This version manages the base profile at Codex project scope.

1. Identify the intended project root and requested mode: `preview`, `inspect`,
   `apply`, or `update`.
2. Run the dependency-free helper from this installed skill:

   ```sh
   node <skill-directory>/scripts/setup-policy.mjs preview --project <project-root>
   ```

3. If the helper reports multiple recognized Codex instruction targets, stop
   and ask the user which target to use. Rerun with exactly one of
   `--target AGENTS.md` or `--target AGENTS.override.md`.
4. For `preview`, show the user the exact preview emitted by the helper. For
   `inspect`, run the same command with `inspect`; both modes are read-only.
   Keep the preview's confirmation token with the exact result it identifies.
5. For `apply` or `update`, first show the exact preview and ask the user to
   confirm that result. Only after that confirmation, rerun the same target and
   project selection with the preview token, for example:

   ```sh
   node <skill-directory>/scripts/setup-policy.mjs apply --project <project-root> --confirm <confirmation-token>
   node <skill-directory>/scripts/setup-policy.mjs update --project <project-root> --confirm <confirmation-token>
   ```

The helper refuses a token if the target, its contents, or the managed result
changed after preview. Preview again in that case. Never repair malformed
markers, choose between ambiguous targets, or grant Risk acceptance on the
user's behalf.
