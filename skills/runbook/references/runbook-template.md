<!--
AUTHOR: Fill this template, then delete this comment block.

Required content: title, one-line description, metadata, symptoms,
prerequisites, resolution steps or a quick fix, final verification,
escalation, rollback, live links, and change history.

Optional sections must be deleted when they do not apply. An empty optional
heading makes the runbook look unfinished.

The Origin field must cite a real operational origin or the explicit human
override recorded by the evidence gate.
-->

# Runbook: {Symptom-first title}

> {What the operator sees and what this runbook does about it.}

- **Severity:** {The project's severity name}
- **Triggers:** {Alert and link, schedule, upstream runbook, customer report, or manual trigger}
- **Reversible:** {Yes, partial, or no, with a pointer to Rollback}
- **Last validated:** {YYYY-MM-DD by validating party, or Not yet validated}
- **Last edited:** {YYYY-MM-DD}
- **Owner:** {Team or person responsible for freshness}
- **Origin:** {Incident, firing alert, recurring task, customer commitment, or recorded human override}

## Symptoms

- {Concrete alert text, error, log line, or user-visible behavior}

### Likely cause (optional)

{One or two likely causes, in order.}

### Not this - try instead (optional)

- **{Adjacent symptom}:** {Other runbook or destination}

## Background (optional)

{Why this failure or operation exists.}

## Prerequisites

- {Access, VPN, context, tool and minimum version, or "None - workstation only"}

## Quick fix (optional)

Use this instead of Resolve only when one or two actions are reversible, low
blast radius, and harmless if this is the wrong runbook.

**Run only if:** {The condition that makes the quick fix safe}.

```text
$ {exact command}
```

Expected result:

```text
{What success looks like}
```

Then continue to [Verify the fix landed](#verify-the-fix-landed).

## Resolve

### 1. {One imperative action}

```text
$ {exact command}
```

Expected result:

```text
{What success looks like}
```

If you see something different: {What it means and where to go next}.

### 2. {Next imperative action}

```text
$ {exact command}
```

Expected result:

```text
{What success looks like}
```

If you see something different: {What it means and where to go next}.

## Verify the fix landed

- {Concrete check that proves the original symptom is gone}

## If a step fails (optional)

- **Step {number} fails with {error}:** {Next action or escalation}

## If the problem comes back (optional)

- **{Recurrence pattern}:** {Investigation, related runbook, or incident trigger}

## What did not work and why (optional)

- **{Attempt}:** {Why it failed and when not to repeat it}

## Escalate

1. **If {condition or time box}:** contact {recipient} through {channel}.

## Rollback

{Exact reversal actions, or "Not applicable - reason and alternative."}

## Live links

- {Operational surface}: {URL}

## Background and related (optional)

- {Related artifact}: {Path or URL}

## Change history

- **{YYYY-MM-DD}** - {Author}: {What changed and why} [validated: yes | no | partial - {scope}]
