-- MYCO2.app Subscription System Database Schema

-- Subscription Plans Table
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2) NOT NULL,
    point_multiplier INTEGER NOT NULL DEFAULT 1,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert subscription plans
INSERT INTO subscription_plans (name, price_monthly, point_multiplier, features) VALUES
('eco_warrior', 0.00, 0, '{"sharing_points": true, "activities": false, "description": "Free tier - earn points by sharing the app"}'),
('green_champion', 9.99, 1, '{"sharing_points": true, "activities": true, "multiplier": "1x", "description": "1 point per activity + sharing points"}'),
('planet_saver', 19.99, 3, '{"sharing_points": true, "activities": true, "multiplier": "3x", "description": "3 points per activity + sharing points"}');

-- Update users table to include subscription fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan_id INTEGER REFERENCES subscription_plans(id) DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_reset_date TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sharing_points INTEGER DEFAULT 0;

-- Subscription History Table
CREATE TABLE subscription_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    old_plan_id INTEGER REFERENCES subscription_plans(id),
    new_plan_id INTEGER REFERENCES subscription_plans(id),
    change_type VARCHAR(20) NOT NULL, -- 'upgrade', 'downgrade', 'cancel', 'reactivate'
    change_reason TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly Reset History Table
CREATE TABLE monthly_resets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    points_before_reset INTEGER NOT NULL,
    points_after_reset INTEGER DEFAULT 0,
    activities_count INTEGER DEFAULT 0,
    sharing_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update activity_types with new point structure
UPDATE activity_types SET 
    points_per_unit = 1,
    description = CASE 
        WHEN name = 'walking_biking' THEN 'Car-Free Mile (Walking/Biking) - 1 point/mile, 0.4kg CO2/mile'
        WHEN name = 'public_transit' THEN 'Public Transit Trip - 1 point/trip, 1kg CO2/trip'
        WHEN name = 'plant_based_meal' THEN 'Plant-Based Meal - 1 point/meal, 2kg CO2/meal'
        WHEN name = 'recycling' THEN 'Recycling (1kg) - 1 point/kg, 1kg CO2/kg'
        WHEN name = 'energy_saving' THEN 'Energy-Saving Hour - 1 point/hour, 0.5kg CO2/hour'
        ELSE description
    END;

-- Sharing Activities Table
CREATE TABLE sharing_activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'facebook', 'instagram', 'tiktok', 'whatsapp'
    points_earned INTEGER DEFAULT 1,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content_type VARCHAR(50), -- 'achievement', 'activity', 'leaderboard', 'general'
    content_id INTEGER -- reference to specific content shared
);

-- Prize Draw Participants Table
CREATE TABLE prize_draw_participants (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    draw_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly'
    draw_date DATE NOT NULL,
    tickets INTEGER NOT NULL, -- number of tickets (equal to points)
    subscription_tier VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, draw_type, draw_date)
);

