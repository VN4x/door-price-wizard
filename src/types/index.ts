import type { Finish, SystemId, ThresholdId } from "@/lib/pricing";

export type Role = "customer" | "sales" | "production" | "admin";

export type ActiveSide = "L" | "R";

export type GlazingId = "std3" | "tinted3" | "quiet36" | "quiet40";

/** Glass upgrades priced per square metre of door area. */
export type GlassAddonId =
  | "warmSpacer"
  | "safetyOutside"
  | "safetyInside"
  | "solar039"
  | "solar035"
  | "solar029";

export type ExtraId = "lock" | "warranty" | "safetyGlass" | "solarGlass" | "gasket";

/** Widened now so other window types can join the cart later without a rewrite. */
export type ProductKind = "slidingDoor" | "outletItem";

export interface GlazingPackage {
  id: GlazingId;
  label: string;
  description: string;
  /** Extra material cost per m2 of glass compared with the base unit. */
  upliftPerM2: number;
}

export interface DoorLine {
  id: string;
  system: SystemId;
  width: number;
  height: number;
  qty: number;
  finish: Finish;
  glazing: GlazingId;
  glassAddons?: GlassAddonId[] | undefined;
  activeSide: ActiveSide;
  threshold: ThresholdId;
  extras?: ExtraId[] | undefined;
}

export interface CartItem {
  id: string;
  kind: ProductKind;
  line: DoorLine;
  note?: string | undefined;
  /** Set for stock items taken from the Outlet. */
  outletId?: string | undefined;
  /** Fixed customer price for stock items, EUR incl. VAT. */
  fixedGross?: number | undefined;
}

export interface CustomerDetails {
  name: string;
  /** A returning customer keeps a small profile in this browser. */
  hasAccount?: boolean | undefined;
  email: string;
  phone?: string | undefined;
  address?: string | undefined;
  note?: string | undefined;
  needsDelivery: boolean;
  needsInstallation: boolean;
  /** Remember these details in this browser for the next visit. */
  remember: boolean;
}

export interface OutletItem {
  id: string;
  name: string;
  system: SystemId;
  width: number;
  height: number;
  finish: Finish;
  glazing: GlazingId;
  activeSide: ActiveSide;
  /** Customer price incl. VAT. */
  gross: number;
  stock: number;
  reason: string;
}

/** What the price page carries into the enquiry form. */
export interface PendingConfig {
  system: SystemId;
  width: number;
  height: number;
  finish: Finish;
  extras: ExtraId[];
  glazing?: GlazingId | undefined;
  glassAddons?: GlassAddonId[] | undefined;
}

export type EnquiryStatus = "new" | "quoted" | "closed";

export interface Enquiry {
  id: string;
  number: string;
  customerName: string;
  email: string;
  phone?: string | undefined;
  lines: DoorLine[];
  needsDelivery: boolean;
  needsInstallation: boolean;
  note?: string | undefined;
  createdAt: string;
  status: EnquiryStatus;
}

export type OfferStatus = "draft" | "sent" | "accepted" | "declined";

export interface Offer {
  id: string;
  /** Long random string used in the customer's private offer link. */
  token: string;
  number: string;
  version: number;
  enquiryId: string;
  customerName: string;
  email: string;
  phone?: string | undefined;
  lines: DoorLine[];
  markupPercent: number;
  /** Manual override of the product net total, EUR excl. VAT. */
  priceOverride: number | null;
  /** Discount on the product total, percent. */
  discountPercent?: number | undefined;
  discountReason?: string | undefined;
  deliveryPrice: number;
  installationPrice: number;
  status: OfferStatus;
  createdAt: string;
  validUntil: string;
  viewedAt?: string | undefined;
  sentAt?: string | undefined;
  /** Set when the offer was emailed automatically on cart submit. */
  autoSentAt?: string | undefined;
}

export type OrderStatus =
  | "order"
  | "drawingsPrinted"
  | "glassOrdered"
  | "ready"
  | "delivered";

export interface Order {
  id: string;
  number: string;
  offerId: string;
  customerName: string;
  lines: DoorLine[];
  orderDate: string;
  status: OrderStatus;
  drawingsPrintedAt?: string | undefined;
  glassOrderedAt?: string | undefined;
}

/** How much of an article one door uses. */
export type PriceDriver =
  | "framePerimeter"
  | "sashPerimeter"
  | "mullionHeight"
  | "width"
  | "glassArea"
  | "fixed";

export interface PriceItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  saleMultiplier: number;
  active: boolean;
  updatedAt: string;
  /** How the quantity is counted for one door. */
  driver: PriceDriver;
  /** Quantity used at the reference door 3500 x 2178 mm. */
  refQty: number;
  /** Which profile systems use this article. */
  systems: SystemId[];
  /** Optional different purchase price for HST. */
  hstPrice?: number | undefined;
}

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}
