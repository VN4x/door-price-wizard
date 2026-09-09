import { GLASS_RULES } from "@/lib/production";
import type { DoorLine, GlassAddonId, GlazingId, GlazingPackage } from "@/types";

/**
 * Nobody glazes a large sliding door with two panes in Estonia any more, so the
 * standard package is a 3-glass unit. Everything else is a surcharge per square
 * metre of door area.
 */
export const GLAZING_PACKAGES: Record<GlazingId, GlazingPackage> = {
  std3: {
    id: "std3",
    label: "Standard 3-glass",
    description: "4-16Ar-4-16Ar-4s, Ug 0.6 W/m²K",
    upliftPerM2: 0,
  },
  tinted3: {
    id: "tinted3",
    label: "Tinted 3-glass",
    description: "Tinted outer pane, Ug 0.6 W/m²K",
    upliftPerM2: 30,
  },
  quiet36: {
    id: "quiet36",
    label: "Quiet 3-glass, 36 dB",
    description: "Laminated acoustic outer pane, Rw 36 dB",
    upliftPerM2: 24,
  },
  quiet40: {
    id: "quiet40",
    label: "Quiet 3-glass, 40 dB",
    description: "Laminated acoustic both sides, Rw 40 dB",
    upliftPerM2: 60,
  },
};

export const GLAZING_LIST = Object.values(GLAZING_PACKAGES);

export interface GlassAddon {
  id: GlassAddonId;
  label: string;
  hint: string;
  /** Surcharge per square metre of door area, EUR incl. VAT. */
  perM2: number;
  /** Only one option of a group can be chosen at a time. */
  group?: "solar";
  /** Read more on our glass pages. */
  infoUrl?: string;
}

const GLASS_INFO = "https://kvaliteetaken.ee/klaasid";
const SOLAR_INFO = "https://kvaliteetaken.ee/klaasid#paikesekaitse";

export const GLASS_ADDONS: Record<GlassAddonId, GlassAddon> = {
  warmSpacer: {
    id: "warmSpacer",
    label: "Warm spacer",
    hint: "Warm edge instead of aluminium, less condensation at the glass edge",
    perM2: 15,
  },
  safetyOutside: {
    id: "safetyOutside",
    label: "Safety glass, outside",
    hint: "Toughened or laminated outer pane",
    perM2: 40,
    infoUrl: GLASS_INFO,
  },
  safetyInside: {
    id: "safetyInside",
    label: "Safety glass, inside",
    hint: "Toughened or laminated inner pane",
    perM2: 40,
    infoUrl: GLASS_INFO,
  },
  solar039: {
    id: "solar039",
    label: "Solar control, g 0.39",
    hint: "Light solar protection, keeps the room bright",
    perM2: 12,
    group: "solar",
    infoUrl: SOLAR_INFO,
  },
  solar035: {
    id: "solar035",
    label: "Solar control, g 0.35",
    hint: "Balanced solar protection",
    perM2: 18,
    group: "solar",
    infoUrl: SOLAR_INFO,
  },
  solar029: {
    id: "solar029",
    label: "Solar control, g 0.29",
    hint: "Strongest solar protection for south-facing rooms",
    perM2: 26,
    group: "solar",
    infoUrl: SOLAR_INFO,
  },
};

export const GLASS_ADDON_LIST = Object.values(GLASS_ADDONS);

/** Door area in square metres, used for every per-m² glass surcharge. */
export function doorAreaM2(widthMm: number, heightMm: number): number {
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm)) return 0;
  return (widthMm * heightMm) / 1_000_000;
}

/** Sum of the glass package and the chosen glass add-ons, EUR per m². */
export function glassPerM2(glazing: GlazingId, addons: GlassAddonId[] = []): number {
  const base = GLAZING_PACKAGES[glazing]?.upliftPerM2 ?? 0;
  return addons.reduce((sum, id) => sum + (GLASS_ADDONS[id]?.perM2 ?? 0), base);
}

