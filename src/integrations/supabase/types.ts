export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cached_competitions: {
        Row: {
          area_code: string
          area_name: string
          code: string
          created_at: string | null
          current_matchday: number | null
          emblem_url: string | null
          id: number
          last_updated: string | null
          name: string
          plan: string | null
          type: string | null
        }
        Insert: {
          area_code: string
          area_name: string
          code: string
          created_at?: string | null
          current_matchday?: number | null
          emblem_url?: string | null
          id: number
          last_updated?: string | null
          name: string
          plan?: string | null
          type?: string | null
        }
        Update: {
          area_code?: string
          area_name?: string
          code?: string
          created_at?: string | null
          current_matchday?: number | null
          emblem_url?: string | null
          id?: number
          last_updated?: string | null
          name?: string
          plan?: string | null
          type?: string | null
        }
        Relationships: []
      }
      cached_fixtures: {
        Row: {
          admin_rating: number | null
          attendance: number | null
          away_score: number | null
          away_team_id: number
          competition_id: number
          created_at: string | null
          duration: string | null
          group_name: string | null
          home_score: number | null
          home_team_id: number
          id: number
          injury_time: number | null
          last_updated: string | null
          matchday: number | null
          minute: number | null
          referee: string | null
          season_id: number | null
          stage: string | null
          status: string
          utc_date: string
          venue: string | null
          winner: string | null
        }
        Insert: {
          admin_rating?: number | null
          attendance?: number | null
          away_score?: number | null
          away_team_id: number
          competition_id: number
          created_at?: string | null
          duration?: string | null
          group_name?: string | null
          home_score?: number | null
          home_team_id: number
          id: number
          injury_time?: number | null
          last_updated?: string | null
          matchday?: number | null
          minute?: number | null
          referee?: string | null
          season_id?: number | null
          stage?: string | null
          status?: string
          utc_date: string
          venue?: string | null
          winner?: string | null
        }
        Update: {
          admin_rating?: number | null
          attendance?: number | null
          away_score?: number | null
          away_team_id?: number
          competition_id?: number
          created_at?: string | null
          duration?: string | null
          group_name?: string | null
          home_score?: number | null
          home_team_id?: number
          id?: number
          injury_time?: number | null
          last_updated?: string | null
          matchday?: number | null
          minute?: number | null
          referee?: string | null
          season_id?: number | null
          stage?: string | null
          status?: string
          utc_date?: string
          venue?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cached_fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "cached_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_fixtures_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "cached_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "cached_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_h2h_matches: {
        Row: {
          away_score: number | null
          away_team_id: number
          competition_id: number
          created_at: string
          home_score: number | null
          home_team_id: number
          id: string
          last_updated: string
          match_id: number
          season_year: number
          status: string
          team1_id: number
          team2_id: number
          utc_date: string
          venue: string | null
          winner: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id: number
          competition_id: number
          created_at?: string
          home_score?: number | null
          home_team_id: number
          id?: string
          last_updated?: string
          match_id: number
          season_year: number
          status: string
          team1_id: number
          team2_id: number
          utc_date: string
          venue?: string | null
          winner?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: number
          competition_id?: number
          created_at?: string
          home_score?: number | null
          home_team_id?: number
          id?: string
          last_updated?: string
          match_id?: number
          season_year?: number
          status?: string
          team1_id?: number
          team2_id?: number
          utc_date?: string
          venue?: string | null
          winner?: string | null
        }
        Relationships: []
      }
      cached_standings: {
        Row: {
          competition_id: number
          created_at: string | null
          draw: number | null
          form: string | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          id: string
          last_updated: string | null
          lost: number | null
          played_games: number | null
          points: number | null
          position: number
          team_id: number
          won: number | null
        }
        Insert: {
          competition_id: number
          created_at?: string | null
          draw?: number | null
          form?: string | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          last_updated?: string | null
          lost?: number | null
          played_games?: number | null
          points?: number | null
          position: number
          team_id: number
          won?: number | null
        }
        Update: {
          competition_id?: number
          created_at?: string | null
          draw?: number | null
          form?: string | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          last_updated?: string | null
          lost?: number | null
          played_games?: number | null
          points?: number | null
          position?: number
          team_id?: number
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cached_standings_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "cached_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "cached_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_team_form: {
        Row: {
          created_at: string
          form_string: string | null
          id: string
          last_updated: string
          match1_result: string | null
          match2_result: string | null
          match3_result: string | null
          match4_result: string | null
          match5_result: string | null
          team_id: number
        }
        Insert: {
          created_at?: string
          form_string?: string | null
          id?: string
          last_updated?: string
          match1_result?: string | null
          match2_result?: string | null
          match3_result?: string | null
          match4_result?: string | null
          match5_result?: string | null
          team_id: number
        }
        Update: {
          created_at?: string
          form_string?: string | null
          id?: string
          last_updated?: string
          match1_result?: string | null
          match2_result?: string | null
          match3_result?: string | null
          match4_result?: string | null
          match5_result?: string | null
          team_id?: number
        }
        Relationships: []
      }
      cached_teams: {
        Row: {
          address: string | null
          club_colors: string | null
          coach_name: string | null
          coach_nationality: string | null
          created_at: string | null
          crest_url: string | null
          founded: number | null
          id: number
          last_updated: string | null
          league_rank: number | null
          name: string
          short_name: string | null
          tla: string | null
          venue: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          club_colors?: string | null
          coach_name?: string | null
          coach_nationality?: string | null
          created_at?: string | null
          crest_url?: string | null
          founded?: number | null
          id: number
          last_updated?: string | null
          league_rank?: number | null
          name: string
          short_name?: string | null
          tla?: string | null
          venue?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          club_colors?: string | null
          coach_name?: string | null
          coach_nationality?: string | null
          created_at?: string | null
          crest_url?: string | null
          founded?: number | null
          id?: number
          last_updated?: string | null
          league_rank?: number | null
          name?: string
          short_name?: string | null
          tla?: string | null
          venue?: string | null
          website?: string | null
        }
        Relationships: []
      }
      coin_offers: {
        Row: {
          coin_amount: number
          created_at: string
          created_by: string
          description: string | null
          discount_percentage: number | null
          end_date: string
          id: string
          is_active: boolean
          offer_price: number
          original_price: number
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          coin_amount: number
          created_at?: string
          created_by: string
          description?: string | null
          discount_percentage?: number | null
          end_date: string
          id?: string
          is_active?: boolean
          offer_price: number
          original_price: number
          start_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          coin_amount?: number
          created_at?: string
          created_by?: string
          description?: string | null
          discount_percentage?: number | null
          end_date?: string
          id?: string
          is_active?: boolean
          offer_price?: number
          original_price?: number
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          admin_rating: number | null
          away_score: number | null
          away_team: string
          competition: string
          created_at: string
          external_id: string | null
          home_score: number | null
          home_team: string
          id: string
          match_date: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_rating?: number | null
          away_score?: number | null
          away_team: string
          competition: string
          created_at?: string
          external_id?: string | null
          home_score?: number | null
          home_team: string
          id?: string
          match_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_rating?: number | null
          away_score?: number | null
          away_team?: string
          competition?: string
          created_at?: string
          external_id?: string | null
          home_score?: number | null
          home_team?: string
          id?: string
          match_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          away_score: number
          created_at: string
          home_score: number
          id: string
          match_id: string
          points_earned: number | null
          room_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          away_score: number
          created_at?: string
          home_score: number
          id?: string
          match_id: string
          points_earned?: number | null
          room_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          away_score?: number
          created_at?: string
          home_score?: number
          id?: string
          match_id?: string
          points_earned?: number | null
          room_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          nationality: string | null
          phone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      room_participants: {
        Row: {
          id: string
          is_active: boolean
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          access_code: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean
          max_participants: number | null
          name: string
          updated_at: string
        }
        Insert: {
          access_code: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean
          max_participants?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean
          max_participants?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      special_game_matches: {
        Row: {
          added_at: string
          id: string
          match_id: string
          points_multiplier: number | null
          special_game_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          match_id: string
          points_multiplier?: number | null
          special_game_id: string
        }
        Update: {
          added_at?: string
          id?: string
          match_id?: string
          points_multiplier?: number | null
          special_game_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_game_matches_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_game_matches_special_game_id_fkey"
            columns: ["special_game_id"]
            isOneToOne: false
            referencedRelation: "special_games"
            referencedColumns: ["id"]
          },
        ]
      }
      special_games: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          competition_id: number | null
          completed_at: string | null
          created_at: string | null
          errors: string | null
          id: string
          records_processed: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          competition_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          errors?: string | null
          id?: string
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_type: string
        }
        Update: {
          competition_id?: number | null
          completed_at?: string | null
          created_at?: string | null
          errors?: string | null
          id?: string
          records_processed?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      sync_progress: {
        Row: {
          batch_size: number
          competition_id: number | null
          completed_at: string | null
          created_at: string
          current_batch: number
          error_message: string | null
          id: string
          metadata: Json | null
          processed_items: number
          status: string
          sync_type: string
          total_items: number
          updated_at: string
        }
        Insert: {
          batch_size?: number
          competition_id?: number | null
          completed_at?: string | null
          created_at?: string
          current_batch?: number
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_items?: number
          status?: string
          sync_type: string
          total_items?: number
          updated_at?: string
        }
        Update: {
          batch_size?: number
          competition_id?: number | null
          completed_at?: string | null
          created_at?: string
          current_batch?: number
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_items?: number
          status?: string
          sync_type?: string
          total_items?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_competitions: {
        Row: {
          area_name: string | null
          competition_code: string | null
          competition_id: number
          competition_name: string
          created_at: string
          id: string
          is_active: boolean
          joined_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_name?: string | null
          competition_code?: string | null
          competition_id: number
          competition_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_name?: string | null
          competition_code?: string | null
          competition_id?: number
          competition_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          is_glowter_wallet: boolean
          updated_at: string
          user_id: string | null
          wallet_name: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          is_glowter_wallet?: boolean
          updated_at?: string
          user_id?: string | null
          wallet_name?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          is_glowter_wallet?: boolean
          updated_at?: string
          user_id?: string | null
          wallet_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_user_profile: {
        Args: { search_term: string }
        Returns: {
          user_id: string
          email: string
          username: string
          full_name: string
        }[]
      }
      get_glowter_wallet_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_or_above: {
        Args: { _user_id: string }
        Returns: boolean
      }
      transfer_chips: {
        Args: {
          from_wallet_id: string
          to_wallet_id: string
          amount: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          description?: string
          reference_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "user"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "bonus"
        | "room_fee"
        | "prize"
        | "refund"
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
      app_role: ["super_admin", "admin", "moderator", "user"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "bonus",
        "room_fee",
        "prize",
        "refund",
      ],
    },
  },
} as const
