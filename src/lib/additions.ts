import { EXTRAS } from "@/lib/extras";
import { GLASS_ADDON_LIST } from "@/lib/glass";
import type { ExtraId, GlassAddonId } from "@/types";

export type AdditionId = ExtraId | GlassAddonId;

/**
 * One row of the additions price list. Prices are what the customer pays,
 * incl. VAT. `showInOffer` decides whether the line is itemised on the offer or
 * simply included in the product total.
 */
export interface AdditionItem {
  id: AdditionId;
  label: string;
  hint: string;
  kind: "extra" | "glass";
  /** How the price is counted. */
  unit: "each" | "perYear" | "perM2";
  price: number;
  showInOffer: boolean;
  active: boolean;
}

/** Starting list, built from the fixed extras and the glass upgrades. */
export function seedAdditions(): AdditionItem[] {
  const extras: AdditionItem[] = EXTRAS.map((e) => ({
    id: e.id,
    label: e.label,
    hint: e.hint,
    kind: "extra",
    unit: e.perYear ? "perYear" : "each",
    price: e.price,
    showInOffer: true,
    active: true,
  }));
  const glass: AdditionItem[] = GLASS_ADDON_LIST.map((g) => ({
    id: g.id,
    label: g.label,
    hint: g.hint,
    kind: "glass",
    unit: "perM2",
    price: g.perM2,
    showInOffer: true,
    active: true,
  }));
  return [...extras, ...glass];
}

export const UNIT_LABELS: Record<AdditionItem["unit"], string> = {
  each: "per door",
  perYear: "per year",
  perM2: "per m² of door",
};
