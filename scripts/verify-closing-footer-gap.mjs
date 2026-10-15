import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

// Browser chrome must be represented: ordinary responsive emulation makes
// 100svh === 100dvh and missed this regression in the original CTA checks.
const base = process.env.CTA_BASE_URL || "http://127.0.0.1:3000";
const baseline = process.env.CTA_EXPECT_GAP === "1";
const isWebkit = process.env.CTA_WEBKIT === "1";
const output = `verification-output/footer-gap/${baseline ? "before" : isWebkit ? "webkit" : "after"}`;
const server = process.env.CTA_BASE_URL ? null : spawn(process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1"], { stdio: "inherit" });
let browser;
const results = [];
try {
  await mkdir(output, { recursive: true });
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try { ready = (await fetch(base)).ok; } catch {}
    if (ready) break;
    if (server && server.exitCode !== null) throw new Error("Server exited");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  assert.ok(ready, "Application responds");
  browser = await (isWebkit ? webkit : chromium).launch(isWebkit ? {} : { channel: "chromium" });
  const configs = baseline ? [{ width: 390, height: 844, difference: 96 }] : isWebkit ? [
    { width: 390, height: 844 }, { width: 390, height: 844, reduce: true },
  ] : [
    { width: 320, height: 568, difference: 64 },
    { width: 360, height: 800, difference: 96 },
    { width: 390, height: 844, difference: 96 },
    { width: 430, height: 932, difference: 112 },
    { width: 390, height: 844, difference: 96, reduce: true },
    { width: 844, height: 390 }, { width: 1440, height: 900 },
  ];
  for (const config of configs) {
    const context = await browser.newContext({ viewport: { width: config.width, height: config.height }, hasTouch: config.width < 900,
      isMobile: config.width < 900, reducedMotion: config.reduce ? "reduce" : "no-preference" });
    await context.addInitScript(() => sessionStorage.setItem("lionovart:exit-intent-shown", "1"));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    let cdp;
    if (config.difference) {
      cdp = await context.newCDPSession(page);
    }
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.locator("[data-process-lion-journey]").waitFor({ timeout: 60000 });
    await page.waitForTimeout(6500);
    if (cdp) {
      await cdp.send("Emulation.setSmallViewportHeightDifferenceOverride", { difference: config.difference });
      await cdp.send("Input.synthesizeScrollGesture", { x: 150, y: 400, yDistance: -600, speed: 1000, gestureSourceType: "touch" });
      await page.waitForTimeout(500);
    }
    const units = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;pointer-events:none;height:100svh";
      document.body.append(probe);
      const small = probe.clientHeight;
      probe.style.height = "100dvh";
      const dynamic = probe.clientHeight;
      probe.style.height = "100lvh";
      const large = probe.clientHeight;
      probe.remove();
      return { small, dynamic, large, viewport: innerHeight };
    });
    console.log("VIEWPORT", JSON.stringify({ config, units }));
    if (config.difference) assert.equal(units.dynamic - units.small, config.difference, "Real svh/dvh difference emulated");
    const scan = async label => {
      const samples = [];
      // Sample the last part of the pin, its release, and the footer in BOTH directions.
      const offsets = [180, 120, 80, 40, 0, -40, -80, -140, -220];
      for (const offset of [...offsets, ...offsets.slice().reverse()]) {
        await page.evaluate(offset => {
          const root = document.querySelector("[data-process-lion-journey]");
          window.scrollTo({ top: scrollY + root.getBoundingClientRect().bottom - innerHeight - offset, behavior: "instant" });
        }, offset);
        await page.waitForTimeout(180);
        samples.push(await page.evaluate(() => {
          const cta = document.querySelector("#closing-cta").getBoundingClientRect();
          const footer = document.querySelector("#footer-compact").getBoundingClientRect();
          return { y: scrollY, ctaBottom: cta.bottom, footerTop: footer.top,
            visibleGap: Math.max(0, Math.min(innerHeight, footer.top) - cta.bottom),
            static: document.querySelector("[data-process-lion-journey]").dataset.static };
        }));
      }
      const maxGap = Math.max(...samples.map(s => s.visibleGap));
      console.log(JSON.stringify({ label, config, units, maxGap, samples }));
      results.push({ label, config, units, maxGap, samples, errors });
      if (baseline) assert.ok(maxGap > 40, "Reproduce the reported visible band before the fix");
      else assert.ok(maxGap <= 1, `${label}: no visible scroll gap (maximum ${maxGap}px)`);
    };
    await scan("scroll-down-and-up");
    if (!isWebkit) {
      // Put the seam in view for visual comparison.
      await page.evaluate(() => {
        const root = document.querySelector("[data-process-lion-journey]");
        window.scrollTo({ top: scrollY + root.getBoundingClientRect().bottom - innerHeight + 70, behavior: "instant" });
      });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${output}/${config.width}${config.reduce ? "-reduce" : ""}.png` });
    }
    if (!baseline && config.width === 390 && !config.reduce) {
      // Browser bars return, then retract; orientation must also recover cleanly.
      if (cdp) {
        await cdp.send("Emulation.setSmallViewportHeightDifferenceOverride", { difference: 0 });
        await page.setViewportSize({ width: 390, height: 748 });
        await page.waitForTimeout(500);
        await scan("bars-expanded");
        await page.setViewportSize({ width: 390, height: 844 });
        await cdp.send("Emulation.setSmallViewportHeightDifferenceOverride", { difference: 96 });
        await page.waitForTimeout(500);
        await scan("bars-retracted-again");
        await cdp.send("Emulation.setSmallViewportHeightDifferenceOverride", { difference: 0 });
      }
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(500);
      await scan("landscape");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);
      await scan("portrait-restored");
      await page.locator("#closing-cta button").click();
      await page.getByRole("dialog", { name: "Nova — LIONOVART AI Strategist", exact: true }).waitFor();
      await page.keyboard.press("Escape");
    }
    assert.deepEqual(errors, [], "No uncaught page errors");
    await context.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser?.close();
  server?.kill("SIGTERM");
}
