import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceSkillsRoot = join(repoRoot, "skills");
const setupSkillRoot = join(sourceSkillsRoot, "setup-operations-pack");
const fixturesRoot = join(
  repoRoot,
  "test",
  "fixtures",
  "setup-operations-pack",
);
const expectedPolicy = readFileSync(
  join(fixturesRoot, "base-codex-project-policy.md"),
  "utf8",
).trimEnd();
const renameFailureImport = join(fixturesRoot, "fail-atomic-rename.mjs");

function createConsumer() {
  const consumerRoot = mkdtempSync(join(tmpdir(), "operations-pack-setup-"));
  const installedSkillsRoot = join(consumerRoot, ".agents", "skills");
  mkdirSync(installedSkillsRoot, { recursive: true });
  cpSync(sourceSkillsRoot, installedSkillsRoot, { recursive: true });

  return {
    consumerRoot,
    setupCli: join(
      installedSkillsRoot,
      "setup-operations-pack",
      "scripts",
      "setup-policy.mjs",
    ),
  };
}

function runSetup(setupCli, consumerRoot, ...args) {
  return spawnSync(
    process.execPath,
    [setupCli, ...args, "--project", consumerRoot],
    { encoding: "utf8" },
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function previewConfirmation(setupCli, consumerRoot, ...args) {
  const preview = runSetup(
    setupCli,
    consumerRoot,
    "preview",
    ...args,
  );
  assert.equal(preview.status, 0, preview.stderr);
  const match = preview.stdout.match(
    /^Confirmation token: (?<token>[a-f0-9]{64})$/m,
  );
  assert.ok(match, "preview must emit a confirmation token");

  return match.groups.token;
}

test("preview shows the exact managed result without writing", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const originalInstructions = "# Consumer instructions\n\nKeep this text.\n";
  writeFileSync(instructionsPath, originalInstructions);

  const result = runSetup(setupCli, consumerRoot, "preview");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Mode: preview/);
  assert.match(result.stdout, /Change: create/);
  assert.match(
    result.stdout,
    new RegExp(
      escapeRegExp(
        `${originalInstructions.trimEnd()}\n\n${expectedPolicy}`,
      ),
    ),
  );
  assert.equal(readFileSync(instructionsPath, "utf8"), originalInstructions);
  assert.equal(
    existsSync(`${instructionsPath}.operations-pack.bak`),
    false,
  );
});

test("apply refuses to write without explicit confirmation", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const originalInstructions = "# Consumer instructions\n";
  writeFileSync(instructionsPath, originalInstructions);

  const result = runSetup(setupCli, consumerRoot, "apply");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /preview.*--confirm/i);
  assert.equal(readFileSync(instructionsPath, "utf8"), originalInstructions);
  assert.equal(
    existsSync(`${instructionsPath}.operations-pack.bak`),
    false,
  );
});

test("confirmed apply preserves instructions and creates an atomic backup", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const backupPath = `${instructionsPath}.operations-pack.bak`;
  const originalInstructions =
    "# Consumer instructions\n\n- Preserve this exactly.\n";
  writeFileSync(instructionsPath, originalInstructions);
  const confirmation = previewConfirmation(setupCli, consumerRoot);

  const result = runSetup(
    setupCli,
    consumerRoot,
    "apply",
    "--confirm",
    confirmation,
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Change: create/);
  assert.equal(
    readFileSync(instructionsPath, "utf8"),
    `${originalInstructions}\n${expectedPolicy}\n`,
  );
  assert.equal(readFileSync(backupPath, "utf8"), originalInstructions);
  assert.deepEqual(
    readdirSync(consumerRoot).filter((entry) =>
      entry.includes(".operations-pack.tmp"),
    ),
    [],
  );
});

test("inspect reports the exact current policy without writing", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const managedInstructions =
    `# Consumer instructions\n\n${expectedPolicy}\n`;
  writeFileSync(instructionsPath, managedInstructions);

  const result = runSetup(setupCli, consumerRoot, "inspect");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Mode: inspect/);
  assert.match(result.stdout, /State: current/);
  assert.match(result.stdout, /Policy schema: 1/);
  assert.match(
    result.stdout,
    new RegExp(escapeRegExp(expectedPolicy)),
  );
  assert.equal(readFileSync(instructionsPath, "utf8"), managedInstructions);
  assert.equal(
    existsSync(`${instructionsPath}.operations-pack.bak`),
    false,
  );
});

