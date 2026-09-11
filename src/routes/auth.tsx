import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { requestStaffAccess } from "@/lib/account.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | Kvaliteetaken" },
      {
        name: "description",
        content: "Sign in to your Kvaliteetaken account to follow your offers and orders.",
      },
      { property: "og:title", content: "Sign in | Kvaliteetaken" },
      { property: "og:description", content: "Sign in to follow your offers and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signIn" | "register">("signIn");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wantsStaff, setWantsStaff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { account, session, signOut, refresh } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refresh();
        void navigate({ to: "/" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email and click the confirmation link to finish.");
        } else {
          await refresh();
          if (wantsStaff) await requestStaffAccess();
          setNotice(
            wantsStaff
              ? "Account created. Your request for staff access is waiting for approval."
              : "Account created.",
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in did not work. Please try again.");
      return;
    }
    if (result.redirected) return;
    await refresh();
    void navigate({ to: "/" });
  }

  if (session && account) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-5 py-16">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            You are signed in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{account.email}</p>
          {account.awaitingApproval && (
            <p className="mt-4 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
              Your request for staff access is waiting for approval.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Go to prices
            </Link>
            {account.isStaff && (
              <Link
                to="/admin"
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Open workspace
              </Link>
            )}
            {!account.isStaff && !account.awaitingApproval && (
              <button
                type="button"
                onClick={async () => {
                  await requestStaffAccess();
                  await refresh();
                }}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Ask for staff access
              </button>
            )}
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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-5 py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {mode === "signIn" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customers can follow their own offers. Staff access is given by the owner.
        </p>

        <button
          type="button"
          onClick={() => void google()}
          className="mt-5 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="grid gap-3">
          {mode === "register" && (
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-foreground">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          )}
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-foreground">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          {mode === "register" && (
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={wantsStaff}
                onChange={(e) => setWantsStaff(e.target.checked)}
                className="mt-0.5"
              />
              I work at Kvaliteetaken and need access to the internal workspace (the owner
              approves this).
            </label>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && (
            <p className="rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signIn" ? "register" : "signIn");
            setError(null);
            setNotice(null);
          }}
          className="mt-4 text-sm text-muted-foreground underline hover:text-foreground"
        >
          {mode === "signIn" ? "I need an account" : "I already have an account"}
        </button>
      </div>

      <Link to="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
        Back to prices
      </Link>
    </main>
  );
}
