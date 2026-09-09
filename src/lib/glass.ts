import { GLASS_RULES } from "@/lib/production";
import type { DoorLine, GlazingId, GlazingPackage } from "@/types";

export const GLAZING_PACKAGES: Record<GlazingId, GlazingPackage> = {
  std2: {
    id: "std2",
    label: "Standard 2-glass",
    description: "4-16Ar-4s, Ug 1.1 W/m²K",
    upliftPerM2: 0,
  },
  warm3: {
    id: "warm3",
    label: "Warm 3-glass",
    description: "4s-4-4s 18/16 argon, Ug 0.6 W/m²K",
    upliftPerM2: 14,
  },
  sound35: {
    id: "sound35",
    label: "Sound 35 dB",
    description: "Laminated acoustic, Rw 35 dB",
    upliftPerM2: 22,
  },
  safety: {
    id: "safety",
    label: "Safety / toughened",
    description: "Toughened outer + laminated inner",
    upliftPerM2: 30,
  },
};

export const GLAZING_LIST = Object.values(GLAZING_PACKAGES);

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
  const glazing = GLAZING_PACKAGES[line.glazing].description;
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
