import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { MOCK_ENQUIRIES, MOCK_OFFERS, MOCK_ORDERS, MOCK_PRICE_ITEMS } from "@/mock/data";
import type { DoorLine, Enquiry, Offer, Order, PriceItem, Role } from "@/types";

interface StoreValue {
  role: Role;
  setRole: (r: Role) => void;
  enquiries: Enquiry[];
  offers: Offer[];
  orders: Order[];
  priceItems: PriceItem[];
  addEnquiry: (
    input: Omit<Enquiry, "id" | "number" | "createdAt" | "status">,
  ) => Enquiry;
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

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [priceItems, setPriceItems] = useState<PriceItem[]>(MOCK_PRICE_ITEMS);
  const [seq, setSeq] = useState(90);

  const value = useMemo<StoreValue>(
    () => ({
      role,
      setRole,
      enquiries,
      offers,
      orders,
      priceItems,
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
        const { sentAt: _s, viewedAt: _v, ...base } = source;
        const copy: Offer = {
          ...base,
          id: `${source.id}-v${source.version + 1}`,
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
    [role, enquiries, offers, orders, priceItems, seq],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside MockStoreProvider");
  return ctx;
}

export { today, plusDays };
