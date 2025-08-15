// MYCO2.app Monthly Reset Service

import { supabase } from './supabase';
import { subscriptionHelpers } from './subscriptionHelpers';

export const monthlyResetService = {
  // Check if user needs monthly reset
  async checkUserReset(userId) {
    try {
      const { needsReset, error } = await subscriptionHelpers.checkMonthlyReset(userId);
      if (error) throw error;
      
      return { needsReset, error: null };
    } catch (error) {
      console.error('Error checking user reset:', error);
      return { needsReset: false, error };
    }
  },

  // Perform monthly reset for a user
  async performUserReset(userId) {
    try {
      const { success, error } = await subscriptionHelpers.performMonthlyReset(userId);
      if (error) throw error;
      
      return { success, error: null };
    } catch (error) {
      console.error('Error performing user reset:', error);
      return { success: false, error };
    }
  },

  // Check and perform reset if needed
  async checkAndResetUser(userId) {
    try {
      const { needsReset, error: checkError } = await this.checkUserReset(userId);
      if (checkError) throw checkError;
      
      if (needsReset) {
        const { success, error: resetError } = await this.performUserReset(userId);
        if (resetError) throw resetError;
        
        return { 
          resetPerformed: success, 
          wasNeeded: true, 
          error: null 
        };
      }
      
      return { 
        resetPerformed: false, 
        wasNeeded: false, 
        error: null 
      };
    } catch (error) {
      console.error('Error in check and reset:', error);
      return { 
        resetPerformed: false, 
        wasNeeded: false, 
        error 
      };
    }
  },

  // Get reset notification message
  getResetNotificationMessage(resetData) {
    if (!resetData || resetData.length === 0) return null;
    
    const latestReset = resetData[0];
    const pointsLost = latestReset.points_before_reset;
    const activitiesCount = latestReset.activities_count;
    const sharingCount = latestReset.sharing_count;
    
    return {
      title: '📅 Monthly Reset Complete!',
      message: `Your points have been reset for the new month!\n\nLast month's stats:\n• ${pointsLost} points earned\n• ${activitiesCount} activities completed\n• ${sharingCount} shares made\n\nTime to start fresh and climb the leaderboards again! 🚀`,
      type: 'info'
    };
  },

  // Check if user should see reset notification
  async shouldShowResetNotification(userId) {
    try {
      const { data: resetHistory, error } = await subscriptionHelpers.getMonthlyResetHistory(userId);
      if (error) throw error;
      
      if (!resetHistory || resetHistory.length === 0) {
        return { shouldShow: false, message: null, error: null };
      }
      
      const latestReset = resetHistory[0];
      const resetDate = new Date(latestReset.reset_date);
      const now = new Date();
      const hoursSinceReset = (now - resetDate) / (1000 * 60 * 60);
      
      // Show notification if reset was within last 24 hours and user hasn't seen it
      const shouldShow = hoursSinceReset <= 24;
      const message = shouldShow ? this.getResetNotificationMessage(resetHistory) : null;
      
      return { shouldShow, message, error: null };
    } catch (error) {
      console.error('Error checking reset notification:', error);
      return { shouldShow: false, message: null, error };
    }
  },

  // Initialize monthly reset checking for app startup
  async initializeResetCheck(userId) {
    try {
      // Check if user needs reset
      const { resetPerformed, wasNeeded, error } = await this.checkAndResetUser(userId);
      if (error) throw error;
      
      // Check if user should see notification
      const { shouldShow, message, error: notifError } = await this.shouldShowResetNotification(userId);
      if (notifError) throw notifError;
      
      return {
        resetPerformed,
        wasNeeded,
        shouldShowNotification: shouldShow,
        notificationMessage: message,
        error: null
      };
    } catch (error) {
      console.error('Error initializing reset check:', error);
      return {
        resetPerformed: false,
        wasNeeded: false,
        shouldShowNotification: false,
        notificationMessage: null,
        error
      };
    }
  },

  // Get days until next reset
  async getDaysUntilReset(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('monthly_reset_date')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      const resetDate = new Date(user.monthly_reset_date);
      const now = new Date();
      const diffTime = resetDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return { 
        days: Math.max(0, diffDays), 
        resetDate: user.monthly_reset_date,
        error: null 
      };
    } catch (error) {
      console.error('Error getting days until reset:', error);
      return { days: 0, resetDate: null, error };
    }
  },

  // Format reset countdown message
  formatResetCountdown(days) {
    if (days === 0) {
      return 'Reset happening soon!';
    } else if (days === 1) {
      return '1 day until reset';
    } else {
      return `${days} days until reset`;
    }
  },

  // Get reset progress percentage (how far through the month)
  getResetProgress() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const totalDays = endOfMonth.getDate();
    const currentDay = now.getDate();
    
    const progress = (currentDay / totalDays) * 100;
    
    return {
      progress: Math.min(100, Math.max(0, progress)),
      currentDay,
      totalDays,
      daysRemaining: totalDays - currentDay
    };
  }
};

export default monthlyResetService;

