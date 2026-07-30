import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(repoRoot, "skills", "operational-design-review");

function readSkillFile(relativePath) {
  return readFileSync(join(skillRoot, relativePath), "utf8");
}

test("broad design intent selects the orchestrator while focused intent stays specialist", () => {
  const skill = readSkillFile("SKILL.md");
  const boundary = readSkillFile("references/capability-boundary.md");

  assert.match(
    skill,
    /broad.*design[- ]readiness.*operational-design-review/is,
  );
  assert.match(
    boundary,
    /focused Infrastructure-readiness.*infrastructure-readiness/is,
  );
  assert.match(
    boundary,
    /focused Application-resilience.*application-resilience/is,
  );
  assert.match(boundary, /do not add the other perspective/i);
});

test("the Applicability gate selects operational signals and records explicit skips", () => {
  const skill = readSkillFile("SKILL.md");
  const gate = readSkillFile("references/applicability-gate.md");
  const fixtures = JSON.parse(
    readFileSync(
      join(
        repoRoot,
        "test",
        "fixtures",
        "operational-design-review",
        "applicability.json",
      ),
      "utf8",
    ),
  );
  const cases = Object.fromEntries(
    fixtures.map((fixture) => [fixture.id, fixture]),
  );

  assert.ok(
    statSync(join(skillRoot, "references", "applicability-gate.md")).isFile(),
  );
  assert.match(
    skill,
    /\[Applicability gate\]\(references\/applicability-gate\.md\)/,
  );

  for (const signal of [
    "containers",
    "deployment manifests",
    "infrastructure as code",
    "CI/CD",
    "rollout behavior",
    "observability",
    "alert configuration",
    "feature flags",
    "operational controls",
  ]) {
    assert.match(gate, new RegExp(signal, "i"));
  }

  for (const signal of [
    "remote calls",
    "retries",
    "timeouts",
    "cancellation",
    "degradation",
    "queues",
    "buffers",
    "backpressure",
    "concurrency",
    "error paths",
    "fan-out",
    "partial failure",
    "idempotency",
    "repeated delivery",
    "co-deployed schema migrations",
    "new production runtime path",
  ]) {
    assert.match(gate, new RegExp(signal, "i"));
  }

  assert.match(
    gate,
    /documentation.*generated files.*pure configuration.*infrastructure.*pipelines.*observability-platform artifacts/is,
  );
  assert.match(gate, /record an explicit skip reason/i);
  assert.match(gate, /neither perspective.*NOT_APPLICABLE/is);

  assert.deepEqual(cases["infrastructure-only"].expected.executed, [
    "Infrastructure readiness",
  ]);
  assert.deepEqual(cases["application-only"].expected.executed, [
    "Application resilience",
  ]);
  assert.deepEqual(cases["both-perspectives"].expected.executed, [
    "Infrastructure readiness",
    "Application resilience",
  ]);
  assert.equal(cases["documentation-only"].expected.status, "NOT_APPLICABLE");
  assert.equal(cases["generated-source"].expected.status, "NOT_APPLICABLE");
  assert.equal(cases["pure-config"].expected.status, "NOT_APPLICABLE");
  assert.equal(cases["no-signal"].expected.status, "NOT_APPLICABLE");

  for (const fixture of fixtures) {
    assert.ok(
      Array.isArray(fixture.expected.skipped) &&
        fixture.expected.skipped.every(
          (entry) => entry.perspective && entry.reason,
        ),
      `${fixture.id} must record every skipped perspective with a reason`,
    );
  }
});

test("applicable perspectives stay independent across concurrent and sequential hosts", () => {
  const skill = readSkillFile("SKILL.md");
  const orchestration = readSkillFile("references/orchestration.md");

  assert.match(
    skill,
    /\[Orchestration\]\(references\/orchestration\.md\)/,
  );
  assert.match(
    orchestration,
    /same candidate design.*same Design-seam Engagement contract/is,
  );
  assert.match(orchestration, /concurrently.*independent subagents/is);
  assert.match(orchestration, /sequential fallback/i);
  assert.match(
    orchestration,
    /do not share.*intermediate findings.*other perspective/is,
  );
  assert.match(orchestration, /synthesize.*only after.*reports/is);
});

