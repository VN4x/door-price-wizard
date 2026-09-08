import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { glassOrderText, glassUnitsForOrder } from "@/lib/glass";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/admin/orders/$orderId/glass")({
  head: () => ({
    meta: [
      { title: "Glass order | Kvaliteetaken admin" },
      { name: "description", content: "Printer-friendly glass order sheet." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GlassOrder,
});

function GlassOrder() {
  const { orderId } = Route.useParams();
  const { orders, updateOrder } = useStore();
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw notFound();

  const units = glassUnitsForOrder(order.lines);

  const download = () => {
    const text = glassOrderText(order.number, order.customerName, order.lines);
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `glass-${order.number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    updateOrder(order.id, {
      status: order.status === "order" || order.status === "drawingsPrinted" ? "glassOrdered" : order.status,
      glassOrderedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          to="/admin/orders/$orderId/production"
          params={{ orderId: order.id }}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to production order
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <Printer className="size-4" aria-hidden />
            Print
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="size-4" aria-hidden />
            Download .txt
          </button>
        </div>
      </div>

      <section className="doc rounded-2xl border border-border bg-card p-6 print:rounded-none print:border-0">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Glass order {order.number}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">
          {order.customerName} · ordered {order.orderDate}
        </p>
        {order.glassOrderedAt && (
          <p className="mt-2 text-sm font-semibold text-accent">
            Glass order already sent on {order.glassOrderedAt} — check before ordering again.
          </p>
        )}

        <table className="mt-6 w-full text-left">
          <thead className="border-b-2 border-foreground text-sm uppercase tracking-wider">
            <tr>
              <th className="py-3">Glass label</th>
              <th className="py-3">Width × Height (mm)</th>
              <th className="py-3">Qty</th>
              <th className="py-3">Glazing</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u, i) => (
              <tr key={`${u.label}-${i}`} className="border-b border-border">
                <td className="py-5 text-xl font-semibold text-foreground">{u.label}</td>
                <td className="py-5 text-2xl font-bold tabular-nums text-foreground">
                  {u.width} × {u.height}
                </td>
                <td className="py-5 text-2xl font-bold tabular-nums text-foreground">{u.qty}</td>
                <td className="py-5 text-base text-muted-foreground">{u.glazing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
