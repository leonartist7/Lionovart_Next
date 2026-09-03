#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const globalInstall = process.argv.includes("--global");
const cwd = process.cwd();
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const sources = [
  { repo: "Leonxlnx/taste-skill", fullDepth: false },
  { repo: "MengTo/Skills", fullDepth: true },
  { repo: "emilkowalski/skills", fullDepth: false },
];

function runSkillsInstall({ repo, fullDepth }) {
  const args = [
    "-y",
    "skills@latest",
    "add",
    repo,
    "--skill",
    "*",
    "--agent",
    "codex",
    "--copy",
    "--yes",
  ];

  if (fullDepth) args.push("--full-depth");
  if (globalInstall) args.push("--global");

  console.log(`\n▶ Installing all Codex skills from ${repo}${globalInstall ? " (global)" : " (project)"}...`);
  const result = spawnSync(npx, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Skills install failed for ${repo} with exit code ${result.status}`);
  }
}

function countSkills(root) {
  if (!existsSync(root)) return 0;
  return readdirSync(root, { withFileTypes: true }).reduce((count, entry) => {
    if (!entry.isDirectory()) return count;
    return count + (existsSync(join(root, entry.name, "SKILL.md")) ? 1 : 0);
  }, 0);
}

for (const source of sources) runSkillsInstall(source);

const projectSkills = resolve(cwd, ".agents", "skills");
const globalCodexSkills = join(homedir(), ".codex", "skills");
const globalCanonicalSkills = join(homedir(), ".agents", "skills");

if (globalInstall) {
  const directCount = countSkills(globalCodexSkills);
  const canonicalCount = countSkills(globalCanonicalSkills);
  console.log(`\n✓ Global Codex skills detected: ${directCount} in ${globalCodexSkills}`);
  if (canonicalCount > directCount) {
    console.log(`ℹ Canonical global skill store also contains ${canonicalCount} skills at ${globalCanonicalSkills}.`);
  }
  if (directCount === 0 && canonicalCount === 0) {
    throw new Error("Global install completed but no Codex skills directory was detected.");
  }
} else {
  const projectCount = countSkills(projectSkills);
  console.log(`\n✓ Project Codex skills detected: ${projectCount} in ${projectSkills}`);
  if (projectCount === 0) {
    throw new Error("Project install completed but no .agents/skills entries were detected.");
  }
}

console.log("\nDone. Start a new Codex session so it discovers the newly installed skills.");
