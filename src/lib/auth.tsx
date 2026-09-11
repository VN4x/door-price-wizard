import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ensureAccount, type Account } from "@/lib/account.functions";
import type { Role } from "@/types";

interface AuthValue {
  session: Session | null;
  account: Account | null;
  loading: boolean;
  /** What this person may see in the app. */
  role: Role;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

function roleOf(account: Account | null): Role {
  if (!account) return "customer";
  if (account.isOwner) return "admin";
  if (account.roles.includes("sales")) return "sales";
  if (account.roles.includes("production")) return "production";
  return "customer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const load = useCallback(async (next: Session | null) => {
    setSession(next);
    if (!next) {
      setAccount(null);
      setLoading(false);
      return;
    }
    try {
      setAccount(await ensureAccount());
    } catch {
      setAccount(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) void load(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void load(next);
      router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await load(data.session);
  }, [load]);

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setAccount(null);
    setSession(null);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{ session, account, loading, role: roleOf(account), refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
