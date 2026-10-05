import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  resolveSectionDestination,
  publicPath,
} = require("../nova-brain/section-destinations.js");

test("founder requests leave the homepage for the dedicated story", () => {
  assert.deepEqual(resolveSectionDestination("founder", "/"), {
    pathname: "/about",
    target: "founder",
  });
  assert.deepEqual(resolveSectionDestination("about", "/fr"), {
    pathname: "/about",
    target: "about-content",
  });
});
test("home destinations work when requested from a localized About page", () => {
  assert.deepEqual(resolveSectionDestination("services", "/ko/about"), {
    pathname: "/",
    target: "services",
  });
  assert.deepEqual(resolveSectionDestination("testimonials", "/es/about"), {
    pathname: "/",
    target: "client-experience",
  });
});
test("legacy work aliases point to the actual selected-work section", () => {
  for (const id of ["showcase", "portfolio", "selected-work"])
    assert.deepEqual(resolveSectionDestination(id, "/about"), {
      pathname: "/",
      target: "selected-work",
    });
});
test("comparison chooses the detailed guide only while on About", () => {
  assert.deepEqual(resolveSectionDestination("comparison", "/fr/about/"), {
    pathname: "/about",
    target: "working-models",
  });
  assert.deepEqual(resolveSectionDestination("comparison", "/fr"), {
    pathname: "/",
    target: "comparison",
  });
});
test("closing invitation stays on the current About page", () => {
  assert.deepEqual(resolveSectionDestination("closing-cta", "/ja/about"), {
    pathname: "/about",
    target: "closing-cta",
  });
});
test("unknown tool destinations and prototype keys fail without building a selector", () => {
  for (const id of ["missing", "__proto__", "constructor", 'a\"]'])
    assert.equal(resolveSectionDestination(id, "/"), null);
});
test("locale normalization respects boundaries and all six supported codes", () => {
  for (const code of ["en", "fr", "es", "it", "ja", "ko"]) {
    assert.equal(publicPath(`/${code}/about`), "/about");
    assert.equal(publicPath(`/${code}`), "/");
  }
  assert.equal(publicPath("/french/about"), "/french/about");
});
