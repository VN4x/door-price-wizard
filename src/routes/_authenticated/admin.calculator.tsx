import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Lock, RotateCcw } from "lucide-react";
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
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/admin/calculator")({
  head: () => ({
    meta: [
      { title: "Cost calculator | Kvaliteetaken admin" },
      {
        name: "description",
        content: "Internal cost and price calculator for Synego Slide and HST sliding doors.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CalculatorPage,
});

const FINISHES: Finish[] = ["white", "oneSide", "bothSides"];
const SYSTEMS: SystemId[] = ["slide", "hst"];

function CalculatorPage() {
  const { role } = useStore();
  const [widthText, setWidthText] = useState("3500");
  const [heightText, setHeightText] = useState("2178");
  const [finish, setFinish] = useState<Finish>("white");
  const [markupText, setMarkupText] = useState(String(DEFAULT_MARKUP));
  const [thresholdOverride, setThresholdOverride] = useState<ThresholdId | null>(null);
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

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <Lock className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 text-lg font-semibold text-foreground">Owner only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The cost calculator shows purchase costs, so it stays with the owner account.
        </p>
      </div>
    );
  }

  const reset = () => {
    setWidthText("3500");
    setHeightText("2178");
    setFinish("white");
    setMarkupText(String(DEFAULT_MARKUP));
    setThresholdOverride(null);
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cost calculator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference door 3500 × 2178 mm reproduces the cost sheet exactly. Other sizes scale from it.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-6 lg:self-start">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Configuration
            </h2>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
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
                      : "border-border text-muted-foreground hover:border-primary/40"
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
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
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {!quotes ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground md:col-span-2">
              Enter a valid size and markup to see the price.
            </div>
          ) : (
            SYSTEMS.map((id) => (
              <QuoteCard
                key={id}
                quote={quotes[id]}
                open={openBreakdown === id}
                onToggle={() => setOpenBreakdown(openBreakdown === id ? null : id)}
              />
            ))
          )}
        </section>
      </div>
    </div>
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
      <div className="flex items-center rounded-lg border border-border bg-background pr-3 focus-within:border-primary">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-sm font-medium outline-none"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function QuoteCard({
  quote,
  open,
  onToggle,
}: {
  quote: Quote;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {SYSTEM_LABELS[quote.system]}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {SYSTEM_NOTES[quote.system]}
      </p>
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
        className="mt-5 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-primary hover:text-primary/80"
      >
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
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