test("missing specialists stop with the exact whole-pack remedy and no fallback copy", () => {
  const orchestration = readSkillFile("references/orchestration.md");
  const fixtures = JSON.parse(
    readFileSync(
      join(
        repoRoot,
        "test",
        "fixtures",
        "operational-design-review",
        "orchestration.json",
      ),
      "utf8",
    ),
  );
  const cases = Object.fromEntries(
    fixtures.map((fixture) => [fixture.id, fixture]),
  );
  const remedy =
    "npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent codex";

  assert.match(orchestration, /verify.*selected.*skill.*available/is);
  assert.match(orchestration, /stop.*before.*specialist/is);
  assert.match(orchestration, new RegExp(remedy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(cases["missing-infrastructure"].expected.remedy, remedy);
  assert.equal(cases["missing-application"].expected.remedy, remedy);
  assert.equal(cases["missing-both"].expected.remedy, remedy);
  assert.doesNotMatch(orchestration, /^### Protocol \d+:/m);
  assert.doesNotMatch(orchestration, /Cascading Failure|Deploy-and-Pray/);
  assert.match(orchestration, /do not embed.*fallback/i);
});

test("the Design Engagement contract requires cited design-state reports", () => {
  const skill = readSkillFile("SKILL.md");
  const engagement = readSkillFile("references/engagement-contract.md");

  assert.match(
    skill,
    /\[Engagement contract\]\(references\/engagement-contract\.md\)/,
  );
  assert.match(engagement, /cite.*exact.*candidate design section/is);

  for (const designState of [
    "decisions",
    "assumptions",
    "constraints",
    "open questions",
  ]) {
    assert.match(engagement, new RegExp(`report.*${designState}`, "is"));
  }
  assert.match(engagement, /citation.*every reported item/is);
  assert.match(engagement, /missing.*citation.*not.*blocker/is);
});

test("only unresolved proposal-attributed production-safety decisions block", () => {
  const engagement = readSkillFile("references/engagement-contract.md");
  const fixtures = JSON.parse(
    readFileSync(
      join(
        repoRoot,
        "test",
        "fixtures",
        "operational-design-review",
        "design-results.json",
      ),
      "utf8",
    ),
  );
  const cases = Object.fromEntries(
    fixtures.map((fixture) => [fixture.id, fixture]),
  );

  assert.match(engagement, /unresolved/i);
  assert.match(engagement, /proposal-attributed/i);
  assert.match(
    engagement,
    /proposal requires.*worsens.*newly depends on/is,
  );
  assert.match(engagement, /necessary.*safe production behavior/is);
  assert.match(
    engagement,
    /pre-existing operational debt.*advisory/is,
  );

  assert.equal(cases["valid-design-blocker"].expected.category, "Blocker");
  assert.equal(cases["pre-existing-debt"].expected.category, "Advisory");
  assert.equal(cases["resolved-decision"].expected.category, "Advisory");
  assert.equal(cases["not-production-safety"].expected.category, "Advisory");
  assert.equal(cases["unattributed-question"].expected.category, "Advisory");
});

test("synthesis preserves disagreement and resolves by evidence rather than voting", () => {
  const readiness = readSkillFile("references/readiness-result.md");

  assert.match(readiness, /deduplicate.*decision.*production outcome/is);
  assert.match(readiness, /evidence.*not.*votes|not.*majority/is);
  assert.match(
    readiness,
    /preserve.*material disagreement.*perspective.*citation/is,
  );
  assert.match(
    readiness,
    /unresolved.*disagreement.*production safety.*Blocker/is,
  );
  assert.match(
    readiness,
    /otherwise.*advisory tension/is,
  );
});

test("the stable Design Readiness result is complete and rerun-ready", () => {
  const readiness = readSkillFile("references/readiness-result.md");
  const fixtures = JSON.parse(
    readFileSync(
      join(
        repoRoot,
        "test",
        "fixtures",
        "operational-design-review",
        "readiness-results.json",
      ),
      "utf8",
    ),
  );
  const cases = Object.fromEntries(
    fixtures.map((fixture) => [fixture.id, fixture]),
  );

  for (const heading of [
    "Status",
    "Perspectives",
    "Executed",
    "Skipped",
    "Blockers",
    "Advisories",
    "Ambient risks",
    "Next action",
  ]) {
    assert.match(readiness, new RegExp(`^#{2,3} ${heading}$`, "m"));
  }

  for (const status of [
    "NOT_APPLICABLE",
    "READY",
    "READY_WITH_ADVISORIES",
    "BLOCKED",
  ]) {
    assert.match(readiness, new RegExp(`\\b${status}\\b`));
  }

  assert.equal(cases["not-applicable"].expected.status, "NOT_APPLICABLE");
  assert.equal(cases["ready"].expected.status, "READY");
  assert.equal(
    cases["advisory-only"].expected.status,
    "READY_WITH_ADVISORIES",
  );
  assert.equal(cases["valid-blocker"].expected.status, "BLOCKED");
  assert.equal(
    cases["advisory-disagreement"].expected.category,
    "Advisory tension",
  );
  assert.equal(
    cases["critical-disagreement"].expected.category,
    "Blocker",
  );
  assert.match(
    readiness,
    /BLOCKED.*one decision at a time.*update.*candidate design.*rerun/is,
  );
});

test("deterministic and manual fixtures cover the Design gate acceptance corpus", () => {
  const fixtureNames = [
    "applicability.json",
    "orchestration.json",
    "design-results.json",
    "readiness-results.json",
  ];
  const fixtures = fixtureNames.flatMap((fixtureName) =>
    JSON.parse(
      readFileSync(
        join(
          repoRoot,
          "test",
          "fixtures",
          "operational-design-review",
          fixtureName,
        ),
        "utf8",
      ),
    ),
  );
  const manualCases = readFileSync(
    join(repoRoot, "eval", "manual", "operational-design-review.md"),
    "utf8",
  );

  for (const fixture of fixtures) {
    assert.match(manualCases, new RegExp(`^## ${fixture.id}$`, "m"));
  }
  assert.match(manualCases, /Codex/i);
  assert.match(manualCases, /Claude Code/i);
  assert.match(manualCases, /not a CI gate/i);
});

test("source provenance records the original Design orchestrator work", () => {
  const provenance = readFileSync(
    join(repoRoot, "SOURCE_PROVENANCE.md"),
    "utf8",
  );

  for (const originalPath of [
    "skills/operational-design-review/",
    "test/operational-design-review.test.mjs",
    "test/fixtures/operational-design-review/",
    "eval/manual/operational-design-review.md",
  ]) {
    assert.match(
      provenance,
      new RegExp(originalPath.replaceAll("/", "\\/")),
    );
  }
});
