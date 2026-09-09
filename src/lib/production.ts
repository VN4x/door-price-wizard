import type { SystemId } from "@/lib/pricing";

/**
 * Production dimensions differ between the two systems: Slide has one sliding
 * sash plus a mullion, HST has two sashes and a threshold rail. All numbers are
 * millimetre deductions from the overall opening and are meant to be edited
 * once the workshop confirms them.
 */
export interface GlassRule {
  /** Deduction on the sliding (active) panel glass width. */
  activeDeductW: number;
  /** Deduction on the fixed panel glass width. */
  fixedDeductW: number;
  /** Deduction on glass height. */
  deductH: number;
  /** Millimetres added to half the opening before the width deduction. */
  splitOffset: number;
}

export const GLASS_RULES: Record<SystemId, GlassRule> = {
  // One sash and a mullion: the mullion sits centred, the fixed panel is glazed
  // straight into the frame so it loses less width.
  slide: { activeDeductW: 172, fixedDeductW: 130, deductH: 205, splitOffset: -48 },
  // Two sashes, no mullion, panels overlap on the meeting stile.
  hst: { activeDeductW: 148, fixedDeductW: 148, deductH: 190, splitOffset: 23 },
};

export const SYSTEM_SHORT: Record<SystemId, string> = { slide: "SLIDE", hst: "HST" };
