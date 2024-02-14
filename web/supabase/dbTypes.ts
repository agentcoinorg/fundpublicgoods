export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          answers: Json | null
          created_at: number
          id: string
          network: number
          project_id: string
          recipient: string
          round: string
        }
        Insert: {
          answers?: Json | null
          created_at: number
          id: string
          network: number
          project_id: string
          recipient: string
          round: string
        }
        Update: {
          answers?: Json | null
          created_at?: number
          id?: string
          network?: number
          project_id?: string
          recipient?: string
          round?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "funding_entries_view"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      funding_entries: {
        Row: {
          amount: string
          created_at: string
          id: string
          project_id: string
          run_id: string
          token: string
          transaction_id: string | null
          weight: number
        }
        Insert: {
          amount: string
          created_at?: string
          id?: string
          project_id: string
          run_id: string
          token: string
          transaction_id?: string | null
          weight: number
        }
        Update: {
          amount?: string
          created_at?: string
          id?: string
          project_id?: string
          run_id?: string
          token?: string
          transaction_id?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "funding_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "funding_entries_view"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "funding_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_entries_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "funding_entries_view"
            referencedColumns: ["run_id"]
          },
          {
            foreignKeyName: "funding_entries_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          }
        ]
      }
      logs: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          run_id: string
          status: Database["public"]["Enums"]["step_status"]
          step_name: Database["public"]["Enums"]["step_name"]
          value: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          run_id: string
          status: Database["public"]["Enums"]["step_status"]
          step_name: Database["public"]["Enums"]["step_name"]
          value?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          run_id?: string
          status?: Database["public"]["Enums"]["step_status"]
          step_name?: Database["public"]["Enums"]["step_name"]
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "funding_entries_view"
            referencedColumns: ["run_id"]
          },
          {
            foreignKeyName: "logs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          categories: string[]
          description: string | null
          id: string
          keywords: string[]
          logo: string | null
          short_description: string | null
          title: string | null
          twitter: string | null
          updated_at: number
          website: string
        }
        Insert: {
          categories?: string[]
          description?: string | null
          id: string
          keywords?: string[]
          logo?: string | null
          short_description?: string | null
          title?: string | null
          twitter?: string | null
          updated_at: number
          website: string
        }
        Update: {
          categories?: string[]
          description?: string | null
          id?: string
          keywords?: string[]
          logo?: string | null
          short_description?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: number
          website?: string
        }
        Relationships: []
      }
      runs: {
        Row: {
          created_at: string
          id: string
          prompt: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      strategy_entries: {
        Row: {
          created_at: string
          funding_needed: number | null
          id: string
          impact: number | null
          interest: number | null
          project_id: string
          report: string | null
          run_id: string
          smart_ranking: number | null
        }
        Insert: {
          created_at?: string
          funding_needed?: number | null
          id?: string
          impact?: number | null
          interest?: number | null
          project_id: string
          report?: string | null
          run_id: string
          smart_ranking?: number | null
        }
        Update: {
          created_at?: string
          funding_needed?: number | null
          id?: string
          impact?: number | null
          interest?: number | null
          project_id?: string
          report?: string | null
          run_id?: string
          smart_ranking?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "funding_entries_view"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "strategy_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_entries_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "funding_entries_view"
            referencedColumns: ["run_id"]
          },
          {
            foreignKeyName: "strategy_entries_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_anon: boolean
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_anon: boolean
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_anon?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      funding_entries_view: {
        Row: {
          amount: string | null
          description: string | null
          network: number | null
          project_id: string | null
          recipient: string | null
          run_id: string | null
          title: string | null
          token: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      step_name:
        | "FETCH_PROJECTS"
        | "EVALUATE_PROJECTS"
        | "ANALYZE_FUNDING"
        | "SYNTHESIZE_RESULTS"
      step_status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ERRORED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

