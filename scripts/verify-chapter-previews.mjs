import assert from "node:assert/strict";
import { chromium } from "/tmp/story-qa/node_modules/playwright/index.mjs";

const base = process.env.STORY_PREVIEW ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const selectorByChapter = {
  innovation: "[data-brand-statement]",
  "service-cards": "[data-opening-static] [data-benefit-card]",
  "selected-work": "[data-static-project]",
};

async function open(page, chapter) {
  const path = "/review/" + chapter;
  const response = await page.goto(base + path + "?shape=hexagon", { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  assert.equal(new URL(page.url()).pathname, path);
  assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
  await page.waitForFunction(() => document.documentElement.dataset.introResult === "internal-page");
}

try {
  const gallery = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await open(gallery, "selected-work");
  await gallery.waitForFunction(() => {
    const stage = document.querySelector("[data-gallery-stage]");
    const progress = Number(stage?.getAttribute("data-gallery-journey"));
    return Math.abs(progress - .14) < .02 && stage?.getAttribute("data-chapter-active") === "true";
  });
  await gallery.mouse.wheel(0, 350);
  await gallery.waitForFunction(() => Number(document.querySelector("[data-gallery-stage]")?.getAttribute("data-gallery-journey")) > .155);
  await gallery.close();

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  for (const [chapter, selector] of Object.entries(selectorByChapter)) {
    await open(reduced, chapter);
    await reduced.waitForFunction(selector => {
      const node = document.querySelector(selector);
      if (!node || document.querySelector("[data-service-world]")?.getAttribute("data-story-static") !== "true") return false;
      const box = node.getBoundingClientRect();
      return scrollY > innerHeight && box.top >= 0 && box.top < innerHeight && box.height > 0;
    }, selector);
  }
  await reduced.close();
  console.log("Verified the Selected Work landing, continued scrolling, and all three reduced-motion review routes.");
} finally {
  await browser.close();
}
