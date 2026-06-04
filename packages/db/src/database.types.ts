export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      billing: {
        Row: {
          current_period_end: number | null;
          plan_id: string | null;
          status: string | null;
          polar_customer_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          current_period_end?: number | null;
          plan_id?: string | null;
          status?: string | null;
          polar_customer_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          current_period_end?: number | null;
          plan_id?: string | null;
          status?: string | null;
          polar_customer_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          ai_reason: string | null;
          author_image: string | null;
          author_name: string;
          body: string;
          created_at: string;
          id: string;
          status: string;
          user_id: string;
          video_id: string;
        };
        Insert: {
          ai_reason?: string | null;
          author_image?: string | null;
          author_name?: string;
          body: string;
          created_at?: string;
          id?: string;
          status?: string;
          user_id: string;
          video_id: string;
        };
        Update: {
          ai_reason?: string | null;
          author_image?: string | null;
          author_name?: string;
          body?: string;
          created_at?: string;
          id?: string;
          status?: string;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_views: {
        Row: {
          count: number;
          day: string;
        };
        Insert: {
          count?: number;
          day: string;
        };
        Update: {
          count?: number;
          day?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          created_at: string;
          user_id: string;
          video_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
          video_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          description: string;
          id: string;
          interval: string;
          name: string;
          polar_product_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: string;
          interval?: string;
          name: string;
          polar_product_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: string;
          interval?: string;
          name?: string;
          polar_product_id?: string;
        };
        Relationships: [];
      };
      processed_webhooks: {
        Row: {
          created_at: string;
          id: string;
          provider: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          provider: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          provider?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          banned: boolean;
          created_at: string;
          email: string | null;
          id: string;
          image: string | null;
          name: string;
          role: string;
        };
        Insert: {
          banned?: boolean;
          created_at?: string;
          email?: string | null;
          id: string;
          image?: string | null;
          name?: string;
          role?: string;
        };
        Update: {
          banned?: boolean;
          created_at?: string;
          email?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          role?: string;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          polar_order_id: string | null;
          user_id: string;
          video_id: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          currency?: string;
          polar_order_id?: string | null;
          user_id: string;
          video_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          polar_order_id?: string | null;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchases_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      rate_counters: {
        Row: {
          count: number;
          key: string;
          window_start: string;
        };
        Insert: {
          count?: number;
          key: string;
          window_start?: string;
        };
        Update: {
          count?: number;
          key?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          data: Json;
          id: number;
          updated_at: string;
        };
        Insert: {
          data?: Json;
          id?: number;
          updated_at?: string;
        };
        Update: {
          data?: Json;
          id?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      videos: {
        Row: {
          access: string;
          aspect_ratio: string | null;
          category_id: string | null;
          comment_count: number;
          created_at: string;
          custom_poster_url: string | null;
          description: string;
          duration: number | null;
          id: string;
          like_count: number;
          mux_asset_id: string | null;
          mux_upload_id: string | null;
          playback_id: string | null;
          playback_policy: string;
          price_amount: number | null;
          processing_status: string;
          publish_at: string | null;
          publish_status: string;
          published_at: string | null;
          required_plan_ids: string[];
          search: unknown | null;
          slug: string;
          polar_product_id: string | null;
          tags: string[];
          thumbnail_time: number | null;
          title: string;
          updated_at: string;
          view_count: number;
          visibility: string;
        };
        Insert: {
          access?: string;
          aspect_ratio?: string | null;
          category_id?: string | null;
          comment_count?: number;
          created_at?: string;
          custom_poster_url?: string | null;
          description?: string;
          duration?: number | null;
          id?: string;
          like_count?: number;
          mux_asset_id?: string | null;
          mux_upload_id?: string | null;
          playback_id?: string | null;
          playback_policy?: string;
          price_amount?: number | null;
          processing_status?: string;
          publish_at?: string | null;
          publish_status?: string;
          published_at?: string | null;
          required_plan_ids?: string[];
          search?: unknown | null;
          slug: string;
          polar_product_id?: string | null;
          tags?: string[];
          thumbnail_time?: number | null;
          title: string;
          updated_at?: string;
          view_count?: number;
          visibility?: string;
        };
        Update: {
          access?: string;
          aspect_ratio?: string | null;
          category_id?: string | null;
          comment_count?: number;
          created_at?: string;
          custom_poster_url?: string | null;
          description?: string;
          duration?: number | null;
          id?: string;
          like_count?: number;
          mux_asset_id?: string | null;
          mux_upload_id?: string | null;
          playback_id?: string | null;
          playback_policy?: string;
          price_amount?: number | null;
          processing_status?: string;
          publish_at?: string | null;
          publish_status?: string;
          published_at?: string | null;
          required_plan_ids?: string[];
          search?: unknown | null;
          slug?: string;
          polar_product_id?: string | null;
          tags?: string[];
          thumbnail_time?: number | null;
          title?: string;
          updated_at?: string;
          view_count?: number;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number };
        Returns: boolean;
      };
      dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_videos: number;
          total_views: number;
          total_likes: number;
          total_comments: number;
          flagged_comments: number;
        }[];
      };
      increment_view: {
        Args: { p_video_id: string };
        Returns: number;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      views_timeseries: {
        Args: { p_days: number };
        Returns: {
          day: string;
          views: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
