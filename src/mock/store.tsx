import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  MOCK_ENQUIRIES,
  MOCK_OFFERS,
  MOCK_ORDERS,
  MOCK_OUTLET,
  MOCK_PRICE_ITEMS,
} from "@/mock/data";
import { DEFAULT_MARKUP } from "@/lib/pricing";
import { seedAdditions, type AdditionItem } from "@/lib/additions";
import { deliveryEstimate, installationEstimate } from "@/lib/public-price";
import type {
  CallbackRequest,
  CartItem,
  CustomerDetails,
  DoorLine,
  Enquiry,
  Offer,
  Order,
  OutletItem,
  PendingConfig,
  PriceItem,
  Role,
} from "@/types";

const CART_KEY = "kv.cart.v1";
const CUSTOMER_KEY = "kv.customer.v1";

interface StoreValue {
  role: Role;
  setRole: (r: Role) => void;
  enquiries: Enquiry[];
  offers: Offer[];
  orders: Order[];
  priceItems: PriceItem[];
  additions: AdditionItem[];
  updateAddition: (id: string, patch: Partial<AdditionItem>) => void;
  /** Discount applied automatically to new offers, percent. */
  campaignPercent: number;
  setCampaignPercent: (p: number) => void;
  outlet: OutletItem[];
  callbacks: CallbackRequest[];
  /** Carried from the price page into the enquiry form. */
  pending: PendingConfig | null;
  setPending: (p: PendingConfig | null) => void;
  cart: CartItem[];
  customer: CustomerDetails | null;
  saveCustomer: (c: CustomerDetails) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  updateCartItem: (id: string, patch: Partial<CartItem>) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  /** Creates the enquiry and the offer, and marks the offer as emailed. */
  submitCart: (details: CustomerDetails) => Offer | undefined;
  requestCallback: (name: string, phone: string) => void;
  addEnquiry: (input: Omit<Enquiry, "id" | "number" | "createdAt" | "status">) => Enquiry;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  duplicateOffer: (id: string) => Offer | undefined;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  upsertPriceItem: (item: PriceItem) => void;
  deletePriceItem: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const makeToken = () =>
  Array.from({ length: 24 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join(
    "",
  );

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the cart simply does not survive a reload */
  }
}

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [priceItems, setPriceItems] = useState<PriceItem[]>(MOCK_PRICE_ITEMS);
  const [additions, setAdditions] = useState<AdditionItem[]>(() => seedAdditions());
  const [campaignPercent, setCampaignPercent] = useState(0);
  const [outlet, setOutlet] = useState<OutletItem[]>(MOCK_OUTLET);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [pending, setPending] = useState<PendingConfig | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => readLocal<CartItem[]>(CART_KEY) ?? []);
  const [customer, setCustomer] = useState<CustomerDetails | null>(() =>
    readLocal<CustomerDetails>(CUSTOMER_KEY),
  );
  const [seq, setSeq] = useState(90);

  const value = useMemo<StoreValue>(
    () => ({
      role,
      setRole,
      enquiries,
      offers,
      orders,
      priceItems,
      additions,
      updateAddition: (id, patch) =>
        setAdditions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
      campaignPercent,
      setCampaignPercent,
      outlet,
      callbacks,
      pending,
      setPending,
      cart,
      customer,
      saveCustomer: (c) => {
        setCustomer(c);
        if (c.remember) writeLocal(CUSTOMER_KEY, c);
      },
      addToCart: (item) => {
        setCart((prev) => {
          const next = [...prev, { ...item, id: `ci-${Date.now()}-${prev.length}` }];
          writeLocal(CART_KEY, next);
          return next;
        });
      },
      updateCartItem: (id, patch) =>
        setCart((prev) => {
          const next = prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
          writeLocal(CART_KEY, next);
          return next;
        }),
      removeCartItem: (id) =>
        setCart((prev) => {
          const next = prev.filter((c) => c.id !== id);
          writeLocal(CART_KEY, next);
          return next;
        }),
      clearCart: () => {
        setCart([]);
        writeLocal(CART_KEY, []);
      },
      submitCart: (details) => {
        if (cart.length === 0) return undefined;
        const customer = details;
        const n = seq + 1;
        setSeq(n);
        const lines: DoorLine[] = cart.map((c, i) => ({ ...c.line, id: `line-${i + 1}` }));
        const enquiry: Enquiry = {
          id: `enq-${n}`,
          number: `KP-2026-${String(n).padStart(4, "0")}`,
          customerName: customer.name,
          email: customer.email,
          ...(customer.phone ? { phone: customer.phone } : {}),
          lines,
          needsDelivery: customer.needsDelivery,
          needsInstallation: customer.needsInstallation,
          ...(customer.note ? { note: customer.note } : {}),
          createdAt: today(),
          status: "quoted",
        };
        const widest = Math.max(...lines.map((l) => l.width));
        const offer: Offer = {
          id: `off-${n}`,
          token: makeToken(),
          number: `KA-2026-${String(n + 50).padStart(4, "0")}`,
          version: 1,
          enquiryId: enquiry.id,
          customerName: customer.name,
          email: customer.email,
          ...(customer.phone ? { phone: customer.phone } : {}),
          lines,
          markupPercent: DEFAULT_MARKUP,
          priceOverride: null,
          ...(campaignPercent > 0
            ? { discountPercent: campaignPercent, discountReason: "Campaign discount" }
            : {}),
          deliveryPrice: customer.needsDelivery ? deliveryEstimate(widest) : 0,
          installationPrice: customer.needsInstallation
            ? lines.reduce((s, l) => s + installationEstimate(l.width, l.qty), 0)
            : 0,
          status: "sent",
          createdAt: today(),
          validUntil: plusDays(30),
          sentAt: today(),
          autoSentAt: today(),
        };
        setEnquiries((prev) => [enquiry, ...prev]);
        setOffers((prev) => [offer, ...prev]);
        setOutlet((prev) =>
          prev.map((o) => {
            const taken = cart.filter((c) => c.outletId === o.id).length;
            return taken > 0 ? { ...o, stock: Math.max(0, o.stock - taken) } : o;
          }),
        );
        setCart([]);
        writeLocal(CART_KEY, []);
        return offer;
      },
      requestCallback: (name, phone) =>
        setCallbacks((prev) => [
          { id: `cb-${Date.now()}`, name, phone, createdAt: today() },
          ...prev,
        ]),
      addEnquiry: (input) => {
        const n = seq + 1;
        setSeq(n);
        const enquiry: Enquiry = {
          ...input,
          id: `enq-${n}`,
          number: `KP-2026-${String(n).padStart(4, "0")}`,
          createdAt: today(),
          status: "new",
        };
        setEnquiries((prev) => [enquiry, ...prev]);
        return enquiry;
      },
      updateOffer: (id, patch) =>
        setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o))),
      duplicateOffer: (id) => {
        const source = offers.find((o) => o.id === id);
        if (!source) return undefined;
        const { sentAt: _s, viewedAt: _v, autoSentAt: _a, ...base } = source;
        const copy: Offer = {
          ...base,
          id: `${source.id}-v${source.version + 1}`,
          token: makeToken(),
          version: source.version + 1,
          status: "draft",
          createdAt: today(),
          validUntil: plusDays(30),
          lines: source.lines.map((l: DoorLine) => ({ ...l, id: `${l.id}-c` })),
        };
        setOffers((prev) => [copy, ...prev]);
        return copy;
      },
      updateOrder: (id, patch) =>
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o))),
      upsertPriceItem: (item) =>
        setPriceItems((prev) =>
          prev.some((p) => p.id === item.id)
            ? prev.map((p) => (p.id === item.id ? item : p))
            : [item, ...prev],
        ),
      deletePriceItem: (id) => setPriceItems((prev) => prev.filter((p) => p.id !== id)),
    }),
    [
      role,
      enquiries,
      offers,
      orders,
      priceItems,
      additions,
      campaignPercent,
      outlet,
      callbacks,
      pending,
      cart,
      customer,
      seq,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside MockStoreProvider");
  return ctx;
}

export { today, plusDays };
