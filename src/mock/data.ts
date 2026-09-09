import { GROUP_LABELS, getCostLines, type CostLine, type Driver, type SystemId } from "@/lib/pricing";
import type {
  DoorLine,
  Enquiry,
  Offer,
  Order,
  OutletItem,
  PriceDriver,
  PriceItem,
} from "@/types";

const line = (over: Partial<DoorLine> & { id: string }): DoorLine => ({
  system: "hst",
  width: 3500,
  height: 2178,
  qty: 1,
  finish: "white",
  glazing: "warm3",
  activeSide: "L",
  threshold: "t37",
  ...over,
});

export const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: "enq-1",
    number: "KP-2026-0087",
    customerName: "Mart Kivi",
    email: "mart.kivi@example.ee",
    phone: "+372 512 3456",
    lines: [line({ id: "l1" })],
    needsDelivery: true,
    needsInstallation: true,
    note: "New house, terrace opening facing the garden.",
    createdAt: "2026-09-06",
    status: "quoted",
  },
  {
    id: "enq-2",
    number: "KP-2026-0088",
    customerName: "Liis Tamm",
    email: "liis.tamm@example.ee",
    lines: [line({ id: "l2", width: 3000, height: 2200, activeSide: "R", finish: "oneSide" })],
    needsDelivery: true,
    needsInstallation: false,
    createdAt: "2026-09-07",
    status: "new",
  },
  {
    id: "enq-3",
    number: "KP-2026-0089",
    customerName: "Peeter Saar",
    email: "peeter@saarehitus.ee",
    phone: "+372 555 1122",
    lines: [
      line({
        id: "l3",
        system: "slide",
        width: 4200,
        height: 2400,
        qty: 2,
        finish: "bothSides",
        glazing: "sound35",
      }),
    ],
    needsDelivery: false,
    needsInstallation: false,
    createdAt: "2026-09-08",
    status: "new",
  },
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: "off-1",
    token: "k7f4x2m9qd8t1v6ncbz3",
    number: "KA-2026-0142",
    version: 1,
    enquiryId: "enq-1",
    customerName: "Mart Kivi",
    email: "mart.kivi@example.ee",
    phone: "+372 512 3456",
    lines: [
      line({ id: "l1" }),
      line({ id: "l1b", system: "slide", width: 2400, height: 2100, activeSide: "R" }),
    ],
    markupPercent: 25,
    priceOverride: null,
    deliveryPrice: 180,
    installationPrice: 640,
    status: "sent",
    createdAt: "2026-09-06",
    validUntil: "2026-10-06",
    sentAt: "2026-09-06",
    autoSentAt: "2026-09-06",
    viewedAt: "2026-09-07",
  },
  {
    id: "off-2",
    token: "w2p8rt5ycj0h4bs7dknq",
    number: "KA-2026-0143",
    version: 1,
    enquiryId: "enq-2",
    customerName: "Liis Tamm",
    email: "liis.tamm@example.ee",
    lines: [line({ id: "l2", width: 3000, height: 2200, activeSide: "R", finish: "oneSide" })],
    markupPercent: 25,
    priceOverride: null,
    deliveryPrice: 150,
    installationPrice: 0,
    status: "draft",
    createdAt: "2026-09-07",
    validUntil: "2026-10-07",
  },
  {
    id: "off-3",
    token: "m9c3vs6lq2xz8dhf5t0r",
    number: "KA-2026-0139",
    version: 2,
    enquiryId: "enq-1",
    customerName: "Kadri Lepik",
    email: "kadri.lepik@example.ee",
    lines: [line({ id: "l4", system: "slide", width: 2600, height: 2100, activeSide: "R" })],
    markupPercent: 22,
    priceOverride: 3200,
    deliveryPrice: 120,
    installationPrice: 480,
    status: "accepted",
    createdAt: "2026-08-28",
    validUntil: "2026-09-27",
    sentAt: "2026-08-28",
    autoSentAt: "2026-08-28",
    viewedAt: "2026-08-29",
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    number: "T-2026-0311",
    offerId: "off-3",
    customerName: "Kadri Lepik",
    lines: [line({ id: "l4", system: "slide", width: 2600, height: 2100, activeSide: "R" })],
    orderDate: "2026-08-30",
    status: "glassOrdered",
    drawingsPrintedAt: "2026-08-31",
    glassOrderedAt: "2026-09-01",
  },
  {
    id: "ord-2",
    number: "T-2026-0312",
    offerId: "off-1",
    customerName: "Jaan Rebane",
    lines: [
      line({ id: "l5", width: 3800, height: 2300, activeSide: "L", finish: "oneSide" }),
      line({ id: "l5b", system: "slide", width: 2200, height: 2300, activeSide: "R", qty: 2 }),
    ],
    orderDate: "2026-09-02",
    status: "order",
  },
  {
    id: "ord-3",
    number: "T-2026-0309",
    offerId: "off-1",
    customerName: "Tiina Mets",
    lines: [line({ id: "l6", width: 3200, height: 2178, activeSide: "R" })],
    orderDate: "2026-08-18",
    status: "ready",
    drawingsPrintedAt: "2026-08-19",
    glassOrderedAt: "2026-08-20",
  },
  {
    id: "ord-4",
    number: "T-2026-0305",
    offerId: "off-1",
    customerName: "Arvo Kask",
    lines: [line({ id: "l7", system: "slide", width: 2800, height: 2050, activeSide: "L" })],
    orderDate: "2026-08-04",
    status: "delivered",
    drawingsPrintedAt: "2026-08-05",
    glassOrderedAt: "2026-08-06",
  },
];

