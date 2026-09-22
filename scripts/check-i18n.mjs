import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const localesDir = path.join(root, "src", "messages");
const statuses = JSON.parse(fs.readFileSync(path.join(root, "src", "lib", "i18n", "review-status.json"), "utf8"));
const localeCodes = ["en", "fr", "es", "it", "ja", "ko"];
const requireApproval = process.argv.includes("--require-approved");
const optionalCatalogKeys = new Set(["image", "initials"]);
let failures = 0;

function loadLocale(locale) {
  return JSON.parse(fs.readFileSync(path.join(localesDir, `${locale}.json`), "utf8"));
}

function placeholders(value) {
  return [...value.matchAll(/\{\{?\s*([A-Za-z_][\w-]*)\s*(?:[,}])/g)].map((match) => match[1]).sort();
}

function compare(source, candidate, label) {
  if (Array.isArray(source)) {
    if (!Array.isArray(candidate) || (source.length === 0 && candidate.length > 0)) {
      throw new Error(`${label}: array shape differs from English`);
    }
    // Marketing collections (marquee items, reviews and FAQs) can be curated
    // per market. Validate each item against the English item shape without
    // forcing every locale to carry the same editorial count.
    candidate.forEach((item, index) => compare(source[Math.min(index, source.length - 1)], item, `${label}[${index}]`));
    return;
  }
  if (source && typeof source === "object") {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error(`${label}: object shape differs from English`);
    }
    const sourceKeys = Object.keys(source).filter((key) => !optionalCatalogKeys.has(key)).sort();
    const candidateKeys = Object.keys(candidate).filter((key) => !optionalCatalogKeys.has(key)).sort();
    if (sourceKeys.join("|") !== candidateKeys.join("|")) {
      throw new Error(`${label}: keys differ from English`);
    }
    sourceKeys.forEach((key) => compare(source[key], candidate[key], `${label}.${key}`));
    return;
  }
  if (typeof source !== typeof candidate) throw new Error(`${label}: value type differs from English`);
  if (typeof source === "string" && placeholders(source).join("|") !== placeholders(candidate).join("|")) {
    throw new Error(`${label}: interpolation placeholders differ from English`);
  }
}

const english = loadLocale("en");
for (const locale of localeCodes) {
  try {
    compare(english, loadLocale(locale), locale);
    if (requireApproval && statuses[locale]?.status !== "approved") {
      throw new Error(`${locale}: translations require a named human approval before release`);
    }
    console.log(`✓ ${locale}: catalog valid${statuses[locale]?.status ? ` (${statuses[locale].status})` : ""}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${error instanceof Error ? error.message : error}`);
  }
}

if (failures) process.exitCode = 1;
