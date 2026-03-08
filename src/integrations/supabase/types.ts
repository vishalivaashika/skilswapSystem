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
      certificates: {
        Row: {
          completed_date: string
          created_at: string
          id: string
          learner_id: string
          learner_name: string
          mentor_name: string
          score: number
          skill_id: string
          skill_name: string
          test_result_id: string
        }
        Insert: {
          completed_date?: string
          created_at?: string
          id?: string
          learner_id: string
          learner_name: string
          mentor_name: string
          score: number
          skill_id: string
          skill_name: string
          test_result_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          id?: string
          learner_id?: string
          learner_name?: string
          mentor_name?: string
          score?: number
          skill_id?: string
          skill_name?: string
          test_result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_test_result_id_fkey"
            columns: ["test_result_id"]
            isOneToOne: false
            referencedRelation: "test_results"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "slot_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      mcq_questions: {
        Row: {
          correct_index: number
          created_at: string
          id: string
          options: Json
          question: string
          question_type: string
          skill_category: string
        }
        Insert: {
          correct_index: number
          created_at?: string
          id?: string
          options: Json
          question: string
          question_type?: string
          skill_category: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          options?: Json
          question?: string
          question_type?: string
          skill_category?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits: number
          email: string
          experience: string | null
          full_name: string
          id: string
          role: string
          teaching_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          role?: string
          teaching_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          role?: string
          teaching_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          learner_id: string
          mentor_id: string
          rating: number
          skill_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          learner_id: string
          mentor_id: string
          rating: number
          skill_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          learner_id?: string
          mentor_id?: string
          rating?: number
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "slot_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          assessment_score: number | null
          category: string
          created_at: string
          credits: number
          description: string
          id: string
          is_approved: boolean
          mentor_id: string
          name: string
          rating: number
          review_count: number
          updated_at: string
        }
        Insert: {
          assessment_score?: number | null
          category: string
          created_at?: string
          credits?: number
          description?: string
          id?: string
          is_approved?: boolean
          mentor_id: string
          name: string
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Update: {
          assessment_score?: number | null
          category?: string
          created_at?: string
          credits?: number
          description?: string
          id?: string
          is_approved?: boolean
          mentor_id?: string
          name?: string
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      slot_bookings: {
        Row: {
          booked_at: string
          credits: number
          google_meet_link: string | null
          id: string
          learner_id: string
          mentor_id: string
          skill_id: string
          slot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          booked_at?: string
          credits: number
          google_meet_link?: string | null
          id?: string
          learner_id: string
          mentor_id: string
          skill_id: string
          slot_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          booked_at?: string
          credits?: number
          google_meet_link?: string | null
          id?: string
          learner_id?: string
          mentor_id?: string
          skill_id?: string
          slot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_bookings_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "teaching_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assessments: {
        Row: {
          answers: Json | null
          completed_at: string
          id: string
          passed: boolean
          score: number
          skill_id: string
          teacher_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          id?: string
          passed?: boolean
          score: number
          skill_id: string
          teacher_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          id?: string
          passed?: boolean
          score?: number
          skill_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assessments_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      teaching_slots: {
        Row: {
          created_at: string
          google_meet_link: string | null
          id: string
          is_available: boolean
          mentor_id: string
          skill_id: string
          slot_date: string
          slot_time: string
        }
        Insert: {
          created_at?: string
          google_meet_link?: string | null
          id?: string
          is_available?: boolean
          mentor_id: string
          skill_id: string
          slot_date: string
          slot_time: string
        }
        Update: {
          created_at?: string
          google_meet_link?: string | null
          id?: string
          is_available?: boolean
          mentor_id?: string
          skill_id?: string
          slot_date?: string
          slot_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "teaching_slots_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          answers: Json | null
          booking_id: string
          completed_at: string
          id: string
          learner_id: string
          pass_percentage: number
          passed: boolean
          score: number
          skill_id: string
          total_questions: number
        }
        Insert: {
          answers?: Json | null
          booking_id: string
          completed_at?: string
          id?: string
          learner_id: string
          pass_percentage: number
          passed?: boolean
          score: number
          skill_id: string
          total_questions: number
        }
        Update: {
          answers?: Json | null
          booking_id?: string
          completed_at?: string
          id?: string
          learner_id?: string
          pass_percentage?: number
          passed?: boolean
          score?: number
          skill_id?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_results_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "slot_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      calculate_teacher_bonus: {
        Args: { p_booking_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_user_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
