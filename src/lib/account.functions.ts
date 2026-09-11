import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole = "owner" | "sales" | "production" | "customer";
export type AccountStatus = "pending" | "active" | "disabled";

export interface Account {
  id: string;
  email: string;
  fullName: string;
  status: AccountStatus;
  roles: AppRole[];
  /** True while the account waits for the owner to approve it. */
  isPending: boolean;
  isStaff: boolean;
  isOwner: boolean;
}

/**
 * Makes sure the signed-in user has a profile row, then reports what they may
 * see. A brand new account is `pending` with no role until the owner approves
 * it — the very first account ever created becomes the owner automatically.
 */
export const ensureAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Account> => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email ?? "";
    const name =
      ((claims as { user_metadata?: { full_name?: string; name?: string } }).user_metadata
        ?.full_name ??
        (claims as { user_metadata?: { name?: string } }).user_metadata?.name ??
        "") || email.split("@")[0] || "";

    let { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, status")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true });
      const first = (count ?? 0) === 0;

      const { data: created, error } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          email,
          full_name: name,
          status: first ? "active" : "pending",
        })
        .select("id, email, full_name, status")
        .single();
      if (error) throw new Error(error.message);
      profile = created;

      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: first ? "owner" : "customer" });
    }

    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const roles = (roleRows ?? []).map((r) => r.role as AppRole);
    const active = profile.status === "active";
    const isStaff = active && roles.some((r) => r === "owner" || r === "sales" || r === "production");

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      status: profile.status as AccountStatus,
      roles,
      isPending: profile.status === "pending",
      isStaff,
      isOwner: active && roles.includes("owner"),
    };
  });

/** Lets a signed-in person ask to be given staff access. */
export const requestStaffAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
