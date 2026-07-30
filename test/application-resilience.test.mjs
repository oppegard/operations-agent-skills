import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(repoRoot, "skills", "application-resilience");

function readSkillFile(relativePath) {
  return readFileSync(join(skillRoot, relativePath), "utf8");
}

function phrasePattern(phrase) {
  return new RegExp(
    phrase
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+"),
    "i",
  );
}

test("focused application intent selects the specialist without claiming complete readiness", () => {
  const skill = readSkillFile("SKILL.md");
  const boundary = readSkillFile("references/capability-boundary.md");

  assert.match(
    skill,
    /asks specifically for an Application-resilience perspective/i,
  );
  assert.match(skill, /not a complete (?:production-)?Readiness result/i);
  assert.match(skill, /\[Role brief\]\(references\/role-brief\.md\)/);
  assert.match(
    skill,
    /\[Engagement contract\]\(references\/engagement-contract\.md\)/,
  );
  assert.match(skill, /\[Report format\]\(references\/report-format\.md\)/);

  for (const reference of [
    "role-brief.md",
    "engagement-contract.md",
    "report-format.md",
  ]) {
    assert.ok(statSync(join(skillRoot, "references", reference)).isFile());
  }

  assert.match(boundary, /direct specialist intent/i);
  assert.match(
    boundary,
    /broad.*production[- ]readiness.*production-readiness-review/is,
  );
  assert.match(
    boundary,
    /broad.*design.*operational-design-review/is,
  );
});

test("the role brief preserves inquiry discipline and all eight protocols", () => {
  const role = readSkillFile("references/role-brief.md");

  assert.match(role, /generate questions before findings/i);
  assert.match(role, /Answered.*Assumed.*Open/is);
  assert.match(role, /never fabricate/i);
  assert.match(role, /link every finding.*questions/is);

  const protocolHeadings = [
    "On-Call Readiness Interrogation",
    "Outbound Call Sweep",
    "Error-Handling and Silent-Failure Sweep",
    "Queue, Buffer, and Backpressure Sweep",
    "Concurrency and Async-Context Sweep",
    "Observability-at-the-Source Sweep",
    "Data Integrity, Idempotency, and Migration Safety Sweep",
    "Recency and Pattern-Source Context",
  ];

  for (const [index, heading] of protocolHeadings.entries()) {
    assert.match(
      role,
      new RegExp(`^### Protocol ${index + 1}: ${heading}`, "m"),
    );
  }
  assert.match(role, /execute all eight protocols/i);

  for (const failureMode of [
    "Cascading Failure",
    "Retry Storm",
    "Thundering Herd",
    "Metastable Failure",
    "Gray Failure",
    "Connection Pool Exhaustion",
    "Poison Pill",
    "Queue Runaway",
    "GC Death Spiral",
    "Data Corruption",
    "Eventual-Consistency Violation",
    "OOM-kill",
    "Thread Pool Starvation",
    "Certificate Expiry",
    "SLA Inversion",
    "Fan-Out Amplification",
  ]) {
    assert.match(role, phrasePattern(failureMode));
  }

  for (const toneCheck of [
    "Sugarcoated criticism",
    "Thin blame dressed in systems language",
    "Tourist citation",
    "Bibliographic empathy",
  ]) {
    assert.match(role, phrasePattern(toneCheck));
  }
});

test("every release finding requires exact source evidence and production impact", () => {
  const role = readSkillFile("references/role-brief.md");
  const engagement = readSkillFile("references/engagement-contract.md");
  const report = readSkillFile("references/report-format.md");
  const evidenceStandard = role.match(
    /^## Evidence standard$(?<content>[\s\S]*?)^## Inquiry posture$/m,
  );

  assert.ok(evidenceStandard, "role brief must expose an evidence standard");
  assert.match(role, /file_path:line_number/i);
  assert.match(role, /exact line or contiguous span/i);
  assert.match(role, /triggering conditions/i);
  assert.match(role, /which users or callers are affected first/i);
  assert.match(role, phrasePattern("blast radius across the call graph"));
  assert.match(
    role,
    /cannot meet this standard.*do not report|do not report.*risk/is,
  );
  assert.match(
    evidenceStandard.groups.content,
    /Design seam.*candidate design section.*exact text/is,
  );
  assert.match(
    evidenceStandard.groups.content,
    /Release\s+seam.*file_path:line_number.*production application source/is,
  );
  assert.match(
    engagement,
    /Every finding.*exact application source.*file_path:line_number/is,
  );

  for (const label of [
    "Anti-pattern",
    "Production failure mode",
    "Operability principle",
    "Location",
    "Evidence",
    "Triggering conditions",
    "Affected users",
    "Blast radius",
    "Related questions",
    "Severity",
    "Remediation \\(today",
    "Remediation \\(next iteration",
    "Remediation \\(next quarter",
  ]) {
    assert.match(report, new RegExp(`\\*\\*${label}`, "i"));
  }
});

