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
      blog_posts: {
        Row: {
          author: string | null
          body: string | null
          category: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          publish_date: string | null
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          publish_date?: string | null
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          author?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          publish_date?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      careers: {
        Row: {
          compensation: string | null
          created_at: string
          department: string | null
          id: string
          location: string | null
          overview: string | null
          requirements: Json | null
          responsibilities: Json | null
          status: string
          title: string
          type: string | null
          what_we_offer: Json | null
          who_for: string | null
        }
        Insert: {
          compensation?: string | null
          created_at?: string
          department?: string | null
          id?: string
          location?: string | null
          overview?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          status?: string
          title: string
          type?: string | null
          what_we_offer?: Json | null
          who_for?: string | null
        }
        Update: {
          compensation?: string | null
          created_at?: string
          department?: string | null
          id?: string
          location?: string | null
          overview?: string | null
          requirements?: Json | null
          responsibilities?: Json | null
          status?: string
          title?: string
          type?: string | null
          what_we_offer?: Json | null
          who_for?: string | null
        }
        Relationships: []
      }
      legal_pages: {
        Row: {
          content: string
          effective_date: string | null
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          effective_date?: string | null
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          effective_date?: string | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_in_cents: number
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          items: Json
          status: string
          yoco_charge_id: string | null
        }
        Insert: {
          amount_in_cents: number
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          items: Json
          status?: string
          yoco_charge_id?: string | null
        }
        Update: {
          amount_in_cents?: number
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          items?: Json
          status?: string
          yoco_charge_id?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_visible: boolean
          logo_url: string
          name: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          logo_url: string
          name: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean
          logo_url?: string
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category: string | null
          created_at: string
          excerpt: string | null
          hero_image: string | null
          id: string
          sections: Json | null
          status: string
          subtitle: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          sections?: Json | null
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          sections?: Json | null
          status?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      review_requests: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          order_id: string | null
          send_after: string
          sent: boolean
          template_name: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          order_id?: string | null
          send_after?: string
          sent?: boolean
          template_name?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          order_id?: string | null
          send_after?: string
          sent?: boolean
          template_name?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          rating: number
          review_date: string
          review_text: string
          reviewer_name: string
          reviewer_photo_url: string | null
          source: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          rating: number
          review_date?: string
          review_text: string
          reviewer_name: string
          reviewer_photo_url?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          rating?: number
          review_date?: string
          review_text?: string
          reviewer_name?: string
          reviewer_photo_url?: string | null
          source?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          kind: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
        }
        Relationships: []
      }
      template_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          suggestion: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          suggestion?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          suggestion?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          canva_link: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          launch_price: number | null
          name: string
          preview_image: string | null
          price: number
          standard_price: number | null
          status: string
        }
        Insert: {
          canva_link?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          launch_price?: number | null
          name: string
          preview_image?: string | null
          price: number
          standard_price?: number | null
          status?: string
        }
        Update: {
          canva_link?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          launch_price?: number | null
          name?: string
          preview_image?: string | null
          price?: number
          standard_price?: number | null
          status?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
