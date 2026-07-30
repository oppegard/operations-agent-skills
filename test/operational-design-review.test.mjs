import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(repoRoot, "skills", "operational-design-review");
const fixturesRoot = join(
  repoRoot,
  "test",
  "fixtures",
  "operational-design-review",
);

function readSkillFile(relativePath) {
  return readFileSync(join(skillRoot, relativePath), "utf8");
}

function readFixtures(fixtureName) {
  return JSON.parse(readFileSync(join(fixturesRoot, fixtureName), "utf8"));
}

function fixtureCases(fixtureName) {
  return Object.fromEntries(
    readFixtures(fixtureName).map((fixture) => [fixture.id, fixture]),
  );
}

const controlContract = JSON.parse(
  readSkillFile("references/control-contract.json"),
);
const infrastructureContract =
  controlContract.applicability.infrastructure;
const applicationContract = controlContract.applicability.application;
const infrastructureSignals = new Set(infrastructureContract.signals);
const applicationSignals = new Set(applicationContract.sourceSignals);
const independentApplicationSignals = new Set(
  applicationContract.independentSignals,
);
const applicationExclusions = new Set(
  applicationContract.excludedArtifacts,
);
const proposalAttributions = new Set(
  controlContract.designBlocker.proposalAttributions,
);
const unresolvedDesignStates = new Set(
  controlContract.designBlocker.unresolvedStates,
);

function routeIntent({ intent }) {
  return {
    selectedCapability: controlContract.routing[intent],
  };
}

function applyApplicabilityGate({ artifactTypes, operationalSignals }) {
  const excludedApplicationArtifact = artifactTypes.some((artifactType) =>
    applicationExclusions.has(artifactType),
  );
  const infrastructureApplies = operationalSignals.some((signal) =>
    infrastructureSignals.has(signal),
  );
  const applicationApplies =
    !excludedApplicationArtifact &&
    (operationalSignals.some((signal) =>
      independentApplicationSignals.has(signal),
    ) ||
      (artifactTypes.includes(applicationContract.sourceArtifact) &&
        operationalSignals.some((signal) => applicationSignals.has(signal))));
  const executed = [];
  const skipped = [];

  if (infrastructureApplies) {
    executed.push(infrastructureContract.perspective);
  } else {
    skipped.push({
      perspective: infrastructureContract.perspective,
      reason: infrastructureContract.skipReason,
    });
  }

  if (applicationApplies) {
    executed.push(applicationContract.perspective);
  } else {
    skipped.push({
      perspective: applicationContract.perspective,
      reason: excludedApplicationArtifact
        ? applicationContract.boundarySkipReason
        : applicationContract.noSignalSkipReason,
    });
  }

  return {
    ...(executed.length === 0
      ? { status: controlContract.applicability.notApplicableStatus }
      : {}),
    executed,
    skipped,
  };
}

function classifyDesignCandidate(candidate) {
  const blockerContract = controlContract.designBlocker;
  const isUnresolvedDecision = unresolvedDesignStates.has(
    candidate[blockerContract.stateField],
  );
  const isProposalAttributed = proposalAttributions.has(
    candidate[blockerContract.proposalAttributionField],
  );

  return {
    category:
      candidate[blockerContract.citationField] &&
      isUnresolvedDecision &&
      isProposalAttributed &&
      candidate[blockerContract.safeProductionField]
        ? blockerContract.blockingCategory
        : blockerContract.advisoryCategory,
  };
}

function deriveOrchestration(fixture) {
  if (fixture.availableSkills) {
    const requiredSkills = Object.fromEntries(
      [infrastructureContract, applicationContract].map((contract) => [
        contract.perspective,
        contract.skill,
      ]),
    );
    const missingSkills = fixture.selectedPerspectives
      .map((perspective) => requiredSkills[perspective])
      .filter((skillName) => !fixture.availableSkills.includes(skillName));

    return {
      outcome: controlContract.orchestration.stoppedOutcome,
      missingSkills,
      remedy: controlContract.orchestration.wholePackRemedies.codex,
    };
  }

  return {
    execution: fixture.hostCapabilities.includes(
      controlContract.orchestration.concurrentCapability,
    )
      ? controlContract.orchestration.concurrentExecution
      : controlContract.orchestration.fallbackExecution,
    sharedIntermediateFindings: false,
    inputIdentity: controlContract.orchestration.inputIdentity,
  };
}

function deriveReadinessResult(fixture) {
  const { nextActions, statuses, disagreementCategories } =
    controlContract.readiness;

  if (fixture.reports.length === 0) {
    return {
      status: statuses.notApplicable,
      nextAction: nextActions[statuses.notApplicable],
    };
  }

  const hasReportedBlocker = fixture.reports.some(
    (report) => report.blockers?.length > 0,
  );
  const hasReportedAdvisory = fixture.reports.some(
    (report) => report.advisories?.length > 0,
  );
  const criticalDisagreement =
    fixture.disagreement?.unresolved &&
    fixture.disagreement.criticalProductionSafety &&
    proposalAttributions.has(fixture.disagreement.proposalAttribution);

  if (hasReportedBlocker || criticalDisagreement) {
    return {
      status: statuses.blocked,
      nextAction: nextActions[statuses.blocked],
      ...(fixture.disagreement
        ? {
            category: disagreementCategories.critical,
            preserveAttribution: true,
          }
        : {}),
    };
  }

  if (hasReportedAdvisory || fixture.disagreement?.unresolved) {
    return {
      status: statuses.advisory,
      nextAction: nextActions[statuses.advisory],
      ...(fixture.disagreement
        ? {
            category: disagreementCategories.nonCritical,
            preserveAttribution: true,
          }
        : {}),
    };
  }

  return {
    status: statuses.ready,
    nextAction: nextActions[statuses.ready],
  };
}

