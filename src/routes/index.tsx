import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Ruler, ShieldCheck, Timer } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sliding doors made to measure | Kvaliteetaken" },
      {
        name: "description",
        content:
          "Rehau Synego Slide and HST sliding doors made to measure in Estonia. Send your opening size and get a written offer within one working day.",
      },
      { property: "og:title", content: "Sliding doors made to measure | Kvaliteetaken" },
      {
        property: "og:description",
        content: "Tell us your opening size and colour, and receive a clear written offer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Rehau Synego Slide &amp; HST · Siegenia hardware
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Sliding doors made to your opening
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Two-panel sliding doors from 1500 × 1500 up to 4500 × 2400 mm. Tell us the size, the
              colour and which side should open — you get a written offer with delivery and
              installation priced separately.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Get my offer
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/offer/$offerId"
                params={{ offerId: "off-1" }}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                See an example offer
              </Link>
            </div>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Ruler,
                title: "Made to measure",
                text: "Every door is cut to your exact opening, no standard sizes.",
              },
              {
                icon: Timer,
                title: "Offer in one day",
                text: "Enquiries sent before 16:00 are usually answered the same day.",
              },
              {
                icon: ShieldCheck,
                title: "Clear pricing",
                text: "Product, delivery and installation are always separate lines.",
              },
              {
                icon: ShieldCheck,
                title: "Warm glazing",
                text: "Three-glass packages, sound and safety options available.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-background p-5">
                <f.icon className="size-5 text-accent" aria-hidden />
                <dt className="mt-3 text-sm font-semibold text-foreground">{f.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["1. Send your opening", "Fill the short form: size, colour, glazing, opening side."],
            ["2. Receive your offer", "A written offer with dimensions, glazing and totals."],
            ["3. We build and fit", "Production, delivery and installation by our own team."],
          ].map(([title, text]) => (
            <li key={title} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
