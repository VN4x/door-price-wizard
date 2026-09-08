import type { Finish, SystemId, ThresholdId } from "@/lib/pricing";

export type Role = "customer" | "sales" | "admin";

export type ActiveSide = "L" | "R";

export type GlazingId = "std2" | "warm3" | "sound35" | "safety";

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
  activeSide: ActiveSide;
  threshold: ThresholdId;
}

export type EnquiryStatus = "new" | "quoted" | "closed";

export interface Enquiry {
  id: string;
  number: string;
  customerName: string;
  email: string;
  phone?: string;
  lines: DoorLine[];
  needsDelivery: boolean;
  needsInstallation: boolean;
  note?: string;
  createdAt: string;
  status: EnquiryStatus;
}

export type OfferStatus = "draft" | "sent" | "accepted" | "declined";

export interface Offer {
  id: string;
  number: string;
  version: number;
  enquiryId: string;
  customerName: string;
  email: string;
  phone?: string;
  lines: DoorLine[];
  markupPercent: number;
  /** Manual override of the product net total, EUR excl. VAT. */
  priceOverride: number | null;
  deliveryPrice: number;
  installationPrice: number;
  status: OfferStatus;
  createdAt: string;
  validUntil: string;
  viewedAt?: string;
  sentAt?: string;
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
  drawingsPrintedAt?: string;
  glassOrderedAt?: string;
}

export interface PriceItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: number;
  saleMultiplier: number;
  active: boolean;
  updatedAt: string;
}
