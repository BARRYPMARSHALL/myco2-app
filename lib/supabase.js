import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwtzyoppsqnidmcfyvpv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dHp5b3Bwc3FuaWRtY2Z5dnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NzM0NTgsImV4cCI6MjA3MDU0OTQ1OH0.z_E-jwgM-gnuJIkOZbuNa0ZIQkSAq0w14blKkoZbQns';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Users
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
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
      .select();
    return { data, error };
  },

  // Activities
  async createActivity(activityData) {
    const { data, error } = await supabase
      .from('activities')
      .insert([activityData])
      .select();
    return { data, error };
  },

  async getUserActivities(userId, limit = 50) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getAllActivities(limit = 100) {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        users (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Leaderboards
  async getLeaderboard(timeframe = 'all_time', limit = 100) {
    let query = supabase
      .from('users')
      .select('id, username, avatar_url, total_points, total_co2_saved, total_activities')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (timeframe === 'weekly') {
      query = query.gte('last_activity_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    } else if (timeframe === 'monthly') {
      query = query.gte('last_activity_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Achievements
  async getUserAchievements(userId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          id,
          name,
          description,
          icon,
          points_required
        )
      `)
      .eq('user_id', userId);
    return { data, error };
  },

  async unlockAchievement(userId, achievementId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      }])
      .select();
    return { data, error };
  },

  // Photos
  async uploadPhoto(file, path) {
    const { data, error } = await supabase.storage
      .from('activity-photos')
      .upload(path, file);
    return { data, error };
  },

  async getPhotoUrl(path) {
    const { data } = supabase.storage
      .from('activity-photos')
      .getPublicUrl(path);
    return data.publicUrl;
  }
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to leaderboard changes
  subscribeToLeaderboard(callback) {
    return supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to new activities
  subscribeToActivities(callback) {
    return supabase
      .channel('activity-feed')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activities' }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to user achievements
  subscribeToAchievements(userId, callback) {
    return supabase
      .channel(`user-achievements-${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
};

// Enhanced Authentication helpers
export const auth = {
  async signUp(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) throw error;

      // Create user profile in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              username: username,
              email: email,
              total_points: 0
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, error };
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Activity helper functions
export const activityHelpers = {
  // Get all activity types
  async getActivityTypes() {
    try {
      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get activity types error:', error);
      return { data: null, error };
    }
  },

  // Log new activity with automatic points calculation
  async logActivity(userId, activityTypeId, quantity = 1, notes = '', photoUrl = null) {
    try {
      // First get the activity type to calculate points and CO2
      const { data: activityType, error: typeError } = await supabase
        .from('activity_types')
        .select('*')
        .eq('id', activityTypeId)
        .single();

      if (typeError) throw typeError;

      const pointsEarned = Math.round(quantity * activityType.points_per_unit);
      const co2Saved = quantity * activityType.co2_saved_per_unit;

      // Insert the activity
      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            user_id: userId,
            activity_type_id: activityTypeId,
            quantity: quantity,
            points_earned: pointsEarned,
            co2_saved: co2Saved,
            photo_url: photoUrl,
            notes: notes
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update user's total points and stats
      await this.updateUserStats(userId);

      return { data, error: null };
    } catch (error) {
      console.error('Log activity error:', error);
      return { data: null, error };
    }
  },

  // Log activity with photo verification
  async logActivityWithPhoto(activityData) {
    try {
      const { user_id, activity_type_id, photo_uri, location, notes } = activityData;

      // Get activity type details
      const { data: activityType, error: typeError } = await supabase
        .from('activity_types')
        .select('*')
        .eq('id', activity_type_id)
        .single();

      if (typeError) throw typeError;

      // Upload photo to storage
      let photoUrl = null;
      if (photo_uri) {
        const { data: uploadData, error: uploadError } = await this.uploadPhoto(
          photo_uri, 
          user_id, 
          activity_type_id
        );
        
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
        } else {
          photoUrl = uploadData.publicUrl;
        }
      }

      // Calculate points (2x for photo verification)
      const basePoints = activityType.points_per_unit;
      const pointsEarned = Math.round(basePoints * 2); // 2x points for photo verification
      const co2Saved = activityType.co2_saved_per_unit;

      // Create activity record
      const activityRecord = {
        user_id,
        activity_type_id,
        quantity: 1,
        points_earned: pointsEarned,
        co2_saved: co2Saved,
        notes: notes || 'Photo verified activity',
        photo_url: photoUrl,
        verified: true,
        created_at: new Date().toISOString()
      };

      // Add location if available
      if (location) {
        activityRecord.location_lat = location.latitude;
        activityRecord.location_lng = location.longitude;
        activityRecord.location_accuracy = location.accuracy;
      }

      const { data, error } = await supabase
        .from('activities')
        .insert(activityRecord)
        .select()
        .single();

      if (error) throw error;

      // Update user stats
      await this.updateUserStats(user_id);

      return { 
        data: { 
          ...data, 
          points_earned: pointsEarned, 
          co2_saved: co2Saved.toFixed(4)
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Log activity with photo error:', error);
      return { data: null, error };
    }
  },

  // Upload photo to Supabase storage
  async uploadPhoto(photoUri, userId, activityTypeId) {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${userId}/${activityTypeId}/${timestamp}.jpg`;

      // Convert URI to blob for upload
      const response = await fetch(photoUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('activity-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('activity-photos')
        .getPublicUrl(filename);

      return { 
        data: { 
          path: data.path, 
          publicUrl: urlData.publicUrl 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Upload photo error:', error);
      return { data: null, error };
    }
  },

  // Get user statistics
  async getUserStats(userId) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('points_earned, co2_saved')
        .eq('user_id', userId);

      if (error) throw error;

      const totalActivities = data.length;
      const totalPoints = data.reduce((sum, activity) => sum + activity.points_earned, 0);
      const totalCO2Saved = data.reduce((sum, activity) => sum + parseFloat(activity.co2_saved), 0);

      return {
        data: {
          totalActivities,
          totalPoints,
          totalCO2Saved: totalCO2Saved.toFixed(2)
        },
        error: null
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return { data: null, error };
    }
  },

  // Update user stats in users table
  async updateUserStats(userId) {
    try {
      const { data: stats } = await this.getUserStats(userId);
      if (!stats) return { error: 'Could not get user stats' };

      const { error } = await supabase
        .from('users')
        .update({
          total_points: stats.totalPoints,
          total_co2_saved: parseFloat(stats.totalCO2Saved),
          total_activities: stats.totalActivities,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return { error };
    } catch (error) {
      console.error('Update user stats error:', error);
      return { error };
    }
  },

  // Get leaderboard data
  async getLeaderboard(metric = 'points', period = 'all_time', limit = 50) {
    try {
      let query = supabase
        .from('users')
        .select('id, username, total_points, total_co2_saved, total_activities, user_id:id')
        .order(`total_${metric}`, { ascending: false })
        .limit(limit);

      // Add time filtering for periods other than all_time
      if (period !== 'all_time') {
        const now = new Date();
        let startDate;

        switch (period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            const dayOfWeek = now.getDay();
            startDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }

        if (startDate) {
          query = query.gte('updated_at', startDate.toISOString());
        }
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return { data: null, error };
    }
  },

  // Get global statistics
  async getGlobalStats() {
    try {
      // Get total users count
      const { count: totalUsers, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get aggregated stats
      const { data: stats, error: statsError } = await supabase
        .from('users')
        .select('total_points, total_co2_saved, total_activities');

      if (statsError) throw statsError;

      const totalPoints = stats.reduce((sum, user) => sum + (user.total_points || 0), 0);
      const totalCO2Saved = stats.reduce((sum, user) => sum + (user.total_co2_saved || 0), 0);
      const totalActivities = stats.reduce((sum, user) => sum + (user.total_activities || 0), 0);

      return {
        data: {
          total_users: totalUsers || 0,
          total_points: totalPoints,
          total_co2_saved: totalCO2Saved.toFixed(4),
          total_activities: totalActivities
        },
        error: null
      };
    } catch (error) {
      console.error('Get global stats error:', error);
      return { data: null, error };
    }
  },

  // Get user's activity history with photos
  async getUserActivities(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          activity_types (
            name,
            description,
            icon
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error('Get user activities error:', error);
      return { data: null, error };
    }
  }
};

// Achievement helper functions
export const achievementHelpers = {
  // Get all achievements
  async getAchievements() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get achievements error:', error);
      return { data: null, error };
    }
  },

  // Check and unlock achievements automatically
  async checkAchievements(userId) {
    try {
      // Get user stats
      const { data: stats } = await activityHelpers.getUserStats(userId);
      if (!stats) return { data: null, error: 'Could not get user stats' };

      // Get all achievements
      const { data: achievements } = await this.getAchievements();
      if (!achievements) return { data: null, error: 'Could not get achievements' };

      // Get already unlocked achievements
      const { data: userAchievements } = await db.getUserAchievements(userId);
      const unlockedIds = userAchievements ? userAchievements.map(ua => ua.achievement_id) : [];

      const newlyUnlocked = [];

      for (const achievement of achievements) {
        // Skip if already unlocked
        if (unlockedIds.includes(achievement.id)) continue;

        let shouldUnlock = false;

        // Check achievement criteria
        if (achievement.points_required && stats.totalPoints >= achievement.points_required) {
          shouldUnlock = true;
        }
        if (achievement.activities_required && stats.totalActivities >= achievement.activities_required) {
          shouldUnlock = true;
        }
        if (achievement.co2_required && parseFloat(stats.totalCO2Saved) >= achievement.co2_required) {
          shouldUnlock = true;
        }
        if (achievement.name === 'First Steps' && stats.totalActivities >= 1) {
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          // Unlock the achievement
          const { error: unlockError } = await db.unlockAchievement(userId, achievement.id);

          if (!unlockError) {
            newlyUnlocked.push(achievement);
          }
        }
      }

      return { data: newlyUnlocked, error: null };
    } catch (error) {
      console.error('Check achievements error:', error);
      return { data: null, error };
    }
  }
};

