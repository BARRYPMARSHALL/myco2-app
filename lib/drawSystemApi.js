/**
 * MYCO2.app Draw System API Client
 * 
 * Connects the mobile app to the prize draw backend system
 */

const DRAW_API_BASE_URL = 'https://5000-i89fcls2gtys5s33z6hjg-d0751742.manusvm.computer';

class DrawSystemAPI {
  constructor() {
    this.baseURL = DRAW_API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Draw API request failed:', error);
      throw error;
    }
  }

  // Get current active and upcoming draws
  async getCurrentDraws() {
    return this.makeRequest('/api/draws/current');
  }

  // Get entries for a specific draw
  async getDrawEntries(drawId) {
    return this.makeRequest(`/api/draws/${drawId}/entries`);
  }

  // Create a new draw (admin function)
  async createDraw(drawData) {
    return this.makeRequest('/api/draws/create', {
      method: 'POST',
      body: JSON.stringify(drawData),
    });
  }

  // Execute a draw (admin function)
  async executeDraw(drawId) {
    return this.makeRequest(`/api/draws/${drawId}/execute`, {
      method: 'POST',
    });
  }

  // Verify a completed draw
  async verifyDraw(drawId) {
    return this.makeRequest(`/api/draws/${drawId}/verify`);
  }

  // Schedule weekly Bitcoin draws
  async scheduleWeeklyDraws(weeksAhead = 4) {
    return this.makeRequest('/api/draws/schedule-weekly', {
      method: 'POST',
      body: JSON.stringify({ weeks_ahead: weeksAhead }),
    });
  }

  // Schedule monthly Ethereum draws
  async scheduleMonthlyDraws(monthsAhead = 3) {
    return this.makeRequest('/api/draws/schedule-monthly', {
      method: 'POST',
      body: JSON.stringify({ months_ahead: monthsAhead }),
    });
  }

  // Get public audit trail
  async getPublicAuditTrail() {
    return this.makeRequest('/api/draws/public-audit');
  }

  // Get recent winners
  async getRecentWinners() {
    return this.makeRequest('/api/draws/winners');
  }

  // Get draw statistics
  async getDrawStatistics() {
    return this.makeRequest('/api/draws/stats');
  }

  // Submit user entries for current draws (called when user earns points)
  async submitUserEntries(userId, username, subscriptionTier, pointsEarned, activityType, photoVerified = false) {
    try {
      // Get current active draws
      const currentDraws = await this.getCurrentDraws();
      
      if (!currentDraws.success || !currentDraws.upcoming_draws.length) {
        console.log('No active draws to enter');
        return { success: true, message: 'No active draws available' };
      }

      const results = [];

      // Submit entries for each upcoming draw
      for (const draw of currentDraws.upcoming_draws) {
        // Each point = 1 entry
        const entryData = {
          draw_id: draw.id,
          user_id: userId,
          username: username,
          points_earned: pointsEarned,
          activity_type: activityType,
          subscription_tier: subscriptionTier,
          photo_verified: photoVerified,
        };

        // For now, we'll store this locally and sync later
        // In production, you'd want to send this to your Supabase database
        // which would then sync with the draw system
        results.push({
          draw_id: draw.id,
          entries_added: pointsEarned,
          draw_type: draw.draw_type,
        });
      }

      return {
        success: true,
        entries_submitted: results,
        total_entries: pointsEarned,
      };
    } catch (error) {
      console.error('Failed to submit user entries:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user's entry count for current draws
  async getUserEntryCount(userId) {
    try {
      const currentDraws = await this.getCurrentDraws();
      
      if (!currentDraws.success) {
        return { success: false, error: 'Failed to get current draws' };
      }

      const userEntries = {};

      // For each draw, get user's entries
      for (const draw of [...(currentDraws.active_draws || []), ...(currentDraws.upcoming_draws || [])]) {
        try {
          const entries = await this.getDrawEntries(draw.id);
          
          if (entries.success) {
            const userEntry = entries.user_entries.find(entry => entry.user_id === userId);
            userEntries[draw.draw_type] = {
              draw_id: draw.id,
              entry_count: userEntry ? userEntry.entry_count : 0,
              total_points: userEntry ? userEntry.total_points : 0,
              draw_date: draw.draw_date,
              prize_amount_usd: draw.prize_amount_usd,
              crypto_symbol: draw.crypto_symbol,
            };
          }
        } catch (error) {
          console.error(`Failed to get entries for draw ${draw.id}:`, error);
        }
      }

      return {
        success: true,
        user_entries: userEntries,
      };
    } catch (error) {
      console.error('Failed to get user entry count:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Initialize draws for the app (create weekly and monthly draws)
  async initializeDraws() {
    try {
      console.log('Initializing draw system...');
      
      // Schedule weekly Bitcoin draws
      const weeklyResult = await this.scheduleWeeklyDraws(4);
      console.log('Weekly draws scheduled:', weeklyResult);

      // Schedule monthly Ethereum draws
      const monthlyResult = await this.scheduleMonthlyDraws(3);
      console.log('Monthly draws scheduled:', monthlyResult);

      return {
        success: true,
        weekly_draws: weeklyResult.draws_created || 0,
        monthly_draws: monthlyResult.draws_created || 0,
      };
    } catch (error) {
      console.error('Failed to initialize draws:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get next draw countdown information
  async getNextDrawCountdown() {
    try {
      const currentDraws = await this.getCurrentDraws();
      
      if (!currentDraws.success || !currentDraws.upcoming_draws.length) {
        return {
          success: false,
          error: 'No upcoming draws found',
        };
      }

      // Find the next weekly and monthly draws
      const weeklyDraw = currentDraws.upcoming_draws.find(draw => draw.draw_type === 'weekly_bitcoin');
      const monthlyDraw = currentDraws.upcoming_draws.find(draw => draw.draw_type === 'monthly_ethereum');

      const now = new Date();

      const result = {};

      if (weeklyDraw) {
        const drawDate = new Date(weeklyDraw.draw_date);
        const timeUntilDraw = drawDate.getTime() - now.getTime();
        
        result.weekly = {
          draw_id: weeklyDraw.id,
          draw_date: weeklyDraw.draw_date,
          time_until_draw_ms: timeUntilDraw,
          prize_amount_usd: weeklyDraw.prize_amount_usd,
          crypto_symbol: weeklyDraw.crypto_symbol,
        };
      }

      if (monthlyDraw) {
        const drawDate = new Date(monthlyDraw.draw_date);
        const timeUntilDraw = drawDate.getTime() - now.getTime();
        
        result.monthly = {
          draw_id: monthlyDraw.id,
          draw_date: monthlyDraw.draw_date,
          time_until_draw_ms: timeUntilDraw,
          prize_amount_usd: monthlyDraw.prize_amount_usd,
          crypto_symbol: monthlyDraw.crypto_symbol,
        };
      }

      return {
        success: true,
        next_draws: result,
      };
    } catch (error) {
      console.error('Failed to get next draw countdown:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const drawSystemAPI = new DrawSystemAPI();

export default drawSystemAPI;

// Helper functions for easy integration
export const initializeDrawSystem = () => drawSystemAPI.initializeDraws();
export const submitUserActivity = (userId, username, subscriptionTier, pointsEarned, activityType, photoVerified) => 
  drawSystemAPI.submitUserEntries(userId, username, subscriptionTier, pointsEarned, activityType, photoVerified);
export const getUserDrawEntries = (userId) => drawSystemAPI.getUserEntryCount(userId);
export const getNextDraws = () => drawSystemAPI.getNextDrawCountdown();
export const getRecentWinners = () => drawSystemAPI.getRecentWinners();
export const getDrawStats = () => drawSystemAPI.getDrawStatistics();
export const getAuditTrail = () => drawSystemAPI.getPublicAuditTrail();

