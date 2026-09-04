import { describe, expect, it } from "vitest";
import { calculateQuote, suggestThreshold, validateSize, type QuoteInput } from "./pricing";

const ref: QuoteInput = {
  width: 3500,
  height: 2178,
  finish: "white",
  markupPercent: 0,
  threshold: "t37",
};

describe("reference size 3500 x 2178 mm, white", () => {
  it("reproduces the Slide material total from the cost sheet", () => {
    const q = calculateQuote("slide", ref);
    expect(q.materials).toBeCloseTo(1770.48, 1);
    expect(q.labour).toBe(400);
    expect(q.cost).toBeCloseTo(2170.48, 1);
  });

  it("reproduces the HST material total with the corrected 20 EUR/m frame price", () => {
    const q = calculateQuote("hst", ref);
    // 2266.61 of profiles/steel/glass etc. + 900 threshold rail
    expect(q.materials + q.threshold).toBeCloseTo(3166.61, 1);
    expect(q.labour).toBe(600);
    expect(q.cost).toBeCloseTo(3766.61, 1);
  });
});

describe("scaling", () => {
  it("grows the price with size", () => {
    const small = calculateQuote("slide", { ...ref, width: 1500, height: 1500 });
    const large = calculateQuote("slide", { ...ref, width: 4500, height: 2400 });
    expect(small.cost).toBeLessThan(large.cost);
  });

  it("charges more for laminated finishes", () => {
    const white = calculateQuote("slide", ref).materials;
    const one = calculateQuote("slide", { ...ref, finish: "oneSide" }).materials;
    const both = calculateQuote("slide", { ...ref, finish: "bothSides" }).materials;
    expect(one).toBeGreaterThan(white);
    expect(both).toBeGreaterThan(one);
  });
});

describe("markup and VAT", () => {
  it("applies markup then 22 % VAT", () => {
    const q = calculateQuote("slide", { ...ref, markupPercent: 25 });
    expect(q.netPrice).toBeCloseTo(q.cost * 1.25, 6);
    expect(q.grossPrice).toBeCloseTo(q.netPrice * 1.22, 6);
  });
});

describe("threshold and validation", () => {
  it("suggests a threshold length from the width", () => {
    expect(suggestThreshold(2400)).toBe("t25");
    expect(suggestThreshold(2900)).toBe("t30");
    expect(suggestThreshold(3500)).toBe("t37");
  });

  it("never charges a threshold on Slide", () => {
    expect(calculateQuote("slide", ref).threshold).toBe(0);
  });

  it("rejects out-of-range sizes", () => {
    expect(validateSize(1400, 2000)).toMatch(/Width/);
    expect(validateSize(2000, 2500)).toMatch(/Height/);
    expect(validateSize(2000, 2000)).toBeNull();
  });
});
