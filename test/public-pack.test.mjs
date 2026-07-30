import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(repoRoot, "skills");
const skillCli = join(
  repoRoot,
  "node_modules",
  "skills",
  "bin",
  "cli.mjs",
);

const expectedSkills = [
  "application-resilience",
  "infrastructure-readiness",
  "operational-design-review",
  "production-readiness-review",
  "runbook",
  "setup-operations-pack",
];

function installedSkillNames(consumerRoot) {
  const installedRoot = join(consumerRoot, ".agents", "skills");

  return readdirSync(installedRoot)
    .filter((entry) => statSync(join(installedRoot, entry)).isDirectory())
    .filter((entry) => {
      try {
        return statSync(join(installedRoot, entry, "SKILL.md")).isFile();
      } catch {
        return false;
      }
    })
    .sort();
}

function installPack(consumerRoot) {
  execFileSync(
    process.execPath,
    [
      skillCli,
      "add",
      repoRoot,
      "--agent",
      "codex",
      "--skill",
      "*",
      "--copy",
      "--yes",
    ],
    {
      cwd: consumerRoot,
      env: {
        ...process.env,
        NO_COLOR: "1",
      },
      stdio: "pipe",
    },
  );
}

function parsePublicFrontmatter(content) {
  const match = content.match(/^---\n(?<frontmatter>[\s\S]*?)\n---\n/);
  assert.ok(match, "SKILL.md must begin with YAML frontmatter");

  return Object.fromEntries(
    match.groups.frontmatter.split("\n").map((line) => {
      const separator = line.indexOf(":");
      assert.notEqual(separator, -1, `invalid frontmatter line: ${line}`);

      const key = line.slice(0, separator).trim();
      const rawValue = line.slice(separator + 1).trim();
      const value =
        rawValue === "true"
          ? true
          : rawValue === "false"
            ? false
            : rawValue;

      return [key, value];
    }),
  );
}

test("a local consumer installs exactly the six stable v1 skills", () => {
  const consumerRoot = realpathSync(
    mkdtempSync(join(tmpdir(), "operations-pack-consumer-")),
  );
  const agentInstructions = "# Consumer-owned Codex instructions\n";
  const claudeInstructions = "# Consumer-owned Claude instructions\n";

  writeFileSync(join(consumerRoot, "AGENTS.md"), agentInstructions);
  writeFileSync(join(consumerRoot, "CLAUDE.md"), claudeInstructions);

  installPack(consumerRoot);

  assert.deepEqual(installedSkillNames(consumerRoot), expectedSkills);

  installPack(consumerRoot);

  assert.equal(
    readFileSync(join(consumerRoot, "AGENTS.md"), "utf8"),
    agentInstructions,
  );
  assert.equal(
    readFileSync(join(consumerRoot, "CLAUDE.md"), "utf8"),
    claudeInstructions,
  );
});

test("the repository exposes only the stable v1 skill directories", () => {
  const discovered = readdirSync(skillsRoot)
    .filter((entry) => statSync(join(skillsRoot, entry)).isDirectory())
    .sort();

  assert.deepEqual(discovered, expectedSkills);
});

test("every skill has valid discovery metadata and bundled references", () => {
  for (const skillName of expectedSkills) {
    const skillRoot = join(skillsRoot, skillName);
    const skillPath = join(skillRoot, "SKILL.md");
    const content = readFileSync(skillPath, "utf8");
    const frontmatter = parsePublicFrontmatter(content);

    assert.equal(frontmatter.name, skillName);
    assert.ok(
      typeof frontmatter.description === "string" &&
        frontmatter.description.length > 0,
      `${skillName} must have a non-empty description`,
    );
    assert.equal(
      frontmatter["disable-model-invocation"],
      skillName === "setup-operations-pack",
      `${skillName} must declare its model-invocation boundary`,
    );

    const referenceTargets = [
      ...content.matchAll(/\[[^\]]+\]\((?<target>[^)#]+\.md)(?:#[^)]+)?\)/g),
    ].map((match) => match.groups.target);

    assert.ok(
      referenceTargets.length > 0,
      `${skillName} must link at least one bundled reference`,
    );

    for (const referenceTarget of referenceTargets) {
      const referencePath = resolve(skillRoot, referenceTarget);
      assert.ok(
        referencePath.startsWith(`${skillRoot}/`),
        `${skillName} reference escapes its installed directory`,
      );
      assert.ok(
        statSync(referencePath).isFile(),
        `${skillName} reference does not resolve: ${referenceTarget}`,
      );
    }
  }
});

test("the repository documents and verifies the whole-pack contract", () => {
  const readme = readFileSync(join(repoRoot, "README.md"), "utf8");
  const license = readFileSync(join(repoRoot, "LICENSE"), "utf8");
  const provenance = readFileSync(
    join(repoRoot, "SOURCE_PROVENANCE.md"),
    "utf8",
  );
  const packageManifest = JSON.parse(
    readFileSync(join(repoRoot, "package.json"), "utf8"),
  );

  assert.match(readme, /whole-pack installation is the supported path/i);
  assert.match(
    readme,
    /oppegard\/operations-agent-skills#v1\.0\.0.*--skill ['"]\*['"]/,
  );
  assert.match(readme, /selective installation is unsupported/i);
  for (const skillName of expectedSkills) {
    assert.match(readme, new RegExp(`\\b${skillName}\\b`));
  }

  assert.match(license, /MIT License/);
  assert.match(license, /Permission is hereby granted, free of charge/);

  assert.match(provenance, /testdouble\/han/);
  assert.match(
    provenance,
    /a90cb0993d774f921ae945ffc58f9eb69df07fdf/,
  );
  assert.match(provenance, /Copyright 2026 Test Double, Inc\./);
  assert.match(provenance, /Adapted upstream work/);
  assert.match(provenance, /Original Operations Pack work/);

  assert.equal(packageManifest.dependencies, undefined);
});
