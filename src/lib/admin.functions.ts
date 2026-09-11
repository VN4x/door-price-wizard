import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole, AccountStatus } from "@/lib/account.functions";
import type { PriceDriver, PriceItem } from "@/types";
import type { SystemId } from "@/lib/pricing";

export interface StaffUser {
  id: string;
  email: string;
  fullName: string;
  status: AccountStatus;
  roles: AppRole[];
  staffRequested: boolean;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface AppSettings {
  companyName: string;
  companyReg: string;
  companyVat: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWeb: string;
  offerValidityDays: number;
  vatPercent: number;
  offerPrefix: string;
  orderPrefix: string;
  enquiryPrefix: string;
  defaultLanguage: string;
  deliveryRate: number;
  installRate: number;
  deliveryTimeText: string;
  defaultMarkup: number;
  minMarginPercent: number;
  campaignPercent: number;
  campaignReason: string;
  emailSubject: string;
  emailBody: string;
}

export interface AddonRow {
  id: string;
  label: string;
  hint: string;
  kind: "extra" | "glass";
  unit: "each" | "perYear" | "perM2";
  price: number;
  showInOffer: boolean;
  active: boolean;
}

/** Throws unless the caller is an active owner. */
async function assertOwner(supabase: {
  rpc: (fn: "is_owner", args: { _user_id: string }) => Promise<{ data: unknown }>;
}, userId: string) {
  const { data } = await supabase.rpc("is_owner", { _user_id: userId });
  if (data !== true) throw new Error("Forbidden");
}

// ---------------------------------------------------------------- users

export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffUser[]> => {
    const { supabase, userId } = context;
    await assertOwner(supabase, userId);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, status, staff_requested, created_at, last_seen_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    return (profiles ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      status: p.status as AccountStatus,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
      staffRequested: p.staff_requested,
      createdAt: p.created_at,
      lastSeenAt: p.last_seen_at,
    }));
  });

/** Replaces a person's roles with exactly the one given. */
export const setUserRole = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; role: AppRole }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.role !== "owner") {
      const { data: owners } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .eq("role", "owner");
      const ids = (owners ?? []).map((o) => o.user_id);
      if (ids.length <= 1 && ids.includes(data.userId)) {
        throw new Error("There must always be one owner");
      }
    }

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("profiles")
      .update({ staff_requested: false, updated_at: new Date().toISOString() })
      .eq("id", data.userId);
    return { ok: true };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string; status: AccountStatus }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    if (data.userId === context.userId && data.status !== "active") {
      throw new Error("You cannot disable your own account");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Turns down a staff request without touching the person's customer access. */
export const rejectStaffRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ staff_requested: false, updated_at: new Date().toISOString() })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ------------------------------------------------------------- settings

export const getSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AppSettings> => {
    const { data, error } = await context.supabase
      .from("app_settings")
      .select("*")
      .eq("id", true)
      .single();
    if (error) throw new Error(error.message);
    return {
      companyName: data.company_name,
      companyReg: data.company_reg,
      companyVat: data.company_vat,
      companyAddress: data.company_address,
      companyPhone: data.company_phone,
      companyEmail: data.company_email,
      companyWeb: data.company_web,
      offerValidityDays: data.offer_validity_days,
      vatPercent: Number(data.vat_percent),
      offerPrefix: data.offer_prefix,
      orderPrefix: data.order_prefix,
      enquiryPrefix: data.enquiry_prefix,
      defaultLanguage: data.default_language,
      deliveryRate: Number(data.delivery_rate),
      installRate: Number(data.install_rate),
      deliveryTimeText: data.delivery_time_text,
      defaultMarkup: Number(data.default_markup),
      minMarginPercent: Number(data.min_margin_percent),
      campaignPercent: Number(data.campaign_percent),
      campaignReason: data.campaign_reason,
      emailSubject: data.email_subject,
      emailBody: data.email_body,
    };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .inputValidator((input: AppSettings) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("app_settings")
      .update({
        company_name: data.companyName,
        company_reg: data.companyReg,
        company_vat: data.companyVat,
        company_address: data.companyAddress,
        company_phone: data.companyPhone,
        company_email: data.companyEmail,
        company_web: data.companyWeb,
        offer_validity_days: data.offerValidityDays,
        vat_percent: data.vatPercent,
        offer_prefix: data.offerPrefix,
        order_prefix: data.orderPrefix,
        enquiry_prefix: data.enquiryPrefix,
        default_language: data.defaultLanguage,
        delivery_rate: data.deliveryRate,
        install_rate: data.installRate,
        delivery_time_text: data.deliveryTimeText,
        default_markup: data.defaultMarkup,
        min_margin_percent: data.minMarginPercent,
        campaign_percent: data.campaignPercent,
        campaign_reason: data.campaignReason,
        email_subject: data.emailSubject,
        email_body: data.emailBody,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----------------------------------------------------------- price list

export const listPriceItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PriceItem[]> => {
    await assertOwner(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("price_items")
      .select("*")
      .order("category")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      purchasePrice: Number(p.purchase_price),
      saleMultiplier: Number(p.sale_multiplier),
      active: p.active,
      updatedAt: p.updated_at.slice(0, 10),
      driver: p.driver as PriceDriver,
      refQty: Number(p.ref_qty),
      systems: p.systems as SystemId[],
      ...(p.hst_price === null ? {} : { hstPrice: Number(p.hst_price) }),
    }));
  });

export const upsertPriceItemFn = createServerFn({ method: "POST" })
  .inputValidator((input: PriceItem) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { error } = await context.supabase.from("price_items").upsert({
      id: data.id,
      name: data.name,
      category: data.category,
      unit: data.unit,
      purchase_price: data.purchasePrice,
      sale_multiplier: data.saleMultiplier,
      active: data.active,
      driver: data.driver,
      ref_qty: data.refQty,
      systems: data.systems,
      hst_price: data.hstPrice ?? null,
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePriceItemFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { error } = await context.supabase.from("price_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------------------------------------------------------------- add-ons

export const listAddons = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AddonRow[]> => {
    const { data, error } = await context.supabase
      .from("addon_items")
      .select("*")
      .order("kind")
      .order("label");
    if (error) throw new Error(error.message);
    return (data ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      hint: a.hint,
      kind: a.kind as AddonRow["kind"],
      unit: a.unit as AddonRow["unit"],
      price: Number(a.price),
      showInOffer: a.show_in_offer,
      active: a.active,
    }));
  });

export const saveAddon = createServerFn({ method: "POST" })
  .inputValidator((input: AddonRow) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { error } = await context.supabase.from("addon_items").upsert({
      id: data.id,
      label: data.label,
      hint: data.hint,
      kind: data.kind,
      unit: data.unit,
      price: data.price,
      show_in_offer: data.showInOffer,
      active: data.active,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
