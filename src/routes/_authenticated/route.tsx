import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: StaffArea,
});

/** Signed in, but the owner has not given this person staff access yet. */
function StaffArea() {
  const { account, loading, signOut } = useAuth();

  if (loading || !account) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-sm text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!account.isStaff) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-5">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {account.awaitingApproval ? "Waiting for approval" : "No access yet"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {account.status === "disabled"
              ? "This account has been switched off. Please ask the owner to turn it back on."
              : account.awaitingApproval
                ? "The owner has your request and will approve it shortly. You will see the workspace here once that is done."
                : "This area is for our own team. If you work here, ask for access on your account page."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Go to prices
            </Link>
            <Link
              to="/auth"
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              My account
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Sign out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <Outlet />;
}
