import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.dependencies.next = "16.3.8";
pkg.devDependencies["eslint-config-next"] = "16.3.8";
pkg.devDependencies.shadcn = pkg.dependencies.shadcn;
delete pkg.dependencies.shadcn;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
for (const args of [
  ["install", "--package-lock-only", "--ignore-scripts"],
  ["audit", "fix", "--package-lock-only", "--ignore-scripts"],
]) {
  const result = spawnSync("npm", args, { stdio: "inherit" });
  if (result.error || result.status > (args[0] === "audit" ? 1 : 0)) throw result.error ?? new Error("Resolver failed");
}
for (const path of ["package.json", "package-lock.json"]) {
  const text = readFileSync(path, "utf8");
  console.log("MANIFEST_META " + JSON.stringify({ path, length: text.length, sha256: createHash("sha256").update(text).digest("hex") }));
  for (let offset = 0; offset < text.length; offset += 14000) {
    console.log("MANIFEST_CHUNK " + JSON.stringify({ path, offset, text: text.slice(offset, offset + 14000) }));
  }
}