test("repeated identical apply is idempotent", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const backupPath = `${instructionsPath}.operations-pack.bak`;
  const originalInstructions = "# Consumer instructions\n";
  writeFileSync(instructionsPath, originalInstructions);
  const firstConfirmation = previewConfirmation(setupCli, consumerRoot);

  const first = runSetup(
    setupCli,
    consumerRoot,
    "apply",
    "--confirm",
    firstConfirmation,
  );
  assert.equal(first.status, 0, first.stderr);
  const appliedInstructions = readFileSync(instructionsPath, "utf8");
  const firstBackup = readFileSync(backupPath, "utf8");

  const secondConfirmation = previewConfirmation(setupCli, consumerRoot);
  const second = runSetup(
    setupCli,
    consumerRoot,
    "apply",
    "--confirm",
    secondConfirmation,
  );

  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /Change: unchanged/);
  assert.equal(readFileSync(instructionsPath, "utf8"), appliedInstructions);
  assert.equal(readFileSync(backupPath, "utf8"), firstBackup);
  assert.equal(
    readFileSync(instructionsPath, "utf8").split(
      "<!-- operations-pack:integration-policy:start -->",
    ).length - 1,
    1,
  );
});

test("preview detects schema drift and shows the exact replacement", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const oldPolicy = expectedPolicy
    .replace("Policy schema: 1", "Policy schema: 0")
    .replace(
      "### Risk acceptance",
      "Legacy policy content.\n\n### Risk acceptance",
    );
  const oldInstructions = `Before\n\n${oldPolicy}\n\nAfter\n`;
  writeFileSync(instructionsPath, oldInstructions);

  const result = runSetup(setupCli, consumerRoot, "preview");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Change: update/);
  assert.match(result.stdout, /Schema drift: 0 -> 1/);
  assert.match(
    result.stdout,
    new RegExp(
      escapeRegExp(`Before\n\n${expectedPolicy}\n\nAfter\n`),
    ),
  );
  assert.equal(readFileSync(instructionsPath, "utf8"), oldInstructions);
});

test("confirmed update replaces only the owned schema-drifted block", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const backupPath = `${instructionsPath}.operations-pack.bak`;
  const oldPolicy = expectedPolicy
    .replace("Policy schema: 1", "Policy schema: 0")
    .replace(
      "### Risk acceptance",
      "Legacy policy content.\n\n### Risk acceptance",
    );
  const oldInstructions = `Before without newline\n${oldPolicy}\nAfter`;
  writeFileSync(instructionsPath, oldInstructions);

  const refused = runSetup(setupCli, consumerRoot, "update");

  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /preview.*--confirm/i);
  assert.equal(readFileSync(instructionsPath, "utf8"), oldInstructions);

  const confirmation = previewConfirmation(setupCli, consumerRoot);
  const applied = runSetup(
    setupCli,
    consumerRoot,
    "update",
    "--confirm",
    confirmation,
  );

  assert.equal(applied.status, 0, applied.stderr);
  assert.match(applied.stdout, /Change: update/);
  assert.equal(
    readFileSync(instructionsPath, "utf8"),
    `Before without newline\n${expectedPolicy}\nAfter`,
  );
  assert.equal(readFileSync(backupPath, "utf8"), oldInstructions);
});

test("multiple recognized Codex targets require an explicit choice", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const agentsPath = join(consumerRoot, "AGENTS.md");
  const overridePath = join(consumerRoot, "AGENTS.override.md");
  writeFileSync(agentsPath, "Shared instructions\n");
  writeFileSync(overridePath, "Override instructions\n");

  const ambiguous = runSetup(setupCli, consumerRoot, "preview");

  assert.equal(ambiguous.status, 1);
  assert.match(ambiguous.stderr, /multiple.*Codex.*targets/i);
  assert.match(ambiguous.stderr, /--target AGENTS\.md/);
  assert.match(ambiguous.stderr, /--target AGENTS\.override\.md/);
  assert.equal(readFileSync(agentsPath, "utf8"), "Shared instructions\n");
  assert.equal(
    readFileSync(overridePath, "utf8"),
    "Override instructions\n",
  );

  const selected = runSetup(
    setupCli,
    consumerRoot,
    "preview",
    "--target",
    "AGENTS.override.md",
  );

  assert.equal(selected.status, 0, selected.stderr);
  assert.match(selected.stdout, /AGENTS\.override\.md/);
  assert.equal(readFileSync(agentsPath, "utf8"), "Shared instructions\n");
  assert.equal(
    readFileSync(overridePath, "utf8"),
    "Override instructions\n",
  );
});

