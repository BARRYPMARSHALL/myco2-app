-- MYCO2.app Data Inserts
-- Run this AFTER the schema is created

-- Insert default activity types
INSERT INTO public.activity_types (name, description, icon, points_per_unit, unit, co2_saved_per_unit, verification_required) VALUES
('Walking/Biking', 'Car-free transportation', 'bicycle', 1, 'mile', 0.8900, true),
('Public Transit', 'Sustainable commuting', 'bus', 1, 'trip', 2.6000, false),
('Plant-Based Meals', 'Eco-friendly dining', 'leaf', 1, 'meal', 1.8500, true),
('Recycling', 'Waste reduction', 'recycle', 1, 'kg', 0.5000, true),
('Energy Saving', 'Smart energy use', 'zap', 1, 'hour', 0.7500, false);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, points_required, activities_required, co2_required, streak_required, rarity) VALUES
('First Steps', 'Complete your first eco-activity', 'star', 'activities', 0, 1, 0, 0, 'common'),
('Eco Warrior', 'Earn 100 points', 'shield', 'points', 100, 0, 0, 0, 'common'),
('Carbon Crusher', 'Save 10kg of CO2', 'leaf', 'co2', 0, 0, 10.00, 0, 'rare'),
('Streak Master', 'Maintain a 7-day streak', 'fire', 'streak', 0, 0, 0, 7, 'rare'),
('Green Champion', 'Complete 50 activities', 'trophy', 'activities', 0, 50, 0, 0, 'epic'),
('Planet Saver', 'Save 100kg of CO2', 'globe', 'co2', 0, 0, 100.00, 0, 'legendary');

-- Insert sample crypto rewards
INSERT INTO public.crypto_rewards (name, description, reward_type, amount_usd, cryptocurrency, starts_at, ends_at, min_points_required, min_activities_required) VALUES
('Weekly Bitcoin Rewards Selection', 'Skill-based eco-challenge rewards selection', 'weekly', 1000.00, 'BTC', NOW(), NOW() + INTERVAL '7 days', 10, 3),
('Monthly Ethereum Rewards Selection', 'Greenest Skills Champion selection', 'monthly', 5000.00, 'ETH', NOW(), NOW() + INTERVAL '30 days', 50, 15),
('Mega Crypto Rewards Selection', 'Ultimate eco-skills championship', 'special', 100000.00, 'MIXED', NOW(), NOW() + INTERVAL '90 days', 500, 100);

