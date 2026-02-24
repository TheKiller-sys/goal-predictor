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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      lineups: {
        Row: {
          created_at: string
          formation: string | null
          id: string
          is_home: boolean
          match_id: string | null
          players: Json | null
          team_name: string
        }
        Insert: {
          created_at?: string
          formation?: string | null
          id?: string
          is_home?: boolean
          match_id?: string | null
          players?: Json | null
          team_name: string
        }
        Update: {
          created_at?: string
          formation?: string | null
          id?: string
          is_home?: boolean
          match_id?: string | null
          players?: Json | null
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lineups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          api_id: number | null
          away_elo: number | null
          away_lambda: number | null
          away_logo: string | null
          away_odds: number | null
          away_ppda: number | null
          away_score: number | null
          away_team: string
          away_team_id: number | null
          away_win_prob: number | null
          away_xg: number | null
          created_at: string
          draw_odds: number | null
          draw_prob: number | null
          home_elo: number | null
          home_lambda: number | null
          home_logo: string | null
          home_odds: number | null
          home_ppda: number | null
          home_score: number | null
          home_team: string
          home_team_id: number | null
          home_win_prob: number | null
          home_xg: number | null
          id: string
          kickoff: string | null
          league: string
          league_id: number | null
          round: string | null
          season: number | null
          status: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          api_id?: number | null
          away_elo?: number | null
          away_lambda?: number | null
          away_logo?: string | null
          away_odds?: number | null
          away_ppda?: number | null
          away_score?: number | null
          away_team: string
          away_team_id?: number | null
          away_win_prob?: number | null
          away_xg?: number | null
          created_at?: string
          draw_odds?: number | null
          draw_prob?: number | null
          home_elo?: number | null
          home_lambda?: number | null
          home_logo?: string | null
          home_odds?: number | null
          home_ppda?: number | null
          home_score?: number | null
          home_team: string
          home_team_id?: number | null
          home_win_prob?: number | null
          home_xg?: number | null
          id?: string
          kickoff?: string | null
          league: string
          league_id?: number | null
          round?: string | null
          season?: number | null
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          api_id?: number | null
          away_elo?: number | null
          away_lambda?: number | null
          away_logo?: string | null
          away_odds?: number | null
          away_ppda?: number | null
          away_score?: number | null
          away_team?: string
          away_team_id?: number | null
          away_win_prob?: number | null
          away_xg?: number | null
          created_at?: string
          draw_odds?: number | null
          draw_prob?: number | null
          home_elo?: number | null
          home_lambda?: number | null
          home_logo?: string | null
          home_odds?: number | null
          home_ppda?: number | null
          home_score?: number | null
          home_team?: string
          home_team_id?: number | null
          home_win_prob?: number | null
          home_xg?: number | null
          id?: string
          kickoff?: string | null
          league?: string
          league_id?: number | null
          round?: string | null
          season?: number | null
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      odds_history: {
        Row: {
          away_odds: number | null
          bookmaker: string | null
          btts_no_odds: number | null
          btts_yes_odds: number | null
          draw_odds: number | null
          home_odds: number | null
          id: string
          match_id: string | null
          over25_odds: number | null
          recorded_at: string
          under25_odds: number | null
        }
        Insert: {
          away_odds?: number | null
          bookmaker?: string | null
          btts_no_odds?: number | null
          btts_yes_odds?: number | null
          draw_odds?: number | null
          home_odds?: number | null
          id?: string
          match_id?: string | null
          over25_odds?: number | null
          recorded_at?: string
          under25_odds?: number | null
        }
        Update: {
          away_odds?: number | null
          bookmaker?: string | null
          btts_no_odds?: number | null
          btts_yes_odds?: number | null
          draw_odds?: number | null
          home_odds?: number | null
          id?: string
          match_id?: string | null
          over25_odds?: number | null
          recorded_at?: string
          under25_odds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "odds_history_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
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
