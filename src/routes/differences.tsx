import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SYSTEM_LABELS } from "@/lib/pricing";
import doorPhoto from "@/assets/sliding-door-systems.jpg";

export const Route = createFileRoute("/differences")({
  head: () => ({
    meta: [
      { title: "Synego Slide or HST — which sliding door to choose | Kvaliteetaken" },
      {
        name: "description",
        content:
          "The five things that separate a Rehau Synego Slide tilt-slide door from a Synego HST lift-slide door: threshold, panel weight, sizes, comfort and price.",
      },
      {
        property: "og:title",
        content: "Synego Slide or HST — which sliding door to choose | Kvaliteetaken",
      },
      {
        property: "og:description",
        content: "Five clear differences between the tilt-slide and the lift-slide sliding door.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DifferencesPage,
});

const POINTS = [
  {
    title: "The threshold under your feet",
    slide: "Has a mullion in the middle and no separate threshold rail, so the floor line is simple.",
    hst: "Runs on a delivered threshold rail; the low version is close to level with the floor and easy to walk over.",
  },
  {
    title: "How much glass and weight it carries",
    slide: "Suited to lighter panels and openings up to roughly 3 m wide.",
    hst: "Built for heavy panels: wide openings, tall glass and triple units up to the full 4.5 m width.",
  },
  {
    title: "How it opens",
    slide: "The sash tilts for airing and then slides sideways along the frame.",
    hst: "The handle lifts the whole panel off its seals, so it glides even when it is large and heavy.",
  },
  {
    title: "Sealing and warmth",
    slide: "Good everyday sealing; the mullion divides the view into two clear halves.",
    hst: "Panel presses down onto continuous seals when closed, which suits exposed and windy sites.",
  },
  {
    title: "Price and use",
    slide: "The more affordable choice for a normal terrace door in everyday use.",
    hst: "Costs more because of the rail and the hardware, and is the right answer for a large glass wall.",
  },
];

function DifferencesPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pb-16">
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Slide or HST — the five real differences
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Both are Rehau Synego doors with Siegenia hardware. The choice comes down to how big
              the opening is and how the door should feel to use.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <ol className="mt-8 grid gap-4">
            {POINTS.map((p, i) => (
              <li key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {i + 1} of {POINTS.length}
                </p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  {p.title}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {SYSTEM_LABELS.slide}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.slide}</p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-sm font-semibold text-foreground">{SYSTEM_LABELS.hst}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.hst}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <figure className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={doorPhoto}
              alt="Large white sliding patio door with two glass panels opening onto a garden terrace"
              width={1600}
              height={912}
              loading="lazy"
              className="h-auto w-full"
            />
            <figcaption className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              A two-panel door: one panel slides, one stays fixed. The same layout is used by both
              systems.
            </figcaption>
          </figure>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Still unsure?</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Tell us the opening width and we will say which system we would fit ourselves.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              {["Both systems priced side by side", "Written offer by email", "No obligation"].map(
                (line) => (
                  <li key={line} className="flex items-center gap-2">
                    <Check className="size-4 text-accent" aria-hidden />
                    {line}
                  </li>
                ),
              )}
            </ul>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              See prices for my size
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
