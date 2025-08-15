import { supabase } from './supabase';

export const db = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    return { data, error };
  },

  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Activity operations
  async getActivityTypes() {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .order('name');
    return { data, error };
  },

  async createActivity(activityData) {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select(`
        *,
        activity_types (*)
      `)
      .single();
    return { data, error };
  },

  async getUserActivities(userId, limit = 50) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        activity_types (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getRecentActivities(limit = 20) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        users (username),
        activity_types (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Achievement operations
  async getAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('points_required');
    return { data, error };
  },

  async getUserAchievements(userId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    return { data, error };
  },

  async unlockAchievement(userId, achievementId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId
      }])
      .select(`
        *,
        achievements (*)
      `)
      .single();
    return { data, error };
  },

  // Leaderboard operations
  async getLeaderboard(limit = 100) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, total_points, total_co2_saved, total_activities')
      .order('total_points', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getUserRank(userId) {
    // Get user's rank based on total points
    const { data, error } = await supabase
      .rpc('get_user_rank', { user_id: userId });
    return { data, error };
  },

  // Statistics operations
  async getGlobalStats() {
    const { data, error } = await supabase
      .rpc('get_global_stats');
    return { data, error };
  },

  async getUserStats(userId) {
    const { data, error } = await supabase
      .rpc('get_user_stats', { user_id: userId });
    return { data, error };
  },

  // Real-time subscriptions
  subscribeToUserActivities(userId, callback) {
    return supabase
      .channel('user_activities')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  subscribeToLeaderboard(callback) {
    return supabase
      .channel('leaderboard')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users'
      }, callback)
      .subscribe();
  },

  // Helper functions
  async checkAndUnlockAchievements(userId) {
    try {
      // Get user stats
      const { data: user } = await this.getUser(userId);
      if (!user) return;

      // Get all achievements
      const { data: achievements } = await this.getAchievements();
      if (!achievements) return;

      // Get user's current achievements
      const { data: userAchievements } = await this.getUserAchievements(userId);
      const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

      // Check each achievement
      for (const achievement of achievements) {
        if (unlockedIds.includes(achievement.id)) continue;

        let shouldUnlock = false;

        // Check points requirement
        if (achievement.points_required && user.total_points >= achievement.points_required) {
          shouldUnlock = true;
        }

        // Check activities requirement
        if (achievement.activities_required && user.total_activities >= achievement.activities_required) {
          shouldUnlock = true;
        }

        // Check CO2 requirement
        if (achievement.co2_required && user.total_co2_saved >= achievement.co2_required) {
          shouldUnlock = true;
        }

        // Special case for "First Steps" achievement
        if (achievement.name === 'First Steps' && user.total_activities >= 1) {
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          await this.unlockAchievement(userId, achievement.id);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  },

  async updateUserStats(userId) {
    try {
      // Calculate user stats from activities
      const { data: activities } = await this.getUserActivities(userId, 1000);
      if (!activities) return;

      const totalPoints = activities.reduce((sum, activity) => sum + activity.points_earned, 0);
      const totalCO2Saved = activities.reduce((sum, activity) => sum + parseFloat(activity.co2_saved), 0);
      const totalActivities = activities.length;

      // Calculate current streak (simplified - just count recent days)
      const today = new Date();
      let currentStreak = 0;
      const activityDates = activities.map(a => new Date(a.created_at).toDateString());
      const uniqueDates = [...new Set(activityDates)].sort((a, b) => new Date(b) - new Date(a));

      for (let i = 0; i < uniqueDates.length; i++) {
        const date = new Date(uniqueDates[i]);
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Update user stats
      await this.updateUser(userId, {
        total_points: totalPoints,
        total_co2_saved: totalCO2Saved,
        total_activities: totalActivities,
        current_streak: currentStreak
      });

      // Check for new achievements
      await this.checkAndUnlockAchievements(userId);

    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }
};

export default db;

