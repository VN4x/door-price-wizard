import type { DoorLine, GlazingId, GlazingPackage } from "@/types";

/** Profile deductions used to derive glass sizes from the overall opening. */
export const GLASS_DEDUCTIONS = {
  /** Frame + sash width taken off the overall width, per panel. */
  widthPerPanel: 172,
  /** Frame + sash height taken off the overall height. */
  height: 205,
  /** Panels always overlap on the meeting stile. */
  overlap: 46,
} as const;

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
}

/** Glass sizes for a two-panel slider: one fixed panel, one active panel. */
export function glassUnitsForLine(line: DoorLine, lineIndex = 0): GlassUnit[] {
  const panelWidth = Math.round(
    (line.width + GLASS_DEDUCTIONS.overlap) / 2 - GLASS_DEDUCTIONS.widthPerPanel,
  );
  const panelHeight = Math.round(line.height - GLASS_DEDUCTIONS.height);
  const glazing = GLAZING_PACKAGES[line.glazing].description;
  const prefix = `P${lineIndex + 1}`;
  const activeFirst = line.activeSide === "L";
  return [
    {
      label: `${prefix}-${activeFirst ? "A" : "F"} ${activeFirst ? "active" : "fixed"} (left)`,
      width: panelWidth,
      height: panelHeight,
      qty: line.qty,
      glazing,
    },
    {
      label: `${prefix}-${activeFirst ? "F" : "A"} ${activeFirst ? "fixed" : "active"} (right)`,
      width: panelWidth,
      height: panelHeight,
      qty: line.qty,
      glazing,
    },
  ];
}

export function glassUnitsForOrder(lines: DoorLine[]): GlassUnit[] {
  return lines.flatMap((line, i) => glassUnitsForLine(line, i));
}

export function glassOrderText(orderNumber: string, customer: string, lines: DoorLine[]): string {
  const rows = glassUnitsForOrder(lines).map(
    (u) => `${u.label};${u.width};${u.height};${u.qty};${u.glazing}`,
  );
  return [
    `ORDER;${orderNumber}`,
    `CUSTOMER;${customer}`,
    "LABEL;WIDTH_MM;HEIGHT_MM;QTY;GLAZING",
    ...rows,
    "",
  ].join("\n");
}
