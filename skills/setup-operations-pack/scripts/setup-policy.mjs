#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const expectedSkills = [
  "application-resilience",
  "infrastructure-readiness",
  "operational-design-review",
  "production-readiness-review",
  "runbook",
  "setup-operations-pack",
];
const endMarker = "<!-- operations-pack:integration-policy:end -->";
const policySchema = 1;
const startMarker = "<!-- operations-pack:integration-policy:start -->";
const supportedModes = new Set([
  "apply",
  "inspect",
  "preview",
  "update",
]);
const writeModes = new Set(["apply", "update"]);
const setupRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = resolve(setupRoot, "..");
const policy = readFileSync(
  join(setupRoot, "references", "base-policy.md"),
  "utf8",
).trimEnd();

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function parseArguments(argv) {
  const [mode, ...options] = argv;
  let confirmation;
  let projectRoot;
  let target;

  for (let index = 0; index < options.length; index += 1) {
    if (options[index] === "--project") {
      projectRoot = options[index + 1];
      index += 1;
    } else if (options[index] === "--confirm") {
      confirmation = options[index + 1];
      index += 1;
    } else if (options[index] === "--target") {
      target = options[index + 1];
      index += 1;
    }
  }

  if (!supportedModes.has(mode) || !projectRoot) {
    fail(
      "Usage: setup-policy.mjs <preview|inspect|apply|update> --project <project-directory> [--confirm <confirmation-token>]",
    );
    return undefined;
  }

  if (writeModes.has(mode) && !confirmation) {
    fail(
      `${mode === "apply" ? "Apply" : "Update"} requires a reviewed preview and explicit --confirm <confirmation-token>; no files were changed.`,
    );
    return undefined;
  }

  if (
    target !== undefined &&
    !["AGENTS.md", "AGENTS.override.md"].includes(target)
  ) {
    fail(
      "Codex project target must be AGENTS.md or AGENTS.override.md.",
    );
    return undefined;
  }

  return {
    confirmation,
    mode,
    projectRoot: resolve(projectRoot),
    target,
  };
}

function verifyPack() {
  return expectedSkills.filter((skillName) => {
    const skillFile = join(skillsRoot, skillName, "SKILL.md");

    try {
      return (
        !statSync(skillFile).isFile() ||
        !new RegExp(`^name:\\s*${skillName}$`, "m").test(
          readFileSync(skillFile, "utf8"),
        )
      );
    } catch {
      return true;
    }
  });
}

function resolveTarget(projectRoot, selectedTarget) {
  const recognizedTargets = ["AGENTS.override.md", "AGENTS.md"].filter(
    (target) => existsSync(join(projectRoot, target)),
  );

  if (
    selectedTarget &&
    recognizedTargets.length === 1 &&
    recognizedTargets[0] !== selectedTarget
  ) {
    fail(
      `The established Codex instruction target is ${recognizedTargets[0]}. Remove --target or choose ${recognizedTargets[0]}; no files were changed.`,
    );
    return undefined;
  }

  if (selectedTarget) {
    return join(projectRoot, selectedTarget);
  }

  if (recognizedTargets.length > 1) {
    fail(
      "Multiple recognized Codex instruction targets exist. Ask the user to choose --target AGENTS.md or --target AGENTS.override.md; no files were changed.",
    );
    return undefined;
  }

  return join(projectRoot, recognizedTargets[0] ?? "AGENTS.md");
}

function renderResult(currentContent, inspection) {
  if (inspection.state === "absent") {
    const result = !currentContent
      ? `${policy}\n`
      : `${currentContent}${currentContent.endsWith("\n") ? "\n" : "\n\n"}${policy}\n`;

    return { change: "create", result };
  }

  const blockStart = currentContent.indexOf(startMarker);
  const blockEnd =
    currentContent.indexOf(endMarker, blockStart) + endMarker.length;
  const result =
    currentContent.slice(0, blockStart) +
    policy +
    currentContent.slice(blockEnd);

  return {
    change: result === currentContent ? "unchanged" : "update",
    result,
  };
}

