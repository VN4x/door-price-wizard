import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { extrasLabels } from "@/lib/extras";
import { GLAZING_PACKAGES } from "@/lib/glass";
import { deliveryEstimate, installationEstimate, publicPrice } from "@/lib/public-price";
import { FINISH_LABELS, SYSTEM_LABELS, eur } from "@/lib/pricing";
import { useStore } from "@/mock/store";
import type { CartItem, CustomerDetails } from "@/types";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your basket and offer request | Kvaliteetaken" },
      {
        name: "description",
        content:
          "Check the doors in your basket, add your contact details and receive a written sliding door offer by email.",
      },
      { property: "og:title", content: "Your basket and offer request | Kvaliteetaken" },
      {
        property: "og:description",
        content: "Review your chosen doors and receive a written offer by email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function itemGross(item: CartItem): number | null {
  if (item.fixedGross !== undefined) return item.fixedGross * item.line.qty;
  const p = publicPrice({
    system: item.line.system,
    width: item.line.width,
    height: item.line.height,
    finish: item.line.finish,
    extras: item.line.extras ?? [],
  });
  return p.totalGross === null ? null : p.totalGross * item.line.qty;
}

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeCartItem, updateCartItem, customer, saveCustomer, submitCart } = useStore();

  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [note, setNote] = useState("");
  const [needsDelivery, setNeedsDelivery] = useState(customer?.needsDelivery ?? true);
  const [needsInstallation, setNeedsInstallation] = useState(customer?.needsInstallation ?? true);
  const [remember, setRemember] = useState(customer?.remember ?? false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const product = cart.reduce((sum, item) => sum + (itemGross(item) ?? 0), 0);
    const widest = cart.length ? Math.max(...cart.map((c) => c.line.width)) : 0;
    const install = needsInstallation
      ? cart.reduce((s, c) => s + installationEstimate(c.line.width, c.line.qty), 0)
      : 0;
    const delivery = needsDelivery && cart.length ? deliveryEstimate(widest) : 0;
    return { product, install, delivery, total: product + install + delivery };
  }, [cart, needsDelivery, needsInstallation]);

  const submit = () => {
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Please enter a valid email address.");
    setError(null);
    const details: CustomerDetails = {
      name: name.trim(),
      email: email.trim(),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(address.trim() ? { address: address.trim() } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
      needsDelivery,
      needsInstallation,
      remember,
    };
    saveCustomer(details);
    const offer = submitCart();
    if (!offer) return setError("Your basket is empty.");
    void navigate({ to: "/enquiry/sent", search: { token: offer.token } });
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pb-16">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your basket</h1>

          {cart.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">Your basket is empty.</p>
              <Link
                to="/"
                className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                See prices
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-4">
                {cart.map((item, i) => {
                  const gross = itemGross(item);
                  const labels = extrasLabels(item.line.extras ?? []);
                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Product {i + 1}
                            {item.outletId ? " · from Outlet" : ""}
                          </p>
                          <h2 className="mt-1 text-lg font-semibold text-foreground">
                            {SYSTEM_LABELS[item.line.system]}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {item.line.width} × {item.line.height} mm ·{" "}
                            {FINISH_LABELS[item.line.finish]} ·{" "}
                            {GLAZING_PACKAGES[item.line.glazing].label} · opens{" "}
                            {item.line.activeSide === "L" ? "left" : "right"}
                          </p>
                          {labels.length > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Options: {labels.join(", ")}
                            </p>
                          )}
                          {item.note && (
                            <p className="mt-1 text-sm italic text-muted-foreground">{item.note}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          aria-label="Remove this product"
                          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
                        <label className="text-xs font-medium text-muted-foreground">
                          Quantity
                          <input
                            type="number"
                            min={1}
                            value={item.line.qty}
                            onChange={(e) =>
                              updateCartItem(item.id, {
                                line: { ...item.line, qty: Math.max(1, Number(e.target.value) || 1) },
                              })
                            }
                            className="mt-1 block w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary"
                          />
                        </label>
                        <p className="text-2xl font-semibold tracking-tight text-foreground">
                          {gross === null ? "Price on request" : eur(gross)}
                        </p>
                      </div>
                    </article>
                  );
                })}

                <Link
                  to="/enquiry"
                  className="rounded-2xl border border-dashed border-border p-4 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  + Add another product
                </Link>
              </div>

              <aside className="grid gap-4 lg:sticky lg:top-20 lg:self-start">
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Your details
                  </h2>
                  <div className="mt-4 grid gap-3">
                    <Input label="Name" value={name} onChange={setName} />
                    <Input label="Email" value={email} onChange={setEmail} type="email" />
                    <Input label="Phone (optional)" value={phone} onChange={setPhone} />
                    <Input label="Delivery address (optional)" value={address} onChange={setAddress} />
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Notes (optional)
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className="input"
                      />
                    </label>
                    <Check label="I need delivery" checked={needsDelivery} onChange={setNeedsDelivery} />
                    <Check
                      label="I need fitting"
                      checked={needsInstallation}
                      onChange={setNeedsInstallation}
                    />
                    <Check
                      label="Remember my details on this device"
                      checked={remember}
                      onChange={setRemember}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <dl className="grid gap-2 text-sm">
                    <Row label="Products" value={eur(totals.product)} />
                    {needsInstallation && <Row label="Fitting, estimated" value={eur(totals.install)} />}
                    {needsDelivery && <Row label="Delivery, estimated" value={eur(totals.delivery)} />}
                  </dl>
                  <p className="mt-4 border-t border-border pt-4 text-3xl font-semibold tracking-tight text-foreground">
                    {eur(totals.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">incl. VAT</p>

                  {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

                  <button
                    type="button"
                    onClick={submit}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    <Send className="size-4" aria-hidden />
                    Get my offer
                  </button>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    We send the written offer to your email straight away. Prices are indicative until
                    we confirm the measurements.
                  </p>
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="input" />
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-primary)]"
      />
      <span className="font-medium text-foreground">{label}</span>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
