import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { DoorDrawing } from "@/components/DoorDrawing";
import { GLAZING_LIST } from "@/lib/glass";
import { FINISH_LABELS, LIMITS, suggestThreshold, validateSize } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { ActiveSide, DoorLine, Finish, GlazingId } from "@/types";

export const Route = createFileRoute("/enquiry/")({
  head: () => ({
    meta: [
      { title: "Request an offer for your sliding door | Kvaliteetaken" },
      {
        name: "description",
        content:
          "Send your opening size, colour and glazing choice and receive a written sliding-door offer with delivery and installation priced separately.",
      },
      { property: "og:title", content: "Request an offer for your sliding door" },
      {
        property: "og:description",
        content: "A short form: size, colour, glazing, opening side. Offer within one working day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EnquiryForm,
});

const FINISH_OPTIONS: { id: Finish; label: string; hint: string }[] = [
  { id: "white", label: "White inside / white outside", hint: "Most common, best price" },
  { id: "oneSide", label: "Colour outside / white inside", hint: "Popular with dark facades" },
  { id: "bothSides", label: "Colour inside / colour outside", hint: "Fully laminated" },
];

const STEPS = ["Your details", "Product & size", "Colour & glazing", "Extras"];

function EnquiryForm() {
  const navigate = useNavigate();
  const { addEnquiry } = useStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [width, setWidth] = useState("3500");
  const [height, setHeight] = useState("2178");
  const [qty, setQty] = useState("1");
  const [activeSide, setActiveSide] = useState<ActiveSide>("L");
  const [finish, setFinish] = useState<Finish>("white");
  const [glazing, setGlazing] = useState<GlazingId>("warm3");
  const [delivery, setDelivery] = useState(true);
  const [installation, setInstallation] = useState(true);
  const [note, setNote] = useState("");

  const w = Number(width);
  const h = Number(height);
  const q = Math.max(1, Math.min(10, Number(qty) || 1));
  const sizeError = validateSize(w, h);

  const line: DoorLine = {
    id: "preview",
    system: "hst",
    width: sizeError ? 3500 : w,
    height: sizeError ? 2178 : h,
    qty: q,
    finish,
    glazing,
    activeSide,
    threshold: suggestThreshold(sizeError ? 3500 : w),
  };

  const contactOk = name.trim().length > 1 && /.+@.+\..+/.test(email);
  const canContinue = step === 0 ? contactOk : step === 1 ? !sizeError : true;

  const submit = () => {
    addEnquiry({
      customerName: name.trim(),
      email: email.trim(),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      lines: [{ ...line, id: "line-1" }],
      needsDelivery: delivery,
      needsInstallation: installation,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    void navigate({ to: "/enquiry/sent" });
  };

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Request your offer
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Four short steps. Nothing is ordered — you receive a written offer to look at calmly.
        </p>

        <ol className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  i === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i < step
                      ? "border-border bg-card text-foreground"
                      : "border-dashed border-border text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-4" aria-hidden /> : <span>{i + 1}</span>}
                {s}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" value={name} onChange={setName} placeholder="Mari Maasikas" />
                <Field
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder="mari@example.ee"
                />
                <Field
                  label="Phone (optional)"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+372 5xx xxxx"
                />
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-6">
                <div className="rounded-xl border border-border bg-secondary/40 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Sliding door, Siegenia HST hardware
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Two-panel slider: one panel slides, one stays fixed.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Which side opens?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["L", "R"] as ActiveSide[]).map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setActiveSide(side)}
                        aria-pressed={activeSide === side}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-5 transition-colors ${
                          activeSide === side
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span className="text-3xl font-semibold text-foreground">
                          {side === "L" ? "←" : "→"}
                        </span>
                        <span className="text-lg font-semibold text-foreground">{side}</span>
                        <span className="text-xs text-muted-foreground">
                          {side === "L" ? "Left panel slides" : "Right panel slides"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    label={`Width mm (${LIMITS.minWidth}–${LIMITS.maxWidth})`}
                    value={width}
                    onChange={setWidth}
                    type="number"
                  />
                  <Field
                    label={`Height mm (${LIMITS.minHeight}–${LIMITS.maxHeight})`}
                    value={height}
                    onChange={setHeight}
                    type="number"
                  />
                  <Field label="Quantity" value={qty} onChange={setQty} type="number" />
                </div>
                {sizeError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                  >
                    {sizeError}
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-6">
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Colour</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {FINISH_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setFinish(o.id)}
                        aria-pressed={finish === o.id}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          finish === o.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`mb-3 block h-10 rounded-lg border border-border ${
                            o.id === "white"
                              ? "bg-white"
                              : o.id === "oneSide"
                                ? "bg-gradient-to-r from-white to-slate-700"
                                : "bg-slate-700"
                          }`}
                          aria-hidden
                        />
                        <span className="block text-sm font-semibold text-foreground">
                          {o.label}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">{o.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Glazing</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {GLAZING_LIST.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGlazing(g.id)}
                        aria-pressed={glazing === g.id}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          glazing === g.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-foreground">
                          {g.label}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {g.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5">
                <Toggle
                  label="I need delivery"
                  hint="Delivered to your address, priced separately."
                  checked={delivery}
                  onChange={setDelivery}
                />
                <Toggle
                  label="I need installation"
                  hint="Fitted by our own team, priced separately."
                  checked={installation}
                  onChange={setInstallation}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Anything we should know? (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Building stage, deadline, access to the opening…"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Get my offer
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              )}
            </div>
          </section>

          {/* live preview */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your door
              </h2>
              <DoorDrawing line={line} className="mt-4 w-full" />
              <dl className="mt-5 space-y-2 text-sm">
                <PreviewRow label="Size" value={`${line.width} × ${line.height} mm`} />
                <PreviewRow label="Quantity" value={`${q} pc${q > 1 ? "s" : ""}`} />
                <PreviewRow label="Opens" value={activeSide === "L" ? "Left panel" : "Right panel"} />
                <PreviewRow label="Colour" value={FINISH_LABELS[finish]} />
                <PreviewRow
                  label="Glazing"
                  value={GLAZING_LIST.find((g) => g.id === glazing)?.label ?? ""}
                />
                <PreviewRow
                  label="Extras"
                  value={
                    [delivery && "delivery", installation && "installation"]
                      .filter(Boolean)
                      .join(", ") || "none"
                  }
                />
              </dl>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                The drawing is indicative. Final dimensions are confirmed by measurement before
                production.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border p-4">
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]"
      />
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
