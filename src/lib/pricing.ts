/**
 * Sliding door quick-offer pricing.
 *
 * All white unit prices and reference quantities come from the customer's
 * material cost sheet for the reference door 3500 x 2178 mm (half opening).
 * Each line scales its quantity by the geometric dimension that drives it,
 * calibrated so the reference size returns exactly the sheet quantity.
 */

export type SystemId = "slide" | "hst";
export type Finish = "white" | "oneSide" | "bothSides";
export type ThresholdId = "t25" | "t30" | "t37";

export type Driver =
  | "framePerimeter"
  | "sashPerimeter"
  | "height"
  | "width"
  | "glassArea"
  | "fixed";

export type FinishFamily = "frame" | "sash" | "bead" | "mullion" | "none";

export type CostGroup =
  | "profiles"
  | "reinforcement"
  | "rails"
  | "seals"
  | "glass"
  | "hardware";

export interface CostLine {
  id: string;
  label: string;
  group: CostGroup;
  /** White unit price in EUR (per m, per m2 or per piece). */
  unitPrice: number;
  /** Quantity at the reference size 3500 x 2178 mm. */
  refQty: number;
  driver: Driver;
  finishFamily: FinishFamily;
}

/* ---------------------------------------------------------------- constants */

export const LIMITS = {
  minWidth: 1500,
  maxWidth: 4500,
  minHeight: 1500,
  maxHeight: 2400,
} as const;

export const REFERENCE = { width: 3.5, height: 2.178 } as const;

const REF_DRIVERS = {
  framePerimeter: 2 * (REFERENCE.width + REFERENCE.height), // 11.356 m
  sashPerimeter: REFERENCE.width + 2 * REFERENCE.height, // 7.856 m
  height: REFERENCE.height, // 2.178 m
  width: REFERENCE.width, // 3.5 m
  glassArea: 6.5884, // m2
  fixed: 1,
} as const;

/** Glass area as a share of the outer door area at the reference size. */
const GLASS_AREA_FACTOR = REF_DRIVERS.glassArea / (REFERENCE.width * REFERENCE.height);

/**
 * Finish multipliers taken from the Rehau SYNEGO price list rows
 * (white / einseitig / beidseitig) for each profile family.
 */
export const FINISH_MULTIPLIERS: Record<FinishFamily, Record<Finish, number>> = {
  // Zarge 8.48 / 10.59 / 12.27
  frame: { white: 1, oneSide: 10.59 / 8.48, bothSides: 12.27 / 8.48 },
  // Flügel 8.85 / 11.37 / 13.05
  sash: { white: 1, oneSide: 11.37 / 8.85, bothSides: 13.05 / 8.85 },
  // Zargenleiste 3.31 / 5.40 / 7.09
  bead: { white: 1, oneSide: 5.4 / 3.31, bothSides: 7.09 / 3.31 },
  // Sprosse 96 7.36 / 11.00 / 14.00
  mullion: { white: 1, oneSide: 11 / 7.36, bothSides: 14 / 7.36 },
  none: { white: 1, oneSide: 1, bothSides: 1 },
};

export const FINISH_LABELS: Record<Finish, string> = {
  white: "White both sides",
  oneSide: "White inside / coloured outside",
  bothSides: "Coloured both sides",
};

export const THRESHOLDS: Record<ThresholdId, { label: string; lengthM: number; price: number }> = {
  t25: { label: "2.5 m", lengthM: 2.5, price: 600 },
  t30: { label: "3.0 m", lengthM: 3.0, price: 750 },
  t37: { label: "3.7 m", lengthM: 3.7, price: 900 },
};

export const LABOUR: Record<SystemId, number> = { slide: 400, hst: 600 };

export const VAT_RATE = 0.22;
export const DEFAULT_MARKUP = 25;

export const GROUP_LABELS: Record<CostGroup, string> = {
  profiles: "PVC profiles",
  reinforcement: "Steel reinforcement",
  rails: "Running rails",
  seals: "Seals & beads",
  glass: "Glass unit",
  hardware: "Hardware & fixings",
};

/* -------------------------------------------------------------- cost tables */

