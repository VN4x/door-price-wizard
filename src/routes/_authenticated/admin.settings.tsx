import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getSettings, saveSettings, type AppSettings } from "@/lib/admin.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Kvaliteetaken" },
      {
        name: "description",
        content: "Company details, offer defaults, delivery estimates and pricing rules.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

type Field = {
  key: keyof AppSettings;
  label: string;
  hint?: string;
  kind?: "text" | "number" | "area";
};

const GROUPS: { title: string; note: string; fields: Field[] }[] = [
  {
    title: "Company",
    note: "Shown on offers, orders and emails.",
    fields: [
      { key: "companyName", label: "Company name" },
      { key: "companyReg", label: "Registry code" },
      { key: "companyVat", label: "VAT number" },
      { key: "companyAddress", label: "Address" },
      { key: "companyPhone", label: "Phone" },
      { key: "companyEmail", label: "Email" },
      { key: "companyWeb", label: "Website" },
    ],
  },
  {
    title: "Documents",
    note: "How offers and orders are numbered and how long they stay valid.",
    fields: [
      { key: "offerValidityDays", label: "Offer valid for (days)", kind: "number" },
      { key: "vatPercent", label: "VAT (%)", kind: "number" },
      { key: "offerPrefix", label: "Offer number prefix" },
      { key: "orderPrefix", label: "Order number prefix" },
      { key: "enquiryPrefix", label: "Enquiry number prefix" },
      { key: "defaultLanguage", label: "Default language (et / en / ru)" },
    ],
  },
  {
    title: "Delivery and installation",
    note: "Used for estimates on offers.",
    fields: [
      { key: "deliveryRate", label: "Delivery rate (EUR)", kind: "number" },
      { key: "installRate", label: "Installation rate (EUR)", kind: "number" },
      { key: "deliveryTimeText", label: "Delivery time text", kind: "area" },
    ],
  },
  {
    title: "Pricing rules",
    note: "Internal only. Never shown to customers.",
    fields: [
      { key: "defaultMarkup", label: "Default markup (e.g. 1.35)", kind: "number" },
      { key: "minMarginPercent", label: "Minimum margin (%)", kind: "number" },
      { key: "campaignPercent", label: "Campaign discount (%)", kind: "number" },
      { key: "campaignReason", label: "Campaign reason" },
    ],
  },
  {
    title: "Offer email",
    note: "Default text when sending an offer.",
    fields: [
      { key: "emailSubject", label: "Subject" },
      { key: "emailBody", label: "Message", kind: "area" },
    ],
  },
];

function SettingsPage() {
  const { account } = useAuth();
  const qc = useQueryClient();
  const load = useServerFn(getSettings);
  const save = useServerFn(saveSettings);
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => load(),
    enabled: Boolean(account?.isStaff),
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (v: AppSettings) => save({ data: v }),
    onSuccess: () => {
      setSaved(true);
      void qc.invalidateQueries({ queryKey: ["app-settings"] });
      window.setTimeout(() => setSaved(false), 2500);
    },
  });

  if (!account?.isOwner) {
    return (
      <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Only the owner can change settings.
      </p>
    );
  }

  if (isLoading || !form) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const set = (key: keyof AppSettings, value: string, numeric: boolean) =>
    setForm({ ...form, [key]: numeric ? Number(value) : value } as AppSettings);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
      className="grid gap-6"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            These values are used across offers, orders and the public price pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-muted-foreground">Saved</span>}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      {(mutation.error || error) && (
        <p className="text-sm text-destructive">
          {((mutation.error ?? error) as Error).message}
        </p>
      )}

      {GROUPS.map((group) => (
        <section key={group.title} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">{group.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{group.note}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.fields.map((f) => {
              const numeric = f.kind === "number";
              return (
                <label
                  key={String(f.key)}
                  className={`grid gap-1 text-sm ${f.kind === "area" ? "sm:col-span-2" : ""}`}
                >
                  <span className="font-medium text-foreground">{f.label}</span>
                  {f.kind === "area" ? (
                    <textarea
                      rows={3}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value, false)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  ) : (
                    <input
                      type={numeric ? "number" : "text"}
                      step={numeric ? "0.01" : undefined}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => set(f.key, e.target.value, numeric)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </form>
  );
}