test("native severity and smallest-safe-remediation behavior stay intact", () => {
  const role = readSkillFile("references/role-brief.md");
  const report = readSkillFile("references/report-format.md");

  for (const severity of [
    "Wakes someone up",
    "Degrades reliability",
    "On-call friction",
    "Polish",
    "YAGNI candidate",
  ]) {
    assert.match(role, new RegExp(severity, "i"));
    assert.match(report, new RegExp(severity, "i"));
  }
  assert.match(role, /Wakes someone up.*top severity/is);
  assert.match(role, /smallest safe step.*ship today/is);
  assert.match(role, phrasePattern("today - smallest safe step"));
  assert.match(role, phrasePattern("next iteration"));
  assert.match(role, phrasePattern("next quarter - paved path"));
  assert.match(role, /do not calibrate severity.*anti-pattern name alone/is);
  assert.match(role, /triggering conditions.*affected users.*blast radius/is);
  assert.match(role, phrasePattern("paved path must be easier than the shortcut"));
  assert.match(role, /strictly simpler/i);
  assert.match(role, /reopen trigger/i);
});

test("the capability covers source resilience and enforces hard artifact boundaries", () => {
  const boundary = readSkillFile("references/capability-boundary.md");
  const role = readSkillFile("references/role-brief.md");

  for (const concern of [
    "remote calls",
    "retries",
    "timeouts",
    "cancellation",
    "degradation",
    "queues",
    "buffers",
    "backpressure",
    "concurrency",
    "partial failure",
    "repeated delivery",
    "migrations",
    "new runtime paths",
  ]) {
    assert.match(boundary, phrasePattern(concern));
  }

  for (const excluded of [
    "documentation",
    "generated files",
    "pure configuration",
    "infrastructure as code",
    "deployment manifests",
    "pipelines",
    "observability-platform artifacts",
  ]) {
    assert.match(boundary, phrasePattern(excluded));
  }

  assert.match(
    boundary,
    /Exclude.*documentation.*generated files.*pure configuration.*infrastructure.*pipelines.*observability-platform artifacts/is,
  );
  assert.match(boundary, /Defer those artifacts to `infrastructure-readiness`/i);
  assert.match(boundary, /do not become a general code-quality or test review/i);
  assert.match(
    role,
    phrasePattern("does not modify code, infrastructure, pipelines"),
  );
  assert.match(
    role,
    phrasePattern(
      "Defer schema, index, and query design to the appropriate data specialist",
    ),
  );
});

test("one role brief accepts direct, design, and release engagement contracts", () => {
  const skill = readSkillFile("SKILL.md");
  const engagement = readSkillFile("references/engagement-contract.md");

  assert.match(skill, /same Role brief/i);
  assert.match(engagement, /^## Direct specialist$/m);
  assert.match(engagement, /^## Design seam$/m);
  assert.match(engagement, /^## Release seam$/m);
  assert.match(engagement, /candidate design section/i);
  assert.match(engagement, /decision.*assumption.*constraint.*open question/is);
  assert.match(engagement, /stable baseline/i);
  assert.match(engagement, /Change-attributed/i);
  assert.match(engagement, /Ambient risk/i);
  assert.match(engagement, /do not duplicate.*Role brief/is);
});

test("deterministic and manual fixtures cover routing, boundaries, evidence, and severity", () => {
  const fixtures = JSON.parse(
    readFileSync(
      join(
        repoRoot,
        "test",
        "fixtures",
        "application-resilience",
        "contracts.json",
      ),
      "utf8",
    ),
  );
  const manualCases = readFileSync(
    join(repoRoot, "eval", "manual", "application-resilience.md"),
    "utf8",
  );
  const cases = Object.fromEntries(
    fixtures.map((fixture) => [fixture.id, fixture]),
  );

  assert.equal(
    cases["direct-selection"].expected.selectedCapability,
    "application-resilience",
  );
  assert.equal(
    cases["broad-readiness"].expected.selectedCapability,
    "production-readiness-review",
  );
  assert.equal(
    cases["infrastructure-boundary"].expected.deferTo,
    "infrastructure-readiness",
  );
  assert.deepEqual(cases["insufficient-evidence"].expected.findings, []);
  assert.equal(
    cases["release-page-risk"].expected.severity,
    "Wakes someone up",
  );
  assert.deepEqual(
    cases["release-page-risk"].expected.requiredFindingFields,
    [
      "exact application-source evidence",
      "named anti-pattern and production failure mode",
      "triggering conditions, affected users, and blast radius",
    ],
  );
  assert.equal(
    cases["severity-calibration"].expected.maximumSeverity,
    "Open question",
  );
  assert.equal(cases["design-engagement"].engagement.seam, "Design");
  assert.equal(cases["release-engagement"].engagement.seam, "Release");

  for (const fixture of fixtures) {
    assert.match(manualCases, new RegExp(`^## ${fixture.id}$`, "m"));
  }
  assert.match(manualCases, /Codex/i);
  assert.match(manualCases, /Claude Code/i);
  assert.match(manualCases, /not a CI gate/i);
});

test("source provenance maps the application role and supporting rules", () => {
  const provenance = readFileSync(
    join(repoRoot, "SOURCE_PROVENANCE.md"),
    "utf8",
  );

  for (const adaptedPath of [
    "skills/application-resilience/SKILL.md",
    "skills/application-resilience/references/role-brief.md",
    "skills/application-resilience/references/report-format.md",
  ]) {
    assert.match(provenance, new RegExp(adaptedPath.replaceAll("/", "\\/")));
  }
  for (const upstreamPath of [
    "han-core/agents/on-call-engineer.md",
    "han-core/references/evidence-rule.md",
    "han-core/references/yagni-rule.md",
  ]) {
    assert.match(provenance, new RegExp(upstreamPath.replaceAll("/", "\\/")));
  }
});
