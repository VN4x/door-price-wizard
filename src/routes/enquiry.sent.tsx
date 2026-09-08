import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/enquiry/sent")({
  head: () => ({
    meta: [
      { title: "Enquiry received | Kvaliteetaken" },
      {
        name: "description",
        content: "Your sliding-door enquiry has been received. We answer with a written offer.",
      },
      { property: "og:title", content: "Enquiry received | Kvaliteetaken" },
      { property: "og:description", content: "We have your enquiry and will send a written offer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Sent,
});

function Sent() {
  const { enquiries } = useStore();
  const latest = enquiries[0];

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-accent" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Thank you, we have your enquiry
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {latest
            ? `Your reference is ${latest.number}. We will email a written offer to ${latest.email}, usually within one working day.`
            : "We will email a written offer, usually within one working day."}
        </p>
        {latest && (
          <dl className="mt-6 space-y-2 rounded-xl border border-border bg-secondary/40 p-5 text-left text-sm">
            {latest.lines.map((l) => (
              <div key={l.id} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Sliding door</dt>
                <dd className="text-right font-medium text-foreground">
                  {l.width} × {l.height} mm · {l.qty} pc · opens {l.activeSide === "L" ? "left" : "right"}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to home
          </Link>
          <Link
            to="/enquiry"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Send another opening
          </Link>
        </div>
      </div>
    </main>
  );
}
