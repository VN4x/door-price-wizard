import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Download, Printer } from "lucide-react";
import { DoorDrawing } from "@/components/DoorDrawing";
import { OrderStatusChip } from "@/components/StatusChip";
import {
  GLAZING_PACKAGES,
  glassOrderText,
  glassUnitsForOrder,
  groupGlassUnits,
} from "@/lib/glass";
import { SYSTEM_SHORT } from "@/lib/production";
import { FINISH_LABELS, calculateQuote, getCostLines } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { DoorLine } from "@/types";

export const Route = createFileRoute("/admin/orders/$orderId/production")({
  head: () => ({
    meta: [
      { title: "Production order | Kvaliteetaken admin" },
      { name: "description", content: "Print-friendly production order with cut lists and glass sizes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductionOrder,
});

/** Articles a fitter reads off the sheet; tiny fixings stay in a quiet block. */
const SMALL_GROUPS = new Set(["hardware", "seals"]);

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
  return quote.lines
    .filter((l) => l.group !== "glass")
    .map((l) => {
      const base = meta.find((m) => m.id === l.id);
      const perDoor = l.qty;
      return {
        id: l.id,
        name: l.label,
        group: base?.group ?? l.group,
        cutLength: l.driver === "fixed" ? "" : perDoor.toFixed(2),
        pieces: l.driver === "fixed" ? (perDoor * line.qty).toFixed(0) : (perDoor * line.qty).toFixed(2),
        unit: unitFor(l.driver),
        small: SMALL_GROUPS.has(base?.group ?? l.group),
      };
    });
}

function ProductionOrder() {
  const { orderId } = Route.useParams();
  const { orders, updateOrder } = useStore();
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw notFound();

  const glass = groupGlassUnits(glassUnitsForOrder(order.lines));
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
          {order.drawingsPrintedAt
            ? `Drawings printed ${order.drawingsPrintedAt}`
            : "Mark drawings printed"}
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
            <h1 className="truncate text-6xl font-bold leading-none tracking-tight text-foreground">
              {order.number}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-foreground">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">
              Order date {order.orderDate} · {order.lines.length} product
              {order.lines.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <OrderStatusChip status={order.status} size="lg" />
          </div>
        </header>

        {order.lines.map((line, index) => {
          const materials = materialsFor(line);
          const big = materials.filter((m) => !m.small);
          const small = materials.filter((m) => m.small);
          return (
            <section key={line.id} className="mt-8 break-inside-avoid border-t border-border pt-6 first-of-type:border-0">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Product {index + 1} of {order.lines.length}
                </p>
                <p className="rounded-lg border-2 border-foreground px-3 py-1 text-xl font-bold tracking-widest text-foreground">
                  {SYSTEM_SHORT[line.system]}
                </p>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-2xl border-2 border-foreground p-5">
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">
                    Overall size, mm
                  </p>
                  <p className="mt-1 text-6xl font-bold leading-none tabular-nums tracking-tight text-foreground">
                    {line.width} × {line.height}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-foreground p-5">
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">Quantity</p>
                  <p className="mt-1 text-6xl font-bold leading-none tabular-nums text-foreground">
                    {line.qty}
                  </p>
                  <p className="text-sm text-muted-foreground">pc</p>
                </div>
                <div className="rounded-2xl bg-accent p-5 text-accent-foreground">
                  <p className="text-sm uppercase tracking-widest opacity-80">Active side</p>
                  <p className="mt-1 text-5xl font-bold leading-none tracking-tight">
                    {line.activeSide === "L" ? "LEFT" : "RIGHT"}
                  </p>
                  <p className="text-sm opacity-90">panel slides</p>
                </div>
              </div>

              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-3">
                <Spec label="Colour" value={FINISH_LABELS[line.finish]} />
                <Spec label="Glazing" value={GLAZING_PACKAGES[line.glazing].label} />
                <Spec
                  label="Hardware"
                  value={line.system === "hst" ? "Siegenia HST" : "Siegenia Slide"}
                />
              </dl>

              <h2 className="mt-6 text-lg font-bold uppercase tracking-wider text-foreground">
                Cut list
              </h2>
              <table className="mt-2 w-full text-left">
                <thead className="border-b-2 border-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-2">Article</th>
                    <th className="py-2 text-right">Cut length / door</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-right">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {big.map((m) => (
                    <tr key={m.id} className="border-b border-border">
                      <td className="py-2.5 text-xl font-semibold text-foreground">{m.name}</td>
                      <td className="py-2.5 text-right text-xl tabular-nums text-foreground">
                        {m.cutLength}
                      </td>
                      <td className="py-2.5 text-right text-2xl font-bold tabular-nums text-foreground">
                        {m.pieces}
                      </td>
                      <td className="py-2.5 text-right text-sm text-muted-foreground">{m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2 className="mt-6 text-lg font-bold uppercase tracking-wider text-foreground">
                Glass for this product
              </h2>
              <table className="mt-2 w-full text-left">
                <thead className="border-b-2 border-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-2">Panel</th>
                    <th className="py-2 text-right">Width × height, mm</th>
                    <th className="py-2 text-right">Pcs</th>
                  </tr>
                </thead>
                <tbody>
                  {groupGlassUnits(glassUnitsForOrder([line])).map((g) => (
                    <tr key={`${g.width}x${g.height}`} className="border-b border-border">
                      <td className="py-2.5 text-lg font-semibold text-foreground">
                        {g.labels.join(", ")}
                      </td>
                      <td className="py-2.5 text-right text-3xl font-bold tabular-nums tracking-tight text-foreground">
                        {g.width} × {g.height}
                      </td>
                      <td className="py-2.5 text-right text-2xl font-bold tabular-nums text-foreground">
                        {g.pieces}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {small.length > 0 && (
                <details className="mt-4 rounded-xl border border-border p-4 print:open" open>
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Seals, hardware and small parts
                  </summary>
                  <ul className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    {small.map((m) => (
                      <li key={m.id} className="flex justify-between gap-3 border-b border-border py-1">
                        <span>{m.name}</span>
                        <span className="tabular-nums">
                          {m.pieces} {m.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              <details className="mt-3 print:hidden">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Show drawing
                </summary>
                <DoorDrawing line={line} detail className="mt-3 w-full max-w-xl" />
              </details>
            </section>
          );
        })}

        <section className="mt-8 break-inside-avoid border-t-2 border-foreground pt-5">
          <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
            Glass order summary, whole order
          </h2>
          <table className="mt-2 w-full text-left">
            <tbody>
              {glass.map((g) => (
                <tr key={`${g.system}-${g.width}x${g.height}-${g.glazing}`} className="border-b border-border">
                  <td className="py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.system}
                  </td>
                  <td className="py-2 text-2xl font-bold tabular-nums text-foreground">
                    {g.width} × {g.height}
                  </td>
                  <td className="py-2 text-sm text-muted-foreground">{g.glazing}</td>
                  <td className="py-2 text-right text-2xl font-bold tabular-nums text-foreground">
                    {g.pieces} pcs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            No prices on this sheet. Cut lengths are metres per door; the total column already
            includes the quantity.
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
      <dd className="mt-1 text-xl font-bold text-foreground">{value}</dd>
    </div>
  );
}
