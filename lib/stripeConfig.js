// MYCO2.app Stripe Configuration and Payment Helpers

import { initStripe, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';

// Stripe Configuration
export const STRIPE_CONFIG = {
  // Test keys - Replace with live keys for production
  publishableKey: 'pk_test_51234567890abcdef...', // Replace with your Stripe publishable key
  merchantIdentifier: 'merchant.com.myco2.app',
  urlScheme: 'myco2app',
  setReturnUrlSchemeOnAndroid: true,
};

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS = {
  eco_warrior: {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    price: 0,
    priceId: null, // Free tier
    features: ['Social sharing points', 'Basic tracking', 'Community access'],
    pointMultiplier: 0, // No activity points
  },
  green_champion: {
    id: 'green_champion',
    name: 'Green Champion',
    price: 9.99,
    priceId: 'price_1234567890abcdef', // Replace with your Stripe price ID
    features: ['1x activity points', 'Photo verification', 'All eco-challenges', 'Priority support'],
    pointMultiplier: 1,
  },
  planet_saver: {
    id: 'planet_saver',
    name: 'Planet Saver',
    price: 19.99,
    priceId: 'price_0987654321fedcba', // Replace with your Stripe price ID
    features: ['3x activity points', 'Premium challenges', 'Early access', 'VIP support'],
    pointMultiplier: 3,
  },
};

// Initialize Stripe
export const initializeStripe = async () => {
  try {
    await initStripe({
      publishableKey: STRIPE_CONFIG.publishableKey,
      merchantIdentifier: STRIPE_CONFIG.merchantIdentifier,
      urlScheme: STRIPE_CONFIG.urlScheme,
      setReturnUrlSchemeOnAndroid: STRIPE_CONFIG.setReturnUrlSchemeOnAndroid,
    });
    console.log('Stripe initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return { success: false, error };
  }
};

// Stripe Payment Helpers
export const stripeHelpers = {
  // Create subscription for user
  async createSubscription(userId, priceId, paymentMethodId) {
    try {
      // This would typically call your backend API
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          priceId,
          paymentMethodId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      return { success: true, subscription: data.subscription };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Update subscription (upgrade/downgrade)
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      return { success: true, subscription: data.subscription };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      return { success: true, subscription: data.subscription };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Get customer payment methods
  async getPaymentMethods(customerId) {
    try {
      const response = await fetch(`/api/payment-methods/${customerId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get payment methods');
      }

      return { success: true, paymentMethods: data.paymentMethods };
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return { success: false, error: error.message };
    }
  },

  // Create setup intent for saving payment method
  async createSetupIntent(customerId) {
    try {
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create setup intent');
      }

      return { success: true, setupIntent: data.setupIntent };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      return { success: false, error: error.message };
    }
  },

  // Get subscription status
  async getSubscriptionStatus(userId) {
    try {
      const response = await fetch(`/api/subscription-status/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get subscription status');
      }

      return { success: true, subscription: data.subscription };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { success: false, error: error.message };
    }
  },

  // Format price for display
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  },

  // Get plan details by ID
  getPlanDetails(planId) {
    return SUBSCRIPTION_PLANS[planId] || null;
  },

  // Calculate prorated amount for plan change
  calculateProration(currentPlan, newPlan, daysRemaining, totalDays) {
    if (!currentPlan || !newPlan) return 0;
    
    const currentDailyRate = currentPlan.price / totalDays;
    const newDailyRate = newPlan.price / totalDays;
    const unusedCredit = currentDailyRate * daysRemaining;
    const newCharge = newDailyRate * daysRemaining;
    
    return Math.max(0, newCharge - unusedCredit);
  },

  // Validate payment method
  validatePaymentMethod(paymentMethod) {
    if (!paymentMethod) {
      return { valid: false, error: 'Payment method is required' };
    }

    if (!paymentMethod.card) {
      return { valid: false, error: 'Card information is required' };
    }

    return { valid: true };
  },
};

// Revenue Tracking Helpers
export const revenueHelpers = {
  // Calculate revenue allocation
  calculateRevenueAllocation(totalRevenue) {
    const prizeAllocation = totalRevenue * 0.5; // 50% for prizes
    const charityAllocation = totalRevenue * 0.1; // 10% for charity
    const operatingRevenue = totalRevenue * 0.4; // 40% for operations
    
    return {
      total: totalRevenue,
      prizes: prizeAllocation,
      charity: charityAllocation,
      operating: operatingRevenue,
    };
  },

  // Track subscription revenue
  async trackSubscriptionRevenue(subscriptionId, amount, planId) {
    try {
      // This would typically update your revenue tracking database
      const allocation = this.calculateRevenueAllocation(amount);
      
      // Log revenue to database
      const response = await fetch('/api/track-revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          amount,
          planId,
          allocation,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track revenue');
      }

      return { success: true, allocation };
    } catch (error) {
      console.error('Error tracking revenue:', error);
      return { success: false, error: error.message };
    }
  },

  // Get revenue statistics
  async getRevenueStats(period = 'month') {
    try {
      const response = await fetch(`/api/revenue-stats?period=${period}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get revenue stats');
      }

      return { success: true, stats: data.stats };
    } catch (error) {
      console.error('Error getting revenue stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Get prize pool amount
  async getPrizePoolAmount() {
    try {
      const { success, stats } = await this.getRevenueStats();
      if (!success) throw new Error('Failed to get revenue stats');
      
      return {
        success: true,
        prizePool: stats.totalPrizeAllocation || 0,
        weeklyPrize: Math.min(1000, stats.weeklyPrizeAllocation || 0),
        monthlyPrize: Math.min(100000, stats.monthlyPrizeAllocation || 0),
      };
    } catch (error) {
      console.error('Error getting prize pool:', error);
      return { success: false, error: error.message };
    }
  },
};

export default {
  STRIPE_CONFIG,
  SUBSCRIPTION_PLANS,
  initializeStripe,
  stripeHelpers,
  revenueHelpers,
};

