import { Link } from "@tanstack/react-router";
import { useStore } from "@/mock/store";
import type { Role } from "@/types";

const ROLES: { id: Role; label: string }[] = [
  { id: "customer", label: "Customer" },
  { id: "sales", label: "Sales" },
  { id: "admin", label: "Admin" },
];

/** Demo-only helper: switch the viewing role to see exactly what each person sees. */
export function DemoBar() {
  const { role, setRole, offers } = useStore();
  const sample = offers[0];
  return (
    <div className="print:hidden sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-xs sm:px-6">
        <span className="font-semibold tracking-tight text-foreground">Kvaliteetaken</span>
        <nav className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Public site
          </Link>
          <Link to="/enquiry" className="hover:text-foreground">
            Configurator
          </Link>
          {sample && (
            <Link
              to="/offer/$token"
              params={{ token: sample.token }}
              className="hover:text-foreground"
            >
              Sample offer
            </Link>
          )}
          <Link to="/admin" className="hover:text-foreground">
            Admin
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground">Viewing as</span>
          <div className="flex rounded-full border border-border p-0.5">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                aria-pressed={role === r.id}
                className={`rounded-full px-3 py-1 font-medium transition-colors ${
                  role === r.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
