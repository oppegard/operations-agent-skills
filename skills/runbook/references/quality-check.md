# Runbook quality check

Read the finished runbook from disk. Fix each failed check before presenting a
created or updated artifact. In validate mode, report each failure unless the
human also asked for an update.

## Completeness

1. Confirm there is exactly one runbook in scope.
2. Confirm all required metadata is present and no template placeholders
   remain. `Last validated` must name a real exercise date and party or state
   `Not yet validated`, with the status explained in change history.
3. Confirm `Origin` cites a real operational artifact or the evidence gate's
   dated human override and reason.
4. Confirm Symptoms contains concrete alert text, errors, log evidence, or
   user-visible behavior. Confirm Prerequisites lists the needed access and
   tools or explicitly says none are needed beyond a workstation.
5. Confirm every Resolve or Quick fix action gives an exact command and
   expected result. A non-command action must give the equivalent success
   signal. Each step must say what different output means or where to go next.
6. Confirm final verification proves the original symptom is gone. It must be
   distinct from a per-step expected result.
7. Confirm each escalation states its condition, recipient, and channel in
   that order.
8. Confirm rollback provides exact reversal steps. When rollback is impossible
   or inapplicable, state the reason and what the operator should do instead.
9. Confirm Live links points to the operational surfaces used during the
   procedure.
10. Confirm change history is newest first and records who changed what, why,
    and whether the change was exercised.
11. Remove the template's author comment, every unused optional section, and
    every empty heading. Do not leave `optional`, ellipses, braces, or other
    drafting scaffolding in the result.

## Readability

Apply this pass only to prose. Exclude code fences, command output, URLs,
identifiers, and citation text.

Write for a capable operator who did not do this work and lacks the author's
context.

1. Put the main point first in the description and each section.
2. Use descriptive headings that help an operator scan under pressure.
3. Give each paragraph one idea and lead with that idea.
4. Prefer short, active sentences and common words. Review any sentence longer
   than about 30 words.
5. Number sequential actions and use bullets for non-sequential information.
6. Reveal the immediate action before background detail.
7. Apply the complete [Writing blocklist](writing-blocklist.md). Treat it as an
   exact output check, not an illustrative list.

Fidelity wins over polishing. Preserve every factual claim, quantity, named
entity, condition, qualifier, command, and expected result. Readability changes
how a fact is presented; they must not weaken, generalize, or remove it.
