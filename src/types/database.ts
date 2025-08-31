// Supabase Database Type Definitions

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          coins: number;
          level: number;
          experience: number;
          total_spins: number;
          total_wins: number;
          total_losses: number;
          biggest_win: number;
          win_rate: number;
          lifetime_wagered: number;
          lifetime_won: number;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_active: boolean;
          
          // Responsible Gaming
          daily_limit: number;
          session_limit: number;
          loss_limit: number;
          reality_check_interval: number;
          self_exclusion_until: string | null;
          responsible_gaming_active: boolean;
          
          // Preferences
          sound_enabled: boolean;
          animations_enabled: boolean;
          theme: 'dark' | 'light' | 'neon';
          language: string;
          auto_play: boolean;
          quick_spin: boolean;
          show_tutorials: boolean;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          coins?: number;
          level?: number;
          experience?: number;
          total_spins?: number;
          total_wins?: number;
          total_losses?: number;
          biggest_win?: number;
          win_rate?: number;
          lifetime_wagered?: number;
          lifetime_won?: number;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
          daily_limit?: number;
          session_limit?: number;
          loss_limit?: number;
          reality_check_interval?: number;
          self_exclusion_until?: string | null;
          responsible_gaming_active?: boolean;
          sound_enabled?: boolean;
          animations_enabled?: boolean;
          theme?: 'dark' | 'light' | 'neon';
          language?: string;
          auto_play?: boolean;
          quick_spin?: boolean;
          show_tutorials?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          coins?: number;
          level?: number;
          experience?: number;
          total_spins?: number;
          total_wins?: number;
          total_losses?: number;
          biggest_win?: number;
          win_rate?: number;
          lifetime_wagered?: number;
          lifetime_won?: number;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
          daily_limit?: number;
          session_limit?: number;
          loss_limit?: number;
          reality_check_interval?: number;
          self_exclusion_until?: string | null;
          responsible_gaming_active?: boolean;
          sound_enabled?: boolean;
          animations_enabled?: boolean;
          theme?: 'dark' | 'light' | 'neon';
          language?: string;
          auto_play?: boolean;
          quick_spin?: boolean;
          show_tutorials?: boolean;
        };
      };
      
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          game_type: string;
          start_time: string;
          end_time: string | null;
          initial_coins: number;
          final_coins: number;
          total_spins: number;
          total_wins: number;
          biggest_win: number;
          session_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          game_type: string;
          start_time?: string;
          end_time?: string | null;
          initial_coins: number;
          final_coins?: number;
          total_spins?: number;
          total_wins?: number;
          biggest_win?: number;
          session_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          game_type?: string;
          start_time?: string;
          end_time?: string | null;
          initial_coins?: number;
          final_coins?: number;
          total_spins?: number;
          total_wins?: number;
          biggest_win?: number;
          session_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };

      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          reward_coins: number;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          reward_coins?: number;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          condition_type?: string;
          condition_value?: number;
          reward_coins?: number;
          category?: string;
          created_at?: string;
        };
      };

      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
          created_at?: string;
        };
      };

      tournaments: {
        Row: {
          id: string;
          name: string;
          description: string;
          game_type: string;
          start_time: string;
          end_time: string;
          entry_fee: number;
          prize_pool: number;
          max_participants: number;
          status: 'upcoming' | 'active' | 'completed';
          rules: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          game_type: string;
          start_time: string;
          end_time: string;
          entry_fee?: number;
          prize_pool?: number;
          max_participants?: number;
          status?: 'upcoming' | 'active' | 'completed';
          rules?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          game_type?: string;
          start_time?: string;
          end_time?: string;
          entry_fee?: number;
          prize_pool?: number;
          max_participants?: number;
          status?: 'upcoming' | 'active' | 'completed';
          rules?: any;
          created_at?: string;
        };
      };
    };
    
    Functions: {
      update_user_coins: {
        Args: {
          user_id: string;
          coin_change: number;
        };
        Returns: number;
      };
      get_player_rank: {
        Args: {
          player_id: string;
          rank_metric: string;
        };
        Returns: number;
      };
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type GameSession = Database['public']['Tables']['game_sessions']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
export type Tournament = Database['public']['Tables']['tournaments']['Row'];
