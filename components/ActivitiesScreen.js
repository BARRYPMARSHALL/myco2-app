import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ActivitiesScreen = ({ navigation }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activityValue, setActivityValue] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const activities = [
    {
      id: 1,
      name: 'Walking/Biking',
      icon: 'bicycle',
      points: '1 point/mile',
      color: ['#10B981', '#059669'],
      description: 'Car-free transportation',
      unit: 'miles',
      placeholder: 'Enter distance in miles',
      co2PerUnit: 0.4,
      tips: [
        'Use bike lanes for safety',
        'Track your route with GPS',
        'Join local cycling groups'
      ]
    },
    {
      id: 2,
      name: 'Public Transit',
      icon: 'bus',
      points: '1 point/trip',
      color: ['#3B82F6', '#1D4ED8'],
      description: 'Sustainable commuting',
      unit: 'trips',
      placeholder: 'Number of transit trips',
      co2PerUnit: 2.1,
      tips: [
        'Plan your route in advance',
        'Use transit apps for schedules',
        'Consider monthly passes'
      ]
    },
    {
      id: 3,
      name: 'Plant-Based Meals',
      icon: 'leaf',
      points: '1 point/meal',
      color: ['#F59E0B', '#D97706'],
      description: 'Eco-friendly dining',
      unit: 'meals',
      placeholder: 'Number of plant-based meals',
      co2PerUnit: 1.8,
      tips: [
        'Try new vegetarian recipes',
        'Visit plant-based restaurants',
        'Grow your own herbs'
      ]
    },
    {
      id: 4,
      name: 'Recycling',
      icon: 'refresh',
      points: '1 point/kg',
      color: ['#8B5CF6', '#7C3AED'],
      description: 'Waste reduction',
      unit: 'kg',
      placeholder: 'Weight recycled in kg',
      co2PerUnit: 0.9,
      tips: [
        'Sort materials properly',
        'Clean containers before recycling',
        'Learn local recycling rules'
      ]
    },
    {
      id: 5,
      name: 'Energy Saving',
      icon: 'flash',
      points: '1 point/hour',
      color: ['#EF4444', '#DC2626'],
      description: 'Smart energy use',
      unit: 'hours',
      placeholder: 'Hours of energy saving',
      co2PerUnit: 0.5,
      tips: [
        'Use LED light bulbs',
        'Unplug unused devices',
        'Adjust thermostat settings'
      ]
    }
  ];

  const recentActivities = [
    {
      id: 1,
      activity: 'Walking/Biking',
      value: '3.2 miles',
      points: 3,
      co2Saved: '1.3 kg',
      date: '2 hours ago',
      icon: 'bicycle',
      color: '#10B981'
    },
    {
      id: 2,
      activity: 'Plant-Based Meals',
      value: '2 meals',
      points: 2,
      co2Saved: '3.6 kg',
      date: '5 hours ago',
      icon: 'leaf',
      color: '#F59E0B'
    },
    {
      id: 3,
      activity: 'Public Transit',
      value: '1 trip',
      points: 1,
      co2Saved: '2.1 kg',
      date: 'Yesterday',
      icon: 'bus',
      color: '#3B82F6'
    }
  ];

  const handleActivityPress = (activity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
    setActivityValue('');
  };

  const handleSubmitActivity = () => {
    if (activityValue && selectedActivity) {
      const value = parseFloat(activityValue);
      const points = Math.floor(value);
      const co2Saved = (value * selectedActivity.co2PerUnit).toFixed(1);
      
      // Here you would typically save to your backend
      console.log(`Logged ${value} ${selectedActivity.unit} of ${selectedActivity.name}`);
      console.log(`Earned ${points} points, saved ${co2Saved} kg CO2`);
      
      setModalVisible(false);
      setActivityValue('');
      setSelectedActivity(null);
    }
  };

  const ActivityCard = ({ activity, index }) => {
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.activityCard,
          {
            transform: [{ translateY }],
            opacity,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.activityCardInner}
          onPress={() => handleActivityPress(activity)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={activity.color}
            style={styles.activityGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.activityHeader}>
              <Ionicons name={activity.icon} size={32} color="white" />
              <Text style={styles.activityPoints}>{activity.points}</Text>
            </View>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            
            <View style={styles.activityStats}>
              <View style={styles.statItem}>
                <Ionicons name="leaf" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.statText}>
                  {activity.co2PerUnit} kg CO2/{activity.unit}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Activity</Text>
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const RecentActivityCard = ({ activity }) => (
    <View style={styles.recentCard}>
      <View style={[styles.recentIcon, { backgroundColor: `${activity.color}20` }]}>
        <Ionicons name={activity.icon} size={20} color={activity.color} />
      </View>
      <View style={styles.recentContent}>
        <Text style={styles.recentActivity}>{activity.activity}</Text>
        <Text style={styles.recentValue}>{activity.value}</Text>
        <Text style={styles.recentDate}>{activity.date}</Text>
      </View>
      <View style={styles.recentStats}>
        <View style={styles.recentStatItem}>
          <Text style={styles.recentPoints}>+{activity.points}</Text>
          <Text style={styles.recentPointsLabel}>points</Text>
        </View>
        <View style={styles.recentStatItem}>
          <Text style={styles.recentCO2}>{activity.co2Saved}</Text>
          <Text style={styles.recentCO2Label}>CO2 saved</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#10B981']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Activities</Text>
          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="time" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Complete eco-challenges to earn points and crypto rewards
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Goal */}
        <View style={styles.goalContainer}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.goalCard}
          >
            <View style={styles.goalHeader}>
              <Ionicons name="target" size={24} color="white" />
              <Text style={styles.goalTitle}>Today's Goal</Text>
            </View>
            <Text style={styles.goalText}>Complete 3 eco-challenges</Text>
            <View style={styles.goalProgress}>
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: '66%' }]} />
              </View>
              <Text style={styles.goalProgressText}>2 of 3 completed</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Available Challenges</Text>
          <Text style={styles.sectionSubtitle}>
            Choose an activity to track and earn rewards
          </Text>
          {activities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {recentActivities.map((activity) => (
            <RecentActivityCard key={activity.id} activity={activity} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Activity Tracking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedActivity && (
              <>
                <View style={styles.modalHeader}>
                  <LinearGradient
                    colors={selectedActivity.color}
                    style={styles.modalIconContainer}
                  >
                    <Ionicons name={selectedActivity.icon} size={32} color="white" />
                  </LinearGradient>
                  <Text style={styles.modalTitle}>{selectedActivity.name}</Text>
                  <Text style={styles.modalDescription}>{selectedActivity.description}</Text>
                </View>

                <View style={styles.modalForm}>
                  <Text style={styles.inputLabel}>
                    Enter {selectedActivity.unit}:
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={selectedActivity.placeholder}
                    value={activityValue}
                    onChangeText={setActivityValue}
                    keyboardType="numeric"
                    autoFocus={true}
                  />
                  
                  {activityValue && (
                    <View style={styles.previewContainer}>
                      <Text style={styles.previewTitle}>You'll earn:</Text>
                      <View style={styles.previewStats}>
                        <View style={styles.previewStat}>
                          <Ionicons name="star" size={16} color="#F59E0B" />
                          <Text style={styles.previewStatText}>
                            {Math.floor(parseFloat(activityValue) || 0)} points
                          </Text>
                        </View>
                        <View style={styles.previewStat}>
                          <Ionicons name="leaf" size={16} color="#10B981" />
                          <Text style={styles.previewStatText}>
                            {((parseFloat(activityValue) || 0) * selectedActivity.co2PerUnit).toFixed(1)} kg CO2 saved
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>💡 Tips:</Text>
                    {selectedActivity.tips.map((tip, index) => (
                      <Text key={index} style={styles.tipText}>• {tip}</Text>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      !activityValue && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmitActivity}
                    disabled={!activityValue}
                  >
                    <LinearGradient
                      colors={activityValue ? selectedActivity.color : ['#E5E7EB', '#E5E7EB']}
                      style={styles.submitButtonGradient}
                    >
                      <Text style={[
                        styles.submitButtonText,
                        !activityValue && styles.submitButtonTextDisabled
                      ]}>
                        Track Activity
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  historyButton: {
    padding: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  goalContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  goalCard: {
    borderRadius: 16,
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  goalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  goalProgress: {
    alignItems: 'center',
  },
  goalProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  activitiesContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  activityCard: {
    marginBottom: 16,
  },
  activityCardInner: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.84,
    elevation: 8,
  },
  activityGradient: {
    padding: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityPoints: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  activityStats: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 6,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  trackButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  recentContainer: {
    marginBottom: 30,
  },
  recentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recentContent: {
    flex: 1,
  },
  recentActivity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  recentValue: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentStats: {
    alignItems: 'flex-end',
  },
  recentStatItem: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  recentPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  recentPointsLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  recentCO2: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  recentCO2Label: {
    fontSize: 10,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  previewContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
  },
  tipsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default ActivitiesScreen;

