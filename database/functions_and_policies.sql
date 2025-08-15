-- MYCO2.app Functions and Security Policies
-- Run this AFTER tables and data are created

-- Create indexes for performance
CREATE INDEX idx_users_total_points ON public.users(total_points DESC);
CREATE INDEX idx_users_membership ON public.users(membership_type);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_activities_verification ON public.activities(verification_status);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_crypto_rewards_status ON public.crypto_rewards(status);
CREATE INDEX idx_crypto_reward_entries_reward_id ON public.crypto_reward_entries(reward_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_reward_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for activities table
CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Users can insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user achievements
CREATE POLICY "Achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crypto reward entries
CREATE POLICY "Reward entries are viewable by everyone" ON public.crypto_reward_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert own entries" ON public.crypto_reward_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for social features
CREATE POLICY "Follows are viewable by everyone" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.user_follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Reactions are viewable by everyone" ON public.activity_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.activity_reactions FOR ALL USING (auth.uid() = user_id);

-- Function for automatic user profile creation
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