-- Prize Draws Table
CREATE TABLE prize_draws (
    id SERIAL PRIMARY KEY,
    draw_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly'
    draw_date DATE NOT NULL,
    total_participants INTEGER NOT NULL,
    total_tickets INTEGER NOT NULL,
    prize_amount_usd DECIMAL(10,2) NOT NULL,
    prize_crypto_type VARCHAR(10), -- 'BTC', 'ETH'
    prize_crypto_amount DECIMAL(18,8),
    winner_user_id UUID REFERENCES users(id),
    winning_ticket INTEGER,
    draw_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charity Donations Table
CREATE TABLE charity_donations (
    id SERIAL PRIMARY KEY,
    donation_date DATE NOT NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    charity_name VARCHAR(100) NOT NULL,
    charity_description TEXT,
    total_revenue DECIMAL(10,2) NOT NULL,
    percentage_donated DECIMAL(5,2) DEFAULT 10.00,
    livestream_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions for subscription management

-- Function to calculate points with multiplier
CREATE OR REPLACE FUNCTION calculate_activity_points(
    user_id_param UUID,
    base_points INTEGER
) RETURNS INTEGER AS $$
DECLARE
    multiplier INTEGER;
    user_plan VARCHAR(50);
BEGIN
    -- Get user's subscription plan
    SELECT sp.name, sp.point_multiplier 
    INTO user_plan, multiplier
    FROM users u
    JOIN subscription_plans sp ON u.subscription_plan_id = sp.id
    WHERE u.id = user_id_param;
    
    -- Eco Warrior (free) gets 0 points from activities
    IF user_plan = 'eco_warrior' THEN
        RETURN 0;
    END IF;
    
    -- Apply multiplier for paid plans
    RETURN base_points * multiplier;
END;
$$ LANGUAGE plpgsql;

-- Function to add sharing points
CREATE OR REPLACE FUNCTION add_sharing_points(
    user_id_param UUID,
    platform_param VARCHAR(50),
    content_type_param VARCHAR(50) DEFAULT 'general'
) RETURNS INTEGER AS $$
DECLARE
    points_to_add INTEGER := 1;
BEGIN
    -- Insert sharing activity
    INSERT INTO sharing_activities (user_id, platform, points_earned, content_type)
    VALUES (user_id_param, platform_param, points_to_add, content_type_param);
    
    -- Update user's sharing points and total points
    UPDATE users 
    SET 
        sharing_points = sharing_points + points_to_add,
        monthly_points = monthly_points + points_to_add,
        total_points = total_points + points_to_add,
        lifetime_points = lifetime_points + points_to_add
    WHERE id = user_id_param;
    
    RETURN points_to_add;
END;
$$ LANGUAGE plpgsql;

-- Function to perform monthly reset
CREATE OR REPLACE FUNCTION perform_monthly_reset(user_id_param UUID) RETURNS VOID AS $$
DECLARE
    current_points INTEGER;
    current_activities INTEGER;
    current_sharing INTEGER;
BEGIN
    -- Get current stats
    SELECT monthly_points, 
           (SELECT COUNT(*) FROM activities WHERE user_id = user_id_param AND created_at >= DATE_TRUNC('month', NOW())),
           sharing_points
    INTO current_points, current_activities, current_sharing
    FROM users WHERE id = user_id_param;
    
    -- Record reset history
    INSERT INTO monthly_resets (user_id, reset_date, points_before_reset, activities_count, sharing_count)
    VALUES (user_id_param, NOW(), current_points, current_activities, current_sharing);
    
    -- Reset monthly points and sharing points
    UPDATE users 
    SET 
        monthly_points = 0,
        sharing_points = 0,
        monthly_reset_date = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to change subscription
CREATE OR REPLACE FUNCTION change_subscription(
    user_id_param UUID,
    new_plan_name VARCHAR(50),
    change_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    old_plan_id INTEGER;
    new_plan_id INTEGER;
    change_type_val VARCHAR(20);
BEGIN
    -- Get current plan
    SELECT subscription_plan_id INTO old_plan_id
    FROM users WHERE id = user_id_param;
    
    -- Get new plan ID
    SELECT id INTO new_plan_id
    FROM subscription_plans WHERE name = new_plan_name AND is_active = true;
    
    IF new_plan_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Determine change type
    IF old_plan_id < new_plan_id THEN
        change_type_val := 'upgrade';
    ELSIF old_plan_id > new_plan_id THEN
        change_type_val := 'downgrade';
    ELSE
        change_type_val := 'no_change';
        RETURN true;
    END IF;
    
    -- Record subscription change
    INSERT INTO subscription_history (user_id, old_plan_id, new_plan_id, change_type, change_reason)
    VALUES (user_id_param, old_plan_id, new_plan_id, change_type_val, change_reason);
    
    -- Update user subscription
    UPDATE users 
    SET 
        subscription_plan_id = new_plan_id,
        subscription_status = 'active',
        subscription_start_date = CASE 
            WHEN subscription_start_date IS NULL THEN NOW()
            ELSE subscription_start_date
        END
    WHERE id = user_id_param;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_users_monthly_reset_date ON users(monthly_reset_date);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_activities_user_id ON sharing_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_prize_draw_participants_draw ON prize_draw_participants(draw_type, draw_date);
CREATE INDEX IF NOT EXISTS idx_monthly_resets_user_date ON monthly_resets(user_id, reset_date);

-- Set default subscription for existing users
UPDATE users 
SET subscription_plan_id = 1, 
    subscription_status = 'active',
    subscription_start_date = NOW(),
    monthly_reset_date = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
WHERE subscription_plan_id IS NULL;

COMMENT ON TABLE subscription_plans IS 'Defines the three subscription tiers: Eco Warrior (free), Green Champion ($9.99), Planet Saver ($19.99)';
COMMENT ON TABLE subscription_history IS 'Tracks all subscription changes for users';
COMMENT ON TABLE monthly_resets IS 'Records monthly point resets for transparency';
COMMENT ON TABLE sharing_activities IS 'Tracks social media sharing for Eco Warrior points';
COMMENT ON TABLE prize_draw_participants IS 'Participants in weekly/monthly prize draws';
COMMENT ON TABLE prize_draws IS 'Historical record of all prize draws';
COMMENT ON TABLE charity_donations IS 'Tracks 10% charity donations from profits';

