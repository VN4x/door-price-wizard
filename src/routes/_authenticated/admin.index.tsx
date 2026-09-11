import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { OfferStatusChip, OrderStatusChip } from "@/components/StatusChip";
import { customerPricing } from "@/lib/offer";
import { eur } from "@/lib/pricing";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Kvaliteetaken admin" },
      { name: "description", content: "Enquiries, offers and production at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { enquiries, offers, orders } = useStore();

  const cards = [
    { label: "New enquiries", value: enquiries.filter((e) => e.status === "new").length },
    { label: "Offers awaiting reply", value: offers.filter((o) => o.status === "sent").length },
    {
      label: "Orders in production",
      value: orders.filter((o) => o.status === "order" || o.status === "drawingsPrinted" || o.status === "glassOrdered").length,
    },
    { label: "Ready for delivery", value: orders.filter((o) => o.status === "ready").length },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Today, {new Date().toISOString().slice(0, 10)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Recent offers" to="/admin/offers">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Offer</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 text-right font-medium">Total</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {offers.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-2.5 font-medium text-foreground">
                    <Link
                      to="/admin/offers/$offerId"
                      params={{ offerId: o.id }}
                      className="underline-offset-4 hover:underline"
                    >
                      {o.number}
                    </Link>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{o.customerName}</td>
                  <td className="py-2.5 text-right font-medium text-foreground">
                    {eur(customerPricing(o).grossTotal)}
                  </td>
                  <td className="py-2.5 text-right">
                    <OfferStatusChip status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Recent production orders" to="/admin/orders">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-2.5 font-medium text-foreground">
                    <Link
                      to="/admin/orders/$orderId/production"
                      params={{ orderId: o.id }}
                      className="underline-offset-4 hover:underline"
                    >
                      {o.number}
                    </Link>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{o.customerName}</td>
                  <td className="py-2.5 text-muted-foreground">
                    {o.lines[0]?.width} × {o.lines[0]?.height}
                  </td>
                  <td className="py-2.5 text-right">
                    <OrderStatusChip status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Order pipeline
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <span className="w-32 font-medium text-foreground">{o.number}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {o.customerName} · {o.lines[0]?.width} × {o.lines[0]?.height} mm · active{" "}
                {o.lines[0]?.activeSide === "L" ? "left" : "right"}
              </span>
              <OrderStatusChip status={o.status} />
              <Link
                to="/admin/orders/$orderId/production"
                params={{ orderId: o.id }}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Panel({
  title,
  to,
  children,
}: {
  title: string;
  to: "/admin/offers" | "/admin/orders";
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <Link
          to={to}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View all
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
