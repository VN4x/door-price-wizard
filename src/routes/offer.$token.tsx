import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Mail, Printer } from "lucide-react";
import { DoorDrawing } from "@/components/DoorDrawing";
import { OfferStatusChip } from "@/components/StatusChip";
import { GLAZING_PACKAGES } from "@/lib/glass";
import { customerPricing } from "@/lib/offer";
import { FINISH_LABELS, VAT_RATE, eur } from "@/lib/pricing";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/offer/$offerId")({
  head: () => ({
    meta: [
      { title: "Your sliding door offer | Kvaliteetaken" },
      {
        name: "description",
        content:
          "Your personal sliding-door offer: dimensions, colour, glazing, delivery and installation with VAT and grand total.",
      },
      { property: "og:title", content: "Your sliding door offer | Kvaliteetaken" },
      {
        property: "og:description",
        content: "Dimensions, colour, glazing and totals for your made-to-measure sliding door.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OfferPage,
});

function OfferPage() {
  const { offerId } = Route.useParams();
  const { offers, updateOffer } = useStore();
  const offer = offers.find((o) => o.id === offerId);
  if (!offer) throw notFound();

  const price = customerPricing(offer);

  return (
    <main className="min-h-screen bg-background py-10 print:py-0">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 print:max-w-none print:px-0">
        <article className="doc rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10 print:rounded-none print:border-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
            <div>
              <div className="flex h-11 w-40 items-center justify-center rounded-lg border border-dashed border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Kvaliteetaken
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Offer for</p>
              <p className="text-lg font-semibold text-foreground">{offer.customerName}</p>
              <p className="text-sm text-muted-foreground">{offer.email}</p>
            </div>
            <div className="text-right">
              <OfferStatusChip status={offer.status} />
              <p className="mt-3 text-sm text-muted-foreground">Offer number</p>
              <p className="text-lg font-semibold text-foreground">
                {offer.number}
                {offer.version > 1 ? ` v${offer.version}` : ""}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Valid until {offer.validUntil}</p>
            </div>
          </header>

          {offer.lines.map((l) => (
            <section key={l.id} className="mt-8 grid gap-8 md:grid-cols-[1fr_320px] md:items-start">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Two-panel sliding door, {l.width} × {l.height} mm
                </h1>
                <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  <Spec label="Overall size" value={`${l.width} × ${l.height} mm`} />
                  <Spec label="Quantity" value={`${l.qty} pc${l.qty > 1 ? "s" : ""}`} />
                  <Spec label="Colour" value={FINISH_LABELS[l.finish]} />
                  <Spec label="Glazing" value={GLAZING_PACKAGES[l.glazing].label} />
                  <Spec
                    label="Active side"
                    value={l.activeSide === "L" ? "Left panel slides" : "Right panel slides"}
                  />
                  <Spec label="Hardware" value="Siegenia HST" />
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {GLAZING_PACKAGES[l.glazing].description}. Profile system Rehau Synego
                  {l.system === "hst" ? " HST" : " Slide"}.
                </p>
              </div>
              <DoorDrawing line={l} className="w-full rounded-xl border border-border bg-background p-3" />
            </section>
          ))}

          <section className="mt-10 rounded-2xl border border-border bg-secondary/40 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your price
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <PriceRow label="Sliding door" value={eur(price.productNet)} />
              {price.deliveryPrice > 0 && (
                <PriceRow label="Delivery" value={eur(price.deliveryPrice)} />
              )}
              {price.installationPrice > 0 && (
                <PriceRow label="Installation" value={eur(price.installationPrice)} />
              )}
              <PriceRow label="Total excl. VAT" value={eur(price.netTotal)} divider />
              <PriceRow label={`VAT ${Math.round(VAT_RATE * 100)}%`} value={eur(price.vat)} />
            </dl>
            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4 border-t border-border pt-5">
              <span className="text-base font-semibold text-foreground">Grand total incl. VAT</span>
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {eur(price.grossTotal)}
              </span>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Printer className="size-4" aria-hidden />
              Print offer
            </button>
            <a
              href="mailto:info@kvaliteetaken.ee"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Mail className="size-4" aria-hidden />
              Contact us
            </a>
            <button
              type="button"
              onClick={() => updateOffer(offer.id, { status: "accepted" })}
              disabled={offer.status === "accepted"}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:no-underline disabled:opacity-60"
            >
              <Check className="size-4" aria-hidden />
              {offer.status === "accepted" ? "Offer accepted" : "Accept offer"}
            </button>
          </div>

          <footer className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            <p>
              Prices are in euro and valid until {offer.validUntil}. Final dimensions are confirmed
              by measurement before production. Delivery and installation are quoted separately and
              can be removed at any time.
            </p>
            <p className="mt-2">
              Kvaliteetaken · info@kvaliteetaken.ee ·{" "}
              <Link to="/" className="underline-offset-4 hover:underline">
                kvaliteetaken.ee
              </Link>
            </p>
          </footer>
        </article>
      </div>
    </main>
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

function PriceRow({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        divider ? "border-t border-border pt-2" : ""
      }`}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
