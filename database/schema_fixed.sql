-- MYCO2.app Database Schema - Fixed Version
-- Run this in Supabase SQL Editor

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
  total_co2_saved DECIMAL(10,2) DEFAULT 0.00,
  total_activities INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Membership
  membership_type VARCHAR(20) DEFAULT 'free',
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT true,
  privacy_level VARCHAR(20) DEFAULT 'public',
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Location
  country VARCHAR(100),
  city VARCHAR(100)
);

-- Activity types lookup table
CREATE TABLE public.activity_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  points_per_unit INTEGER DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'action',
  co2_saved_per_unit DECIMAL(8,4) DEFAULT 0.0000,
  verification_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activities table
CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type_id UUID REFERENCES public.activity_types(id),
  
  -- Activity details
  quantity DECIMAL(8,2) DEFAULT 1.00,
  points_earned INTEGER NOT NULL,
  co2_saved DECIMAL(8,4) NOT NULL,
  
  -- Verification
  verification_status VARCHAR(20) DEFAULT 'pending',
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
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50),
  
  -- Requirements
  points_required INTEGER,
  activities_required INTEGER,
  co2_required DECIMAL(10,2),
  streak_required INTEGER,
  
  -- Metadata
  rarity VARCHAR(20) DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (many-to-many)
CREATE TABLE public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Crypto rewards tracking
CREATE TABLE public.crypto_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  reward_type VARCHAR(20) NOT NULL,
  
  -- Reward details
  amount_usd DECIMAL(12,2) NOT NULL,
  cryptocurrency VARCHAR(10) NOT NULL,
  
  -- Selection details
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  winner_selected_at TIMESTAMP WITH TIME ZONE,
  winner_user_id UUID REFERENCES public.users(id),
  
  -- Requirements
  min_points_required INTEGER DEFAULT 0,
  min_activities_required INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto reward entries
CREATE TABLE public.crypto_reward_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Activity reactions
CREATE TABLE public.activity_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Analytics table
CREATE TABLE public.analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  avg_session_duration INTEGER DEFAULT 0,
  retention_rate DECIMAL(5,2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

