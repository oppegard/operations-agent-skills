# Setup capability boundary

- This is a manual-only skill.
- Installation and update only copy the Operations Pack skill files; they do
  not invoke setup or edit consumer instructions.
- The current setup surface manages Codex project scope and the host-neutral
  base Integration Policy only. Global scope, Claude Code, and optional
  Integration profiles belong to later capabilities.
- Policy preview and inspect modes are read-only.
- Setup verifies all six public skills before it offers a managed policy.
- Codex targets are the recognized project-root `AGENTS.md` and
  `AGENTS.override.md` conventions. Preserve a single established convention;
  when both exist, require the user to choose.
- Any policy write requires explicit setup invocation, an exact preview, human
  confirmation, and the helper's `--confirm <confirmation-token>` option. The
  token binds the write to the exact target, current content, and managed
  result that preview displayed.
- The helper owns one marker-delimited block. It preserves unrelated bytes,
  refuses malformed or duplicate ownership markers, creates a one-step backup,
  and replaces the target atomically.
- A managed block carries its own policy schema. An identical rerun is
  read-only; schema drift is previewed before a confirmed update.
