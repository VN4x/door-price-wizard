import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Download, Printer } from "lucide-react";
import { DoorDrawing } from "@/components/DoorDrawing";
import { OrderStatusChip } from "@/components/StatusChip";
import { GLAZING_PACKAGES, glassOrderText } from "@/lib/glass";
import { FINISH_LABELS, getCostLines, calculateQuote } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { DoorLine } from "@/types";

export const Route = createFileRoute("/admin/orders/$orderId/production")({
  head: () => ({
    meta: [
      { title: "Production order | Kvaliteetaken admin" },
      { name: "description", content: "Print-friendly production order with drawing and materials." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductionOrder;
});

function unitFor(driver: string): string {
  if (driver === "fixed") return "pcs";
  if (driver === "glassArea") return "m²";
  return "m";
}

function materialsFor(line: DoorLine) {
  const quote = calculateQuote(line.system, {
    width: line.width,
    height: line.height,
    finish: line.finish,
    markupPercent: 0,
    threshold: line.threshold,
  });
  const meta = getCostLines(line.system);
  return quote.lines.map((l) => {
    const base = meta.find((m) => m.id === l.id);
    return {
      id: l.id,
      name: l.label,
      description: base ? base.group : "",
      cutLength: l.driver === "fixed" || l.driver === "glassArea" ? "" : l.qty.toFixed(2),
      qty: l.driver === "fixed" ? l.qty.toFixed(0) : l.qty.toFixed(2),
      unit: unitFor(l.driver),
    };
  });
}

function ProductionOrder() {
  const { orderId } = Route.useParams();
  const { orders, updateOrder } = useStore();
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw notFound();
  const line = order.lines[0];
  if (!line) throw notFound();

  const materials = materialsFor(line);
  const today = new Date().toISOString().slice(0, 10);

  const downloadGlass = () => {
    const text = glassOrderText(order.number, order.customerName, order.lines);
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `glass-${order.number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Printer className="size-4" aria-hidden />
          Print production order
        </button>
        <button
          type="button"
          onClick={downloadGlass}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          <Download className="size-4" aria-hidden />
          Download glass order .txt
        </button>
        <button
          type="button"
          onClick={() =>
            updateOrder(order.id, {
              status: order.status === "order" ? "drawingsPrinted" : order.status,
              drawingsPrintedAt: today,
            })
          }
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          <Check className="size-4" aria-hidden />
          {order.drawingsPrintedAt ? `Drawings printed ${order.drawingsPrintedAt}` : "Mark drawings printed"}
        </button>
        <button
          type="button"
          onClick={() => updateOrder(order.id, { status: "glassOrdered", glassOrderedAt: today })}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          <Check className="size-4" aria-hidden />
          {order.glassOrderedAt ? `Glass ordered ${order.glassOrderedAt}` : "Mark glass ordered"}
        </button>
        <Link
          to="/admin/orders/$orderId/glass"
          params={{ orderId: order.id }}
          className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Glass order sheet
        </Link>
      </div>

      <article className="doc rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 print:rounded-none print:border-0 print:shadow-none">
        <header className="grid gap-4 border-b-2 border-foreground pb-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Production order
            </p>
            <h1 className="truncate text-4xl font-bold tracking-tight text-foreground">
              {order.number}
            </h1>
            <p className="mt-1 text-xl text-foreground">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">Order date {order.orderDate}</p>
          </div>
          <div className="text-right">
            <OrderStatusChip status={order.status} size="lg" />
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-foreground p-5">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Overall size</p>
            <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight text-foreground">
              {line.width} × {line.height}
            </p>
            <p className="text-sm text-muted-foreground">mm · quantity {line.qty} pc</p>
          </div>
          <div className="rounded-2xl bg-accent p-5 text-accent-foreground">
            <p className="text-sm uppercase tracking-widest opacity-80">Active side</p>
            <p className="mt-1 text-5xl font-bold tracking-tight">
              {line.activeSide === "L" ? "LEFT" : "RIGHT"}
            </p>
            <p className="text-sm opacity-90">
              {line.activeSide === "L" ? "Left panel slides" : "Right panel slides"}
            </p>
          </div>
        </section>

        <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-4">
          <Spec label="System" value={line.system === "hst" ? "Synego HST" : "Synego Slide"} />
          <Spec label="Colour" value={FINISH_LABELS[line.finish]} />
          <Spec label="Glazing" value={GLAZING_PACKAGES[line.glazing].label} />
          <Spec label="Hardware" value="Siegenia HST" />
        </dl>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Technical drawing
          </h2>
          <DoorDrawing line={line} detail className="mt-3 w-full" />
        </section>

        <section className="mt-8 break-inside-avoid">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Materials
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b-2 border-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2">Article</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Cut length</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-b border-border">
                  <td className="py-2 font-medium text-foreground">{m.name}</td>
                  <td className="py-2 capitalize text-muted-foreground">{m.description}</td>
                  <td className="py-2 text-right tabular-nums text-foreground">{m.cutLength}</td>
                  <td className="py-2 text-right tabular-nums font-semibold text-foreground">
                    {m.qty}
                  </td>
                  <td className="py-2 text-right text-muted-foreground">{m.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            No prices on this sheet. Cut lengths are total metres per article for this order line.
          </p>
        </section>
      </article>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-foreground">{value}</dd>
    </div>
  );
}
