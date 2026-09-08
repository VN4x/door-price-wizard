import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { OfferStatusChip } from "@/components/StatusChip";
import { customerPricing } from "@/lib/offer";
import { eur } from "@/lib/pricing";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/admin/offers/")({
  head: () => ({
    meta: [
      { title: "Offers | Kvaliteetaken admin" },
      { name: "description", content: "All sliding-door offers and their status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Offers,
});

function Offers() {
  const { offers, duplicateOffer } = useStore();
  const [query, setQuery] = useState("");
  const filtered = offers.filter((o) =>
    `${o.number} ${o.customerName} ${o.email}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Offers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{offers.length} offers in total</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search offers"
          className="w-full max-w-64 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Offer</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Valid until</th>
              <th className="px-5 py-3 text-right font-medium">Total incl. VAT</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">
                  <Link
                    to="/admin/offers/$offerId"
                    params={{ offerId: o.id }}
                    className="underline-offset-4 hover:underline"
                  >
                    {o.number}
                    {o.version > 1 ? ` v${o.version}` : ""}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{o.customerName}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {o.lines[0]?.width} × {o.lines[0]?.height} mm
                </td>
                <td className="px-5 py-3 text-muted-foreground">{o.validUntil}</td>
                <td className="px-5 py-3 text-right font-medium text-foreground">
                  {eur(customerPricing(o).grossTotal)}
                </td>
                <td className="px-5 py-3 text-right">
                  <OfferStatusChip status={o.status} />
                  {o.viewedAt && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      viewed {o.viewedAt}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => duplicateOffer(o.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                  >
                    <Copy className="size-3.5" aria-hidden />
                    Revise
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
