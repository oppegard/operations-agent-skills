import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(repoRoot, "skills", "production-readiness-review");

function readSkillFile(relativePath) {
  return readFileSync(join(skillRoot, relativePath), "utf8");
}

function readContractFixtures() {
  return JSON.parse(
    readFileSync(
      join(
        repoRoot,
        "test",
        "fixtures",
        "production-readiness-review",
        "contracts.json",
      ),
      "utf8",
    ),
  );
}

function phrasePattern(phrase) {
  return new RegExp(
    phrase
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+"),
    "i",
  );
}

test("broad release intent selects the orchestrator with a stable baseline", () => {
  const skill = readSkillFile("SKILL.md");
  const boundary = readSkillFile("references/capability-boundary.md");

  assert.match(
    skill,
    /broad.*(?:release|production)[- ]readiness.*production-readiness-review/is,
  );
  assert.match(skill, /focused.*Infrastructure-readiness/is);
  assert.match(skill, /focused.*Application-resilience/is);
  assert.match(
    skill,
    /functionally reviewed fixed point.*change diff.*specification/is,
  );
  assert.match(
    skill,
    /same (?:stable )?baseline.*(?:every|each).*perspective/is,
  );
  assert.match(
    boundary,
    /fixed point.*specification.*missing.*request.*do not.*`BLOCKED`/is,
  );
});

test("the applicability gate selects only operationally relevant perspectives", () => {
  const boundary = readSkillFile("references/capability-boundary.md");

  for (const signal of [
    "containers",
    "deployment manifests",
    "infrastructure as code",
    "CI/CD",
    "rollout",
    "observability",
    "alert",
    "feature flags",
    "operational controls",
  ]) {
    assert.match(boundary, phrasePattern(signal));
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
    assert.match(boundary, phrasePattern(signal));
  }

  assert.match(
    boundary,
    /documentation.*generated files.*pure configuration.*infrastructure.*pipelines.*observability-platform artifacts.*do not\s+activate Application resilience/is,
  );
  assert.match(boundary, /record.*skip reason.*perspective/is);
  assert.match(boundary, /neither.*`NOT_APPLICABLE`/is);
});

