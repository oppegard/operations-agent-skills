import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(repoRoot, "skills", "infrastructure-readiness");

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

test("focused infrastructure intent selects the specialist without claiming complete readiness", () => {
  const skill = readSkillFile("SKILL.md");
  const boundary = readSkillFile("references/capability-boundary.md");

  assert.match(
    skill,
    /asks specifically for an Infrastructure-readiness perspective/i,
  );
  assert.match(
    skill,
    /not a complete (?:production-)?Readiness result/i,
  );
  assert.match(
    skill,
    /\[Role brief\]\(references\/role-brief\.md\)/,
  );
  assert.match(
    skill,
    /\[Engagement contract\]\(references\/engagement-contract\.md\)/,
  );
  assert.ok(statSync(join(skillRoot, "references", "role-brief.md")).isFile());
  assert.ok(
    statSync(join(skillRoot, "references", "engagement-contract.md")).isFile(),
  );

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

test("the role brief preserves the inquiry-first twelve-protocol review", () => {
  const role = readSkillFile("references/role-brief.md");

  assert.match(role, /generate questions before findings/i);
  assert.match(role, /Answered.*Assumed.*Open/is);
  assert.match(role, /never fabricate/i);
  assert.match(role, /link every finding.*questions/is);

  const protocolHeadings = [
    "Readiness Interrogation and Production Context",
    "DORA / Delivery Performance Sweep",
    "Environment and Parity Audit",
    "Hosting, Runtime, and Cost Fit",
    "Container and Orchestration Audit",
    "Observability Sweep",
    "CI/CD and Progressive Delivery Audit",
    "Feature Flag and Release-Decoupling Audit",
    "Security, Secrets, Compliance, and Supply Chain",
    "Reliability, Scale, and Production-Only Failure Modes",
    "Incident Response Readiness",
    "Recency and Churn Context",
  ];

  for (const [index, heading] of protocolHeadings.entries()) {
    assert.match(
      role,
      new RegExp(`^### Protocol ${index + 1}: ${heading}`, "m"),
    );
  }
  assert.match(role, /execute all twelve protocols/i);

  for (const framework of [
    "DORA",
    "Twelve-Factor",
    "Four Golden Signals",
    "RED",
    "USE",
    "SLO",
    "error budget",
    "AWS Well-Architected",
    "SLSA",
    "SBOM",
    "Sigstore",
    "expand-and-contract",
  ]) {
    assert.match(role, phrasePattern(framework));
  }

  for (const failureMode of [
    "Works on My Machine",
    "Snowflake / Pet Server",
    "Clickops Atop IaC",
    "Latest Tag in Production",
    "Deploy-and-Pray",
    "Schema Change Without Expand/Contract",
    "Secrets In The Repo / Image / Env",
    "PII In The Logs",
    "Alert On Causes, Not Symptoms",
    "Vendor-Coupled Observability",
    "Flag Debt",
    "Kubernetes Resume-Driven Design",
    "Single-Region Forever",
    "Untested Backup",
    "Friday-Afternoon / Pre-Holiday Deploy",
    "Tests Pass = Ready To Ship",
  ]) {
    assert.match(role, phrasePattern(failureMode));
  }
});

test("every release finding requires exact evidence, a principle, and production impact", () => {
  const role = readSkillFile("references/role-brief.md");
  const report = readSkillFile("references/report-format.md");
  const evidenceStandard = role.match(
    /^## Evidence standard$(?<content>[\s\S]*?)^## Inquiry posture$/m,
  );

  assert.ok(evidenceStandard, "role brief must expose an evidence standard");
  assert.match(role, /file_path:line_number/i);
  assert.match(
    role,
    phrasePattern("exact code, manifest, pipeline step, or config line"),
  );
  assert.match(role, /operational principle/i);
  assert.match(role, /production impact/i);
  assert.match(role, /what breaks.*when.*who.*blast radius/is);
  assert.match(
    role,
    /cannot meet this standard.*do not report|not.*operational risk/is,
  );
  assert.match(
    evidenceStandard.groups.content,
    /Design seam.*candidate design section.*exact text/is,
  );
  assert.match(
    evidenceStandard.groups.content,
    /Release\s+seam.*file_path:line_number/is,
  );

  for (const label of [
    "Principle",
    "Location",
    "Evidence",
    "Production impact",
    "Related questions",
    "Severity",
    "Remediation \\(P0",
    "Remediation \\(P1",
    "Remediation \\(P2",
  ]) {
    assert.match(report, new RegExp(`\\*\\*${label}`, "i"));
  }
});

test("native severity and smallest-safe-next-step sequencing stay intact", () => {
  const role = readSkillFile("references/role-brief.md");
  const report = readSkillFile("references/report-format.md");

  for (const severity of [
    "Blocks rollout",
    "Degrades reliability",
    "Operational friction",
    "Polish",
    "YAGNI candidate",
  ]) {
    assert.match(role, new RegExp(severity, "i"));
    assert.match(report, new RegExp(severity, "i"));
  }
  assert.match(role, /Blocks rollout.*top severity/is);
  assert.match(role, /smallest safe next step/i);
  assert.match(role, /P0.*today.*P1.*next sprint.*P2.*next quarter/is);
  assert.match(role, /paved path.*easier\s+than the shortcut/is);
  assert.match(role, /YAGNI/i);
  assert.match(role, /evidence.*needed\s+now/is);
  assert.match(role, /strictly simpler/i);
  assert.match(role, /reopen trigger/i);
});

test("the capability spans operations while deferring source resilience and exploit paths", () => {
  const boundary = readSkillFile("references/capability-boundary.md");
  const role = readSkillFile("references/role-brief.md");
  const protocolTen = role.match(
    /^### Protocol 10:.*$(?<content>[\s\S]*?)^### Protocol 11:/m,
  );

  for (const concern of [
    "infrastructure",
    "delivery",
    "infrastructure as code",
    "observability configuration",
    "operational controls",
    "scale",
    "cost",
    "production fitness",
  ]) {
    assert.match(boundary, phrasePattern(concern));
  }
  assert.match(
    boundary,
    /application-source resilience.*application-resilience/is,
  );
  assert.match(
    boundary,
    /exploit-path\s+security.*security/is,
  );
  assert.ok(protocolTen, "role brief must expose Protocol 10");
  assert.match(protocolTen.groups.content, /operational evidence/i);
  assert.match(
    protocolTen.groups.content,
    /defer.*application-source implementation.*application-resilience/is,
  );
  assert.match(role, phrasePattern("does not write code"));
  assert.match(role, phrasePattern("does not change infrastructure"));
});

test("one role brief accepts design and release engagement contracts", () => {
  const skill = readSkillFile("SKILL.md");
  const engagement = readSkillFile("references/engagement-contract.md");

  assert.match(skill, /same Role brief/i);
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
        "infrastructure-readiness",
        "contracts.json",
      ),
      "utf8",
    ),
  );
  const manualCases = readFileSync(
    join(repoRoot, "eval", "manual", "infrastructure-readiness.md"),
    "utf8",
  );

  const cases = Object.fromEntries(
    fixtures.map((fixture) => [fixture.id, fixture]),
  );
  assert.equal(cases["direct-selection"].expected.selectedCapability, "infrastructure-readiness");
  assert.equal(cases["broad-readiness"].expected.selectedCapability, "production-readiness-review");
  assert.equal(cases["application-source-boundary"].expected.deferTo, "application-resilience");
  assert.equal(cases["exploit-path-boundary"].expected.deferTo, "security review");
  assert.deepEqual(cases["insufficient-evidence"].expected.findings, []);
  assert.equal(cases["release-blocker"].expected.severity, "Blocks rollout");
  assert.deepEqual(cases["release-blocker"].expected.requiredFindingFields, [
    "exact artifact evidence",
    "operational principle or named failure mode",
    "concrete production impact",
  ]);
  assert.equal(cases["design-engagement"].engagement.seam, "Design");
  assert.equal(cases["release-engagement"].engagement.seam, "Release");

  for (const fixture of fixtures) {
    assert.match(manualCases, new RegExp(`^## ${fixture.id}$`, "m"));
  }
  assert.match(manualCases, /Codex/i);
  assert.match(manualCases, /Claude Code/i);
  assert.match(manualCases, /not a CI gate/i);
});

test("source provenance maps the infrastructure role and supporting rules", () => {
  const provenance = readFileSync(
    join(repoRoot, "SOURCE_PROVENANCE.md"),
    "utf8",
  );

  for (const adaptedPath of [
    "skills/infrastructure-readiness/SKILL.md",
    "skills/infrastructure-readiness/references/role-brief.md",
    "skills/infrastructure-readiness/references/report-format.md",
  ]) {
    assert.match(provenance, new RegExp(adaptedPath.replaceAll("/", "\\/")));
  }
  for (const upstreamPath of [
    "han-core/agents/devops-engineer.md",
    "han-core/references/evidence-rule.md",
    "han-core/references/yagni-rule.md",
  ]) {
    assert.match(provenance, new RegExp(upstreamPath.replaceAll("/", "\\/")));
  }
});