test("malformed or duplicate ownership markers refuse partial mutation", () => {
  for (const instructions of [
    "Before\n<!-- operations-pack:integration-policy:start -->\nBroken\n",
    `${expectedPolicy}\n\n${expectedPolicy}\n`,
  ]) {
    const { consumerRoot, setupCli } = createConsumer();
    const instructionsPath = join(consumerRoot, "AGENTS.md");
    writeFileSync(instructionsPath, instructions);

    const result = runSetup(
      setupCli,
      consumerRoot,
      "apply",
      "--confirm",
      "invalid-confirmation",
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /malformed or duplicate.*markers/i);
    assert.match(result.stderr, /repair.*inspect/i);
    assert.equal(readFileSync(instructionsPath, "utf8"), instructions);
    assert.equal(
      existsSync(`${instructionsPath}.operations-pack.bak`),
      false,
    );
    assert.deepEqual(
      readdirSync(consumerRoot).filter((entry) =>
        entry.includes(".operations-pack.tmp"),
      ),
      [],
    );
  }
});

test("incomplete installations fail with the whole-pack remedy", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const originalInstructions = "# Consumer instructions\n";
  writeFileSync(instructionsPath, originalInstructions);
  writeFileSync(
    join(
      consumerRoot,
      ".agents",
      "skills",
      "runbook",
      "SKILL.md",
    ),
    "---\nname: wrong-skill\n---\n",
  );

  const result = runSetup(setupCli, consumerRoot, "preview");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Incomplete Operations Pack/);
  assert.match(result.stderr, /runbook/);
  assert.match(
    result.stderr,
    /npx skills add oppegard\/operations-agent-skills#v1\.0\.0 --skill '\*' --agent codex/,
  );
  assert.equal(readFileSync(instructionsPath, "utf8"), originalInstructions);
  assert.equal(
    existsSync(`${instructionsPath}.operations-pack.bak`),
    false,
  );
});

test("update refuses when no managed policy exists", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const originalInstructions = "# Consumer instructions\n";
  writeFileSync(instructionsPath, originalInstructions);

  const result = runSetup(
    setupCli,
    consumerRoot,
    "update",
    "--confirm",
    "invalid-confirmation",
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /no managed policy/i);
  assert.match(result.stderr, /preview.*apply/i);
  assert.equal(readFileSync(instructionsPath, "utf8"), originalInstructions);
  assert.equal(
    existsSync(`${instructionsPath}.operations-pack.bak`),
    false,
  );
});

test("a new Codex project defaults to AGENTS.md with an empty backup", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");

  const inspection = runSetup(setupCli, consumerRoot, "inspect");

  assert.equal(inspection.status, 0, inspection.stderr);
  assert.match(inspection.stdout, /State: absent/);
  assert.equal(existsSync(instructionsPath), false);

  const confirmation = previewConfirmation(setupCli, consumerRoot);
  const applied = runSetup(
    setupCli,
    consumerRoot,
    "apply",
    "--confirm",
    confirmation,
  );

  assert.equal(applied.status, 0, applied.stderr);
  assert.equal(
    readFileSync(instructionsPath, "utf8"),
    `${expectedPolicy}\n`,
  );
  assert.equal(
    readFileSync(`${instructionsPath}.operations-pack.bak`, "utf8"),
    "",
  );
});

test("a single established AGENTS.override.md convention is preserved", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const overridePath = join(consumerRoot, "AGENTS.override.md");
  const originalInstructions = "# Established override\n";
  writeFileSync(overridePath, originalInstructions);

  const result = runSetup(setupCli, consumerRoot, "preview");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /AGENTS\.override\.md/);
  assert.equal(readFileSync(overridePath, "utf8"), originalInstructions);
  assert.equal(existsSync(join(consumerRoot, "AGENTS.md")), false);
});

