import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";
import {
  DEFAULT_MARKUP,
  FINISH_LABELS,
  LIMITS,
  SYSTEM_LABELS,
  SYSTEM_NOTES,
  THRESHOLDS,
  VAT_RATE,
  calculateQuote,
  eur,
  suggestThreshold,
  validateSize,
  type Finish,
  type Quote,
  type SystemId,
  type ThresholdId,
} from "@/lib/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sliding Door Price Calculator | Rehau Synego Slide & HST" },
      {
        name: "description",
        content:
          "Instant dealer price offer for Rehau Synego Slide and HST sliding doors. Enter size from 1500x1500 to 4500x2400 mm, choose the finish, get material, labour, markup and VAT.",
      },
      { property: "og:title", content: "Sliding Door Price Calculator | Synego Slide & HST" },
      {
        property: "og:description",
        content:
          "Quick price offers for Rehau Synego Slide and HST sliding doors: custom size, white or laminated finish, threshold options.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Calculator,
});

const FINISHES: Finish[] = ["white", "oneSide", "bothSides"];
const SYSTEMS: SystemId[] = ["slide", "hst"];

function Calculator() {
  const [widthText, setWidthText] = useState("3500");
  const [heightText, setHeightText] = useState("2178");
  const [finish, setFinish] = useState<Finish>("white");
  const [markupText, setMarkupText] = useState(String(DEFAULT_MARKUP));
  const [thresholdOverride, setThresholdOverride] = useState<ThresholdId | null>(null);
  const [selected, setSelected] = useState<SystemId>("slide");
  const [openBreakdown, setOpenBreakdown] = useState<SystemId | null>(null);

  const width = Number(widthText);
  const height = Number(heightText);
  const markup = Number(markupText);
  const sizeError = validateSize(width, height);
  const suggested = Number.isFinite(width) ? suggestThreshold(width) : "t37";
  const threshold = thresholdOverride ?? suggested;

  const quotes = useMemo(() => {
    if (sizeError || !Number.isFinite(markup)) return null;
    const input = { width, height, finish, markupPercent: markup, threshold };
    return {
      slide: calculateQuote("slide", input),
      hst: calculateQuote("hst", input),
    } satisfies Record<SystemId, Quote>;
  }, [sizeError, width, height, finish, markup, threshold]);

  const reset = () => {
    setWidthText("3500");
    setHeightText("2178");
    setFinish("white");
    setMarkupText(String(DEFAULT_MARKUP));
    setThresholdOverride(null);
    setSelected("slide");
  };

  const areaText =
    sizeError === null ? `${((width * height) / 1_000_000).toFixed(2)} m²` : "\u2014";

  return (
    <main className="min-h-screen bg-background pb-20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-7 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Dealer tool · quick offer
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sliding door price calculator
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Rehau Synego Slide and Synego HST. Enter a custom size, pick the finish, and read the
            offer price straight off the screen.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[360px_1fr]">
        {/* ---------------------------------------------------------- inputs */}
        <section className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Configuration
              </h2>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberField
                id="width"
                label="Width"
                unit="mm"
                hint={`${LIMITS.minWidth}–${LIMITS.maxWidth}`}
                value={widthText}
                onChange={setWidthText}
              />
              <NumberField
                id="height"
                label="Height"
                unit="mm"
                hint={`${LIMITS.minHeight}–${LIMITS.maxHeight}`}
                value={heightText}
                onChange={setHeightText}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Opening area {areaText}</p>

            {sizeError && (
              <p
                role="alert"
                className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
              >
                {sizeError}
              </p>
            )}

            <fieldset className="mt-6">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Finish
              </legend>
              <div className="flex flex-col gap-2">
                {FINISHES.map((f) => (
                  <label
                    key={f}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      finish === f
                        ? "border-primary bg-primary/5 font-medium text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="finish"
                      value={f}
                      checked={finish === f}
                      onChange={() => setFinish(f)}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {FINISH_LABELS[f]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label
                htmlFor="threshold"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Threshold rail (HST only)
              </label>
              <select
                id="threshold"
                value={threshold}
                onChange={(e) => setThresholdOverride(e.target.value as ThresholdId)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
              >
                {(Object.keys(THRESHOLDS) as ThresholdId[]).map((id) => (
                  <option key={id} value={id}>
                    {THRESHOLDS[id].label} — {eur(THRESHOLDS[id].price)} delivered
                    {id === suggested ? " (suggested)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6">
              <NumberField
                id="markup"
                label="Markup"
                unit="%"
                value={markupText}
                onChange={setMarkupText}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                VAT of {Math.round(VAT_RATE * 100)}% is added on top of the marked-up price.
              </p>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- results */}
        <section className="flex flex-col gap-5">
          {!quotes ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Enter a valid size and markup to see the offer price.
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                {SYSTEMS.map((id) => (
                  <QuoteCard
                    key={id}
                    quote={quotes[id]}
                    selected={selected === id}
                    onSelect={() => setSelected(id)}
                    open={openBreakdown === id}
                    onToggle={() => setOpenBreakdown(openBreakdown === id ? null : id)}
                  />
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Offer summary
                  </h2>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Printer className="size-4" aria-hidden />
                    Print offer
                  </button>
                </div>
                <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  <SummaryRow label="System" value={SYSTEM_LABELS[selected]} />
                  <SummaryRow label="Size" value={`${width} × ${height} mm`} />
                  <SummaryRow label="Finish" value={FINISH_LABELS[finish]} />
                  <SummaryRow
                    label="Threshold"
                    value={
                      selected === "hst"
                        ? `${THRESHOLDS[threshold].label} (${eur(THRESHOLDS[threshold].price)})`
                        : "Not applicable"
                    }
                  />
                  <SummaryRow label="Price excl. VAT" value={eur(quotes[selected].netPrice)} />
                  <SummaryRow
                    label="Price incl. VAT"
                    value={eur(quotes[selected].grossPrice)}
                    emphasis
                  />
                </dl>
                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                  Indicative price offer only. Glass specification is fixed at 4s-4-4s 18/16 argon,
                  Rw 35 dB. Quantities are scaled from the reference door 3500 × 2178 mm; confirm
                  before ordering.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function NumberField({
  id,
  label,
  unit,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label} {hint && <span className="font-normal normal-case tracking-normal">({hint})</span>}
      </label>
      <div className="flex items-center rounded-lg border border-border bg-background pr-3 transition-colors focus-within:border-primary">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-sm font-medium text-foreground outline-none"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={
          emphasis
            ? "text-base font-semibold text-accent"
            : "text-sm font-medium text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function QuoteCard({
  quote,
  selected,
  onSelect,
  open,
  onToggle,
}: {
  quote: Quote;
  selected: boolean;
  onSelect: () => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-colors ${
        selected ? "border-primary ring-1 ring-primary/30" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {SYSTEM_LABELS[quote.system]}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {SYSTEM_NOTES[quote.system]}
          </p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
          }`}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
        {eur(quote.grossPrice)}
      </p>
      <p className="text-xs text-muted-foreground">
        incl. VAT · {eur(quote.netPrice)} excl. VAT
      </p>

      <dl className="mt-5 space-y-1.5 text-sm">
        <Row label="Materials" value={eur(quote.materials)} />
        {quote.threshold > 0 && <Row label="Threshold rail" value={eur(quote.threshold)} />}
        <Row label="Labour" value={eur(quote.labour)} />
        <Row label="Cost total" value={eur(quote.cost)} strong />
        <Row label="Markup" value={eur(quote.markup)} />
        <Row label={`VAT ${Math.round(VAT_RATE * 100)}%`} value={eur(quote.vat)} />
      </dl>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-5 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-primary transition-colors hover:text-primary/80"
      >
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
        {open ? "Hide cost breakdown" : "Show cost breakdown"}
      </button>

      {open && (
        <dl className="mt-3 space-y-1.5 rounded-lg bg-secondary/60 p-4 text-sm">
          {quote.groups.map((g) => (
            <Row key={g.group} label={g.label} value={eur(g.total)} />
          ))}
          {quote.threshold > 0 && <Row label="Threshold rail" value={eur(quote.threshold)} />}
        </dl>
      )}
    </article>
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
