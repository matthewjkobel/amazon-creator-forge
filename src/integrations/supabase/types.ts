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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      brand_list_items: {
        Row: {
          creator_id: string
          list_id: string
        }
        Insert: {
          creator_id: string
          list_id: string
        }
        Update: {
          creator_id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_list_items_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "brand_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_lists: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_lists_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          about: string | null
          amazon_storefront_url: string | null
          approval_status: string | null
          approved_at: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          notes: string | null
          submission_count: number | null
          submitted_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          about?: string | null
          amazon_storefront_url?: string | null
          approval_status?: string | null
          approved_at?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          submission_count?: number | null
          submitted_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          about?: string | null
          amazon_storefront_url?: string | null
          approval_status?: string | null
          approved_at?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          notes?: string | null
          submission_count?: number | null
          submitted_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_media: {
        Row: {
          created_at: string | null
          creator_id: string | null
          id: string
          media_url: string | null
          metrics: Json | null
          thumb_url: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          media_url?: string | null
          metrics?: Json | null
          thumb_url?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          media_url?: string | null
          metrics?: Json | null
          thumb_url?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_media_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_niches: {
        Row: {
          creator_id: string
          niche_id: number
        }
        Insert: {
          creator_id: string
          niche_id: number
        }
        Update: {
          creator_id?: string
          niche_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "creator_niches_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_niches_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "niches"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_packages: {
        Row: {
          creator_id: string | null
          delivery_days: number | null
          description: string | null
          id: string
          includes: Json | null
          name: string
          price: number | null
        }
        Insert: {
          creator_id?: string | null
          delivery_days?: number | null
          description?: string | null
          id?: string
          includes?: Json | null
          name: string
          price?: number | null
        }
        Update: {
          creator_id?: string | null
          delivery_days?: number | null
          description?: string | null
          id?: string
          includes?: Json | null
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_packages_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_socials: {
        Row: {
          avg_views: number | null
          creator_id: string | null
          followers: number | null
          handle: string | null
          id: string
          platform: string
          url: string | null
        }
        Insert: {
          avg_views?: number | null
          creator_id?: string | null
          followers?: number | null
          handle?: string | null
          id?: string
          platform: string
          url?: string | null
        }
        Update: {
          avg_views?: number | null
          creator_id?: string | null
          followers?: number | null
          handle?: string | null
          id?: string
          platform?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_socials_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          avatar_url: string | null
          avg_views: number | null
          bio: string | null
          created_at: string | null
          display_name: string
          engagement_rate: number | null
          featured_video_url: string | null
          headline: string | null
          id: string
          is_featured: boolean | null
          location: string | null
          price_max: number | null
          price_min: number | null
          storefront_url: string | null
          submission_count: number | null
          submitted_at: string | null
          user_id: string | null
          visibility: string | null
          website_url: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          avatar_url?: string | null
          avg_views?: number | null
          bio?: string | null
          created_at?: string | null
          display_name: string
          engagement_rate?: number | null
          featured_video_url?: string | null
          headline?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          price_max?: number | null
          price_min?: number | null
          storefront_url?: string | null
          submission_count?: number | null
          submitted_at?: string | null
          user_id?: string | null
          visibility?: string | null
          website_url?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          avatar_url?: string | null
          avg_views?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string
          engagement_rate?: number | null
          featured_video_url?: string | null
          headline?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          price_max?: number | null
          price_min?: number | null
          storefront_url?: string | null
          submission_count?: number | null
          submitted_at?: string | null
          user_id?: string | null
          visibility?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          brand_id: string | null
          created_at: string | null
          creator_id: string | null
          id: string
          message: string | null
          package_id: string | null
          status: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          message?: string | null
          package_id?: string | null
          status?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          message?: string | null
          package_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "creator_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      niches: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          renews_at: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          renews_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          renews_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      member_user_ids: {
        Row: {
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_update_users_row: {
        Args: { _new_role: string; _requester: string; _target: string }
        Returns: boolean
      }
      ensure_user_row: {
        Args: {
          p_email: string
          p_full_name: string
          p_id: string
          p_role?: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
