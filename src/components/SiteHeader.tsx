import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useStore } from "@/mock/store";

/** Public header. Nothing here links to internal screens or other customers' data. */
export function SiteHeader() {
  const { cart } = useStore();
  const count = cart.length;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3 sm:px-8">
        <Link to="/" className="text-base font-semibold tracking-tight text-foreground">
          Kvaliteetaken
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground font-medium" }} className="hover:text-foreground">
            Prices
          </Link>
          <Link to="/outlet" activeProps={{ className: "text-foreground font-medium" }} className="hover:text-foreground">
            Outlet
          </Link>
          <Link to="/enquiry" activeProps={{ className: "text-foreground font-medium" }} className="hover:text-foreground">
            Configure
          </Link>
        </nav>
        <Link
          to="/cart"
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ShoppingCart className="size-4" aria-hidden />
          Cart
          {count > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
