// Supabase Client Configuration

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helpers
export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    });
    return { data, error };
  },

  // Sign in existing user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers
export const db = {
  // User Profile Operations
  profiles: {
    get: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    create: async (profile: import('@/types/database').Database['public']['Tables']['profiles']['Insert']) => {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile] as any)
        .select()
        .single();
      return { data, error };
    },

    update: async (userId: string, updates: import('@/types/database').Database['public']['Tables']['profiles']['Update']) => {
      // @ts-ignore
      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },

    updateCoins: async (userId: string, amount: number) => {
      const { data, error } = await supabase.rpc('update_user_coins', {
        user_id: userId,
        coin_change: amount,
      } as any);
      return { data, error };
    },
  },

  // Game Sessions
  sessions: {
    create: async (session: any) => {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert(session)
        .select()
        .single();
      return { data, error };
    },

    update: async (sessionId: string, updates: any) => {
      const { data, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      return { data, error };
    },

    getHistory: async (userId: string, limit = 50) => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    },
  },

  // Achievements
  achievements: {
    getUserAchievements: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', userId);
      return { data, error };
    },

    unlock: async (userId: string, achievementId: string) => {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([{ user_id: userId, achievement_id: achievementId, unlocked_at: new Date().toISOString() }] as any)
        .select()
        .single();
      return { data, error };
    },
  },

  // Leaderboards
  leaderboards: {
    getTopPlayers: async (metric: string, limit = 100) => {
      let query = supabase
        .from('profiles')
        .select('id, username, avatar_url, level, coins, total_wins, biggest_win')
        .order(metric, { ascending: false })
        .limit(limit);

      const { data, error } = await query;
      return { data, error };
    },

    getPlayerRank: async (userId: string, metric: string) => {
      const { data, error } = await supabase.rpc('get_player_rank', {
        player_id: userId,
        rank_metric: metric,
      } as any);
      return { data, error };
    },
  },
};

export default supabase;
