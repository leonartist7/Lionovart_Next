import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { ESLint } from "eslint";

const baseline = "e1723e35b215dc34b478c326b6791e866ae2b8f5";
const eslint = new ESLint();
const results = await eslint.lintFiles(["src"]);
await mkdir("verification-output", { recursive: true });
await writeFile("verification-output/lint-full.json", JSON.stringify(results, null, 2) + "\n");
const paths = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", baseline, "HEAD", "--", "src"], { encoding: "utf8" }).trim().split("\n").filter((path) => /\.[cm]?[jt]sx?$/.test(path));
const findings = [];
const key = (message) => JSON.stringify([message.ruleId, message.message]);
for (const path of paths) {
  const current = results.find((result) => result.filePath.replaceAll("\\", "/").endsWith("/" + path));
  if (!current) continue;
  let previous = [];
  let oldSource;
  try { oldSource = execFileSync("git", ["show", baseline + ":" + path], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch {}
  if (oldSource !== undefined) previous = (await eslint.lintText(oldSource, { filePath: path }))[0].messages;
  const existing = new Map();
  for (const message of previous.filter((entry) => entry.severity === 2)) existing.set(key(message), (existing.get(key(message)) ?? 0) + 1);
  for (const message of current.messages.filter((entry) => entry.severity === 2)) {
    const count = existing.get(key(message)) ?? 0;
    if (count > 0) existing.set(key(message), count - 1);
    else findings.push({ path, ...message });
  }
}
await writeFile("verification-output/lint-new.json", JSON.stringify(findings, null, 2) + "\n");
console.log("Full source lint:", JSON.stringify({ errors: results.reduce((total, result) => total + result.errorCount, 0), warnings: results.reduce((total, result) => total + result.warningCount, 0), changedFiles: paths.length, newErrors: findings.length }));
for (const finding of findings) console.log(JSON.stringify(finding));
if (findings.length) throw new Error("New source lint errors require resolution");
