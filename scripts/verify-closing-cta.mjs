import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
const base = process.env.CTA_BASE_URL || "http://127.0.0.1:3000";
const server = process.env.CTA_BASE_URL ? null : spawn(process.execPath, ["node_modules/next/dist/bin/next", ...(process.env.CTA_PRODUCTION ? ["start"] : ["dev", "--webpack"]), "-H", "127.0.0.1"], { stdio: "inherit" });
let browser;
const results = [];
try {
  await mkdir("verification-output/closing-cta", { recursive: true });
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try { ready = (await fetch(base)).ok; } catch {}
    if (ready) break;
    if (server && server.exitCode !== null) throw new Error("Dev server exited");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  assert.ok(ready, "Application responds");
  browser = await (process.env.CTA_WEBKIT ? webkit : chromium).launch({ headless: true });
  for (const config of [
    {width:320,height:568,motion:"reduce"}, {width:390,height:844,motion:"reduce"},
    {width:768,height:1024,motion:"reduce"}, {width:1366,height:768,motion:"reduce"},
    {width:1440,height:900,motion:"no-preference"},
    {width:320,height:568,motion:"no-preference",touch:true},
    {width:360,height:640,motion:"no-preference",touch:true},
    {width:390,height:844,motion:"no-preference",touch:true},
    {width:430,height:932,motion:"no-preference",touch:true},
    {width:844,height:390,motion:"no-preference",touch:true},
    {width:390,height:844,motion:"no-preference",touch:true,saveData:true},
  ].filter(config => !process.env.CTA_WEBKIT || (config.width===390 && !config.saveData)).filter(config => !process.env.CTA_VISUAL_ONLY || config.width === 390 || (config.width === 320 && config.motion === "reduce") || config.width === 1440)) {
    const context = await browser.newContext({
      viewport: {width:config.width,height:config.height}, reducedMotion:config.motion,
      hasTouch:!!config.touch, isMobile:!!config.touch,
    });
    if (config.saveData) await context.addInitScript(() => {
      const network = new EventTarget();
      network.saveData = true;
      Object.defineProperty(navigator, "connection", {configurable:true, value:network});
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base + "/#closing-cta", { waitUntil:"domcontentloaded", timeout:120000 });
    const dismissExit = async () => {
      const prompt = page.getByRole("dialog",{name:"Get a free brand audit",exact:true});
      if (await prompt.isVisible()) {
        await prompt.getByRole("button",{name:"Close",exact:true}).click();
        await prompt.waitFor({state:"hidden"});
      }
    };
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
    await dismissExit();
    const active = config.motion === "reduce" || config.saveData ? "false" : "true";
    await page.waitForFunction(expected => document.querySelector("[data-closing-media-wall]")?.dataset.animationActive === expected, active, {timeout:15000});
    const count = await wall.locator("[data-media-wall-plane] > div").evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).display !== "none").length);
    assert.equal(count,config.width<640?8:18,"Responsive plane budget");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth+2),false,"No horizontal overflow");
    assert.equal(await wall.evaluate(n => getComputedStyle(n).pointerEvents),"none","Gallery does not intercept gestures");
    const before = await wall.locator("[data-media-wall-plane]").evaluate(n => getComputedStyle(n).transform);
    if (active === "false") {
      await page.mouse.move(config.width*.85,config.height*.55);
      await page.waitForTimeout(500);
      assert.equal(await wall.locator("[data-media-wall-plane]").evaluate(n => getComputedStyle(n).transform),before,"Reduced motion stays static");
    } else if (config.touch) {
      await page.waitForTimeout(1500);
      assert.notEqual(await wall.locator("[data-media-wall-plane]").evaluate(n => getComputedStyle(n).transform),before,"Touch gallery drifts without pointer input");
      const mutations = await wall.locator("[data-media-wall-plane]").evaluate(n => new Promise(resolve => {
        let count=0; const observer=new MutationObserver(records=>{count+=records.length});
        observer.observe(n,{attributes:true,attributeFilter:["style"]});
        setTimeout(()=>{observer.disconnect();resolve(count)},1500);
      }));
      assert.equal(mutations,0,"Phone gallery has no per-frame JS style writes");
    } else if (!config.touch) {
      const box = await page.locator("#closing-cta").boundingBox();
      await page.mouse.move(box.x+box.width*.85,box.y+box.height*.35);
      await page.waitForTimeout(800);
      assert.notEqual(await wall.locator("[data-media-wall-plane]").evaluate(n => getComputedStyle(n).transform),before,"Pointer changes perspective");
    }
    if (config.width < 640 || config.touch || active === "false") {
      assert.equal(await page.locator("#closing-cta canvas").count(),0,"Constrained CTA creates no button GPU context");
    }
    const wordBefore = await page.locator("[data-closing-word]").getAttribute("data-closing-word");
    await page.waitForTimeout(4800);
    const wordAfter = await page.locator("[data-closing-word]").getAttribute("data-closing-word");
    if (active === "false") assert.equal(wordAfter,wordBefore,"Static preferences stop cycling");
    else assert.notEqual(wordAfter,wordBefore,"Words continue cycling while reading");
    const model = await page.locator("[data-process-lion-viewport]").evaluate(n => ({
      ready:n.dataset.ready, canvas:n.querySelector("canvas")?.parentElement?.dataset,
      size:n.querySelector("canvas") ? [n.querySelector("canvas").width,n.querySelector("canvas").height] : null,
    }));
    if (model.ready === "true") assert.equal(model.canvas.animationActive,"false","Settled lion renders on demand");
    if (config.saveData) assert.equal(model.size,null,"Data saving avoids the 3D download and context");
    await dismissExit();
    await page.waitForFunction(() => document.querySelectorAll('[data-closing-media-wall] img[data-loaded="true"]').length >= 3, {}, {timeout:30000});
    // Linux WebKit crashes during screenshot compositing on this long existing page.
    // Keep its behavioral checks; Chromium owns the visual captures.
    if (!process.env.CTA_WEBKIT) await page.screenshot({path:`verification-output/closing-cta/${config.width}-${config.motion}${config.saveData?"-save":""}.png`});
    const button = page.locator("#closing-cta button").first();
    await button.focus();
    assert.ok(await button.evaluate(n => n === document.activeElement),"CTA accepts keyboard focus");
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog",{name:"Nova — LIONOVART AI Strategist",exact:true});
    await dialog.waitFor({state:"visible",timeout:30000});
    const opened = true;
    await page.keyboard.press("Escape");
    results.push({...config,engine:process.env.CTA_WEBKIT?"webkit":"chromium",planes:count,active,model,buttonOpenedDialog:opened,errors});
    // The animation must stop after the CTA leaves the viewport.
    await page.evaluate(() => window.scrollTo({top:0,behavior:"instant"}));
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => document.querySelector("[data-closing-media-wall]")?.dataset.animationActive === "false",{},{timeout:10000});
    const pausedWord = await page.locator("[data-closing-word]").getAttribute("data-closing-word");
    await page.waitForTimeout(4600);
    assert.equal(await page.locator("[data-closing-word]").getAttribute("data-closing-word"),pausedWord,"Offscreen words stop cycling");
    if (config.width === 390 && config.touch && !config.saveData) {
      // Re-enter, rotate to a short viewport and back, then change the OS preference live.
      const returnToCTA = async () => {
        await page.evaluate(() => {
          const e=document.querySelector("[data-process-lion-journey]");
          window.scrollTo({top:scrollY+e.getBoundingClientRect().bottom-innerHeight,behavior:"instant"});
        });
        await page.locator("#closing-cta").scrollIntoViewIfNeeded();
      };
      await returnToCTA();
      await page.waitForFunction(()=>document.querySelector("[data-closing-media-wall]")?.dataset.animationActive==="true");
      await page.setViewportSize({width:844,height:390});
      await page.waitForFunction(()=>document.querySelector("[data-process-lion-journey]")?.dataset.static==="true");
      await returnToCTA();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,"Landscape has no horizontal overflow");
      await page.setViewportSize({width:390,height:844});
      await page.waitForTimeout(500);
      await returnToCTA();
      await page.emulateMedia({reducedMotion:"reduce"});
      await page.waitForFunction(()=>document.querySelector("[data-closing-media-wall]")?.dataset.motion==="static");
      assert.equal(await page.locator("#closing-cta canvas").count(),0,"Live reduced motion has no CTA shader");
      await page.emulateMedia({reducedMotion:"no-preference"});
      await returnToCTA();
      await page.waitForFunction(()=>document.querySelector("[data-closing-media-wall]")?.dataset.animationActive==="true");
    }
    assert.deepEqual(errors,[],"No uncaught browser errors");
    await context.close();
    console.log("PASS",JSON.stringify(results.at(-1)));
  }
  await writeFile("verification-output/closing-cta/results.json",JSON.stringify(results,null,2));
} finally {
  await browser?.close();
  server?.kill("SIGTERM");
}