test("the normative public control contract drives deterministic decisions", () => {
  const skill = readSkillFile("SKILL.md");
  const gate = readSkillFile("references/applicability-gate.md");
  const orchestration = readSkillFile("references/orchestration.md");
  const engagement = readSkillFile("references/engagement-contract.md");
  const readiness = readSkillFile("references/readiness-result.md");

  assert.ok(
    statSync(join(skillRoot, "references", "control-contract.json")).isFile(),
  );
  assert.equal(controlContract.schemaVersion, 1);
  assert.match(
    skill,
    /\[Control contract\]\(references\/control-contract\.json\).*normative/is,
  );
  assert.match(skill, /must not redefine a conflicting control value/i);

  for (const signal of [
    ...infrastructureContract.signals,
    ...applicationContract.sourceSignals,
    ...applicationContract.independentSignals,
    ...applicationContract.excludedArtifacts,
  ]) {
    assert.match(gate, new RegExp(signal, "i"));
  }
  assert.match(gate, new RegExp(infrastructureContract.skipReason, "i"));
  assert.match(gate, new RegExp(applicationContract.boundarySkipReason, "i"));
  assert.match(gate, new RegExp(applicationContract.noSignalSkipReason, "i"));

  for (const remedy of Object.values(
    controlContract.orchestration.wholePackRemedies,
  )) {
    assert.match(
      orchestration,
      new RegExp(remedy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  for (const attribution of proposalAttributions) {
    assert.match(engagement, new RegExp(attribution, "i"));
  }
  for (const status of Object.values(controlContract.readiness.statuses)) {
    assert.match(readiness, new RegExp(`\\b${status}\\b`));
  }
  assert.doesNotMatch(gate, /production fitness/i);
});

test("broad design intent selects the orchestrator while focused intent stays specialist", () => {
  const skill = readSkillFile("SKILL.md");
  const boundary = readSkillFile("references/capability-boundary.md");
  const fixtures = readFixtures("routing.json");

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

  for (const fixture of fixtures) {
    assert.deepEqual(routeIntent(fixture.input), fixture.expected);
  }
});

test("the Applicability gate selects operational signals and records explicit skips", () => {
  const skill = readSkillFile("SKILL.md");
  const gate = readSkillFile("references/applicability-gate.md");
  const fixtures = readFixtures("applicability.json");

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
  assert.match(gate, /when either.*new production runtime path/is);
  assert.doesNotMatch(gate, /production fitness/i);
  assert.match(gate, /record an explicit skip reason/i);
  assert.match(gate, /neither perspective.*NOT_APPLICABLE/is);

  for (const fixture of fixtures) {
    assert.deepEqual(
      applyApplicabilityGate(fixture.input),
      fixture.expected,
      fixture.id,
    );
  }

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
    /same candidate design.*same Design Engagement contract/is,
  );
  assert.match(orchestration, /Design-seam contract.*specialist/is);
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
  const cases = fixtureCases("orchestration.json");
  const remedy =
    "npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent codex";

  assert.match(orchestration, /verify.*selected.*skill.*available/is);
  assert.match(orchestration, /stop.*before.*specialist/is);
  assert.match(orchestration, new RegExp(remedy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(cases["missing-infrastructure"].expected.remedy, remedy);
  assert.equal(cases["missing-application"].expected.remedy, remedy);
  assert.equal(cases["missing-both"].expected.remedy, remedy);
  for (const fixture of readFixtures("orchestration.json")) {
    assert.deepEqual(deriveOrchestration(fixture), fixture.expected, fixture.id);
  }
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

  for (const fixture of readFixtures("design-results.json")) {
    assert.equal(
      classifyDesignCandidate(fixture.candidate).category,
      fixture.expected.category,
      fixture.id,
    );
  }
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
  const cases = fixtureCases("readiness-results.json");

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
  for (const fixture of readFixtures("readiness-results.json")) {
    assert.deepEqual(
      deriveReadinessResult(fixture),
      fixture.expected,
      fixture.id,
    );
  }
  assert.match(
    readiness,
    /BLOCKED.*one decision at a time.*update.*candidate design.*rerun/is,
  );
});

test("deterministic and manual fixtures cover the Design gate acceptance corpus", () => {
  const fixtureNames = [
    "routing.json",
    "applicability.json",
    "orchestration.json",
    "design-results.json",
    "readiness-results.json",
  ];
  const fixtures = fixtureNames.flatMap(readFixtures);
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
