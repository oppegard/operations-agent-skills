import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runbookRoot = join(repoRoot, "skills", "runbook");

function readRunbookFile(relativePath) {
  return readFileSync(join(runbookRoot, relativePath), "utf8");
}

function metadataValue(markdown, label) {
  const match = markdown.match(
    new RegExp(`^- \\*\\*${label}:\\*\\*\\s*(?<value>.*)$`, "im"),
  );
  assert.ok(match, `missing ${label} metadata`);
  return match.groups.value;
}

function applyFixtureChanges(markdown, fixture) {
  let result = markdown;

  for (const change of fixture.expected.changes) {
    assert.equal(
      result.split(change.from).length,
      2,
      `${fixture.id} change must match exactly once: ${change.from}`,
    );
    result = result.replace(change.from, change.to);
  }

  return result;
}

function renderLifecycleArtifacts(fixtureRoot, lifecycle) {
  const artifacts = new Map();

  for (const fixture of lifecycle) {
    const artifact =
      fixture.id === "creation"
        ? readFileSync(join(fixtureRoot, fixture.expected.output), "utf8")
        : applyFixtureChanges(
            artifacts.get(fixture.input.artifactCase),
            fixture,
          );
    artifacts.set(fixture.id, artifact);
  }

  return artifacts;
}

