/**
 * Screenshots the portal as both roles, in both themes.
 *
 *   node scripts/portal-verify/shots.mjs [outDir]
 *
 * Use this SPARINGLY. Images cost far more context than assertions, so lead
 * with `verify.mjs` (15 pass/fail lines) and only screenshot when you need to
 * judge something visual — layout, spacing, colour, or the end of a phase.
 *
 * Also reports horizontal overflow and console errors per view, which are the
 * two failures a screenshot alone will not tell you about.
 */
import { BASE, J, setupWorkspace } from "./harness.mjs";

// Deliberately NOT a dependency of this repo: the Dockerfile runs a plain
// `npm install`, so anything in package.json is pulled into every Cloud Build.
// Screenshots are the occasional path — install it where you need it.
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error(
    "playwright-core isn't installed.\n\n" +
      "  npm i --no-save playwright-core\n\n" +
      "Chromium itself is already on the box at /opt/pw-browsers/ — do not run " +
      "`playwright install`. Override the binary with CHROMIUM_PATH if the path differs.",
  );
  process.exit(1);
}

const OUT = process.argv[2] ?? "/tmp/portal-shots";
const CHROME =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const fx = await setupWorkspace("Screenshot Fixture");
const api = `${BASE}/api/portal/${fx.slug}/projects`;

// Enough real data that the screens aren't empty states.
const project = (
  await (
    await fetch(api, {
      method: "POST",
      headers: J(fx.agencyCookie),
      body: JSON.stringify({ name: "Brand Identity System", kind: "brand", status: "active" }),
    })
  ).json()
).project;

const mApi = `${api}/${project.id}/milestones`;
const made = [];
for (const title of ["Discovery", "Concepts", "Refinement", "Handover"]) {
  const r = await fetch(mApi, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ title }),
  });
  made.push((await r.json()).milestone);
}
await fetch(`${mApi}/${made[0].id}`, {
  method: "PATCH",
  headers: J(fx.agencyCookie),
  body: JSON.stringify({ status: "done" }),
});

const views = [
  { name: "dash-mobile-dark", cookie: fx.clientCookie, theme: "dark", w: 390, h: 900, path: `/portal/${fx.slug}` },
  { name: "dash-mobile-light", cookie: fx.clientCookie, theme: "light", w: 390, h: 900, path: `/portal/${fx.slug}` },
  { name: "dash-desktop", cookie: fx.clientCookie, theme: "dark", w: 1280, h: 900, path: `/portal/${fx.slug}` },
  { name: "project-client", cookie: fx.clientCookie, theme: "light", w: 390, h: 900, path: `/portal/${fx.slug}/projects/${project.id}` },
  { name: "project-agency", cookie: fx.agencyCookie, theme: "dark", w: 390, h: 1000, path: `/portal/${fx.slug}/projects/${project.id}` },
];

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const { mkdirSync } = await import("node:fs");
mkdirSync(OUT, { recursive: true });

for (const v of views) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 2,
  });
  await ctx.addCookies([
    { name: "lv_portal_session", value: v.cookie.split("=").slice(1).join("="), url: BASE },
    { name: "lv_theme", value: v.theme, url: BASE },
  ]);

  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 90)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 90));
  });

  const res = await page.goto(BASE + v.path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/${v.name}.png` });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  console.log(
    `${v.name.padEnd(20)} ${res.status()} hscroll=${overflow} errors=${errors.length} ${errors[0] ?? ""}`,
  );
  await ctx.close();
}

await browser.close();
console.log(`\nWritten to ${OUT}`);
