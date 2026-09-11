export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addon_items: {
        Row: {
          active: boolean
          hint: string
          id: string
          kind: string
          label: string
          price: number
          show_in_offer: boolean
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          hint?: string
          id: string
          kind?: string
          label: string
          price?: number
          show_in_offer?: boolean
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          hint?: string
          id?: string
          kind?: string
          label?: string
          price?: number
          show_in_offer?: boolean
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          campaign_percent: number
          campaign_reason: string
          company_address: string
          company_email: string
          company_name: string
          company_phone: string
          company_reg: string
          company_vat: string
          company_web: string
          default_language: string
          default_markup: number
          delivery_rate: number
          delivery_time_text: string
          email_body: string
          email_subject: string
          enquiry_prefix: string
          id: boolean
          install_rate: number
          min_margin_percent: number
          offer_prefix: string
          offer_validity_days: number
          order_prefix: string
          updated_at: string
          vat_percent: number
        }
        Insert: {
          campaign_percent?: number
          campaign_reason?: string
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          company_reg?: string
          company_vat?: string
          company_web?: string
          default_language?: string
          default_markup?: number
          delivery_rate?: number
          delivery_time_text?: string
          email_body?: string
          email_subject?: string
          enquiry_prefix?: string
          id?: boolean
          install_rate?: number
          min_margin_percent?: number
          offer_prefix?: string
          offer_validity_days?: number
          order_prefix?: string
          updated_at?: string
          vat_percent?: number
        }
        Update: {
          campaign_percent?: number
          campaign_reason?: string
          company_address?: string
          company_email?: string
          company_name?: string
          company_phone?: string
          company_reg?: string
          company_vat?: string
          company_web?: string
          default_language?: string
          default_markup?: number
          delivery_rate?: number
          delivery_time_text?: string
          email_body?: string
          email_subject?: string
          enquiry_prefix?: string
          id?: boolean
          install_rate?: number
          min_margin_percent?: number
          offer_prefix?: string
          offer_validity_days?: number
          order_prefix?: string
          updated_at?: string
          vat_percent?: number
        }
        Relationships: []
      }
      price_items: {
        Row: {
          active: boolean
          category: string
          driver: string
          hst_price: number | null
          id: string
          name: string
          purchase_price: number
          ref_qty: number
          sale_multiplier: number
          systems: string[]
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          driver?: string
          hst_price?: number | null
          id: string
          name: string
          purchase_price?: number
          ref_qty?: number
          sale_multiplier?: number
          systems?: string[]
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          driver?: string
          hst_price?: number | null
          id?: string
          name?: string
          purchase_price?: number
          ref_qty?: number
          sale_multiplier?: number
          systems?: string[]
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_seen_at: string | null
          staff_requested: boolean
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          last_seen_at?: string | null
          staff_requested?: boolean
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          last_seen_at?: string | null
          staff_requested?: boolean
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      public_settings: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "owner" | "sales" | "production" | "customer"
      profile_status: "pending" | "active" | "disabled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "sales", "production", "customer"],
      profile_status: ["pending", "active", "disabled"],
    },
  },
} as const
