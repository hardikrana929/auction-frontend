import test from "node:test";
import assert from "node:assert/strict";
import { formatShortAmount, formatRupeesWithShort } from "../src/utils/formatAmount.js";

test("10000 -> 10K, 100000 -> 1 Lac, 10000000 -> 1 Cr", () => {
  assert.equal(formatShortAmount(10000), "10K");
  assert.equal(formatShortAmount(100000), "1 Lac");
  assert.equal(formatShortAmount(10000000), "1 Cr");
});

test("fractions and edge values", () => {
  assert.equal(formatShortAmount(150000), "1.5 Lac");
  assert.equal(formatShortAmount(12500000), "1.25 Cr");
  assert.equal(formatShortAmount("2500"), "2.5K");
  assert.equal(formatShortAmount(999), "999");
  assert.equal(formatShortAmount(""), "");
  assert.equal(formatShortAmount(-5), "");
});

test("rupees with short form", () => {
  assert.equal(formatRupeesWithShort(100000), "₹1,00,000 (1 Lac)");
  assert.equal(formatRupeesWithShort(500), "₹500");
});