export const MOCK_OUTLET: OutletItem[] = [
  {
    id: "out-1",
    name: "Synego HST, anthracite outside",
    system: "hst",
    width: 3000,
    height: 2200,
    finish: "oneSide",
    glazing: "warm3",
    activeSide: "L",
    gross: 4290,
    stock: 1,
    reason: "Cancelled order, never installed",
  },
  {
    id: "out-2",
    name: "Synego Slide, white",
    system: "slide",
    width: 2400,
    height: 2100,
    finish: "white",
    glazing: "std2",
    activeSide: "R",
    gross: 2190,
    stock: 2,
    reason: "Showroom door, as new",
  },
  {
    id: "out-3",
    name: "Synego HST, anthracite both sides",
    system: "hst",
    width: 3500,
    height: 2178,
    finish: "bothSides",
    glazing: "safety",
    activeSide: "R",
    gross: 5640,
    stock: 1,
    reason: "Production overrun",
  },
  {
    id: "out-4",
    name: "Synego Slide, white, narrow",
    system: "slide",
    width: 1800,
    height: 2000,
    finish: "white",
    glazing: "std2",
    activeSide: "L",
    gross: 1690,
    stock: 0,
    reason: "Reserved for a customer",
  },
];

/* ------------------------------------------------------- price list rows */

const DRIVER_MAP: Record<Driver, PriceDriver> = {
  framePerimeter: "framePerimeter",
  sashPerimeter: "sashPerimeter",
  height: "mullionHeight",
  width: "width",
  glassArea: "glassArea",
  fixed: "fixed",
};

const UNIT_MAP: Record<Driver, string> = {
  framePerimeter: "m",
  sashPerimeter: "m",
  height: "m",
  width: "m",
  glassArea: "m²",
  fixed: "pcs",
};

const MULTIPLIER = 1.4;

/**
 * The price list and the calculator read the same articles, so a row edited
 * here changes the price everywhere.
 */
function buildPriceItems(): PriceItem[] {
  const slide = getCostLines("slide");
  const hst = getCostLines("hst");
  const byId = new Map<string, { line: CostLine; systems: SystemId[]; hstPrice?: number }>();

  for (const l of slide) byId.set(l.id, { line: l, systems: ["slide"] });
  for (const l of hst) {
    const found = byId.get(l.id);
    if (found) {
      found.systems = [...found.systems, "hst"];
      if (l.unitPrice !== found.line.unitPrice) found.hstPrice = l.unitPrice;
    } else {
      byId.set(l.id, { line: l, systems: ["hst"] });
    }
  }

  const items: PriceItem[] = [...byId.values()].map(({ line: l, systems, hstPrice }) => ({
    id: `pi-${l.id}`,
    name: l.label,
    category: GROUP_LABELS[l.group],
    unit: UNIT_MAP[l.driver],
    purchasePrice: l.unitPrice,
    saleMultiplier: MULTIPLIER,
    active: true,
    updatedAt: "2026-09-01",
    driver: DRIVER_MAP[l.driver],
    refQty: Number(l.refQty.toFixed(2)),
    systems,
    ...(hstPrice === undefined ? {} : { hstPrice }),
  }));

  items.push(
    {
      id: "pi-rail-25",
      name: "Threshold rail 2.5 m (delivered)",
      category: "Running rails",
      unit: "pcs",
      purchasePrice: 600,
      saleMultiplier: 1.25,
      active: true,
      updatedAt: "2026-08-30",
      driver: "fixed",
      refQty: 1,
      systems: ["hst"],
    },
    {
      id: "pi-rail-30",
      name: "Threshold rail 3.0 m (delivered)",
      category: "Running rails",
      unit: "pcs",
      purchasePrice: 750,
      saleMultiplier: 1.25,
      active: true,
      updatedAt: "2026-08-30",
      driver: "fixed",
      refQty: 1,
      systems: ["hst"],
    },
    {
      id: "pi-rail-37",
      name: "Threshold rail 3.7 m (delivered)",
      category: "Running rails",
      unit: "pcs",
      purchasePrice: 900,
      saleMultiplier: 1.25,
      active: true,
      updatedAt: "2026-08-30",
      driver: "fixed",
      refQty: 1,
      systems: ["hst"],
    },
  );

  return items;
}

export const MOCK_PRICE_ITEMS: PriceItem[] = buildPriceItems();
