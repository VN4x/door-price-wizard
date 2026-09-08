import { calculateQuote, VAT_RATE, type Quote } from "@/lib/pricing";
import { GLAZING_PACKAGES } from "@/lib/glass";
import type { DoorLine, Offer, Role } from "@/types";

export interface LinePricing {
  line: DoorLine;
  quote: Quote;
  glazingUplift: number;
  /** Internal cost for the whole line (qty included). */
  cost: number;
  /** Net sales price for the whole line (qty included). */
  net: number;
}

export interface OfferPricing {
  lines: LinePricing[];
  /** Product net price excl. VAT, after any manual override. */
  productNet: number;
  /** Product net price before the manual override. */
  calculatedNet: number;
  deliveryPrice: number;
  installationPrice: number;
  netTotal: number;
  vat: number;
  grossTotal: number;
  /** Internal only. */
  cost: number;
  marginEur: number;
  marginPercent: number;
}

export const MARGIN_FLOOR_PERCENT = 15;
export const MARGIN_WARN_PERCENT = 22;

export function priceLine(line: DoorLine, markupPercent: number): LinePricing {
  const quote = calculateQuote(line.system, {
    width: line.width,
    height: line.height,
    finish: line.finish,
    markupPercent,
    threshold: line.threshold,
  });
  const areaM2 = (line.width * line.height) / 1_000_000;
  const glazingUplift = GLAZING_PACKAGES[line.glazing].upliftPerM2 * areaM2;
  const cost = (quote.cost + glazingUplift) * line.qty;
  const net = (quote.netPrice + glazingUplift * (1 + markupPercent / 100)) * line.qty;
  return { line, quote, glazingUplift, cost, net };
}

export function priceOffer(offer: Offer): OfferPricing {
  const lines = offer.lines.map((l) => priceLine(l, offer.markupPercent));
  const calculatedNet = lines.reduce((s, l) => s + l.net, 0);
  const productNet = offer.priceOverride ?? calculatedNet;
  const netTotal = productNet + offer.deliveryPrice + offer.installationPrice;
  const vat = netTotal * VAT_RATE;
  const cost = lines.reduce((s, l) => s + l.cost, 0);
  const marginEur = productNet - cost;
  return {
    lines,
    productNet,
    calculatedNet,
    deliveryPrice: offer.deliveryPrice,
    installationPrice: offer.installationPrice,
    netTotal,
    vat,
    grossTotal: netTotal + vat,
    cost,
    marginEur,
    marginPercent: productNet > 0 ? (marginEur / productNet) * 100 : 0,
  };
}

/** Everything a customer may see — no cost or margin fields exist on this object. */
export interface CustomerPricing {
  productNet: number;
  deliveryPrice: number;
  installationPrice: number;
  netTotal: number;
  vat: number;
  grossTotal: number;
}

export function customerPricing(offer: Offer): CustomerPricing {
  const p = priceOffer(offer);
  return {
    productNet: p.productNet,
    deliveryPrice: p.deliveryPrice,
    installationPrice: p.installationPrice,
    netTotal: p.netTotal,
    vat: p.vat,
    grossTotal: p.grossTotal,
  };
}

export function canSeeCosts(role: Role): boolean {
  return role === "admin";
}

export function marginTone(percent: number): "good" | "warn" | "bad" {
  if (percent < MARGIN_FLOOR_PERCENT) return "bad";
  if (percent < MARGIN_WARN_PERCENT) return "warn";
  return "good";
}