/** Glass surcharge for one door, EUR (VAT-inclusive figures in, same out). */
export function glassSurcharge(
  widthMm: number,
  heightMm: number,
  glazing: GlazingId,
  addons: GlassAddonId[] = [],
): number {
  return glassPerM2(glazing, addons) * doorAreaM2(widthMm, heightMm);
}

/** Only one solar option may be selected; picking another replaces it. */
export function toggleGlassAddon(current: GlassAddonId[], id: GlassAddonId): GlassAddonId[] {
  if (current.includes(id)) return current.filter((a) => a !== id);
  const group = GLASS_ADDONS[id]?.group;
  const kept = group ? current.filter((a) => GLASS_ADDONS[a]?.group !== group) : current;
  return [...kept, id];
}

export function glassAddonLabels(ids: GlassAddonId[] = []): string[] {
  return ids.map((id) => GLASS_ADDONS[id]?.label ?? id);
}

export interface GlassUnit {
  label: string;
  width: number;
  height: number;
  qty: number;
  glazing: string;
  /** SLIDE or HST — the two systems have different production sizes. */
  system: string;
}

/**
 * Glass sizes for a two-panel door: one active (sliding) panel and one fixed
 * panel. Slide and HST deduct different amounts, see `GLASS_RULES`.
 */
export function glassUnitsForLine(line: DoorLine, lineIndex = 0): GlassUnit[] {
  const rule = GLASS_RULES[line.system];
  const half = line.width / 2 + rule.splitOffset;
  const activeWidth = Math.round(half - rule.activeDeductW);
  const fixedWidth = Math.round(half - rule.fixedDeductW);
  const panelHeight = Math.round(line.height - rule.deductH);
  const addons = glassAddonLabels(line.glassAddons ?? []);
  const glazing = [GLAZING_PACKAGES[line.glazing].description, ...addons].join(" + ");
  const system = line.system === "hst" ? "HST" : "SLIDE";
  const prefix = `P${lineIndex + 1}`;
  const activeLeft = line.activeSide === "L";

  const active: GlassUnit = {
    label: `${prefix}-A active (${activeLeft ? "left" : "right"})`,
    width: activeWidth,
    height: panelHeight,
    qty: line.qty,
    glazing,
    system,
  };
  const fixed: GlassUnit = {
    label: `${prefix}-F fixed (${activeLeft ? "right" : "left"})`,
    width: fixedWidth,
    height: panelHeight,
    qty: line.qty,
    glazing,
    system,
  };
  return activeLeft ? [active, fixed] : [fixed, active];
}

export function glassUnitsForOrder(lines: DoorLine[]): GlassUnit[] {
  return lines.flatMap((line, i) => glassUnitsForLine(line, i));
}

export interface GlassGroup {
  width: number;
  height: number;
  glazing: string;
  system: string;
  pieces: number;
  labels: string[];
}

/** Same size and glazing collapsed into one row with a piece count. */
export function groupGlassUnits(units: GlassUnit[]): GlassGroup[] {
  const map = new Map<string, GlassGroup>();
  for (const u of units) {
    const key = `${u.width}x${u.height}|${u.glazing}|${u.system}`;
    const existing = map.get(key);
    if (existing) {
      existing.pieces += u.qty;
      existing.labels.push(u.label);
    } else {
      map.set(key, {
        width: u.width,
        height: u.height,
        glazing: u.glazing,
        system: u.system,
        pieces: u.qty,
        labels: [u.label],
      });
    }
  }
  return [...map.values()].sort((a, b) => b.width * b.height - a.width * a.height);
}

export function glassOrderText(orderNumber: string, customer: string, lines: DoorLine[]): string {
  const rows = glassUnitsForOrder(lines).map(
    (u) => `${u.label};${u.system};${u.width};${u.height};${u.qty};${u.glazing}`,
  );
  return [
    `ORDER;${orderNumber}`,
    `CUSTOMER;${customer}`,
    "LABEL;SYSTEM;WIDTH_MM;HEIGHT_MM;QTY;GLAZING",
    ...rows,
    "",
  ].join("\n");
}
