import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Bell,
  Calculator,
  ClipboardList,
  FileText,
  Factory,
  LayoutDashboard,
  Lock,
  Search,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import { useStore } from "@/mock/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Kvaliteetaken" },
      { name: "description", content: "Internal sales and production workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/enquiries", label: "Enquiries", icon: ClipboardList },
  { to: "/admin/offers", label: "Offers", icon: FileText },
  { to: "/admin/orders", label: "Orders", icon: Factory },
  { to: "/admin/calculator", label: "Calculator", icon: Calculator },
  { to: "/admin/price-list", label: "Price lists", icon: Tags, adminOnly: true },
] as const;

function AdminLayout() {
  const { role, enquiries } = useStore();
  const newCount = enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r print:hidden">
        <div className="px-5 py-5">
          <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            Kvaliteetaken
          </p>
          <p className="text-xs text-muted-foreground">Sales &amp; production</p>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-4 lg:flex-col">
          {NAV.map((item) => {
            const locked = item.adminOnly && role !== "admin";
            if (locked) {
              return (
                <span
                  key={item.to}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/60"
                  title="Admin only"
                >
                  <Lock className="size-4" aria-hidden />
                  {item.label}
                </span>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                activeProps={{
                  className: "bg-sidebar-accent text-sidebar-foreground",
                }}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <span className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/60">
            <Users className="size-4" aria-hidden />
            Users
          </span>
          <span className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground/60">
            <Settings className="size-4" aria-hidden />
            Settings
          </span>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-card px-5 py-3 print:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              placeholder="Search customers, offers, orders…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <button
            type="button"
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={`${newCount} new enquiries`}
          >
            <Bell className="size-5" aria-hidden />
            {newCount > 0 && (
              <span className="absolute right-1 top-1 size-2 rounded-full bg-accent" />
            )}
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              EK
            </span>
            <span className="hidden text-sm sm:block">
              <span className="block font-medium text-foreground">Elmo K.</span>
              <span className="block text-xs capitalize text-muted-foreground">{role}</span>
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
