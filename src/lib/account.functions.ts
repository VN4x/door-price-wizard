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
  staffRequested: boolean;
  /** True while a staff request waits for the owner. */
  awaitingApproval: boolean;
  isStaff: boolean;
  isOwner: boolean;
}

/**
 * Makes sure the signed-in user has a profile row, then reports what they may
 * see. Customers are usable right away; staff access only exists once the owner
 * grants a staff role. The very first account ever created becomes the owner.
 */
export const ensureAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Account> => {
    const { supabase, userId, claims } = context;
    const meta = claims as {
      email?: string;
      user_metadata?: { full_name?: string; name?: string };
    };
    const email = meta.email ?? "";
    const name =
      meta.user_metadata?.full_name ?? meta.user_metadata?.name ?? email.split("@")[0] ?? "";

    let { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, status, staff_requested")
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
        .insert({ id: userId, email, full_name: name, status: "active" })
        .select("id, email, full_name, status, staff_requested")
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
    const isStaff =
      active && roles.some((r) => r === "owner" || r === "sales" || r === "production");

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      status: profile.status as AccountStatus,
      roles,
      staffRequested: profile.staff_requested,
      awaitingApproval: profile.staff_requested && !isStaff,
      isStaff,
      isOwner: active && roles.includes("owner"),
    };
  });

/** A signed-in person asks the owner for staff access. */
export const requestStaffAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ staff_requested: true, updated_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
