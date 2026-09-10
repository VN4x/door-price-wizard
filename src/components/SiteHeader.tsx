import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { LanguagePicker } from "@/components/LanguagePicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/mock/store";

/** Public header. Nothing here links to internal screens or other customers' data. */
export function SiteHeader() {
  const { cart } = useStore();
  const { t } = useI18n();
  const count = cart.length;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
        <Link to="/" className="text-base font-semibold tracking-tight text-foreground">
          Kvaliteetaken
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground font-medium" }}
            className="hover:text-foreground"
          >
            {t("nav.prices")}
          </Link>
          <Link
            to="/outlet"
            activeProps={{ className: "text-foreground font-medium" }}
            className="hover:text-foreground"
          >
            {t("nav.outlet")}
          </Link>
          <Link
            to="/differences"
            activeProps={{ className: "text-foreground font-medium" }}
            className="hover:text-foreground"
          >
            {t("nav.differences")}
          </Link>
          <Link
            to="/enquiry"
            activeProps={{ className: "text-foreground font-medium" }}
            className="hover:text-foreground"
          >
            {t("nav.configure")}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ShoppingCart className="size-4" aria-hidden />
            {t("nav.cart")}
            {count > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