test("the public runbook skill exposes one-runbook create, update, and validate modes", () => {
  const skill = readRunbookFile("SKILL.md");
  const workflowPath = join(runbookRoot, "references", "authoring-workflow.md");

  assert.match(skill, /create, update, or validate/i);
  assert.match(skill, /one (?:operational )?runbook per invocation/i);
  assert.match(
    skill,
    /\[Authoring workflow\]\(references\/authoring-workflow\.md\)/,
  );
  assert.ok(statSync(workflowPath).isFile());

  const workflow = readRunbookFile("references/authoring-workflow.md");
  assert.match(workflow, /^## Create$/m);
  assert.match(workflow, /^## Update$/m);
  assert.match(workflow, /^## Validate$/m);
  assert.match(workflow, /exactly one runbook/i);
});

test("creation refuses unsupported speculation and records an explicit human override", () => {
  const skill = readRunbookFile("SKILL.md");
  const gate = readRunbookFile("references/evidence-gate.md");
  const cases = JSON.parse(
    readFileSync(
      join(repoRoot, "test", "fixtures", "runbook", "evidence-gate.json"),
      "utf8",
    ),
  );

  assert.match(skill, /\[Evidence gate\]\(references\/evidence-gate\.md\)/);
  assert.match(gate, /before (?:choosing|discovering).*location.*drafting/is);
  assert.match(gate, /alert that (?:has )?actually fired/i);
  assert.match(gate, /documented incident/i);
  assert.match(gate, /recurring (?:scheduled )?task/i);
  assert.match(gate, /human override/i);
  assert.match(gate, /agent must not grant|do not grant.*yourself/is);
  assert.match(gate, /Origin/i);
  assert.match(gate, /reason/i);
  assert.match(gate, /revisit|reopen/i);
  assert.match(gate, /simpler-version/i);
  assert.match(gate, /simpler\s+procedure/i);

  const outcomes = Object.fromEntries(
    cases.map((fixture) => [fixture.id, fixture.expected.outcome]),
  );
  assert.equal(outcomes["evidence-gate-refusal"], "refuse");
  assert.equal(outcomes["human-override"], "proceed");

  for (const fixture of cases) {
    assert.equal(fixture.mode, "create");
    assert.ok(Array.isArray(fixture.expected.writes));
    if (fixture.expected.outcome === "refuse") {
      assert.deepEqual(fixture.expected.writes, []);
      assert.ok(fixture.expected.revisitWhen);
    } else {
      assert.match(fixture.expected.origin, /^override: .+ - .+/);
      assert.doesNotMatch(
        fixture.input.humanOverride.reason,
        /alert|incident|recurring task|production failure|customer|commitment/i,
      );
    }
  }
});

test("creation follows project convention and produces the complete procedural contract", () => {
  const skill = readRunbookFile("SKILL.md");
  const workflow = readRunbookFile("references/authoring-workflow.md");
  const template = readRunbookFile("references/runbook-template.md");
  const created = readFileSync(
    join(repoRoot, "test", "fixtures", "runbook", "created.md"),
    "utf8",
  );

  assert.match(skill, /\[Runbook template\]\(references\/runbook-template\.md\)/);
  assert.match(workflow, /discover.*existing.*convention/is);
  assert.match(workflow, /default.*docs\/runbooks\//is);
  assert.match(workflow, /ambigui(?:ty|ous).*ask/is);
  assert.match(workflow, /symptom.*(?:file name|filename)/is);

  for (const label of [
    "Severity",
    "Triggers",
    "Reversible",
    "Last validated",
    "Last edited",
    "Owner",
    "Origin",
  ]) {
    assert.match(template, new RegExp(`\\*\\*${label}:\\*\\*`, "i"));
    assert.match(created, new RegExp(`\\*\\*${label}:\\*\\*\\s+\\S`, "i"));
  }

  for (const heading of [
    "Symptoms",
    "Prerequisites",
    "Resolve",
    "Verify the fix landed",
    "Escalate",
    "Rollback",
    "Live links",
    "Change history",
  ]) {
    assert.match(template, new RegExp(`^## ${heading}$`, "im"));
    assert.match(created, new RegExp(`^## ${heading}$`, "im"));
  }

  assert.match(template, /exact command/i);
  assert.match(template, /Expected (?:output|result)/i);
  assert.match(
    created,
    /^### 1\. .+[\s\S]+?```[\s\S]+?```[\s\S]+?Expected (?:output|result):/m,
  );
  assert.match(created, /If you see something different:/i);
  assert.doesNotMatch(created, /\{[^}\n]+\}|…|\(optional\)/);
});

test("updates preserve history and validation dates change only after an end-to-end exercise", () => {
  const workflow = readRunbookFile("references/authoring-workflow.md");
  const fixtureRoot = join(repoRoot, "test", "fixtures", "runbook");
  const lifecycle = JSON.parse(
    readFileSync(join(fixtureRoot, "lifecycle.json"), "utf8"),
  );

  assert.match(workflow, /update[\s\S]*edit.*in place/i);
  assert.match(workflow, /preserve.*factual/i);
  assert.match(workflow, /change-history.*newest|newest.*change-history/is);
  assert.match(workflow, /Last edited/i);
  assert.match(workflow, /Last validated/i);
  assert.match(workflow, /end to end.*production.*faithful staging/is);
  assert.match(
    workflow,
    /(?:editorial|structural).*(?:must not|do not|does not).*validation/is,
  );

  assert.deepEqual(
    lifecycle.map((fixture) => fixture.id),
    ["creation", "update", "validation"],
  );

  const artifacts = renderLifecycleArtifacts(fixtureRoot, lifecycle);

  const created = artifacts.get("creation");
  const updated = artifacts.get("update");
  const validated = artifacts.get("validation");

  for (const label of ["Triggers", "Reversible", "Owner", "Origin"]) {
    assert.equal(metadataValue(updated, label), metadataValue(created, label));
    assert.equal(metadataValue(validated, label), metadataValue(updated, label));
  }

  assert.equal(
    metadataValue(updated, "Last validated"),
    metadataValue(created, "Last validated"),
  );
  assert.equal(
    metadataValue(validated, "Last validated"),
    "2026-08-01 by Sam Exerciser",
  );
  assert.match(updated, /Created from incident INC-142/);
  assert.match(updated, /Added the database escalation condition/);
  assert.match(validated, /Added the database escalation condition/);
  assert.match(validated, /Exercised the procedure end to end/);

  const validationCase = lifecycle.find(
    (fixture) => fixture.id === "validation",
  );
  assert.equal(validationCase.input.exercisedEndToEnd, true);
  assert.equal(validationCase.input.environment, "faithful staging");
});

test("the final check removes incomplete scaffolding without weakening facts", () => {
  const skill = readRunbookFile("SKILL.md");
  const quality = readRunbookFile("references/quality-check.md");
  const blocklist = readRunbookFile("references/writing-blocklist.md");

  assert.match(skill, /\[Quality check\]\(references\/quality-check\.md\)/);
  assert.match(
    quality,
    /\[Writing blocklist\]\(writing-blocklist\.md\)/,
  );
  assert.match(quality, /no (?:template )?placeholders/i);
  assert.match(quality, /optional.*(?:remove|delete)/is);
  assert.match(
    quality,
    /every (?:factual )?(?:claim|condition)|preserve every fact/is,
  );
  assert.match(quality, /exact command.*expected result/is);
  assert.match(
    quality,
    /verification.*(?:distinct|separate).*expected result/is,
  );
  assert.match(quality, /condition.*recipient.*channel/is);
  assert.match(quality, /rollback.*(?:alternative|instead)/is);
  assert.match(quality, /main point first/i);
  assert.match(quality, /descriptive headings/i);
  assert.match(
    quality,
    /code (?:fences|blocks).*(?:exclude|skip)|(?:exclude|skip).*code (?:fences|blocks)/is,
  );
  for (const blockedTerm of [
    "leverage",
    "utilize",
    "game-changing",
    "arguably",
    "showcase",
    "robust",
    "actually",
    "just",
    "delve",
    "synergy",
    "pivotal",
    "spoiler alert",
    "full stop",
  ]) {
    assert.match(blocklist, new RegExp(blockedTerm, "i"));
  }

  const fixtureRoot = join(repoRoot, "test", "fixtures", "runbook");
  const lifecycle = JSON.parse(
    readFileSync(join(fixtureRoot, "lifecycle.json"), "utf8"),
  );
  const artifacts = renderLifecycleArtifacts(fixtureRoot, lifecycle);
  for (const [fixtureId, artifact] of artifacts) {
    assert.doesNotMatch(artifact, /\{[^}\n]+\}|…|\(optional\)/);
    assert.doesNotMatch(artifact, /<!--[\s\S]*?-->/);

    const headings = [...artifact.matchAll(/^#{2,3} .+$/gm)];
    for (const [index, heading] of headings.entries()) {
      const contentStart = heading.index + heading[0].length;
      const headingDepth = heading[0].match(/^#+/)[0].length;
      const nextPeer = headings
        .slice(index + 1)
        .find(
          (candidate) =>
            candidate[0].match(/^#+/)[0].length <= headingDepth,
        );
      const contentEnd = nextPeer?.index ?? artifact.length;
      assert.ok(
        artifact.slice(contentStart, contentEnd).trim().length > 0,
        `${fixtureId} has an empty section: ${heading[0]}`,
      );
    }
  }
});

test("deterministic and manual cases cover refusal, override, creation, update, and validation", () => {
  const evidenceCases = JSON.parse(
    readFileSync(
      join(repoRoot, "test", "fixtures", "runbook", "evidence-gate.json"),
      "utf8",
    ),
  );
  const lifecycleCases = JSON.parse(
    readFileSync(
      join(repoRoot, "test", "fixtures", "runbook", "lifecycle.json"),
      "utf8",
    ),
  );
  const coveredCases = [
    ...evidenceCases.map((fixture) => fixture.id),
    ...lifecycleCases.map((fixture) => fixture.id),
  ];
  assert.deepEqual(coveredCases, [
    "evidence-gate-refusal",
    "human-override",
    "creation",
    "update",
    "validation",
  ]);

  const manualCases = readFileSync(
    join(repoRoot, "eval", "manual", "runbook.md"),
    "utf8",
  );
  for (const caseName of coveredCases) {
    assert.match(manualCases, new RegExp(`^## ${caseName}$`, "m"));
  }
  assert.match(manualCases, /Codex/i);
  assert.match(manualCases, /Claude Code/i);
  assert.match(manualCases, /not a CI gate/i);
  assert.match(manualCases, /incident-notes\.md/);
  assert.match(manualCases, /existing-convention\.md/);
  assert.doesNotMatch(
    manualCases,
    /created\.md.*(?:factual incident notes|incident notes)/is,
  );
});

test("source provenance maps the adapted runbook capability to the pinned Han revision", () => {
  const provenance = readFileSync(
    join(repoRoot, "SOURCE_PROVENANCE.md"),
    "utf8",
  );
  const pinnedRevision = "a90cb0993d774f921ae945ffc58f9eb69df07fdf";

  assert.match(provenance, new RegExp(pinnedRevision));
  for (const adaptedPath of [
    "skills/runbook/SKILL.md",
    "skills/runbook/references/authoring-workflow.md",
    "skills/runbook/references/evidence-gate.md",
    "skills/runbook/references/runbook-template.md",
    "skills/runbook/references/quality-check.md",
    "skills/runbook/references/writing-blocklist.md",
  ]) {
    assert.match(provenance, new RegExp(adaptedPath.replaceAll("/", "\\/")));
  }
  for (const upstreamPath of [
    "han-core/skills/runbook/SKILL.md",
    "han-core/skills/runbook/references/runbook-template.md",
    "han-core/references/evidence-rule.md",
    "han-core/references/yagni-rule.md",
    "han-core/references/readability-rule.md",
    "han-core/references/writing-voice.md",
  ]) {
    assert.match(provenance, new RegExp(upstreamPath.replaceAll("/", "\\/")));
  }
  assert.doesNotMatch(provenance, /does not yet introduce adapted Han content/i);
});