function inspectManagedPolicy(content) {
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker);
  const duplicateStart = start !== content.lastIndexOf(startMarker);
  const duplicateEnd = end !== content.lastIndexOf(endMarker);

  if (start === -1 && end === -1) {
    return { state: "absent" };
  }

  if (
    start === -1 ||
    end === -1 ||
    duplicateStart ||
    duplicateEnd ||
    end < start
  ) {
    return { state: "malformed" };
  }

  const block = content.slice(start, end + endMarker.length);
  const schemaMatch = block.match(/^Policy schema:\s*(?<schema>\d+)$/m);

  if (!schemaMatch) {
    return { state: "malformed" };
  }

  const schema = Number(schemaMatch.groups.schema);

  return {
    block,
    schema,
    state: schema === policySchema ? "current" : "schema-drift",
  };
}

function createConfirmationToken({
  change,
  currentContent,
  result,
  targetPath,
}) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        change,
        currentContent,
        policySchema,
        result,
        targetPath,
      }),
    )
    .digest("hex");
}

function applyResult(targetPath, currentContent, result) {
  const backupPath = `${targetPath}.operations-pack.bak`;
  const temporaryPath = join(
    dirname(targetPath),
    `.${basename(targetPath)}.operations-pack.tmp-${randomUUID()}`,
  );
  const targetMode = existsSync(targetPath)
    ? statSync(targetPath).mode & 0o777
    : 0o644;

  try {
    writeFileSync(backupPath, currentContent, { mode: targetMode });
    writeFileSync(temporaryPath, result, {
      flag: "wx",
      mode: targetMode,
    });
    renameSync(temporaryPath, targetPath);
    return true;
  } catch (error) {
    fail(
      `Atomic replacement failed (${error.code ?? error.message}). The target was not changed; inspect the target and backup before retrying.`,
    );
    return false;
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

const parsed = parseArguments(process.argv.slice(2));

if (parsed) {
  const missingSkills = verifyPack();

  if (missingSkills.length > 0) {
    fail(
      `Incomplete Operations Pack; missing or invalid skills: ${missingSkills.join(", ")}. Reinstall the complete pack with: npx skills add oppegard/operations-agent-skills#v1.0.0 --skill '*' --agent codex`,
    );
  } else {
    const targetPath = resolveTarget(parsed.projectRoot, parsed.target);

    if (targetPath) {
      const currentContent = existsSync(targetPath)
        ? readFileSync(targetPath, "utf8")
        : "";
      const inspection = inspectManagedPolicy(currentContent);

      if (inspection.state === "malformed") {
        fail(
          "Malformed or duplicate Operations Pack markers. Repair the marker pair, then run inspect before retrying; no files were changed.",
        );
      } else if (
        parsed.mode === "update" &&
        inspection.state === "absent"
      ) {
        fail(
          "No managed policy exists to update. Run preview, then apply after confirmation; no files were changed.",
        );
      } else if (parsed.mode === "inspect") {
        process.stdout.write(
          [
            `Target: ${targetPath}`,
            "Mode: inspect",
            `State: ${inspection.state}`,
            ...(inspection.schema === undefined
              ? []
              : [`Policy schema: ${inspection.schema}`]),
            ...(inspection.block === undefined
              ? []
              : [
                  "--- managed policy ---",
                  inspection.block,
                  "--- end managed policy ---",
                ]),
            "",
          ].join("\n"),
        );
      } else {
        const { change, result } = renderResult(
          currentContent,
          inspection,
        );
        const confirmationToken = createConfirmationToken({
          change,
          currentContent,
          result,
          targetPath,
        });
        const writeRequested = writeModes.has(parsed.mode);
        const confirmationMatches =
          !writeRequested ||
          parsed.confirmation === confirmationToken;

        if (!confirmationMatches) {
          fail(
            "The target no longer matches the confirmed preview. Run preview again and confirm its new token; no files were changed.",
          );
        } else {
          const applied =
            !writeRequested ||
            change === "unchanged" ||
            applyResult(targetPath, currentContent, result);

          if (applied) {
            process.stdout.write(
              [
                `Target: ${targetPath}`,
                `Mode: ${parsed.mode}`,
                `Change: ${change}`,
                `Policy schema: ${policySchema}`,
                ...(inspection.state === "schema-drift"
                  ? [
                      `Schema drift: ${inspection.schema} -> ${policySchema}`,
                    ]
                  : []),
                ...(parsed.mode === "preview"
                  ? [`Confirmation token: ${confirmationToken}`]
                  : []),
                "--- managed result ---",
                result,
                "--- end managed result ---",
                "",
              ].join("\n"),
            );
          }
        }
      }
    }
  }
}
