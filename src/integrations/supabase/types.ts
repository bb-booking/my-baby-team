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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      check_ins: {
        Row: {
          created_at: string
          date: string
          id: string
          mood: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          mood: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          mood?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      diaper_logs: {
        Row: {
          id: string
          stool_color: string | null
          stool_consistency: string | null
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          id?: string
          stool_color?: string | null
          stool_consistency?: string | null
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          id?: string
          stool_color?: string | null
          stool_consistency?: string | null
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      night_shifts: {
        Row: {
          assignee: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          assignee: string
          date: string
          id?: string
          user_id: string
        }
        Update: {
          assignee?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      nursing_logs: {
        Row: {
          id: string
          side: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          side: string
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          side?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          children: Json
          created_at: string
          due_or_birth_date: string
          id: string
          languages: Json | null
          mor_health: Json | null
          onboarded: boolean
          parent_name: string
          parental_leave: Json | null
          partner_name: string
          phase: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          children?: Json
          created_at?: string
          due_or_birth_date?: string
          id?: string
          languages?: Json | null
          mor_health?: Json | null
          onboarded?: boolean
          parent_name?: string
          parental_leave?: Json | null
          partner_name?: string
          phase?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          children?: Json
          created_at?: string
          due_or_birth_date?: string
          id?: string
          languages?: Json | null
          mor_health?: Json | null
          onboarded?: boolean
          parent_name?: string
          parental_leave?: Json | null
          partner_name?: string
          phase?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          end_time: string | null
          id: string
          source: string
          start_time: string
          type: string
          user_id: string
        }
        Insert: {
          end_time?: string | null
          id?: string
          source?: string
          start_time: string
          type: string
          user_id: string
        }
        Update: {
          end_time?: string | null
          id?: string
          source?: string
          start_time?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string
          category: string
          completed: boolean
          created_at: string
          due_date: string
          id: string
          recurrence: string
          title: string
          user_id: string
        }
        Insert: {
          assignee?: string
          category?: string
          completed?: boolean
          created_at?: string
          due_date?: string
          id?: string
          recurrence?: string
          title: string
          user_id: string
        }
        Update: {
          assignee?: string
          category?: string
          completed?: boolean
          created_at?: string
          due_date?: string
          id?: string
          recurrence?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
