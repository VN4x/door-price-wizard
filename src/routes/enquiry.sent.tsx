import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { CallbackBox } from "@/components/CallbackBox";
import { SiteHeader } from "@/components/SiteHeader";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/enquiry/sent")({
  validateSearch: (search: Record<string, unknown>): { token?: string | undefined } => {
    const raw = search["token"];
    return typeof raw === "string" ? { token: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "Your offer is on its way | Kvaliteetaken" },
      {
        name: "description",
        content: "Your sliding door offer has been sent to your email with a private link to open it.",
      },
      { property: "og:title", content: "Your offer is on its way | Kvaliteetaken" },
      { property: "og:description", content: "Your sliding door offer has been sent by email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SentPage,
});

function SentPage() {
  const { token } = Route.useSearch();
  const { offers } = useStore();
  const offer = token ? offers.find((o) => o.token === token) : undefined;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background pb-16">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <CheckCircle2 className="size-8 text-accent" aria-hidden />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
              Your offer is ready
            </h1>
            {offer ? (
              <>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  We have sent offer <strong className="text-foreground">{offer.number}</strong> to{" "}
                  <strong className="text-foreground">{offer.email}</strong>. It is valid until{" "}
                  {offer.validUntil}.
                </p>
                <Link
                  to="/offer/$token"
                  params={{ token: offer.token }}
                  className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Open my offer
                </Link>
                <p className="mt-3 text-xs text-muted-foreground">
                  The link is private — only someone who has it can open your offer.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We could not find that offer in this browser. Please check the link in your email.
              </p>
            )}
          </div>

          <div className="mt-6">
            <CallbackBox />
          </div>
        </div>
      </main>
    </>
  );
}
