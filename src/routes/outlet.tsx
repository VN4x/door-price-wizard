import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { GLAZING_PACKAGES } from "@/lib/glass";
import { FINISH_LABELS, SYSTEM_LABELS, eur, thresholdForWidth } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { OutletItem } from "@/types";

export const Route = createFileRoute("/outlet")({
  head: () => ({
    meta: [
      { title: "Outlet: sliding doors in stock | Kvaliteetaken" },
      {
        name: "description",
        content:
          "Ready-made Rehau Synego sliding doors in stock at outlet prices: size, colour, glazing and price shown for each door.",
      },
      { property: "og:title", content: "Outlet: sliding doors in stock | Kvaliteetaken" },
      {
        property: "og:description",
        content: "Ready-made sliding doors in stock, with a fixed price and immediate delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OutletPage,
});

function OutletPage() {
  const navigate = useNavigate();
  const { outlet, addToCart } = useStore();

  const add = (item: OutletItem) => {
    addToCart({
      kind: "outletItem",
      outletId: item.id,
      fixedGross: item.gross,
      line: {
        id: `outlet-${item.id}`,
        system: item.system,
        width: item.width,
        height: item.height,
        qty: 1,
        finish: item.finish,
        glazing: item.glazing,
        activeSide: item.activeSide,
        threshold: thresholdForWidth(item.width) ?? "t37",
      },
      note: `Stock door: ${item.reason}`,
    });
    void navigate({ to: "/cart" });
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pb-16">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Outlet</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Doors already built and standing in our warehouse. Fixed price, delivery within a week,
            first come first served.
          </p>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {outlet.map((item) => {
              const soldOut = item.stock < 1;
              return (
                <li
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <div
                    className="grid h-32 place-items-center rounded-xl border border-dashed border-border bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground"
                    aria-hidden
                  >
                    Photo to come
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-foreground">{item.name}</h2>
                  <p className="text-xs text-muted-foreground">{SYSTEM_LABELS[item.system]}</p>
                  <dl className="mt-4 grid gap-1.5 text-sm">
                    <Row label="Size" value={`${item.width} × ${item.height} mm`} />
                    <Row label="Colour" value={FINISH_LABELS[item.finish]} />
                    <Row label="Glazing" value={GLAZING_PACKAGES[item.glazing].label} />
                    <Row
                      label="Opens"
                      value={item.activeSide === "L" ? "Left panel" : "Right panel"}
                    />
                    <Row label="In stock" value={soldOut ? "Reserved" : `${item.stock} pc`} />
                  </dl>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                    {eur(item.gross)}
                  </p>
                  <p className="text-xs text-muted-foreground">incl. VAT · {item.reason}</p>
                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => add(item)}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {soldOut ? (
                      <>
                        <Check className="size-4" aria-hidden />
                        Reserved
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="size-4" aria-hidden />
                        Add to cart
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border pb-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
