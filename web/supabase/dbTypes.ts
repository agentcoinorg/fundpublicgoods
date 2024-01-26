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
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      gitcoin_applications: {
        Row: {
          created_at: number
          data: Json
          id: string
          pointer: string
          project_id: string
          protocol: number
          round_id: string
        }
        Insert: {
          created_at: number
          data: Json
          id: string
          pointer: string
          project_id: string
          protocol: number
          round_id: string
        }
        Update: {
          created_at?: number
          data?: Json
          id?: string
          pointer?: string
          project_id?: string
          protocol?: number
          round_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gitcoin_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "gitcoin_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      gitcoin_indexing_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          is_failed: boolean
          is_running: boolean
          last_updated_at: string
          network_id: number
          skip_projects: number
          skip_rounds: number
          url: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          is_failed?: boolean
          is_running?: boolean
          last_updated_at?: string
          network_id: number
          skip_projects?: number
          skip_rounds?: number
          url: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          is_failed?: boolean
          is_running?: boolean
          last_updated_at?: string
          network_id?: number
          skip_projects?: number
          skip_rounds?: number
          url?: string
        }
        Relationships: []
      }
      gitcoin_projects: {
        Row: {
          created_at: string
          data: Json
          id: string
          pointer: string
          protocol: number
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          pointer: string
          protocol: number
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          pointer?: string
          protocol?: number
        }
        Relationships: []
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
            referencedRelation: "runs"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          description: string | null
          id: string
          title: string | null
          updated_at: number
          website: string | null
        }
        Insert: {
          description?: string | null
          id: string
          title?: string | null
          updated_at: number
          website?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          title?: string | null
          updated_at?: number
          website?: string | null
        }
        Relationships: []
      }
      runs: {
        Row: {
          created_at: string
          id: string
          prompt: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          }
        ]
      }
      strategy_entries: {
        Row: {
          created_at: string
          id: string
          impact: number | null
          interest: number | null
          project_id: string
          reasoning: string | null
          run_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          impact?: number | null
          interest?: number | null
          project_id: string
          reasoning?: string | null
          run_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          impact?: number | null
          interest?: number | null
          project_id?: string
          reasoning?: string | null
          run_id?: string
          weight?: number | null
        }
        Relationships: [
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
            referencedRelation: "runs"
            referencedColumns: ["id"]
          }
        ]
      }
      workers: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
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

