-- MYCO2.app Complete Database Schema
-- This creates all tables needed for the full functional app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  
  -- Stats
  total_points INTEGER DEFAULT 0,
  total_co2_saved DECIMAL(10,2) DEFAULT 0.00, -- in kg
  total_activities INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Membership
  membership_type VARCHAR(20) DEFAULT 'free', -- free, green_champion, planet_saver
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT true,
  privacy_level VARCHAR(20) DEFAULT 'public', -- public, friends, private
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Location (for leaderboards)
  country VARCHAR(100),
  city VARCHAR(100)
);

-- Activity types lookup table
CREATE TABLE public.activity_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  points_per_unit INTEGER DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'action', -- action, mile, kg, hour, etc.
  co2_saved_per_unit DECIMAL(8,4) DEFAULT 0.0000, -- kg CO2 per unit
  verification_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default activity types
INSERT INTO public.activity_types (name, description, icon, points_per_unit, unit, co2_saved_per_unit, verification_required) VALUES
('Walking/Biking', 'Car-free transportation', 'bicycle', 1, 'mile', 0.8900, true),
('Public Transit', 'Sustainable commuting', 'bus', 1, 'trip', 2.6000, false),
('Plant-Based Meals', 'Eco-friendly dining', 'leaf', 1, 'meal', 1.8500, true),
('Recycling', 'Waste reduction', 'recycle', 1, 'kg', 0.5000, true),
('Energy Saving', 'Smart energy use', 'zap', 1, 'hour', 0.7500, false);

-- User activities table
CREATE TABLE public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type_id UUID REFERENCES public.activity_types(id),
  
  -- Activity details
  quantity DECIMAL(8,2) DEFAULT 1.00,
  points_earned INTEGER NOT NULL,
  co2_saved DECIMAL(8,4) NOT NULL,
  
  -- Verification
  verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
  photo_url TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_name VARCHAR(255),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.users(id)
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50), -- points, streak, activities, co2, social
  
  -- Requirements
  points_required INTEGER,
  activities_required INTEGER,
  co2_required DECIMAL(10,2),
  streak_required INTEGER,
  
  -- Metadata
  rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, points_required, activities_required, co2_required, streak_required, rarity) VALUES
('First Steps', 'Complete your first eco-activity', 'star', 'activities', 0, 1, 0, 0, 'common'),
('Eco Warrior', 'Earn 100 points', 'shield', 'points', 100, 0, 0, 0, 'common'),
('Carbon Crusher', 'Save 10kg of CO2', 'leaf', 'co2', 0, 0, 10.00, 0, 'rare'),
('Streak Master', 'Maintain a 7-day streak', 'fire', 'streak', 0, 0, 0, 7, 'rare'),
('Green Champion', 'Complete 50 activities', 'trophy', 'activities', 0, 50, 0, 0, 'epic'),
('Planet Saver', 'Save 100kg of CO2', 'globe', 'co2', 0, 0, 100.00, 0, 'legendary');

-- User achievements (many-to-many)
CREATE TABLE public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Crypto rewards tracking
CREATE TABLE public.crypto_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  reward_type VARCHAR(20) NOT NULL, -- weekly, monthly, special
  
  -- Reward details
  amount_usd DECIMAL(12,2) NOT NULL,
  cryptocurrency VARCHAR(10) NOT NULL, -- BTC, ETH, etc.
  
  -- Selection details
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  winner_selected_at TIMESTAMP WITH TIME ZONE,
  winner_user_id UUID REFERENCES public.users(id),
  
  -- Requirements
  min_points_required INTEGER DEFAULT 0,
  min_activities_required INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto reward entries (who's qualified)
CREATE TABLE public.crypto_reward_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reward_id UUID REFERENCES public.crypto_rewards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Qualification details
  points_at_entry INTEGER NOT NULL,
  activities_at_entry INTEGER NOT NULL,
  qualified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(reward_id, user_id)
);

-- Social features - user follows
CREATE TABLE public.user_follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Activity likes/reactions
CREATE TABLE public.activity_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like', -- like, love, wow, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Admin analytics table
CREATE TABLE public.analytics_daily (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  
  -- User metrics
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  
  -- Activity metrics
  total_activities INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_co2_saved DECIMAL(12,4) DEFAULT 0.0000,
  
  -- Engagement metrics
  avg_session_duration INTEGER DEFAULT 0, -- seconds
  retention_rate DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_total_points ON public.users(total_points DESC);
CREATE INDEX idx_users_membership ON public.users(membership_type);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_activities_verification ON public.activities(verification_status);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_crypto_rewards_status ON public.crypto_rewards(status);
CREATE INDEX idx_crypto_reward_entries_reward_id ON public.crypto_reward_entries(reward_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_reward_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_reactions ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Activities: users can read all, but only insert/update their own
CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Users can insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);

-- User achievements: users can read all, but only their own are inserted
CREATE POLICY "Achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Crypto reward entries: users can read all, but only insert their own
CREATE POLICY "Reward entries are viewable by everyone" ON public.crypto_reward_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert own entries" ON public.crypto_reward_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social features policies
CREATE POLICY "Follows are viewable by everyone" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Reactions are viewable by everyone" ON public.activity_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.activity_reactions FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats when activity is added
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users 
    SET 
      total_points = total_points + NEW.points_earned,
      total_co2_saved = total_co2_saved + NEW.co2_saved,
      total_activities = total_activities + 1,
      last_activity_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user stats on new activity
CREATE TRIGGER on_activity_created
  AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  achievement_record RECORD;
BEGIN
  -- Get updated user stats
  SELECT * INTO user_record FROM public.users WHERE id = NEW.user_id;
  
  -- Check each achievement
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE id NOT IN (
      SELECT achievement_id FROM public.user_achievements WHERE user_id = NEW.user_id
    )
  LOOP
    -- Check if user qualifies for this achievement
    IF (achievement_record.points_required IS NULL OR user_record.total_points >= achievement_record.points_required) AND
       (achievement_record.activities_required IS NULL OR user_record.total_activities >= achievement_record.activities_required) AND
       (achievement_record.co2_required IS NULL OR user_record.total_co2_saved >= achievement_record.co2_required) AND
       (achievement_record.streak_required IS NULL OR user_record.current_streak >= achievement_record.streak_required) THEN
      
      -- Unlock the achievement
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (NEW.user_id, achievement_record.id);
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check achievements after activity
CREATE TRIGGER on_activity_check_achievements
  AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.check_achievements();

-- Create storage bucket for activity photos
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-photos', 'activity-photos', true);

-- Storage policy for activity photos
CREATE POLICY "Activity photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'activity-photos');
CREATE POLICY "Users can upload activity photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'activity-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE USING (bucket_id = 'activity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'activity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

