import test from "node:test";
import assert from "node:assert/strict";
import { resolveLiveTheme, readableOn, sanitizeLiveSettings, LIVE_PRESETS } from "../src/utils/liveThemes.js";

test("auto follows the app theme", () => {
  assert.equal(resolveLiveTheme({ preset: "auto" }, "dark").bg, "#020617");
  assert.equal(resolveLiveTheme({ preset: "auto" }, "light").bg, "#f1f5f9");
});

test("text colour is always readable on the chosen background", () => {
  assert.equal(readableOn("#ffffff"), "#0f172a");
  assert.equal(readableOn("#000000"), "#f8fafc");
  const dark = resolveLiveTheme({ preset: "custom", bg: "#111827", card: "#ffffff" });
  assert.equal(dark.fg, "#f8fafc");
  assert.equal(dark.cardfg, "#0f172a"); // light card on a dark page keeps dark text
});

test("sold is green and unsold is gray in every preset", () => {
  for (const p of LIVE_PRESETS.filter((x) => x.vars)) {
    assert.match(p.vars.sold, /^#(15803d|22c55e|4ade80)$/);
    assert.match(p.vars.unsold, /^#(6b7280|9ca3af|a3a3a3)$/);
  }
});

test("invalid stored settings fall back to safe defaults", () => {
  assert.deepEqual(sanitizeLiveSettings({ preset: "evil", bg: "red", card: "javascript:1" }), {
    preset: "auto", bg: "#0f172a", card: "#1e293b",
  });
  assert.equal(sanitizeLiveSettings({ preset: "custom", bg: "#112233", card: "#445566" }).bg, "#112233");
});