const SHARED_LINES: CostLine[] = [
  {
    id: "leng",
    label: "Frame profile (leng)",
    group: "profiles",
    unitPrice: 10.35,
    refQty: 12.06,
    driver: "framePerimeter",
    finishFamily: "frame",
  },
  {
    id: "post",
    label: "Mullion profile (post)",
    group: "profiles",
    unitPrice: 9,
    refQty: 2.22,
    driver: "height",
    finishFamily: "mullion",
  },
  {
    id: "kate",
    label: "Cover profile (kate)",
    group: "profiles",
    unitPrice: 4.4,
    refQty: 16.56,
    driver: "framePerimeter",
    finishFamily: "bead",
  },
  {
    id: "kate2",
    label: "Cover profile (kate2)",
    group: "profiles",
    unitPrice: 3.5,
    refQty: 17.56,
    driver: "framePerimeter",
    finishFamily: "bead",
  },
  {
    id: "klaasiliist",
    label: "Glazing bead (klaasiliist)",
    group: "seals",
    unitPrice: 1,
    refQty: 15.56,
    driver: "sashPerimeter",
    finishFamily: "bead",
  },
  {
    id: "rails",
    label: "Top & bottom rails",
    group: "rails",
    unitPrice: 40,
    refQty: 3.71,
    driver: "width",
    finishFamily: "none",
  },
  {
    id: "klaasitihend",
    label: "Glazing seal 865012",
    group: "seals",
    unitPrice: 4,
    refQty: 15.73,
    driver: "sashPerimeter",
    finishFamily: "none",
  },
  {
    id: "raamitihend",
    label: "Sash seal 864952",
    group: "seals",
    unitPrice: 3,
    refQty: 16.42,
    driver: "framePerimeter",
    finishFamily: "none",
  },
  {
    id: "raud-post",
    label: "Mullion reinforcement",
    group: "reinforcement",
    unitPrice: 4,
    refQty: 2.06,
    driver: "height",
    finishFamily: "none",
  },
  {
    id: "raud-leng",
    label: "Frame reinforcement",
    group: "reinforcement",
    unitPrice: 17,
    refQty: 18.98,
    driver: "framePerimeter",
    finishFamily: "none",
  },
  {
    id: "handle",
    label: "Hardware set & handle",
    group: "hardware",
    unitPrice: 200,
    refQty: 1,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "jupid",
    label: "Small parts (jupid)",
    group: "hardware",
    unitPrice: 50,
    refQty: 2,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "248608",
    label: "Mullion connectors 248608",
    group: "hardware",
    unitPrice: 4,
    refQty: 2,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "klamber",
    label: "Clamps 277/3",
    group: "hardware",
    unitPrice: 1.5,
    refQty: 18,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "tiltini",
    label: "Glazing bridges",
    group: "hardware",
    unitPrice: 3,
    refQty: 8,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "268651",
    label: "Keeper holders 268651",
    group: "hardware",
    unitPrice: 5,
    refQty: 8,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "screw-5x40",
    label: "Screws 5x40",
    group: "hardware",
    unitPrice: 15,
    refQty: 2,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "screw-63x70",
    label: "Screws 6.3x70",
    group: "hardware",
    unitPrice: 15,
    refQty: 2,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "screw-39x16",
    label: "Screws 3.9x16",
    group: "hardware",
    unitPrice: 0.004,
    refQty: 79,
    driver: "fixed",
    finishFamily: "none",
  },
  {
    id: "glass",
    label: "Glass 4s-4-4s 18/16 Arg, Rw35dB",
    group: "glass",
    unitPrice: 51.25,
    refQty: REF_DRIVERS.glassArea,
    driver: "glassArea",
    finishFamily: "none",
  },
];

const SLIDE_ONLY: CostLine[] = [
  {
    id: "raam",
    label: "Sash profile (raam)",
    group: "profiles",
    unitPrice: 10.8,
    refQty: 8.08,
    driver: "sashPerimeter",
    finishFamily: "sash",
  },
];

const HST_ONLY: CostLine[] = [
  {
    id: "raam",
    label: "Sash profile 1 (raam)",
    group: "profiles",
    unitPrice: 12,
    refQty: 8.08,
    driver: "sashPerimeter",
    finishFamily: "sash",
  },
  {
    id: "raam2",
    label: "Sash profile 2 (raam2)",
    group: "profiles",
    unitPrice: 12,
    refQty: 9.08,
    driver: "sashPerimeter",
    finishFamily: "sash",
  },
  {
    id: "raud-raam",
    label: "Sash 1 reinforcement",
    group: "reinforcement",
    unitPrice: 6.1,
    refQty: 19.98,
    driver: "sashPerimeter",
    finishFamily: "none",
  },
  {
    id: "raud-raam2",
    label: "Sash 2 reinforcement",
    group: "reinforcement",
    unitPrice: 6,
    refQty: 20.98,
    driver: "sashPerimeter",
    finishFamily: "none",
  },
];

/**
 * HST-specific white unit prices from the cost sheet's HST column.
 * The sheet's 2 EUR/m frame price is a typo, corrected to 20 EUR/m.
 */
const HST_PRICE_OVERRIDES: Record<string, number> = { leng: 20, post: 15 };


export const SYSTEM_LABELS: Record<SystemId, string> = {
  slide: "Rehau Synego Slide",
  hst: "Rehau Synego HST",
};

