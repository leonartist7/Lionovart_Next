import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const result = spawnSync("npm", ["audit", "--omit=dev", "--json"], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
if (result.error) throw result.error;
let report;
try { report = JSON.parse(result.stdout); } catch { throw new Error("Dependency audit returned no JSON report"); }
if (report.error) throw new Error("Dependency audit failed: " + JSON.stringify(report.error));
mkdirSync("verification-output", { recursive: true });
writeFileSync("verification-output/dependency-advisories.json", JSON.stringify(report, null, 2) + "\n");
console.log("Application advisory summary:", JSON.stringify(report.metadata?.vulnerabilities ?? {}));
for (const [name, finding] of Object.entries(report.vulnerabilities ?? {})) {
  console.log(JSON.stringify({
    name, severity: finding.severity, direct: finding.isDirect,
    affected: finding.range, fix: finding.fixAvailable,
    advisories: finding.via.filter((v) => typeof v === "object").map((v) => ({ title: v.title, url: v.url, range: v.range })),
  }));
}
