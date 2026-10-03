import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import WebSocket from "ws";

const base = process.env.PORTAL_BASE ?? "http://localhost:3000";
const server = spawn(process.execPath, ["server.js"], { stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });
const run = (args) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, args, { stdio: "inherit", env: process.env });
  child.once("error", reject);
  child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Verification exited ${code}`)));
});
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error("Server exited before becoming ready");
    try { ready = (await fetch(base + "/portal/demo")).ok; } catch {}
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  assert.ok(ready, "Production server becomes ready");
  await run(["scripts/portal-verify/verify.mjs"]);
  const tokenResponse = await fetch(base + "/api/strategist/session-token", {
    method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ conversationId: "ci-voice-upgrade" }),
  });
  const { token } = await tokenResponse.json();
  assert.ok(token, "NOVA mints an authenticated upgrade token");
  await new Promise((resolve, reject) => {
    const socket = new WebSocket(base.replace(/^http/, "ws") + "/api/strategist/live?t=" + encodeURIComponent(token), {
      origin: "https://lionovart.com", headers: { "x-forwarded-for": "127.0.0.1" }, handshakeTimeout: 10000,
    });
    socket.once("error", reject);
    socket.once("open", () => { socket.close(); resolve(); });
  });
  console.log("PASS: NOVA authenticated WebSocket upgrade (no model session or external API call)");
  await mkdir("verification-output", { recursive: true });
  browser = await chromium.launch({ headless: true });
  const results = [];
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of ["/", "/about", "/portal/demo/content"]) {
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
      assert.equal(response.status(), 200, `${route} responds at ${width}px`);
      await page.waitForTimeout(7000);
      if (route === "/") {
        const comparison = page.locator('[data-nova-section="comparison"]');
        await comparison.scrollIntoViewIfNeeded();
        assert.equal(await comparison.locator("table").count(), 1, "Compact comparison remains addressable by NOVA");
        assert.ok(await page.locator("[data-gold-threads]").count() > 0, "Gold decoration is mounted");
      }
      const overflowing = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
      assert.equal(overflowing, false, `No horizontal overflow on ${route} at ${width}px`);
      const filename = `${width}-${route.replaceAll("/", "_") || "home"}.png`;
      await page.screenshot({ path: "verification-output/" + filename, fullPage: true });
      results.push({ width, route, status: response.status(), horizontalOverflow: overflowing });
    }
    assert.deepEqual(errors, [], `No uncaught browser errors at ${width}px`);
    await context.close();
  }
  await writeFile("verification-output/results.json", JSON.stringify(results, null, 2) + "\n");
  console.log("PASS: production runtime, portal suite and twelve browser viewport checks");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