export const SYSTEM_NOTES: Record<SystemId, string> = {
  slide: "One sliding sash, mullion, no separate threshold.",
  hst: "Two sashes, no separate threshold profile, delivered threshold rail included.",
};

export function getCostLines(system: SystemId): CostLine[] {
  const extra = system === "slide" ? SLIDE_ONLY : HST_ONLY;
  const lines = [...SHARED_LINES, ...extra];
  if (system === "slide") return lines;
  return lines.map((line) => {
    const override = HST_PRICE_OVERRIDES[line.id];
    return override === undefined ? line : { ...line, unitPrice: override };
  });
}


/* ----------------------------------------------------------------- calculate */

export interface QuoteInput {
  /** Width in millimetres. */
  width: number;
  /** Height in millimetres. */
  height: number;
  finish: Finish;
  /** Markup percentage, e.g. 25 for +25 %. */
  markupPercent: number;
  /** HST threshold rail; ignored for Slide. Derived from the width when omitted. */
  threshold?: ThresholdId | undefined;
}

export interface QuoteLine extends CostLine {
  qty: number;
  effectiveUnitPrice: number;
  total: number;
}

export interface Quote {
  system: SystemId;
  /** False when HST is wider than the longest threshold rail. */
  thresholdAvailable: boolean;
  lines: QuoteLine[];
  groups: { group: CostGroup; label: string; total: number }[];
  materials: number;
  threshold: number;
  labour: number;
  cost: number;
  markup: number;
  netPrice: number;
  vat: number;
  grossPrice: number;
}

function driverValue(driver: Driver, w: number, h: number): number {
  switch (driver) {
    case "framePerimeter":
      return 2 * (w + h);
    case "sashPerimeter":
      return w + 2 * h;
    case "height":
      return h;
    case "width":
      return w;
    case "glassArea":
      return w * h * GLASS_AREA_FACTOR;
    case "fixed":
      return 1;
  }
}

export function suggestThreshold(widthMm: number): ThresholdId {
  const w = widthMm / 1000;
  if (w <= 2.5) return "t25";
  if (w <= 3.0) return "t30";
  return "t37";
}

/**
 * The threshold rail comes in three delivered lengths and the whole rail is
 * charged. Openings wider than the longest rail cannot be priced automatically.
 */
export function thresholdForWidth(widthMm: number): ThresholdId | null {
  if (!Number.isFinite(widthMm)) return null;
  if (widthMm <= 2500) return "t25";
  if (widthMm <= 3000) return "t30";
  if (widthMm <= 3700) return "t37";
  return null;
}

export function validateSize(widthMm: number, heightMm: number): string | null {
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm)) return "Enter both dimensions.";
  if (widthMm < LIMITS.minWidth || widthMm > LIMITS.maxWidth)
    return `Width must be between ${LIMITS.minWidth} and ${LIMITS.maxWidth} mm.`;
  if (heightMm < LIMITS.minHeight || heightMm > LIMITS.maxHeight)
    return `Height must be between ${LIMITS.minHeight} and ${LIMITS.maxHeight} mm.`;
  return null;
}

export function calculateQuote(system: SystemId, input: QuoteInput): Quote {
  const w = input.width / 1000;
  const h = input.height / 1000;

  const lines: QuoteLine[] = getCostLines(system).map((line) => {
    const scale = driverValue(line.driver, w, h) / REF_DRIVERS[line.driver];
    const qty = line.refQty * scale;
    const effectiveUnitPrice =
      line.unitPrice * FINISH_MULTIPLIERS[line.finishFamily][input.finish];
    return { ...line, qty, effectiveUnitPrice, total: qty * effectiveUnitPrice };
  });

  const materials = lines.reduce((sum, l) => sum + l.total, 0);
  const railId = input.threshold ?? thresholdForWidth(input.width);
  const thresholdAvailable = system === "slide" || railId !== null;
  const threshold = system === "hst" && railId ? THRESHOLDS[railId].price : 0;
  const labour = LABOUR[system];
  const cost = materials + threshold + labour;
  const markup = cost * (input.markupPercent / 100);
  const netPrice = cost + markup;
  const vat = netPrice * VAT_RATE;

  const groupOrder: CostGroup[] = [
    "profiles",
    "reinforcement",
    "rails",
    "seals",
    "glass",
    "hardware",
  ];
  const groups = groupOrder
    .map((group) => ({
      group,
      label: GROUP_LABELS[group],
      total: lines.filter((l) => l.group === group).reduce((s, l) => s + l.total, 0),
    }))
    .filter((g) => g.total > 0);

  return {
    system,
    thresholdAvailable,
    lines,
    groups,
    materials,
    threshold,
    labour,
    cost,
    markup,
    netPrice,
    vat,
    grossPrice: netPrice + vat,
  };
}

export const eur = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
