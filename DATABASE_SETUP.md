# 🗄️ KoinClink Database Setup Guide

## 🚀 Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization/project
4. Choose region closest to users
5. Generate secure database password

### 2. Get Project Credentials
1. Go to Settings → API
2. Copy **Project URL** and **anon/public key**
3. Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Schema Setup

Run these SQL commands in Supabase SQL Editor:

#### Enable Row Level Security
```sql
-- Enable RLS on all tables
ALTER DATABASE postgres SET row_security = on;
```

#### Create Tables

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Game Statistics
  coins BIGINT DEFAULT 1000 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  experience BIGINT DEFAULT 0 NOT NULL,
  total_spins BIGINT DEFAULT 0 NOT NULL,
  total_wins BIGINT DEFAULT 0 NOT NULL,
  total_losses BIGINT DEFAULT 0 NOT NULL,
  biggest_win BIGINT DEFAULT 0 NOT NULL,
  win_rate DECIMAL(5,4) DEFAULT 0 NOT NULL,
  lifetime_wagered BIGINT DEFAULT 0 NOT NULL,
  lifetime_won BIGINT DEFAULT 0 NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Responsible Gaming
  daily_limit INTEGER DEFAULT 500 NOT NULL,
  session_limit INTEGER DEFAULT 200 NOT NULL,
  loss_limit INTEGER DEFAULT 100 NOT NULL,
  reality_check_interval INTEGER DEFAULT 30 NOT NULL,
  self_exclusion_until TIMESTAMPTZ,
  responsible_gaming_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Preferences
  sound_enabled BOOLEAN DEFAULT true NOT NULL,
  animations_enabled BOOLEAN DEFAULT true NOT NULL,
  theme TEXT DEFAULT 'neon' CHECK (theme IN ('dark', 'light', 'neon')) NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  auto_play BOOLEAN DEFAULT false NOT NULL,
  quick_spin BOOLEAN DEFAULT false NOT NULL,
  show_tutorials BOOLEAN DEFAULT true NOT NULL
);

-- Game Sessions table
CREATE TABLE public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  
  -- Session Details
  start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_time TIMESTAMPTZ,
  initial_coins BIGINT NOT NULL,
  final_coins BIGINT DEFAULT 0 NOT NULL,
  total_spins INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  biggest_win BIGINT DEFAULT 0 NOT NULL,
  
  -- Game Data (JSON)
  session_data JSONB DEFAULT '{}' NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL, -- 'spins', 'wins', 'coins_won', etc.
  condition_value INTEGER NOT NULL,
  reward_coins INTEGER DEFAULT 0 NOT NULL,
  category TEXT NOT NULL, -- 'wins', 'spins', 'games', 'special'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Achievements (unlocked achievements)
CREATE TABLE public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, achievement_id)
);

-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  game_type TEXT NOT NULL,
  
  -- Tournament Details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  entry_fee INTEGER DEFAULT 0 NOT NULL,
  prize_pool INTEGER DEFAULT 0 NOT NULL,
  max_participants INTEGER DEFAULT 100 NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')) NOT NULL,
  
  -- Rules (JSON)
  rules JSONB DEFAULT '{}' NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### Row Level Security Policies

```sql
-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Game Sessions RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions" ON public.game_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements are public read
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements" ON public.achievements
  FOR SELECT TO public USING (true);

-- User Achievements RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tournaments are public read
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournaments" ON public.tournaments
  FOR SELECT TO public USING (true);
```

#### Database Functions

```sql
-- Function to update user coins safely
CREATE OR REPLACE FUNCTION update_user_coins(user_id UUID, coin_change BIGINT)
RETURNS BIGINT AS $$
DECLARE
  new_coin_total BIGINT;
BEGIN
  UPDATE public.profiles 
  SET 
    coins = GREATEST(0, coins + coin_change),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING coins INTO new_coin_total;
  
  RETURN new_coin_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get player rank
CREATE OR REPLACE FUNCTION get_player_rank(player_id UUID, rank_metric TEXT)
RETURNS INTEGER AS $$
DECLARE
  player_rank INTEGER;
BEGIN
  EXECUTE format('
    SELECT rank() OVER (ORDER BY %I DESC) 
    FROM (
      SELECT %I, id
      FROM public.profiles 
      WHERE is_active = true
    ) ranked
    WHERE id = $1
  ', rank_metric, rank_metric)
  USING player_id
  INTO player_rank;
  
  RETURN COALESCE(player_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Triggers for Updated Timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Sample Achievements Data

```sql
-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, reward_coins, category) VALUES
('First Spin', 'Complete your first spin', '🎰', 'spins', 1, 50, 'spins'),
('Spin Master', 'Complete 100 spins', '💫', 'spins', 100, 500, 'spins'),
('Lucky Winner', 'Win your first game', '🍀', 'wins', 1, 100, 'wins'),
('High Roller', 'Win 1000 coins in a single spin', '💰', 'single_win', 1000, 1000, 'wins'),
('Dedicated Player', 'Play for 7 consecutive days', '🏆', 'daily_streak', 7, 2000, 'special'),
('Coin Collector', 'Accumulate 10,000 coins', '��', 'total_coins', 10000, 5000, 'special');
```

## 🔒 Security Features

✅ **Row Level Security** - Users can only access their own data
✅ **Input Validation** - Database constraints prevent invalid data
✅ **Secure Functions** - SECURITY DEFINER functions for safe operations
✅ **API Rate Limiting** - Supabase provides built-in rate limiting
✅ **SSL Encryption** - All connections encrypted in transit

## 📊 Performance Optimizations

```sql
-- Add database indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_coins ON public.profiles(coins DESC);
CREATE INDEX idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
```

## 🚀 Deployment Ready

Your KoinClink database is now ready for production! The schema supports:

- 🔐 **User Authentication** with Supabase Auth
- 🎮 **Game Sessions** with detailed tracking
- 🏆 **Achievement System** with unlockable rewards
- 📊 **Leaderboards** with real-time rankings
- 🛡️ **Responsible Gaming** with built-in limits
- 🎯 **Tournament Support** for competitive play

Next step: Update your `.env.local` file and deploy to Netlify!
