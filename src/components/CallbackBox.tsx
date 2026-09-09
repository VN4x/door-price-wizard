import { useState } from "react";
import { MessageCircle, PhoneCall } from "lucide-react";
import { useStore } from "@/mock/store";

/** Two quiet helpers: a call-back request and a chat panel (AI assistant later). */
export function CallbackBox() {
  const { requestCallback } = useStore();
  const [open, setOpen] = useState<"call" | "chat" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm print:hidden">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(open === "call" ? null : "call")}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <PhoneCall className="size-4" aria-hidden />
          Call me back
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === "chat" ? null : "chat")}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <MessageCircle className="size-4" aria-hidden />
          Chat with a pro
        </button>
      </div>

      {open === "call" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+372 5xx xxxx"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            disabled={name.trim().length < 2 || phone.trim().length < 5}
            onClick={() => {
              requestCallback(name.trim(), phone.trim());
              setDone(true);
              setName("");
              setPhone("");
            }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Ask us to call
          </button>
          {done && (
            <p className="text-sm text-muted-foreground sm:col-span-3">
              Thank you — we will call you back on a working day.
            </p>
          )}
        </div>
      )}

      {open === "chat" && (
        <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">A person answers here for now</p>
          <p className="mt-1">
            Write to info@kvaliteetaken.ee or call +372 5xx xxxx. Our automatic assistant is being
            prepared and will answer here soon.
          </p>
        </div>
      )}
    </section>
  );
}
