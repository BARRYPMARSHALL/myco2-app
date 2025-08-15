import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { subscriptionHelpers } from '../lib/subscriptionHelpers';
import AnimatedCounter from './AnimatedCounter';

const SubscriptionScreen = ({ user, onNavigate }) => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load subscription plans
      const { data: plans, error: plansError } = await subscriptionHelpers.getSubscriptionPlans();
      if (plansError) throw plansError;
      setSubscriptionPlans(plans);

      // Load user's current subscription
      const { data: userSub, error: subError } = await subscriptionHelpers.getUserSubscription(user.id);
      if (subError) throw subError;
      setCurrentSubscription(userSub);
      
    } catch (error) {
      console.error('Error loading subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = (plan) => {
    if (currentSubscription?.subscription_plans?.name === plan.name) {
      Alert.alert('Current Plan', 'You are already subscribed to this plan.');
      return;
    }
    
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const confirmSubscriptionChange = async () => {
    if (!selectedPlan) return;
    
    try {
      setUpgrading(true);
      setShowConfirmModal(false);
      
      const currentPlan = currentSubscription?.subscription_plans?.name;
      const newPlan = selectedPlan.name;
      
      let changeReason = '';
      if (currentPlan === 'eco_warrior' && newPlan !== 'eco_warrior') {
        changeReason = 'Upgrade from free tier';
      } else if (selectedPlan.price_monthly > currentSubscription?.subscription_plans?.price_monthly) {
        changeReason = 'Plan upgrade';
      } else {
        changeReason = 'Plan downgrade';
      }
      
      const { success, error } = await subscriptionHelpers.changeSubscription(
        user.id, 
        newPlan, 
        changeReason
      );
      
      if (error) throw error;
      
      if (success) {
        Alert.alert(
          'Success!', 
          `Successfully changed to ${subscriptionHelpers.getSubscriptionTierInfo(newPlan).name}!`,
          [{ text: 'OK', onPress: () => loadSubscriptionData() }]
        );
      } else {
        throw new Error('Failed to change subscription');
      }
      
    } catch (error) {
      console.error('Error changing subscription:', error);
      Alert.alert('Error', 'Failed to change subscription. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will be downgraded to the free Eco Warrior tier.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: () => handlePlanSelection(subscriptionPlans.find(p => p.name === 'eco_warrior'))
        }
      ]
    );
  };

  const SubscriptionPlanCard = ({ plan, isCurrentPlan }) => {
    const tierInfo = subscriptionHelpers.getSubscriptionTierInfo(plan.name);
    
    return (
      <View style={[
        styles.planCard,
        isCurrentPlan && styles.currentPlanCard,
        { borderColor: tierInfo.color }
      ]}>
        <View style={styles.planHeader}>
          <Text style={styles.planEmoji}>{tierInfo.emoji}</Text>
          <Text style={styles.planName}>{tierInfo.name}</Text>
          {isCurrentPlan && (
            <View style={[styles.currentBadge, { backgroundColor: tierInfo.color }]}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.planPrice, { color: tierInfo.color }]}>
          {tierInfo.price}
        </Text>
        
        <Text style={styles.pointsInfo}>{tierInfo.pointsInfo}</Text>
        
        <View style={styles.featuresContainer}>
          {tierInfo.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✅</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.selectButton,
            isCurrentPlan ? styles.currentButton : { backgroundColor: tierInfo.color }
          ]}
          onPress={() => handlePlanSelection(plan)}
          disabled={isCurrentPlan || upgrading}
        >
          <Text style={[
            styles.selectButtonText,
            isCurrentPlan && { color: '#6b7280' }
          ]}>
            {isCurrentPlan ? 'Current Plan' : 
             plan.price_monthly > (currentSubscription?.subscription_plans?.price_monthly || 0) ? 'Upgrade' : 
             plan.price_monthly === 0 ? 'Downgrade' : 'Select Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ConfirmationModal = () => {
    if (!selectedPlan) return null;
    
    const tierInfo = subscriptionHelpers.getSubscriptionTierInfo(selectedPlan.name);
    const currentTierInfo = subscriptionHelpers.getSubscriptionTierInfo(
      currentSubscription?.subscription_plans?.name || 'eco_warrior'
    );
    
    const isUpgrade = selectedPlan.price_monthly > (currentSubscription?.subscription_plans?.price_monthly || 0);
    const isDowngrade = selectedPlan.price_monthly < (currentSubscription?.subscription_plans?.price_monthly || 0);
    
    return (
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change'} Subscription
            </Text>
            
            <View style={styles.changePreview}>
              <View style={styles.planPreview}>
                <Text style={styles.previewLabel}>From:</Text>
                <Text style={styles.previewPlan}>
                  {currentTierInfo.emoji} {currentTierInfo.name}
                </Text>
                <Text style={styles.previewPrice}>{currentTierInfo.price}</Text>
              </View>
              
              <Text style={styles.arrow}>→</Text>
              
              <View style={styles.planPreview}>
                <Text style={styles.previewLabel}>To:</Text>
                <Text style={styles.previewPlan}>
                  {tierInfo.emoji} {tierInfo.name}
                </Text>
                <Text style={styles.previewPrice}>{tierInfo.price}</Text>
              </View>
            </View>
            
            <Text style={styles.modalDescription}>
              {isUpgrade && 'You will be charged immediately and get access to enhanced features.'}
              {isDowngrade && 'Your subscription will be downgraded at the next billing cycle.'}
              {selectedPlan.name === 'eco_warrior' && 'You will lose access to activity points but can still earn sharing points.'}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: tierInfo.color }]}
                onPress={confirmSubscriptionChange}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  const daysUntilReset = subscriptionHelpers.getDaysUntilReset(
    currentSubscription?.monthly_reset_date
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💎 Subscription Plans</Text>
          <Text style={styles.subtitle}>
            Choose your eco-warrior tier and maximize your impact!
          </Text>
        </View>

        {/* Current Status */}
        {currentSubscription && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Plan:</Text>
                <Text style={styles.statusValue}>
                  {subscriptionHelpers.getSubscriptionTierInfo(
                    currentSubscription.subscription_plans.name
                  ).name}
                </Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Monthly Points:</Text>
                <AnimatedCounter
                  value={currentSubscription.monthly_points || 0}
                  style={styles.statusValue}
                />
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Days Until Reset:</Text>
                <Text style={styles.statusValue}>{daysUntilReset} days</Text>
              </View>
            </View>
          </View>
        )}

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          {subscriptionPlans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentSubscription?.subscription_plans?.name === plan.name}
            />
          ))}
        </View>

        {/* Monthly Reset Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📅 Monthly Reset System</Text>
          <Text style={styles.infoText}>
            All points reset to zero at the end of each month to ensure fair competition. 
            This creates exciting monthly races for the top prizes!
          </Text>
        </View>

        {/* Prize Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>🏆 Prize Structure</Text>
          <Text style={styles.infoText}>
            • 50% of subscription revenue goes to prizes{'\n'}
            • Weekly crypto giveaways{'\n'}
            • Monthly "Greenest Person Alive" mega prizes{'\n'}
            • 10% donated to environmental charities{'\n'}
            • Each point = 1 ticket for draws
          </Text>
        </View>

        {/* Cancel Subscription */}
        {currentSubscription?.subscription_plans?.name !== 'eco_warrior' && (
          <TouchableOpacity
            style={styles.cancelSubscriptionButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelSubscriptionText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmationModal />

      {upgrading && (
        <View style={styles.upgradingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.upgradingText}>Updating subscription...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f0a',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  plansContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  currentPlanCard: {
    backgroundColor: '#0f1419',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pointsInfo: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    marginRight: 8,
    fontSize: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#d1d5db',
    flex: 1,
  },
  selectButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  currentButton: {
    backgroundColor: '#374151',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  cancelSubscriptionButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  cancelSubscriptionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  changePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  planPreview: {
    flex: 1,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  previewPlan: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 14,
    color: '#10b981',
  },
  arrow: {
    fontSize: 20,
    color: '#9ca3af',
    marginHorizontal: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
});

export default SubscriptionScreen;

