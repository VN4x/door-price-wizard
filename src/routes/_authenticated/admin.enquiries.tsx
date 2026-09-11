import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { StatusChip } from "@/components/StatusChip";
import { GLAZING_PACKAGES } from "@/lib/glass";
import { FINISH_LABELS } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { Enquiry } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  head: () => ({
    meta: [
      { title: "Enquiries | Kvaliteetaken admin" },
      { name: "description", content: "Incoming sliding-door enquiries." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Enquiries,
});

const STATUS_META = {
  new: { label: "New", tone: "info" as const },
  quoted: { label: "Offer sent", tone: "neutral" as const },
  closed: { label: "Closed", tone: "good" as const },
};

function summaryText(e: Enquiry): string {
  const l = e.lines[0];
  if (!l) return e.customerName;
  return [
    `${e.number} — ${e.customerName} (${e.email}${e.phone ? `, ${e.phone}` : ""})`,
    `Sliding door ${l.width} x ${l.height} mm, ${l.qty} pc, active side ${l.activeSide}`,
    `${FINISH_LABELS[l.finish]}, ${GLAZING_PACKAGES[l.glazing].label}`,
    `Delivery: ${e.needsDelivery ? "yes" : "no"}, installation: ${e.needsInstallation ? "yes" : "no"}`,
    e.note ? `Note: ${e.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function Enquiries() {
  const { enquiries } = useStore();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (e: Enquiry) => {
    try {
      await navigator.clipboard.writeText(summaryText(e));
      setCopied(e.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {enquiries.length} enquiries. Copy a summary before calling the customer.
        </p>
      </div>

      <div className="grid gap-4">
        {enquiries.map((e) => (
          <article key={e.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="truncate text-base font-semibold text-foreground">
                    {e.customerName}
                  </h2>
                  <StatusChip {...STATUS_META[e.status]} />
                  <span className="text-xs text-muted-foreground">
                    {e.number} · {e.createdAt}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {e.email}
                  {e.phone ? ` · ${e.phone}` : ""}
                </p>
                <ul className="mt-3 grid gap-1 text-sm text-foreground">
                  {e.lines.map((l) => (
                    <li key={l.id}>
                      {l.width} × {l.height} mm · {l.qty} pc · active {l.activeSide} ·{" "}
                      {FINISH_LABELS[l.finish]} · {GLAZING_PACKAGES[l.glazing].label}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  Delivery {e.needsDelivery ? "yes" : "no"} · Installation{" "}
                  {e.needsInstallation ? "yes" : "no"}
                  {e.note ? ` · ${e.note}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void copy(e)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Copy className="size-4" aria-hidden />
                  {copied === e.id ? "Copied" : "Copy summary"}
                </button>
                <Link
                  to="/admin/offers"
                  className="rounded-xl bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Make offer
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
