import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Mail, ExternalLink } from "lucide-react";
import { DoorDrawing } from "@/components/DoorDrawing";
import { OfferStatusChip } from "@/components/StatusChip";
import { GLAZING_PACKAGES } from "@/lib/glass";
import {
  MARGIN_FLOOR_PERCENT,
  canSeeCosts,
  marginTone,
  priceOffer,
} from "@/lib/offer";
import { FINISH_LABELS, VAT_RATE, eur } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { OfferStatus } from "@/types";

export const Route = createFileRoute("/admin/offers/$offerId")({
  head: () => ({
    meta: [
      { title: "Offer editor | Kvaliteetaken admin" },
      { name: "description", content: "Edit and send a sliding-door offer." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OfferEditor,
});

const STATUSES: OfferStatus[] = ["draft", "sent", "accepted", "declined"];

function OfferEditor() {
  const { offerId } = Route.useParams();
  const { offers, updateOffer, role } = useStore();
  const offer = offers.find((o) => o.id === offerId);
  if (!offer) throw notFound();

  const [showCalc, setShowCalc] = useState(false);
  const price = priceOffer(offer);
  const seeCosts = canSeeCosts(role);
  const tone = marginTone(price.marginPercent);
  const line = offer.lines[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
      <div className="grid min-w-0 gap-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {offer.number}
              {offer.version > 1 ? ` v${offer.version}` : ""} · {offer.customerName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {offer.email}
              {offer.phone ? ` · ${offer.phone}` : ""} · valid until {offer.validUntil}
            </p>
          </div>
          <OfferStatusChip status={offer.status} size="lg" />
        </div>

        {/* configuration */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Configuration
          </h2>
          {line && (
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Spec label="Size" value={`${line.width} × ${line.height} mm`} />
              <Spec label="Quantity" value={`${line.qty} pc${line.qty > 1 ? "s" : ""}`} />
              <Spec label="Colour" value={FINISH_LABELS[line.finish]} />
              <Spec label="Glazing" value={GLAZING_PACKAGES[line.glazing].label} />
              <Spec
                label="Active side"
                value={line.activeSide === "L" ? "Left panel" : "Right panel"}
              />
              <Spec label="System" value={line.system === "hst" ? "Synego HST" : "Synego Slide"} />
            </dl>
          )}
        </section>

        {/* price panel */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Offer amount
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <NumberField
              label="Product net (EUR)"
              value={String(Math.round(price.productNet))}
              onChange={(v) => updateOffer(offer.id, { priceOverride: v === "" ? null : Number(v) })}
            />
            <NumberField
              label="Delivery (EUR)"
              value={String(offer.deliveryPrice)}
              onChange={(v) => updateOffer(offer.id, { deliveryPrice: Number(v) || 0 })}
            />
            <NumberField
              label="Installation (EUR)"
              value={String(offer.installationPrice)}
              onChange={(v) => updateOffer(offer.id, { installationPrice: Number(v) || 0 })}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Discount (%)"
              value={String(offer.discountPercent ?? 0)}
              onChange={(v) =>
                updateOffer(offer.id, {
                  discountPercent: Math.min(40, Math.max(0, Number(v) || 0)),
                })
              }
            />
            <TextField
              label="Discount reason (shown to the customer)"
              value={offer.discountReason ?? ""}
              onChange={(v) => updateOffer(offer.id, { discountReason: v })}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Calculated net {eur(price.calculatedNet)}
              {price.discountEur > 0 ? ` · discount −${eur(price.discountEur)}` : ""}
            </span>
            {offer.priceOverride !== null && (
              <button
                type="button"
                onClick={() => updateOffer(offer.id, { priceOverride: null })}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Reset to calculated
              </button>
            )}
          </div>

          {/* margin guard */}
          <div
            className={`mt-5 rounded-xl border p-4 text-sm ${
              tone === "good"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : tone === "warn"
                  ? "border-accent/40 bg-accent/10"
                  : "border-destructive/40 bg-destructive/10"
            }`}
          >
            <p className="font-semibold text-foreground">
              Margin {price.marginPercent.toFixed(1)}%
              {seeCosts ? ` · ${eur(price.marginEur)}` : ""}
            </p>
            <p className="mt-1 text-muted-foreground">
              {tone === "bad"
                ? `Below the ${MARGIN_FLOOR_PERCENT}% floor — this discount needs the owner's approval.`
                : tone === "warn"
                  ? "Thin but acceptable. Check delivery and installation are covered."
                  : "Healthy margin."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCalc(!showCalc)}
            aria-expanded={showCalc}
            disabled={!seeCosts}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            <ChevronDown
              className={`size-4 transition-transform ${showCalc ? "rotate-180" : ""}`}
              aria-hidden
            />
            {seeCosts
              ? showCalc
                ? "Hide calculation"
                : "Show calculation"
              : "Calculation visible to the owner only"}
          </button>

          {seeCosts && showCalc && (
            <dl className="mt-3 space-y-1.5 rounded-xl bg-secondary/60 p-4 text-sm">
              {price.lines.map((lp) => (
                <div key={lp.line.id} className="grid gap-1.5">
                  {lp.quote.groups.map((g) => (
                    <Row key={g.group} label={g.label} value={eur(g.total * lp.line.qty)} />
                  ))}
                  {lp.quote.threshold > 0 && (
                    <Row label="Threshold rail" value={eur(lp.quote.threshold * lp.line.qty)} />
                  )}
                  <Row label="Glazing upgrade" value={eur(lp.glazingUplift * lp.line.qty)} />
                  <Row label="Labour" value={eur(lp.quote.labour * lp.line.qty)} />
                  <Row label="Cost total" value={eur(lp.cost)} strong />
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* status & send */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateOffer(offer.id, { status: s })}
                aria-pressed={offer.status === s}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  offer.status === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              updateOffer(offer.id, {
                status: "sent",
                sentAt: new Date().toISOString().slice(0, 10),
              })
            }
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Mail className="size-5" aria-hidden />
            Send offer by email
          </button>
        </section>
      </div>

      {/* customer preview */}
      <aside className="min-w-0 xl:sticky xl:top-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              What the customer sees
            </h2>
            <Link
              to="/offer/$token"
              params={{ token: offer.token }}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Open
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          </div>
          {line && (
            <DoorDrawing
              line={line}
              className="mt-4 w-full rounded-xl border border-border bg-background p-3"
            />
          )}
          <dl className="mt-5 space-y-2 text-sm">
            <Row label="Sliding door" value={eur(price.productNet)} />
            {price.deliveryPrice > 0 && <Row label="Delivery" value={eur(price.deliveryPrice)} />}
            {price.installationPrice > 0 && (
              <Row label="Installation" value={eur(price.installationPrice)} />
            )}
            <Row label="Total excl. VAT" value={eur(price.netTotal)} strong />
            <Row label={`VAT ${Math.round(VAT_RATE * 100)}%`} value={eur(price.vat)} />
            <Row label="Grand total" value={eur(price.grossTotal)} strong />
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            No cost or margin figure appears on the customer page.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium outline-none focus:border-primary"
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium outline-none focus:border-primary"
      />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        strong ? "border-t border-border pt-1.5" : ""
      }`}
    >
      <dt className={strong ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-semibold text-foreground" : "font-medium text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
