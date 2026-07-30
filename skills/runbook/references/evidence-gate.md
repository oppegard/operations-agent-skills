# Runbook evidence gate

Apply this gate in create mode before choosing a location, discovering a new
document convention, or drafting content. Updates and validation operate on an
existing artifact and do not need to prove its original need again.

## Evidence that supports creation

Creation may proceed when at least one real operational origin needs the
procedure now:

1. An alert that actually fired, with the firing incident or alert-manager
   record.
2. A documented incident or post-mortem.
3. A recurring scheduled task the team performs, with its cadence and schedule
   location.
4. A failure mode on a production service that has occurred or is expected
   under current measured pressure.
5. A customer report or stakeholder commitment that requires the procedure
   now.

Record the specific artifact in the runbook's `Origin` field. Read a supplied
incident, post-mortem, alert record, or task definition and use its observed
symptoms, successful actions, and verification evidence. Do not reconstruct
those facts from general knowledge.

Name the evidence trust class when reporting the gate decision:

- `codebase` for current source, configuration, tests, and build output;
- `provided` for user-supplied files, links, screenshots, or transcripts;
- `web` for material outside the project and user-provided evidence set.

Cite the artifact rather than a recollection. Mark a recommendation based on
one uncorroborated web source as single-source; it cannot be the sole reason to
create the runbook.

## Simpler-version gate

After evidence supports creation, and before an update adds content, apply the
simpler-version gate to the shape of the runbook. Use the smallest procedure
that fully addresses the same operational evidence. A requested update is
evidence for that change, not for adjacent additions.

Do not add speculative branches, commands, configuration, links, or optional
sections for failure modes the evidence does not support. When a simpler
procedure satisfies the observed need, choose it and report excluded ideas
outside the runbook with the concrete trigger that would justify revisiting
them. Do not add an empty deferred section to the runbook.

## Refusal and revisit trigger

If no origin applies, do not write or change a file. Recommend deferring the
runbook and name the concrete event that would justify revisiting it, such as
the first alert firing, first occurrence of the failure mode, first scheduled
execution, or a customer commitment.

Explain that the runbook would otherwise be speculative operational machinery
with an ongoing staleness cost. Then ask whether the human wants to override
the gate and proceed preventively.

## Human override

Only a human may grant the override. The agent must not grant the human
override, infer one from silence, or turn a readiness finding into an
authorization to write.

If the human explicitly overrides the refusal, proceed and record this exact
shape in `Origin`:

`override: written preventively at human request on YYYY-MM-DD - reason`

Use the actual date and the human's stated reason. If the reason is missing,
ask for it before writing. This record keeps the lack of standard operational
evidence visible to future readers.
