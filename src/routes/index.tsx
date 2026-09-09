import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Ruler, ShieldCheck, Timer } from "lucide-react";
import { CallbackBox } from "@/components/CallbackBox";
import { SiteHeader } from "@/components/SiteHeader";
import { EXTRAS } from "@/lib/extras";
import { publicPrice } from "@/lib/public-price";
import { LIMITS, SYSTEM_LABELS, SYSTEM_NOTES, eur, type Finish, type SystemId } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { ExtraId } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sliding door prices in minutes | Kvaliteetaken" },
      {
        name: "description",
        content:
          "See the price of a made-to-measure Rehau Synego Slide or HST sliding door straight away: enter your opening size and pick a colour and extras.",
      },
      { property: "og:title", content: "Sliding door prices in minutes | Kvaliteetaken" },
      {
        property: "og:description",
        content: "Enter your opening size and see the price of both sliding door systems at once.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricePage,
});

const FINISHES: { id: Finish; label: string }[] = [
  { id: "white", label: "White both sides" },
  { id: "oneSide", label: "Anthracite outside / white inside" },
  { id: "bothSides", label: "Anthracite both sides" },
];

const SYSTEMS: SystemId[] = ["slide", "hst"];

function PricePage() {
  const navigate = useNavigate();
  const { setPending } = useStore();
  const [widthText, setWidthText] = useState("2000");
  const [heightText, setHeightText] = useState("2000");
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [finish, setFinish] = useState<Finish>("white");

  const width = Number(widthText);
  const height = Number(heightText);

  const prices = useMemo(
    () =>
      Object.fromEntries(
        SYSTEMS.map((system) => [
          system,
          Object.fromEntries(
            FINISHES.map((f) => [f.id, publicPrice({ system, width, height, finish: f.id, extras })]),
          ) as Record<Finish, ReturnType<typeof publicPrice>>,
        ]),
      ) as Record<SystemId, Record<Finish, ReturnType<typeof publicPrice>>>,
    [width, height, extras],
  );

  const toggleExtra = (id: ExtraId) =>
    setExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const wantIt = (system: SystemId) => {
    setPending({ system, width, height, finish, extras });
    navigate({ to: "/enquiry" }).catch((err) => console.error("nav", err));
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pb-16">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Rehau Synego Slide &amp; HST · Siegenia hardware
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your sliding door price, right now
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Enter your opening. Both systems are priced side by side, including VAT, with fitting
              and delivery estimated separately.
            </p>
          </div>
        </section>

        <div className="mx-auto mt-8 grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="grid gap-6 lg:sticky lg:top-20 lg:self-start">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your opening
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <NumberField
                  id="width"
                  label="Width"
                  hint={`${LIMITS.minWidth}–${LIMITS.maxWidth}`}
                  value={widthText}
                  onChange={setWidthText}
                />
                <NumberField
                  id="height"
                  label="Height"
                  hint={`${LIMITS.minHeight}–${LIMITS.maxHeight}`}
                  value={heightText}
                  onChange={setHeightText}
                />
              </div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Options
              </h3>
              <ul className="mt-3 grid gap-2">
                {EXTRAS.map((e) => (
                  <li key={e.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm transition-colors hover:border-primary/40">
                      <input
                        type="checkbox"
                        checked={extras.includes(e.id)}
                        onChange={() => toggleExtra(e.id)}
                        className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-3">
                          <span className="font-medium text-foreground">{e.label}</span>
                          <span className="whitespace-nowrap font-semibold text-foreground">
                            +{eur(e.price)}
                            {e.perYear ? " / year" : ""}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{e.hint}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>

            <CallbackBox />
          </aside>

          <div className="grid gap-6">
            <section className="grid gap-6 md:grid-cols-2">
              {SYSTEMS.map((system) => (
                <SystemCard
                  key={system}
                  system={system}
                  prices={prices[system]}
                  finish={finish}
                  onFinish={setFinish}
                  onWantIt={() => wantIt(system)}
                />
              ))}
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Ruler,
                  title: "Made to measure",
                  text: "Cut to your exact opening, no standard sizes.",
                },
                {
                  icon: Timer,
                  title: "4–5 weeks",
                  text: "Usual time from confirmed order to delivery.",
                },
                {
                  icon: ShieldCheck,
                  title: "Clear pricing",
                  text: "Product, delivery and fitting always shown separately.",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
                  <f.icon className="size-5 text-accent" aria-hidden />
                  <p className="mt-3 text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </section>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Prices include VAT and are indicative until we confirm the measurements. Fitting and
              delivery are estimates for mainland Estonia.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function SystemCard({
  system,
  prices,
  finish,
  onFinish,
  onWantIt,
}: {
  system: SystemId;
  prices: Record<Finish, ReturnType<typeof publicPrice>>;
  finish: Finish;
  onFinish: (f: Finish) => void;
  onWantIt: () => void;
}) {
  const white = prices.white;
  const others = FINISHES.filter((f) => f.id !== "white");
  const selected = prices[finish];

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {SYSTEM_LABELS[system]}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{SYSTEM_NOTES[system]}</p>

      {white.productGross === null ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          {white.unavailableReason}
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onFinish("white")}
            aria-pressed={finish === "white"}
            className={`mt-5 rounded-xl border p-4 text-left transition-colors ${
              finish === "white" ? "border-primary bg-primary/5" : "border-transparent hover:bg-secondary/60"
            }`}
          >
            <span className="block text-4xl font-semibold tracking-tight text-foreground">
              {eur(white.totalGross ?? 0)}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              White both sides, standard glass, incl. VAT
            </span>
          </button>

          <ul className="mt-2 grid gap-1">
            {others.map((f) => {
              const p = prices[f.id];
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => onFinish(f.id)}
                    aria-pressed={finish === f.id}
                    className={`flex w-full items-baseline justify-between gap-3 rounded-lg border px-4 py-2 text-sm transition-colors ${
                      finish === f.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-secondary/60"
                    }`}
                  >
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-semibold text-foreground">
                      {p.totalGross === null ? "ask us" : eur(p.totalGross)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
            <Row label="Fitting, estimated" value={eur(selected.installationEstimate)} />
            <Row label="Delivery, estimated" value={eur(selected.deliveryEstimate)} />
            <Row label="Delivery time" value={selected.deliveryWeeks} />
          </dl>
        </>
      )}

      <button
        type="button"
        onClick={onWantIt}
        disabled={white.productGross === null}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        I want it
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label} <span className="font-normal normal-case">({hint})</span>
      </label>
      <div className="flex items-center rounded-xl border border-border bg-background pr-3 focus-within:border-primary">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 text-sm font-medium outline-none"
        />
        <span className="text-xs text-muted-foreground">mm</span>
      </div>
    </div>
  );
}