test("applicable perspectives remain independent and retain specialist contracts", () => {
  const skill = readSkillFile("SKILL.md");

  assert.match(
    skill,
    /run.*concurrently.*subagents|subagents.*concurrently/is,
  );
  assert.match(
    skill,
    /sequential.*withhold\s+intermediate\s+findings/is,
  );
  assert.match(
    skill,
    /Infrastructure-readiness.*Release-seam\s+Engagement contract/is,
  );
  assert.match(
    skill,
    /Application-resilience.*Release-seam\s+Engagement contract/is,
  );
  assert.match(skill, /do not embed.*fallback.*specialist behavior/is);
  assert.match(
    skill,
    /npx skills add.*operations-agent-skills.*--skill ['"]?\*['"]?/i,
  );
});

test("only validated attributable top-severity findings become blockers", () => {
  const skill = readSkillFile("SKILL.md");

  assert.match(
    skill,
    phrasePattern("introduced, modified, or newly relied-upon behavior"),
  );
  assert.match(
    skill,
    /surrounding.*context.*not.*(?:source|basis).*blocker/is,
  );
  assert.match(
    skill,
    /`Blocks rollout`.*Infrastructure-readiness.*`Wakes someone up`.*Application-resilience/is,
  );
  assert.match(
    skill,
    /validate.*exact evidence.*Change attribution.*before.*promot/is,
  );
  assert.match(
    skill,
    /pre-existing.*`Ambient risk`.*cannot block/is,
  );
  assert.match(skill, /lower severit.*advis/is);
});

test("questions and disagreements block only for attributable critical risk", () => {
  const skill = readSkillFile("SKILL.md");

  assert.match(skill, /missing context alone.*does not block/is);
  assert.match(
    skill,
    /open question.*concrete.*Change-attributed.*top-severity/is,
  );
  assert.match(skill, /synthesi[sz]e.*evidence.*not.*vot/is);
  assert.match(skill, /material.*disagreement.*attribut/is);
  assert.match(
    skill,
    /unresolved.*disagreement.*block.*attributable critical\s+production/is,
  );
  assert.match(skill, /otherwise.*advisory tension/is);
});

test("the stable result controls commit and rerun behavior", () => {
  const skill = readSkillFile("SKILL.md");
  const report = readSkillFile("references/report-format.md");

  for (const status of [
    "NOT_APPLICABLE",
    "READY",
    "READY_WITH_ADVISORIES",
    "BLOCKED",
  ]) {
    assert.match(report, new RegExp(`\\b${status}\\b`));
  }
  for (const heading of [
    "Status",
    "Perspectives",
    "Blockers",
    "Advisories",
    "Ambient risks",
    "Next action",
  ]) {
    assert.match(report, new RegExp(`^## ${heading}$`, "m"));
  }

  assert.match(skill, /`BLOCKED`.*agent-controlled commit or merge/is);
  assert.match(
    skill,
    /remediation or explicit human Risk acceptance/is,
  );
  assert.match(skill, /agent.*(?:cannot|must not).*grant.*Risk acceptance/is);
  assert.match(
    skill,
    /(?:operationally relevant remediation|remediation changes operationally relevant).*functional.*operational.*new baseline/is,
  );
  assert.match(skill, /rerun.*new fixed point.*specification/is);
});

test("deterministic fixtures cover release routing and synthesis", () => {
  const fixtures = readContractFixtures();
  const cases = Object.fromEntries(
    fixtures.map((fixture) => [fixture.id, fixture]),
  );

  assert.equal(cases["broad-selection"].expected.selectedCapability, "production-readiness-review");
  assert.equal(cases["focused-infrastructure"].expected.selectedCapability, "infrastructure-readiness");
  assert.equal(cases["focused-application"].expected.selectedCapability, "application-resilience");
  assert.deepEqual(cases["missing-baseline"].expected.requiredInputs, [
    "functionally reviewed fixed point",
    "change diff",
    "specification",
  ]);
  assert.deepEqual(cases["dual-perspective"].expected.executedPerspectives, [
    "infrastructure-readiness",
    "application-resilience",
  ]);
  assert.equal(cases["dual-perspective"].expected.independent, true);
  assert.equal(cases["not-applicable"].expected.status, "NOT_APPLICABLE");
  assert.equal(cases["ready"].expected.status, "READY");
  assert.equal(
    cases["advisory"].expected.status,
    "READY_WITH_ADVISORIES",
  );
  assert.equal(cases["infrastructure-blocker"].candidate.severity, "Blocks rollout");
  assert.equal(cases["application-blocker"].candidate.severity, "Wakes someone up");
  assert.equal(cases["ambient-risk"].expected.promotedToBlocker, false);
  assert.equal(cases["open-question"].expected.status, "READY_WITH_ADVISORIES");
  assert.equal(cases["critical-open-question"].expected.status, "BLOCKED");
  assert.equal(cases["advisory-disagreement"].expected.status, "READY_WITH_ADVISORIES");
  assert.equal(cases["critical-disagreement"].expected.status, "BLOCKED");
  assert.equal(cases["agent-risk-acceptance"].expected.accepted, false);
  assert.equal(cases["human-risk-acceptance"].expected.accepted, true);
  assert.equal(cases["remediation-rerun"].expected.newBaselineRequired, true);
});

test("manual release cases mirror every deterministic fixture", () => {
  const fixtures = readContractFixtures();
  const manualCases = readFileSync(
    join(repoRoot, "eval", "manual", "production-readiness-review.md"),
    "utf8",
  );

  assert.ok(
    statSync(
      join(skillRoot, "references", "capability-boundary.md"),
    ).isFile(),
  );
  assert.ok(
    statSync(join(skillRoot, "references", "report-format.md")).isFile(),
  );
  for (const fixture of fixtures) {
    assert.match(manualCases, new RegExp(`^## ${fixture.id}$`, "m"));
  }
  assert.match(manualCases, /Codex/i);
  assert.match(manualCases, /Claude Code/i);
  assert.match(manualCases, /not a CI gate/i);
});
