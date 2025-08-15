import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { activityHelpers, achievementHelpers } from '../lib/supabase';
import { subscriptionHelpers } from '../lib/subscriptionHelpers';
import AnimatedCounter from './AnimatedCounter';
import PhotoVerificationModal from './PhotoVerificationModal';

const ActivityTrackingScreen = ({ user, onStatsUpdate }) => {
  const [activityTypes, setActivityTypes] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    totalCO2Saved: 0,
    totalActivities: 0
  });

  useEffect(() => {
    loadActivityTypes();
    loadUserStats();
    loadUserSubscription();
  }, []);

  const loadActivityTypes = async () => {
    try {
      const { data, error } = await activityHelpers.getActivityTypes();
      if (error) {
        Alert.alert('Error', 'Failed to load activities');
        console.error('Load activities error:', error);
      } else {
        setActivityTypes(data || []);
      }
    } catch (error) {
      console.error('Load activities error:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data, error } = await activityHelpers.getUserStats(user.id);
      if (error) {
        console.error('Load stats error:', error);
      } else {
        setUserStats(data || { totalPoints: 0, totalCO2Saved: 0, totalActivities: 0 });
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const loadUserSubscription = async () => {
    try {
      const { data, error } = await subscriptionHelpers.getUserSubscription(user.id);
      if (error) {
        console.error('Load subscription error:', error);
      } else {
        setUserSubscription(data);
      }
    } catch (error) {
      console.error('Load subscription error:', error);
    }
  };

  const getActivityIcon = (iconName) => {
    const icons = {
      bicycle: '🚴',
      bus: '🚌',
      leaf: '🌱',
      recycle: '♻️',
      zap: '⚡'
    };
    return icons[iconName] || '🌍';
  };

  const getActivityColor = (activityName) => {
    const colors = {
      'Walking/Biking': '#10b981',
      'Public Transit': '#3b82f6',
      'Plant-Based Meals': '#22c55e',
      'Recycling': '#f59e0b',
      'Energy Saving': '#8b5cf6'
    };
    return colors[activityName] || '#10b981';
  };

  const handleActivitySelect = (activity) => {
    // Check if user is Eco Warrior (free tier) - they can't earn points from activities
    const isEcoWarrior = userSubscription?.subscription_plans?.name === 'eco_warrior';
    
    if (isEcoWarrior) {
      Alert.alert(
        '🌱 Eco Warrior - Upgrade to Earn Activity Points',
        `As an Eco Warrior, you earn points by sharing the app on social media!\n\nUpgrade to Green Champion ($9.99) or Planet Saver ($19.99) to earn points from activities like ${activity.name}.`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'View Plans', onPress: () => {
            // Navigate to subscription screen
            Alert.alert('Info', 'Navigate to Plans tab to upgrade your subscription!');
          }}
        ]
      );
      return;
    }

    // Calculate points based on subscription tier
    const tierInfo = subscriptionHelpers.getSubscriptionTierInfo(
      userSubscription?.subscription_plans?.name || 'eco_warrior'
    );
    const multiplier = userSubscription?.subscription_plans?.point_multiplier || 1;
    const basePoints = activity.points_per_unit;
    const actualPoints = basePoints * multiplier;

    Alert.alert(
      activity.name,
      `${activity.description}\n\nReward: ${actualPoints} points (${tierInfo.name} ${multiplier}x)\nCO2 Saved: ${activity.co2_saved_per_unit}kg`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Quick Log', 
          onPress: () => {
            setSelectedActivity(activity);
            setModalVisible(true);
            setQuantity('1');
            setNotes('');
          }
        },
        { 
          text: `Photo Verify (${actualPoints * 2} Points)`, 
          onPress: () => openPhotoVerification(activity)
        }
      ]
    );
  };

  const openPhotoVerification = (activity) => {
    setSelectedActivity(activity);
    setPhotoModalVisible(true);
  };

  const handlePhotoVerified = async (activityData) => {
    // Check for new achievements
    const { data: newAchievements } = await achievementHelpers.checkAchievements(user.id);
    
    let message = `Amazing! Photo verified activity earned you ${activityData.points_earned} points (2x bonus) and saved ${activityData.co2_saved}kg of CO2!`;
    
    if (newAchievements && newAchievements.length > 0) {
      message += `\n\n🏆 New Achievement${newAchievements.length > 1 ? 's' : ''} Unlocked:\n`;
      message += newAchievements.map(a => `• ${a.name}`).join('\n');
    }

    Alert.alert('Photo Verified! 🎉📸', message);
    
    // Refresh data
    loadUserStats();
    if (onStatsUpdate) onStatsUpdate();
  };

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([loadActivityTypes(), loadUserStats()]).finally(() => {
      setRefreshing(false);
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedActivity(null);
    setQuantity('1');
    setNotes('');
  };

  const calculatePoints = () => {
    if (!selectedActivity) return 0;
    const qty = parseFloat(quantity) || 1;
    const basePoints = qty * selectedActivity.points_per_unit;
    const multiplier = userSubscription?.subscription_plans?.point_multiplier || 1;
    return Math.round(basePoints * multiplier);
  };

  const calculateCO2Saved = () => {
    if (!selectedActivity) return 0;
    const qty = parseFloat(quantity) || 1;
    return (qty * selectedActivity.co2_saved_per_unit).toFixed(2);
  };

  const submitActivity = async () => {
    if (!selectedActivity || !quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Check if Eco Warrior trying to log activity
    const isEcoWarrior = userSubscription?.subscription_plans?.name === 'eco_warrior';
    if (isEcoWarrior) {
      Alert.alert('Upgrade Required', 'Eco Warriors earn points by sharing! Upgrade to earn points from activities.');
      return;
    }

    setSubmitting(true);

    try {
      // Calculate points using subscription multiplier
      const basePoints = parseFloat(quantity) * selectedActivity.points_per_unit;
      const { points: actualPoints, error: pointsError } = await subscriptionHelpers.calculateActivityPoints(
        user.id,
        basePoints
      );

      if (pointsError) {
        throw pointsError;
      }

      // Log activity with calculated points
      const { data, error } = await activityHelpers.logActivity(
        user.id,
        selectedActivity.id,
        parseFloat(quantity),
        notes,
        actualPoints // Pass the tier-adjusted points
      );

      if (error) {
        Alert.alert('Error', 'Failed to log activity');
        console.error('Log activity error:', error);
      } else {
        // Check for new achievements
        const { data: newAchievements } = await achievementHelpers.checkAchievements(user.id);
        
        const tierInfo = subscriptionHelpers.getSubscriptionTierInfo(
          userSubscription?.subscription_plans?.name || 'eco_warrior'
        );
        
        let successMessage = `Great! You earned ${actualPoints} points (${tierInfo.name} tier) and saved ${data.co2_saved}kg of CO2!`;
        
        if (newAchievements && newAchievements.length > 0) {
          const achievementNames = newAchievements.map(a => a.name).join(', ');
          successMessage += `\n\n🏆 New Achievement${newAchievements.length > 1 ? 's' : ''} Unlocked: ${achievementNames}!`;
        }

        Alert.alert('Activity Logged! 🎉', successMessage);
        closeModal();
        
        // Refresh stats
        await loadUserStats();
        await loadUserSubscription();
        
        // Update parent component stats
        if (onStatsUpdate) {
          onStatsUpdate();
        }
      }
    } catch (error) {
      console.error('Submit activity error:', error);
      Alert.alert('Error', 'Failed to log activity');
    } finally {
      setSubmitting(false);
    }
  };

  const StatCard = ({ title, value, suffix = '', icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <AnimatedCounter 
        value={value} 
        suffix={suffix}
        style={[styles.statValue, { color }]}
      />
    </View>
  );

  const ActivityCard = ({ activity }) => (
    <TouchableOpacity
      style={[styles.activityCard, { borderLeftColor: getActivityColor(activity.name) }]}
      onPress={() => handleActivitySelect(activity)}
    >
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: `${getActivityColor(activity.name)}20` }]}>
          <Text style={styles.activityIconText}>
            {getActivityIcon(activity.icon)}
          </Text>
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{activity.name}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
        </View>
      </View>
      <View style={styles.activityRewards}>
        <Text style={styles.rewardText}>
          {activity.points_per_unit} pts • {activity.co2_saved_per_unit} kg CO2
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Activities</Text>
        <Text style={styles.headerSubtitle}>Log your eco-friendly actions and earn crypto rewards</Text>
        
        {/* Subscription Tier Info */}
        {userSubscription && (
          <View style={styles.tierInfo}>
            <Text style={styles.tierText}>
              {subscriptionHelpers.getSubscriptionTierInfo(userSubscription.subscription_plans.name).emoji} {' '}
              {subscriptionHelpers.getSubscriptionTierInfo(userSubscription.subscription_plans.name).name}
              {userSubscription.subscription_plans.name === 'eco_warrior' 
                ? ' - Earn points by sharing!' 
                : ` - ${userSubscription.subscription_plans.point_multiplier}x points from activities`
              }
            </Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Points"
              value={userStats.totalPoints}
              icon="⭐"
              color="#f59e0b"
            />
            <StatCard
              title="CO2 Saved"
              value={parseFloat(userStats.totalCO2Saved)}
              suffix=" kg"
              icon="🌱"
              color="#10b981"
            />
            <StatCard
              title="Activities"
              value={userStats.totalActivities}
              icon="✅"
              color="#3b82f6"
            />
          </View>
        </View>

        {/* Activity Types */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Available Activities</Text>
          {activityTypes.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Activity Logging Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Log {selectedActivity?.name}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedActivity && (
                <>
                  <View style={styles.selectedActivityInfo}>
                    <Text style={styles.selectedActivityIcon}>
                      {getActivityIcon(selectedActivity.icon)}
                    </Text>
                    <Text style={styles.selectedActivityName}>
                      {selectedActivity.name}
                    </Text>
                    <Text style={styles.selectedActivityDescription}>
                      {selectedActivity.description}
                    </Text>
                  </View>

                  {/* Quantity Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                      style={styles.textInput}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      placeholder="Enter quantity"
                      placeholderTextColor="#666"
                    />
                    <Text style={styles.inputHint}>
                      {selectedActivity.name === 'Walking/Biking' ? 'Miles/Kilometers' :
                       selectedActivity.name === 'Public Transit' ? 'Trips' :
                       selectedActivity.name === 'Plant-Based Meals' ? 'Meals' :
                       selectedActivity.name === 'Recycling' ? 'Items' :
                       selectedActivity.name === 'Energy Saving' ? 'Hours' : 'Units'}
                    </Text>
                  </View>

                  {/* Notes Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Notes (Optional)</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={notes}
                      onChangeText={setNotes}
                      multiline
                      numberOfLines={3}
                      placeholder="Add any additional details..."
                      placeholderTextColor="#666"
                    />
                  </View>

                  {/* Reward Preview */}
                  <View style={styles.rewardPreview}>
                    <Text style={styles.rewardTitle}>You'll Earn:</Text>
                    <View style={styles.rewardStats}>
                      <View style={styles.rewardItem}>
                        <Text style={styles.rewardValue}>{calculatePoints()}</Text>
                        <Text style={styles.rewardLabel}>Points</Text>
                      </View>
                      <View style={styles.rewardItem}>
                        <Text style={styles.rewardValue}>{calculateCO2Saved()}kg</Text>
                        <Text style={styles.rewardLabel}>CO2 Saved</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={submitActivity}
                    disabled={submitting}
                  >
                    <Text style={styles.submitButtonText}>
                      {submitting ? 'Logging Activity...' : 'Log Activity'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Photo Verification Modal */}
      <PhotoVerificationModal
        visible={photoModalVisible}
        onClose={() => {
          setPhotoModalVisible(false);
          setSelectedActivity(null);
        }}
        activity={selectedActivity}
        user={user}
        onPhotoVerified={handlePhotoVerified}
      />
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
  header: {
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tierInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  tierText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activitiesContainer: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityIconText: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
  activityRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 24,
    color: '#9ca3af',
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  selectedActivityInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectedActivityIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  selectedActivityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedActivityDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rewardPreview: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  rewardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ActivityTrackingScreen;

