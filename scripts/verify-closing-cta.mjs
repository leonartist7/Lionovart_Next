import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "playwright";
const base = "http://127.0.0.1:3000";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "-H", "127.0.0.1"], { stdio: "inherit" });
let browser;
const results = [];
try {
  await mkdir("verification-output/closing-cta", { recursive: true });
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try { ready = (await fetch(base)).ok; } catch {}
    if (ready) break;
    if (server.exitCode !== null) throw new Error("Dev server exited");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  assert.ok(ready, "Application responds");
  browser = await chromium.launch({ headless: true });
  for (const config of [
    {width:320,height:740,motion:"reduce"}, {width:390,height:844,motion:"reduce"},
    {width:768,height:1024,motion:"reduce"}, {width:1366,height:768,motion:"reduce"},
    {width:1440,height:900,motion:"no-preference"}, {width:390,height:844,motion:"no-preference",touch:true},
  ]) {
    const context = await browser.newContext({
      viewport: {width:config.width,height:config.height}, reducedMotion:config.motion,
      hasTouch:!!config.touch, isMobile:!!config.touch,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base + "/#closing-cta", { waitUntil:"domcontentloaded", timeout:120000 });
    const wall = page.locator("[data-closing-media-wall]");
    await wall.waitFor({timeout:90000});
    await page.waitForTimeout(7000);
    await page.evaluate(() => {
      const section = document.getElementById("closing-cta");
      const journey = section.closest("[data-static]");
      const element = journey || section;
      const rect = element.getBoundingClientRect();
      window.scrollTo({top:scrollY+rect.bottom-innerHeight,behavior:"instant"});
    });
    await page.waitForTimeout(2500);
    await page.locator("#closing-cta").scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    const active = config.motion === "reduce" ? "false" : "true";
    await page.waitForFunction(expected => document.querySelector("[data-closing-media-wall]")?.dataset.animationActive === expected, active, {timeout:15000});
    const count = await wall.locator("[data-media-wall-plane] > div").evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).display !== "none").length);
    assert.equal(count,config.width<640?12:18,"Responsive plane budget");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth+2),false,"No horizontal overflow");
    assert.equal(await wall.evaluate(n => getComputedStyle(n).pointerEvents),"none","Gallery does not intercept gestures");
    const before = await wall.locator("[data-media-wall-plane]").evaluate(n => getComputedStyle(n).transform);
    if (config.motion === "reduce") {
      await page.mouse.move(config.width*.85,config.height*.55);
      await page.waitForTimeout(500);
      assert.equal(await wall.locator("[data-media-wall-plane]").evaluate(n => getComputedStyle(n).transform),before,"Reduced motion stays static");
    } else if (!config.touch) {
      const box = await page.locator("#closing-cta").boundingBox();
      await page.mouse.move(box.x+box.width*.85,box.y+box.height*.35);
      await page.waitForTimeout(800);
      assert.notEqual(await wall.locator("[data-media-wall-plane]").evaluate(n => getComputedStyle(n).transform),before,"Pointer changes perspective");
    }
    await page.waitForFunction(() => document.querySelectorAll('[data-closing-media-wall] img[data-loaded="true"]').length >= 3, {}, {timeout:30000});
    await page.screenshot({path:`verification-output/closing-cta/${config.width}-${config.motion}.png`});
    if ((config.width===390 && config.motion==="reduce") || config.width===1440) {
      const shot = await page.screenshot({type:"jpeg",quality:45});
      console.log(`CTA_PREVIEW_${config.width}:${shot.toString("base64")}`);
    }
    const button = page.locator("#closing-cta button").first();
    await button.focus();
    assert.ok(await button.evaluate(n => n === document.activeElement),"CTA accepts keyboard focus");
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog",{name:"Nova — LIONOVART AI Strategist",exact:true});
    await dialog.waitFor({state:"visible",timeout:30000});
    const opened = true;
    await page.keyboard.press("Escape");
    results.push({...config,planes:count,active,buttonOpenedDialog:opened,errors});
    // The animation must stop after the CTA leaves the viewport.
    await page.evaluate(() => window.scrollTo({top:0,behavior:"instant"}));
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => document.querySelector("[data-closing-media-wall]")?.dataset.animationActive === "false",{},{timeout:10000});
    assert.deepEqual(errors,[],"No uncaught browser errors");
    await context.close();
    console.log("PASS",JSON.stringify(results.at(-1)));
  }
  await writeFile("verification-output/closing-cta/results.json",JSON.stringify(results,null,2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
