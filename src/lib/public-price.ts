import { extrasTotal } from "@/lib/extras";
import {
  DEFAULT_MARKUP,
  calculateQuote,
  thresholdForWidth,
  validateSize,
  type Finish,
  type SystemId,
} from "@/lib/pricing";
import { glassSurcharge } from "@/lib/glass";
import type { ExtraId, GlassAddonId, GlazingId } from "@/types";

export interface PublicPriceInput {
  system: SystemId;
  width: number;
  height: number;
  finish: Finish;
  extras: ExtraId[];
  glazing?: GlazingId | undefined;
  glassAddons?: GlassAddonId[] | undefined;
}

/**
 * Everything a visitor may see. No cost, labour, markup or margin field exists
 * on this shape, so a customer-facing component cannot leak one.
 */
export interface PublicPrice {
  /** Product price incl. VAT, EUR. Null when the size cannot be priced online. */
  productGross: number | null;
  /** Glass package and glass upgrades, EUR incl. VAT. */
  glassGross: number;
  extrasGross: number;
  totalGross: number | null;
  installationEstimate: number;
  deliveryEstimate: number;
  deliveryWeeks: string;
  /** Reason the price is unavailable, in plain language. */
  unavailableReason: string | null;
}

/** Rough fitting estimate: a base visit plus metres of opening. */
export function installationEstimate(widthMm: number, qty = 1): number {
  const perDoor = 260 + Math.round((widthMm / 1000) * 90);
  return perDoor * qty;
}

export function deliveryEstimate(widthMm: number): number {
  return widthMm > 3200 ? 180 : 120;
}

export function publicPrice(input: PublicPriceInput): PublicPrice {
  const extrasGross = extrasTotal(input.extras);
  const glassGross = Math.round(
    glassSurcharge(input.width, input.height, input.glazing ?? "std3", input.glassAddons ?? []),
  );
  const base: PublicPrice = {
    productGross: null,
    glassGross,
    extrasGross,
    totalGross: null,
    installationEstimate: installationEstimate(input.width),
    deliveryEstimate: deliveryEstimate(input.width),
    deliveryWeeks: "4–5 weeks",
    unavailableReason: null,
  };

  const sizeError = validateSize(input.width, input.height);
  if (sizeError) return { ...base, unavailableReason: sizeError };

  const quote = calculateQuote(input.system, {
    width: input.width,
    height: input.height,
    finish: input.finish,
    markupPercent: DEFAULT_MARKUP,
  });

  const productGross = Math.round(quote.grossPrice);
  return {
    ...base,
    productGross,
    totalGross: productGross + glassGross + extrasGross,
  };
}
