# Runbook authoring workflow

Handle exactly one runbook per invocation. If the user asks for a batch, ask
them to choose one procedure and rerun the skill for each remaining procedure.

Determine the mode from the request before inspecting or changing an artifact.
If the mode is unclear, ask whether the user wants to create, update, or
validate the runbook.

## Create

Create a runbook for a procedure that does not have one yet. Apply the evidence
gate before choosing a location or drafting content.

After the gate passes, discover and follow the project's existing runbook
convention:

1. Read the applicable project instructions, including `AGENTS.md`,
   `CLAUDE.md`, and any project-discovery document, for documented runbook and
   documentation directories.
2. Enumerate existing Markdown runbooks and inspect representative files. Note
   whether the project uses a flat, per-service, or alert-keyed layout, and
   preserve its filename and document format.
3. Reuse an established instruction index, incident-document link pattern, ADR
   link pattern, or alert-definition comment pattern when one applies.
4. If existing conventions conflict or more than one placement is reasonable,
   explain the ambiguity and ask the human to choose before writing.
5. Only when no convention exists, default to `docs/runbooks/` and the bundled
   template.

Use a symptom-first filename in kebab case when the project has no filename
rule. Lead with the observable failure or operation, not a broad system name.
Place the file in a service or alert directory only when the project already
uses that organization.

Gather the title, one-line purpose, severity, triggers, reversibility, origin,
owner, prerequisites, symptoms, procedure, expected result for each action,
final verification, escalation conditions and contacts, rollback, and live
operational links. Read the operational origin and preserve its observed facts
rather than inventing missing commands or outcomes. Ask only for genuinely
missing information.

Draft for a capable operator who did not do this work and lacks the author's
context. Put the immediate operational signal and action before background
detail.

Write the runbook using the established project format. If none exists, use
the bundled template. Remove author guidance and any optional heading that
does not apply.

Add applicable cross-links only through conventions the project has already
established:

- link an existing runbook index or instruction section to the new runbook;
- link a related incident, post-mortem, or architecture decision record back
  to the runbook;
- link an alert definition to the runbook using the repository's existing
  comment or annotation pattern.

Do not create a new project index or linking convention for this invocation.

## Update

Read the complete existing runbook before editing it. Edit that file in place;
do not replace it with the bundled template or move it to a new convention.
Preserve every factual claim, condition, qualifier, command, expected result,
and history entry unless current evidence specifically changes it. Ask about a
fact that appears stale but lacks replacement evidence.

Set `Last edited` to the current date. Add the newest change-history entry at
the top with the author, what changed, why, and its validation status. Do not
change `Last validated` for an edit, structural review, partial command check,
or unexercised correction.

Apply established cross-links when the update makes one newly applicable. Do
not invent an index or linking convention.

## Validate

Read the complete existing runbook and check its metadata, prerequisites,
actions, expected results, final verification, escalation, rollback, live
links, history, placeholders, optional sections, and readability.

Treat a structural or editorial review as different from an end-to-end
exercise. An editorial or structural review must not update validation
metadata. Report the findings and state that the runbook remains unvalidated.

Update `Last validated` only when the human confirms the procedure was
exercised end to end in production or a faithful staging environment. Record
the date and validating party, set `Last edited` when the artifact changes, and
add the newest change-history entry describing the environment and scope.
Never infer successful exercise from a passing command, a prior history entry,
or the absence of reported errors.
