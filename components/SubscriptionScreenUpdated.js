import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { stripeHelpers, SUBSCRIPTION_PLANS } from '../lib/stripeConfig';

const SubscriptionScreen = ({ user, onNavigate }) => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const { success, subscription } = await stripeHelpers.getSubscriptionStatus(user.id);
      
      if (success) {
        setCurrentSubscription(subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId) => {
    if (planId === 'eco_warrior') {
      Alert.alert(
        'Eco Warrior Plan',
        'This is your current free plan. Upgrade to Green Champion or Planet Saver to unlock activity tracking and earn crypto rewards!',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Subscribe to Plan',
      `Subscribe to ${SUBSCRIPTION_PLANS[planId].name} for ${stripeHelpers.formatPrice(SUBSCRIPTION_PLANS[planId].price)}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Navigate to payment screen
            if (onNavigate) {
              onNavigate('payment', { selectedPlan: planId });
            }
          },
        },
      ]
    );
  };

  const handleUpgrade = (planId) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    const currentPlan = currentSubscription?.plan_id ? SUBSCRIPTION_PLANS[currentSubscription.plan_id] : null;
    
    if (!currentPlan) {
      handleSubscribe(planId);
      return;
    }

    const isUpgrade = plan.price > currentPlan.price;
    const action = isUpgrade ? 'upgrade' : 'downgrade';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Plan`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} to ${plan.name} for ${stripeHelpers.formatPrice(plan.price)}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => updateSubscription(planId),
        },
      ]
    );
  };

  const updateSubscription = async (newPlanId) => {
    try {
      setActionLoading(true);
      const newPlan = SUBSCRIPTION_PLANS[newPlanId];
      
      const { success, subscription, error } = await stripeHelpers.updateSubscription(
        currentSubscription.id,
        newPlan.priceId
      );

      if (success) {
        setCurrentSubscription(subscription);
        Alert.alert(
          'Success!',
          `Your subscription has been updated to ${newPlan.name}.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', error || 'Failed to update subscription');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: cancelSubscription,
        },
      ]
    );
  };

  const cancelSubscription = async () => {
    try {
      setActionLoading(true);
      
      const { success, error } = await stripeHelpers.cancelSubscription(currentSubscription.id);

      if (success) {
        setCurrentSubscription(null);
        Alert.alert(
          'Subscription Cancelled',
          'Your subscription has been cancelled. You will retain access to premium features until the end of your billing period.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', error || 'Failed to cancel subscription');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const PlanCard = ({ planId, plan, isCurrentPlan, isPopular }) => (
    <View style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <LinearGradient
        colors={isCurrentPlan ? ['#10b981', '#059669'] : ['#1f2937', '#111827']}
        style={styles.planGradient}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>
              {plan.price === 0 ? 'FREE' : stripeHelpers.formatPrice(plan.price)}
            </Text>
            {plan.price > 0 && <Text style={styles.planPeriod}>/month</Text>}
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planActions}>
          {isCurrentPlan ? (
            <View style={styles.currentPlanIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.currentPlanText}>Current Plan</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.planButton,
                isPopular && styles.popularPlanButton
              ]}
              onPress={() => currentSubscription ? handleUpgrade(planId) : handleSubscribe(planId)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.planButtonText}>
                  {currentSubscription ? 'Switch Plan' : 'Subscribe'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </View>
    );
  }

  const currentPlanId = currentSubscription?.plan_id || 'eco_warrior';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💎 Subscription Plans</Text>
        <Text style={styles.subtitle}>Choose your eco-crypto journey</Text>
        
        {currentSubscription && (
          <View style={styles.currentStatus}>
            <Text style={styles.statusText}>
              Current: {SUBSCRIPTION_PLANS[currentPlanId]?.name || 'Eco Warrior'}
            </Text>
            {currentSubscription.next_billing_date && (
              <Text style={styles.billingText}>
                Next billing: {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
            <PlanCard
              key={planId}
              planId={planId}
              plan={plan}
              isCurrentPlan={planId === currentPlanId}
              isPopular={planId === 'green_champion'}
            />
          ))}
        </View>

        {/* Subscription Management */}
        {currentSubscription && currentSubscription.plan_id !== 'eco_warrior' && (
          <View style={styles.managementSection}>
            <Text style={styles.sectionTitle}>⚙️ Manage Subscription</Text>
            
            <TouchableOpacity
              style={styles.managementButton}
              onPress={() => onNavigate && onNavigate('revenue')}
            >
              <Ionicons name="analytics" size={20} color="#10b981" />
              <Text style={styles.managementButtonText}>View Revenue Analytics</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.managementButton}
              onPress={() => Alert.alert('Payment History', 'Payment history feature coming soon!')}
            >
              <Ionicons name="receipt" size={20} color="#3b82f6" />
              <Text style={styles.managementButtonText}>Payment History</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.managementButton, styles.cancelButton]}
              onPress={handleCancelSubscription}
              disabled={actionLoading}
            >
              <Ionicons name="close-circle" size={20} color="#ef4444" />
              <Text style={[styles.managementButtonText, styles.cancelButtonText]}>
                Cancel Subscription
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits Overview */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>🌟 Why Upgrade?</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="flash" size={24} color="#f59e0b" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Earn More Points</Text>
              <Text style={styles.benefitDescription}>
                Green Champion: 1x points • Planet Saver: 3x points
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="camera" size={24} color="#10b981" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Photo Verification</Text>
              <Text style={styles.benefitDescription}>
                Upload photos for 2x bonus points on all activities
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="trophy" size={24} color="#8b5cf6" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Crypto Rewards</Text>
              <Text style={styles.benefitDescription}>
                Enter weekly Bitcoin and monthly Ethereum selections
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f0a',
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  currentStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    marginBottom: 4,
  },
  billingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f0a',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  plansContainer: {
    marginTop: 20,
  },
  planCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    zIndex: 1,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  planGradient: {
    padding: 24,
    paddingTop: 32,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
  },
  planPeriod: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#d1d5db',
    marginLeft: 12,
    flex: 1,
  },
  planActions: {
    alignItems: 'center',
  },
  currentPlanIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 8,
  },
  planButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: 'center',
  },
  popularPlanButton: {
    backgroundColor: '#f59e0b',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  managementSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  managementButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  managementButtonText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  benefitContent: {
    marginLeft: 16,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;

