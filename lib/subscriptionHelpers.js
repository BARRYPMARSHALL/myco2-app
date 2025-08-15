// MYCO2.app Subscription Management Helpers

import { supabase } from './supabase';

export const subscriptionHelpers = {
  // Get all subscription plans
  async getSubscriptionPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return { data: null, error };
    }
  },

  // Get user's current subscription
  async getUserSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          subscription_plan_id,
          subscription_status,
          subscription_start_date,
          subscription_end_date,
          monthly_reset_date,
          monthly_points,
          lifetime_points,
          sharing_points,
          subscription_plans (
            name,
            price_monthly,
            point_multiplier,
            features
          )
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return { data: null, error };
    }
  },

  // Change user subscription
  async changeSubscription(userId, newPlanName, changeReason = null) {
    try {
      const { data, error } = await supabase.rpc('change_subscription', {
        user_id_param: userId,
        new_plan_name: newPlanName,
        change_reason: changeReason
      });
      
      if (error) throw error;
      return { success: data, error: null };
    } catch (error) {
      console.error('Error changing subscription:', error);
      return { success: false, error };
    }
  },

  // Calculate points for activity with multiplier
  async calculateActivityPoints(userId, basePoints) {
    try {
      const { data, error } = await supabase.rpc('calculate_activity_points', {
        user_id_param: userId,
        base_points: basePoints
      });
      
      if (error) throw error;
      return { points: data, error: null };
    } catch (error) {
      console.error('Error calculating activity points:', error);
      return { points: 0, error };
    }
  },

  // Add sharing points
  async addSharingPoints(userId, platform, contentType = 'general') {
    try {
      const { data, error } = await supabase.rpc('add_sharing_points', {
        user_id_param: userId,
        platform_param: platform,
        content_type_param: contentType
      });
      
      if (error) throw error;
      return { points: data, error: null };
    } catch (error) {
      console.error('Error adding sharing points:', error);
      return { points: 0, error };
    }
  },

  // Get subscription history
  async getSubscriptionHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('subscription_history')
        .select(`
          *,
          old_plan:old_plan_id(name, price_monthly),
          new_plan:new_plan_id(name, price_monthly)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return { data: null, error };
    }
  },

  // Get sharing activities
  async getSharingActivities(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('sharing_activities')
        .select('*')
        .eq('user_id', userId)
        .order('shared_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching sharing activities:', error);
      return { data: null, error };
    }
  },

  // Perform monthly reset
  async performMonthlyReset(userId) {
    try {
      const { error } = await supabase.rpc('perform_monthly_reset', {
        user_id_param: userId
      });
      
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error performing monthly reset:', error);
      return { success: false, error };
    }
  },

  // Get monthly reset history
  async getMonthlyResetHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('monthly_resets')
        .select('*')
        .eq('user_id', userId)
        .order('reset_date', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching reset history:', error);
      return { data: null, error };
    }
  },

  // Check if user needs monthly reset
  async checkMonthlyReset(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('monthly_reset_date')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      const resetDate = new Date(user.monthly_reset_date);
      const now = new Date();
      
      return { needsReset: now >= resetDate, error: null };
    } catch (error) {
      console.error('Error checking monthly reset:', error);
      return { needsReset: false, error };
    }
  },

  // Get prize draw eligibility
  async getPrizeDrawEligibility(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          monthly_points,
          subscription_plans (
            name,
            point_multiplier
          )
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      const weeklyTickets = user.monthly_points;
      const monthlyTickets = user.monthly_points;
      const tier = user.subscription_plans.name;
      
      return { 
        data: {
          weeklyTickets,
          monthlyTickets,
          tier,
          eligible: user.monthly_points > 0
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting prize draw eligibility:', error);
      return { data: null, error };
    }
  },

  // Get subscription tier info
  getSubscriptionTierInfo(planName) {
    const tiers = {
      eco_warrior: {
        name: 'Eco Warrior',
        price: 'FREE',
        color: '#6b7280',
        emoji: '🌱',
        features: [
          'Earn points by sharing the app',
          'Access to community features',
          'Basic environmental impact tracking',
          'Entry to prize draws with sharing points'
        ],
        pointsInfo: 'Points only from sharing'
      },
      green_champion: {
        name: 'Green Champion',
        price: '$9.99/month',
        color: '#059669',
        emoji: '🏆',
        features: [
          'All Eco Warrior features',
          '1 point per eco-activity',
          'Photo verification for activities',
          'Enhanced leaderboard status',
          'Priority customer support'
        ],
        pointsInfo: '1x points from activities + sharing'
      },
      planet_saver: {
        name: 'Planet Saver',
        price: '$19.99/month',
        color: '#8b5cf6',
        emoji: '🌍',
        features: [
          'All Green Champion features',
          '3 points per eco-activity',
          'Exclusive Planet Saver badge',
          'Early access to new features',
          'VIP customer support',
          'Maximum prize draw entries'
        ],
        pointsInfo: '3x points from activities + sharing'
      }
    };
    
    return tiers[planName] || tiers.eco_warrior;
  },

  // Format subscription status
  formatSubscriptionStatus(status) {
    const statuses = {
      active: { text: 'Active', color: '#10b981', emoji: '✅' },
      cancelled: { text: 'Cancelled', color: '#ef4444', emoji: '❌' },
      expired: { text: 'Expired', color: '#f59e0b', emoji: '⏰' },
      pending: { text: 'Pending', color: '#6b7280', emoji: '⏳' }
    };
    
    return statuses[status] || statuses.active;
  },

  // Calculate days until reset
  getDaysUntilReset(resetDate) {
    const reset = new Date(resetDate);
    const now = new Date();
    const diffTime = reset - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  // Get sharing platforms
  getSharingPlatforms() {
    return [
      { id: 'twitter', name: 'Twitter/X', emoji: '🐦', color: '#1da1f2' },
      { id: 'facebook', name: 'Facebook', emoji: '📘', color: '#4267b2' },
      { id: 'instagram', name: 'Instagram', emoji: '📷', color: '#e4405f' },
      { id: 'tiktok', name: 'TikTok', emoji: '🎵', color: '#000000' },
      { id: 'whatsapp', name: 'WhatsApp', emoji: '💬', color: '#25d366' },
      { id: 'linkedin', name: 'LinkedIn', emoji: '💼', color: '#0077b5' }
    ];
  }
};

export default subscriptionHelpers;

