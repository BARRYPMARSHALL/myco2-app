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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ user, onNavigate }) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const [stats, setStats] = useState({
    co2Saved: 0,
    activities: 0,
    points: 0,
    rank: 0
  });

  // Handle navigation for web compatibility
  const handleNavigation = (screen, params = {}) => {
    if (onNavigate) {
      onNavigate(screen, params);
    } else {
      Alert.alert('Navigation', `Would navigate to ${screen}`);
    }
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    switch (action) {
      case 'scan':
        Alert.alert('Scan Receipt', 'Receipt scanning feature coming soon!');
        break;
      case 'track':
        handleNavigation('activities');
        break;
      case 'rewards':
        handleNavigation('giveaways');
        break;
      default:
        Alert.alert('Action', `${action} feature coming soon!`);
    }
  };

  useEffect(() => {
    // Animate entrance
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animate stats counting up
    const timer = setTimeout(() => {
      setStats({
        co2Saved: 15.7,
        activities: 47,
        points: 1247,
        rank: 156
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const activities = [
    {
      id: 1,
      name: 'Walking/Biking',
      icon: 'bicycle',
      points: '1 point/mile',
      color: ['#10B981', '#059669'],
      description: 'Car-free transportation'
    },
    {
      id: 2,
      name: 'Public Transit',
      icon: 'bus',
      points: '1 point/trip',
      color: ['#3B82F6', '#1D4ED8'],
      description: 'Sustainable commuting'
    },
    {
      id: 3,
      name: 'Plant-Based Meals',
      icon: 'leaf',
      points: '1 point/meal',
      color: ['#F59E0B', '#D97706'],
      description: 'Eco-friendly dining'
    },
    {
      id: 4,
      name: 'Recycling',
      icon: 'refresh',
      points: '1 point/kg',
      color: ['#8B5CF6', '#7C3AED'],
      description: 'Waste reduction'
    },
    {
      id: 5,
      name: 'Energy Saving',
      icon: 'flash',
      points: '1 point/hour',
      color: ['#EF4444', '#DC2626'],
      description: 'Smart energy use'
    }
  ];

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
          onPress={() => handleNavigation('activities')}
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
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => handleNavigation('activities')}
            >
              <Text style={styles.trackButtonText}>Track Activity</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
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
          <View>
            <Text style={styles.greeting}>Good morning! 🌱</Text>
            <Text style={styles.headerTitle}>Skill-Based Eco-Challenges</Text>
            <Text style={styles.headerSubtitle}>Rewards Club</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => handleNavigation('profile')}
          >
            <Ionicons name="person-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Regulatory Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Earn entries through skill-based eco-activities • Not a game of chance
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Impact Today</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="CO2 Saved"
              value={`${stats.co2Saved} kg`}
              icon="leaf"
              color="#10B981"
            />
            <StatCard
              title="Activities"
              value={stats.activities}
              icon="checkmark-circle"
              color="#3B82F6"
            />
            <StatCard
              title="Points"
              value={stats.points.toLocaleString()}
              icon="trophy"
              color="#F59E0B"
            />
            <StatCard
              title="Global Rank"
              value={`#${stats.rank}`}
              icon="star"
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleQuickAction('scan')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.quickActionText}>Verify Activity</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleQuickAction('track')}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="location" size={24} color="white" />
                <Text style={styles.quickActionText}>Track Challenge</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleQuickAction('rewards')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="gift" size={24} color="white" />
                <Text style={styles.quickActionText}>Rewards Selection</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Skill-Based Eco-Challenges</Text>
          <Text style={styles.sectionSubtitle}>
            Complete verified activities to earn reward entries
          </Text>
          {activities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </View>

        {/* Crypto Rewards Teaser */}
        <View style={styles.rewardsContainer}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.rewardsCard}
          >
            <View style={styles.rewardsHeader}>
              <Ionicons name="diamond" size={32} color="#F59E0B" />
              <Text style={styles.rewardsTitle}>Weekly Rewards Selection</Text>
            </View>
            <Text style={styles.rewardsAmount}>$1,000 BTC</Text>
            <Text style={styles.rewardsDescription}>
              Next selection in 2 days, 14 hours
            </Text>
            <TouchableOpacity 
              style={styles.rewardsButton}
              onPress={() => handleNavigation('giveaways')}
            >
              <Text style={styles.rewardsButtonText}>View Rewards Program</Text>
              <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  disclaimerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
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
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 50) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  activitiesContainer: {
    marginBottom: 30,
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
    marginBottom: 16,
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
  rewardsContainer: {
    marginBottom: 30,
  },
  rewardsCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  rewardsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  rewardsDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  rewardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  rewardsButtonText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default HomeScreen;

