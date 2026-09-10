import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DoorDrawing } from "@/components/DoorDrawing";
import { EXTRAS } from "@/lib/extras";
import {
  GLASS_ADDON_LIST,
  GLAZING_LIST,
  GLAZING_PACKAGES,
  doorAreaM2,
  toggleGlassAddon,
} from "@/lib/glass";
import { publicPrice } from "@/lib/public-price";
import {
  FINISH_LABELS,
  LIMITS,
  SYSTEM_LABELS,
  SYSTEM_NOTES,
  eur,
  thresholdForWidth,
  validateSize,
  type Finish,
  type SystemId,
} from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { ActiveSide, ExtraId, GlassAddonId, GlazingId } from "@/types";

export const Route = createFileRoute("/enquiry/")({
  head: () => ({
    meta: [
      { title: "Configure your sliding door | Kvaliteetaken" },
      {
        name: "description",
        content:
          "Choose size, colour, glazing and the opening side of your sliding door, then add it to your basket for a written offer.",
      },
      { property: "og:title", content: "Configure your sliding door | Kvaliteetaken" },
      {
        property: "og:description",
        content: "Set size, colour, glazing and opening side, then request a written offer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfigurePage,
});

const FINISHES: Finish[] = ["white", "oneSide", "bothSides"];

function ConfigurePage() {
  const navigate = useNavigate();
  const { pending, addToCart, cart } = useStore();

  const [system, setSystem] = useState<SystemId>(pending?.system ?? "hst");
  const [width, setWidth] = useState(String(pending?.width ?? 2000));
  const [height, setHeight] = useState(String(pending?.height ?? 2000));
  const [finish, setFinish] = useState<Finish>(pending?.finish ?? "white");
  const [extras, setExtras] = useState<ExtraId[]>(pending?.extras ?? []);
  const [glazing, setGlazing] = useState<GlazingId>(pending?.glazing ?? "std3");
  const [glassAddons, setGlassAddons] = useState<GlassAddonId[]>(pending?.glassAddons ?? []);
  const [activeSide, setActiveSide] = useState<ActiveSide>("R");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const w = Number(width);
  const h = Number(height);
  const sizeError = validateSize(w, h);
  const area = doorAreaM2(w || 2000, h || 2000);
  const price = useMemo(
    () => publicPrice({ system, width: w, height: h, finish, extras, glazing, glassAddons }),
    [system, w, h, finish, extras, glazing, glassAddons],
  );
  const canAdd = !sizeError && price.totalGross !== null && qty > 0;

  const add = (then: "cart" | "more") => {
    if (!canAdd) return;
    addToCart({
      kind: "slidingDoor",
      line: {
        id: `line-${Date.now()}`,
        system,
        width: w,
        height: h,
        qty,
        finish,
        glazing,
        glassAddons,
        activeSide,
        threshold: thresholdForWidth(w) ?? "t37",
        extras,
      },
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    if (then === "cart") void navigate({ to: "/cart" });
    else {
      setNote("");
      setQty(1);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pb-16">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Configure your door
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            All prices include VAT. Add as many doors as you need — you enter your contact details
            once, at the basket.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-6">
              <Panel title="System">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["slide", "hst"] as SystemId[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSystem(s)}
                      aria-pressed={system === s}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        system === s ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-foreground">
                        {SYSTEM_LABELS[s]}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {SYSTEM_NOTES[s]}
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Size and amount">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Field label={`Width mm (${LIMITS.minWidth}–${LIMITS.maxWidth})`}>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label={`Height mm (${LIMITS.minHeight}–${LIMITS.maxHeight})`}>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="input"
                    />
                  </Field>
                  <Field label="Quantity">
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                      className="input"
                    />
                  </Field>
                </div>
                {sizeError && <p className="mt-3 text-sm font-medium text-destructive">{sizeError}</p>}
              </Panel>

              <Panel title="Colour">
                <div className="grid gap-3 sm:grid-cols-3">
                  {FINISHES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFinish(f)}
                      aria-pressed={finish === f}
                      className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                        finish === f ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      <span className="mb-3 flex gap-1" aria-hidden>
                        <span
                          className={`h-6 flex-1 rounded-md border border-border ${
                            f === "bothSides" ? "bg-[#383a3c]" : "bg-white"
                          }`}
                        />
                        <span
                          className={`h-6 flex-1 rounded-md border border-border ${
                            f === "white" ? "bg-white" : "bg-[#383a3c]"
                          }`}
                        />
                      </span>
                      <span className="font-medium text-foreground">{FINISH_LABELS[f]}</span>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Glazing">
                <div className="grid gap-2">
                  {GLAZING_LIST.map((g) => (
                    <label
                      key={g.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                        glazing === g.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="glazing"
                        checked={glazing === g.id}
                        onChange={() => setGlazing(g.id)}
                        className="mt-0.5 size-4 accent-[var(--color-primary)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-3">
                          <span className="font-medium text-foreground">{g.label}</span>
                          <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                            {g.upliftPerM2 === 0
                              ? "included"
                              : `+${eur(g.upliftPerM2)} / m² · ${eur(g.upliftPerM2 * area)}`}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{g.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Panel>

              <Panel title="Glass upgrades">
                <div className="grid gap-2 sm:grid-cols-2">
                  {GLASS_ADDON_LIST.map((a) => (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                        glassAddons.includes(a.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={glassAddons.includes(a.id)}
                        onChange={() => setGlassAddons((prev) => toggleGlassAddon(prev, a.id))}
                        className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-3">
                          <span className="font-medium text-foreground">{a.label}</span>
                          <span className="whitespace-nowrap font-semibold text-foreground">
                            +{eur(a.perM2 * area)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {a.hint} · {eur(a.perM2)} / m²
                        </span>
                        {a.infoUrl && (
                          <a
                            href={a.infoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-xs font-medium text-accent underline"
                          >
                            Read more about our glass
                          </a>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Glass upgrades are charged per square metre of door. This door is{" "}
                  {area.toFixed(2)} m².
                </p>
              </Panel>

              <Panel title="Which panel slides open?">
                <div className="grid grid-cols-2 gap-3">
                  {(["L", "R"] as ActiveSide[]).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setActiveSide(side)}
                      aria-pressed={activeSide === side}
                      className={`rounded-xl border p-5 text-center transition-colors ${
                        activeSide === side
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      <span className="block text-3xl font-semibold text-foreground" aria-hidden>
                        {side === "L" ? "←" : "→"}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-foreground">
                        {side === "L" ? "Left panel" : "Right panel"}
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Options">
                <div className="grid gap-2 sm:grid-cols-2">
                  {EXTRAS.map((e) => (
                    <label
                      key={e.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-sm transition-colors hover:border-primary/40"
                    >
                      <input
                        type="checkbox"
                        checked={extras.includes(e.id)}
                        onChange={() =>
                          setExtras((prev) =>
                            prev.includes(e.id) ? prev.filter((x) => x !== e.id) : [...prev, e.id],
                          )
                        }
                        className="mt-0.5 size-4 accent-[var(--color-primary)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex justify-between gap-3">
                          <span className="font-medium text-foreground">{e.label}</span>
                          <span className="font-semibold text-foreground">+{eur(e.price)}</span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{e.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Panel>

              <Panel title="Anything we should know?">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Floor level, existing opening, access, wishes…"
                  className="input"
                />
              </Panel>
            </div>

            <aside className="grid gap-4 lg:sticky lg:top-20 lg:self-start">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Your door
                </h2>
                <div className="mt-4">
                  <DoorDrawing
                    line={{
                      id: "preview",
                      system,
                      width: w || 2000,
                      height: h || 2000,
                      qty,
                      finish,
                      glazing,
                      glassAddons,
                      activeSide,
                      threshold: thresholdForWidth(w) ?? "t37",
                    }}
                  />
                </div>
                <dl className="mt-5 grid gap-1.5 text-sm">
                  <Row label="System" value={SYSTEM_LABELS[system]} />
                  <Row label="Size" value={`${w || "–"} × ${h || "–"} mm`} />
                  <Row label="Colour" value={FINISH_LABELS[finish]} />
                  <Row label="Glass" value={GLAZING_PACKAGES[glazing].label} />
                  {price.glassGross > 0 && (
                    <Row label="Glass upgrades" value={eur(price.glassGross)} />
                  )}
                  <Row label="Quantity" value={`${qty} pc`} />
                </dl>

                {price.totalGross === null ? (
                  <p className="mt-5 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {price.unavailableReason ?? "Please check the measurements."}
                  </p>
                ) : (
                  <>
                    <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
                      {eur(price.totalGross * qty)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      incl. VAT, options included · fitting {eur(price.installationEstimate * qty)} and
                      delivery {eur(price.deliveryEstimate)} estimated separately
                    </p>
                  </>
                )}

                <button
                  type="button"
                  disabled={!canAdd}
                  onClick={() => add("cart")}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add to basket
                  <ArrowRight className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={!canAdd}
                  onClick={() => add("more")}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <Plus className="size-4" aria-hidden />
                  Add and configure another
                </button>
                {cart.length > 0 && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {cart.length} product{cart.length > 1 ? "s" : ""} already in your basket
                  </p>
                )}
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
