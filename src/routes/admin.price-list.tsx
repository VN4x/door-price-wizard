import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Plus, X } from "lucide-react";
import { StatusChip } from "@/components/StatusChip";
import { eur } from "@/lib/pricing";
import { useStore, today } from "@/mock/store";
import type { PriceItem } from "@/types";

export const Route = createFileRoute("/admin/price-list")({
  head: () => ({
    meta: [
      { title: "Price lists | Kvaliteetaken admin" },
      { name: "description", content: "Article purchase prices and sale multipliers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PriceList,
});

const EMPTY: PriceItem = {
  id: "",
  name: "",
  category: "PVC profile",
  unit: "m",
  purchasePrice: 0,
  saleMultiplier: 1.4,
  active: true,
  updatedAt: today(),
};

function PriceList() {
  const { priceItems, upsertPriceItem, deletePriceItem, role } = useStore();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<PriceItem | null>(null);

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <Lock className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 text-lg font-semibold text-foreground">Owner only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Purchase prices are visible to the owner account only. Switch the role to Admin to open
          this screen.
        </p>
      </div>
    );
  }

  const filtered = priceItems.filter((p) =>
    `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  const save = () => {
    if (!draft) return;
    upsertPriceItem({
      ...draft,
      id: draft.id || `pi-${Date.now()}`,
      updatedAt: today(),
    });
    setDraft(null);
  };

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Price list</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {priceItems.length} articles · purchase prices are never shown outside this screen
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden />
          Add price item
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search article or category"
        className="w-full max-w-sm rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Article</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 text-right font-medium">Purchase</th>
              <th className="px-5 py-3 text-right font-medium">Multiplier</th>
              <th className="px-5 py-3 text-right font-medium">Sale</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Updated</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.unit}</td>
                <td className="px-5 py-3 text-right tabular-nums text-foreground">
                  {eur(p.purchasePrice)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                  ×{p.saleMultiplier.toFixed(2)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-semibold text-foreground">
                  {eur(p.purchasePrice * p.saleMultiplier)}
                </td>
                <td className="px-5 py-3 text-right">
                  <StatusChip
                    label={p.active ? "Active" : "Inactive"}
                    tone={p.active ? "good" : "neutral"}
                  />
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground">{p.updatedAt}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...p })}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20">
          <div className="h-full w-full max-w-md overflow-y-auto bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                {draft.id ? "Edit price item" : "Add price item"}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <Field
                label="Article name"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
              />
              <Field
                label="Category"
                value={draft.category}
                onChange={(v) => setDraft({ ...draft, category: v })}
              />
              <Field
                label="Unit"
                value={draft.unit}
                onChange={(v) => setDraft({ ...draft, unit: v })}
              />
              <Field
                label="Purchase price (EUR)"
                type="number"
                value={String(draft.purchasePrice)}
                onChange={(v) => setDraft({ ...draft, purchasePrice: Number(v) || 0 })}
              />
              <Field
                label="Sale multiplier"
                type="number"
                value={String(draft.saleMultiplier)}
                onChange={(v) => setDraft({ ...draft, saleMultiplier: Number(v) || 1 })}
              />
              <label className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 text-sm">
                <span className="font-medium text-foreground">Active</span>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  className="size-5 accent-[var(--color-primary)]"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={save}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Save
              </button>
              {draft.id && (
                <button
                  type="button"
                  onClick={() => {
                    deletePriceItem(draft.id);
                    setDraft(null);
                  }}
                  className="rounded-xl border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
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
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
