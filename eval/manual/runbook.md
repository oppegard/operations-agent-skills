# Runbook manual prompt cases

Run each case against a whole-pack installation in both Codex and Claude Code.
Repeat at global and project scope before a release. Record the host, scope,
pack revision, observed result, and pass or fail. These live-model evaluations
are release evidence, not a CI gate.

Use a disposable project containing only the named fixture files. Do not point
these prompts at production systems or execute their example commands.

## evidence-gate-refusal

Prompt:

> Create a runbook for a checkout alert we might add someday. The alert does
> not exist, has never fired, and no incident or commitment requires it.

Expected observations:

- The skill selects create mode for one runbook.
- It refuses to write, explains the speculative staleness cost, and names a
  concrete revisit trigger.
- It offers a human override but does not grant one.

## human-override

Start with `evidence-gate-refusal`, then reply:

> Override and proceed. I want a preventive rehearsal document even though no
> operational trigger exists.

Expected observations:

- The skill asks for any missing procedure facts before writing.
- The result records a dated `Origin` beginning with `override:` and preserves
  the stated reason.
- It does not describe the override as incident or alert evidence.

## creation

Use `test/fixtures/runbook/incident-notes.md` as the operational origin. Copy
`test/fixtures/runbook/existing-convention.md` into the disposable project's
established runbook directory. Prompt:

> Create one checkout-queue runbook from the supplied INC-142 notes. Follow
> this project's runbook convention.

Expected observations:

- The skill discovers and follows the existing location, filename, format, and
  applicable link patterns.
- The artifact includes all required procedural and history information.
- `Last validated` does not claim an end-to-end exercise.
- No unused optional section, author guidance, or placeholder remains.

## update

Use `test/fixtures/runbook/created.md` as the existing artifact. Prompt:

> Update this runbook in place to add the database escalation condition from
> the INC-142 follow-up. I have not exercised the procedure.

Expected observations:

- Existing facts and history remain.
- The new history entry is first and explains the unexercised update.
- `Last edited` changes and `Last validated` does not.
- The skill adds only cross-links supported by an established project pattern.

## validation

Use the artifact produced by the `update` case. Prompt:

> Validate this one runbook. Sam Exerciser ran every step end to end in a
> faithful staging environment today and observed each documented result.

Expected observations:

- The skill checks completeness and readability without dropping facts.
- `Last validated` records the date and Sam Exerciser.
- The newest history entry names faithful staging and the end-to-end scope.
- The skill would leave validation metadata unchanged if the exercise claim
  were absent.
