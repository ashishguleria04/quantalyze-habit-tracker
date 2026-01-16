// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionStatus = 'free' | 'pro' | 'cancelled'
export type HabitCategory = 'vitality' | 'focus' | 'discipline' | 'social'
export type GoalType = 'binary' | 'number' | 'duration'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: SubscriptionStatus
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: HabitCategory
          weight: number
          goal_type: GoalType
          goal_value: number | null
          unit: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: HabitCategory
          weight?: number
          goal_type?: GoalType
          goal_value?: number | null
          unit?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: HabitCategory
          weight?: number
          goal_type?: GoalType
          goal_value?: number | null
          unit?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          value: number
          normalized_value: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          date: string
          value: number
          normalized_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string
          date?: string
          value?: number
          normalized_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quality_scores: {
        Row: {
          id: string
          user_id: string
          date: string
          vitality_score: number | null
          focus_score: number | null
          discipline_score: number | null
          social_score: number | null
          overall_score: number | null
          consistency_multiplier: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          vitality_score?: number | null
          focus_score?: number | null
          discipline_score?: number | null
          social_score?: number | null
          overall_score?: number | null
          consistency_multiplier?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          vitality_score?: number | null
          focus_score?: number | null
          discipline_score?: number | null
          social_score?: number | null
          overall_score?: number | null
          consistency_multiplier?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: string
          title: string | null
          content: string
          priority: number
          is_read: boolean
          is_dismissed: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type?: string
          title?: string | null
          content: string
          priority?: number
          is_read?: boolean
          is_dismissed?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: string
          title?: string | null
          content?: string
          priority?: number
          is_read?: boolean
          is_dismissed?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
      import_sessions: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_type: string
          row_count: number | null
          column_mappings: Json | null
          status: string
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_type: string
          row_count?: number | null
          column_mappings?: Json | null
          status?: string
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_type?: string
          row_count?: number | null
          column_mappings?: Json | null
          status?: string
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Enums: {
      subscription_status: SubscriptionStatus
      habit_category: HabitCategory
      goal_type: GoalType
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type DailyLog = Database['public']['Tables']['daily_logs']['Row']
export type QualityScore = Database['public']['Tables']['quality_scores']['Row']
export type AIInsight = Database['public']['Tables']['ai_insights']['Row']
export type ImportSession = Database['public']['Tables']['import_sessions']['Row']
