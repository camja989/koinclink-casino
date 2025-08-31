// Authentication Hook

'use client';

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth, db } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { useGameStore } from '@/store/gameStore';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  });

  const { initializePlayer } = useGameStore();

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await auth.getCurrentUser();
        
        if (mounted) {
          if (user) {
            await handleUserSession(user);
          } else {
            setAuthState(prev => ({
              ...prev,
              loading: false,
              initialized: true,
            }));
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
          }));
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        await handleUserSession(session.user, session);
      } else {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }
    });

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (user: User, session?: Session) => {
    try {
      // Get or create user profile
      let { data: profile, error } = await db.profiles.get(user.id);

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: user.id,
          email: user.email!,
          username: user.user_metadata?.username || user.email!.split('@')[0],
          display_name: user.user_metadata?.display_name || user.user_metadata?.username,
          coins: 1000, // Starting coins
          level: 1,
          experience: 0,
          total_spins: 0,
          total_wins: 0,
          total_losses: 0,
          biggest_win: 0,
          win_rate: 0,
          lifetime_wagered: 0,
          lifetime_won: 0,
          is_active: true,
          daily_limit: 500,
          session_limit: 200,
          loss_limit: 100,
          reality_check_interval: 30,
          responsible_gaming_active: true,
          sound_enabled: true,
          animations_enabled: true,
          theme: 'neon' as const,
          language: 'en',
          auto_play: false,
          quick_spin: false,
          show_tutorials: true,
          last_login: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await db.profiles.create(newProfile);
        
        if (createError) {
          console.error('Error creating profile:', createError);
          toast.error('Failed to create user profile');
          return;
        }
        
        profile = createdProfile;
      } else if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load user profile');
        return;
      }

      // Update last login
      if (profile) {
        await db.profiles.update(user.id, {
          last_login: new Date().toISOString(),
        });
      }

      setAuthState({
        user,
        profile,
        session: session || null,
        loading: false,
        initialized: true,
      });

      // Initialize game store with user data
      if (profile) {
        const dbProfile = profile as import('@/types/database').Database['public']['Tables']['profiles']['Row'];
        if (typeof dbProfile.username === 'string') {
          initializePlayer(dbProfile.username);
        }
      }

    } catch (error) {
      console.error('Error handling user session:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
      }));
      toast.error('Error loading user data');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed out successfully');
      }
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user || !authState.profile) return;

    try {
      const { data, error } = await db.profiles.update(authState.user.id, updates);
      
      if (error) {
        toast.error('Failed to update profile');
        return false;
      }

      setAuthState(prev => ({
        ...prev,
        profile: data,
      }));

      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      toast.error('Error updating profile');
      return false;
    }
  };

  const isAuthenticated = !!authState.user && !!authState.profile;
  const isGuest = !authState.user;

  return {
    ...authState,
    isAuthenticated,
    isGuest,
    signOut,
    updateProfile,
  };
}