test("confirmation is bound to the exact previewed file state", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  writeFileSync(instructionsPath, "# Initial instructions\n");
  const confirmation = previewConfirmation(setupCli, consumerRoot);
  const changedInstructions = "# Instructions changed after preview\n";
  writeFileSync(instructionsPath, changedInstructions);

  const result = runSetup(
    setupCli,
    consumerRoot,
    "apply",
    "--confirm",
    confirmation,
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /no longer matches.*preview/i);
  assert.equal(readFileSync(instructionsPath, "utf8"), changedInstructions);
  assert.equal(
    existsSync(`${instructionsPath}.operations-pack.bak`),
    false,
  );
});

test("an explicit target cannot compete with one established convention", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const overridePath = join(consumerRoot, "AGENTS.override.md");
  writeFileSync(overridePath, "# Established override\n");

  const result = runSetup(
    setupCli,
    consumerRoot,
    "preview",
    "--target",
    "AGENTS.md",
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /established.*AGENTS\.override\.md/i);
  assert.match(result.stderr, /remove --target|choose.*override/i);
  assert.equal(existsSync(join(consumerRoot, "AGENTS.md")), false);
  assert.equal(
    readFileSync(overridePath, "utf8"),
    "# Established override\n",
  );
});

test("atomic rename failure leaves the target unchanged", () => {
  const { consumerRoot, setupCli } = createConsumer();
  const instructionsPath = join(consumerRoot, "AGENTS.md");
  const originalInstructions = "# Original instructions\n";
  writeFileSync(instructionsPath, originalInstructions);
  const confirmation = previewConfirmation(setupCli, consumerRoot);
  const importOption =
    `--import=${pathToFileURL(renameFailureImport).href}`;

  const result = spawnSync(
    process.execPath,
    [
      setupCli,
      "apply",
      "--confirm",
      confirmation,
      "--project",
      consumerRoot,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        NODE_OPTIONS: [process.env.NODE_OPTIONS, importOption]
          .filter(Boolean)
          .join(" "),
      },
    },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /atomic replacement failed/i);
  assert.equal(readFileSync(instructionsPath, "utf8"), originalInstructions);
  assert.equal(
    readFileSync(`${instructionsPath}.operations-pack.bak`, "utf8"),
    originalInstructions,
  );
  assert.deepEqual(
    readdirSync(consumerRoot).filter((entry) =>
      entry.includes(".operations-pack.tmp"),
    ),
    [],
  );
});

test("the base policy controls both lifecycle events and every status", () => {
  assert.match(
    expectedPolicy,
    /Design:.*operational-design-review/is,
  );
  assert.match(
    expectedPolicy,
    /Release:.*production-readiness-review/is,
  );
  assert.match(expectedPolicy, /before an agent-controlled commit or merge/i);
  for (const status of [
    "NOT_APPLICABLE",
    "READY",
    "READY_WITH_ADVISORIES",
    "BLOCKED",
  ]) {
    assert.match(expectedPolicy, new RegExp(`\\b${status}\\b`));
  }
  assert.match(expectedPolicy, /Only a human may explicitly accept a Risk/);
  assert.match(
    expectedPolicy,
    /agent must never grant, infer,\s+or impersonate Risk acceptance/i,
  );
});

test("the setup skill keeps preview and confirmation user-controlled", () => {
  const skill = readFileSync(join(setupSkillRoot, "SKILL.md"), "utf8");
  const boundary = readFileSync(
    join(setupSkillRoot, "references", "capability-boundary.md"),
    "utf8",
  );

  assert.match(skill, /only when the user explicitly invokes/i);
  assert.match(skill, /never.*installation or update/is);
  assert.match(
    skill,
    /node.*scripts\/setup-policy\.mjs preview --project/is,
  );
  assert.match(skill, /multiple.*target.*ask the user/is);
  assert.match(skill, /show.*exact preview.*ask.*confirm/is);
  assert.match(
    skill,
    /apply.*--confirm <confirmation-token>|update.*--confirm <confirmation-token>/is,
  );
  assert.match(skill, /\[Base Integration Policy\]\(references\/base-policy\.md\)/);
  assert.match(boundary, /Codex project.*base.*only/is);
  assert.match(boundary, /preview.*inspect.*read-only/is);
  assert.match(boundary, /one.*marker-delimited block/is);
});
