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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const GiveawaysScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const upcomingGiveaways = [
    {
      id: 1,
      title: 'Weekly Bitcoin Rewards Selection',
      prize: '$1,000',
      currency: 'BTC',
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      participants: 1247,
      description: 'Skill-based eco-challenge rewards selection',
      type: 'weekly',
      gradient: ['#F59E0B', '#D97706']
    },
    {
      id: 2,
      title: 'Monthly Ethereum Rewards Selection',
      prize: '$5,000',
      currency: 'ETH',
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      participants: 3891,
      description: 'Greenest Skills Champion selection',
      type: 'monthly',
      gradient: ['#3B82F6', '#1D4ED8']
    },
    {
      id: 3,
      title: 'Mega Crypto Rewards Selection',
      prize: '$100,000',
      currency: 'MIXED',
      endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      participants: 12456,
      description: 'Ultimate eco-skills championship',
      type: 'special',
      gradient: ['#10B981', '#059669']
    }
  ];

  const monthlyWinners = [
    {
      id: 1,
      title: 'January 2025 - Greenest Skills Champion',
      prize: '$100,000',
      currency: 'BTC + ETH',
      winner: 'Sarah M.',
      date: 'January 31, 2025',
      activities: 2847,
      co2Saved: '15.2 tons',
      gradient: ['#10B981', '#059669']
    },
    {
      id: 2,
      title: 'December 2024 - Eco-Skills Master',
      prize: '$75,000',
      currency: 'BTC',
      winner: 'Michael K.',
      date: 'December 31, 2024',
      activities: 2156,
      co2Saved: '12.8 tons',
      gradient: ['#F59E0B', '#D97706']
    },
    {
      id: 3,
      title: 'November 2024 - Sustainability Hero',
      prize: '$50,000',
      currency: 'ETH',
      winner: 'Emma L.',
      date: 'November 30, 2024',
      activities: 1923,
      co2Saved: '11.4 tons',
      gradient: ['#8B5CF6', '#7C3AED']
    }
  ];

  const weeklyWinners = [
    {
      id: 1,
      title: 'Week of Feb 5-11, 2025',
      prize: '$1,000',
      currency: 'BTC',
      winner: 'Alex R.',
      date: 'February 11, 2025',
      activities: 47,
      co2Saved: '0.8 tons',
      gradient: ['#F59E0B', '#D97706']
    },
    {
      id: 2,
      title: 'Week of Jan 29 - Feb 4, 2025',
      prize: '$1,000',
      currency: 'ETH',
      winner: 'Jessica T.',
      date: 'February 4, 2025',
      activities: 52,
      co2Saved: '0.9 tons',
      gradient: ['#3B82F6', '#1D4ED8']
    },
    {
      id: 3,
      title: 'Week of Jan 22-28, 2025',
      prize: '$1,000',
      currency: 'BTC',
      winner: 'David P.',
      date: 'January 28, 2025',
      activities: 43,
      co2Saved: '0.7 tons',
      gradient: ['#10B981', '#059669']
    },
    {
      id: 4,
      title: 'Week of Jan 15-21, 2025',
      prize: '$1,000',
      currency: 'ETH',
      winner: 'Maria S.',
      date: 'January 21, 2025',
      activities: 49,
      co2Saved: '0.8 tons',
      gradient: ['#8B5CF6', '#7C3AED']
    }
  ];

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const diff = endDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const UpcomingCard = ({ giveaway, index }) => {
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY }],
            opacity: animatedValue,
          }
        ]}
      >
        <LinearGradient
          colors={giveaway.gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{giveaway.type.toUpperCase()}</Text>
            </View>
            <Ionicons name="diamond" size={32} color="white" />
          </View>
          
          <View style={styles.prizeSection}>
            <Text style={styles.prizeAmount}>{giveaway.prize}</Text>
            <Text style={styles.prizeCurrency}>{giveaway.currency}</Text>
          </View>

          <View style={styles.countdownSection}>
            <View style={styles.countdownBox}>
              <Ionicons name="time" size={16} color="white" />
              <Text style={styles.countdownText}>
                {formatTimeRemaining(giveaway.endDate)} remaining
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{giveaway.title}</Text>
          <Text style={styles.cardDescription}>{giveaway.description}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.participantsInfo}>
              <Ionicons name="people" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.participantsText}>
                {giveaway.participants.toLocaleString()} participants
              </Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const WinnerCard = ({ winner, index }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: animatedValue,
        }
      ]}
    >
      <LinearGradient
        colors={winner.gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.winnerBadge}>
            <Ionicons name="trophy" size={16} color="#F59E0B" />
            <Text style={styles.winnerBadgeText}>WINNER</Text>
          </View>
          <Ionicons name="trophy" size={32} color="white" />
        </View>
        
        <View style={styles.prizeSection}>
          <Text style={styles.prizeAmount}>{winner.prize}</Text>
          <Text style={styles.prizeCurrency}>{winner.currency}</Text>
        </View>

        <Text style={styles.cardTitle}>{winner.title}</Text>
        
        <View style={styles.winnerInfo}>
          <View style={styles.winnerRow}>
            <Text style={styles.winnerLabel}>Winner:</Text>
            <Text style={styles.winnerValue}>{winner.winner}</Text>
          </View>
          <View style={styles.winnerRow}>
            <Text style={styles.winnerLabel}>Date:</Text>
            <Text style={styles.winnerValue}>{winner.date}</Text>
          </View>
          <View style={styles.winnerRow}>
            <Text style={styles.winnerLabel}>Activities:</Text>
            <Text style={styles.winnerValue}>{winner.activities.toLocaleString()}</Text>
          </View>
          <View style={styles.winnerRow}>
            <Text style={styles.winnerLabel}>CO2 Saved:</Text>
            <Text style={styles.winnerValue}>{winner.co2Saved}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.performanceButton}>
          <Ionicons name="trending-up" size={16} color="white" />
          <Text style={styles.performanceButtonText}>View Performance</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const TabButton = ({ title, isActive, onPress, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={isActive ? '#10B981' : '#6B7280'} 
        style={styles.tabIcon}
      />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'upcoming':
        return (
          <View>
            <Text style={styles.sectionTitle}>Upcoming Reward Selections</Text>
            <Text style={styles.sectionSubtitle}>
              Active selections you can qualify for through eco-challenges
            </Text>
            {upcomingGiveaways.map((giveaway, index) => (
              <UpcomingCard key={giveaway.id} giveaway={giveaway} index={index} />
            ))}
          </View>
        );
      case 'monthly':
        return (
          <View>
            <Text style={styles.sectionTitle}>Monthly Champions</Text>
            <Text style={styles.sectionSubtitle}>
              Celebrating our top eco-skills performers each month
            </Text>
            {monthlyWinners.map((winner, index) => (
              <WinnerCard key={winner.id} winner={winner} index={index} />
            ))}
          </View>
        );
      case 'weekly':
        return (
          <View>
            <Text style={styles.sectionTitle}>Weekly Winners</Text>
            <Text style={styles.sectionSubtitle}>
              Consistent eco-challenge performers earning weekly rewards
            </Text>
            {weeklyWinners.map((winner, index) => (
              <WinnerCard key={winner.id} winner={winner} index={index} />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Skill-Based Crypto Rewards</Text>
            <Text style={styles.headerTitle}>
              Rewards <Text style={styles.headerTitleAccent}>Selections</Text>
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerDescription}>
          Earn qualification entries through verified eco-challenges and skill-based sustainable actions
        </Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton
          title="Upcoming"
          icon="time"
          isActive={activeTab === 'upcoming'}
          onPress={() => setActiveTab('upcoming')}
        />
        <TabButton
          title="Monthly"
          icon="trophy"
          isActive={activeTab === 'monthly'}
          onPress={() => setActiveTab('monthly')}
        />
        <TabButton
          title="Weekly"
          icon="flash"
          isActive={activeTab === 'weekly'}
          onPress={() => setActiveTab('weekly')}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        
        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.ctaCard}
          >
            <Ionicons name="sparkles" size={32} color="white" />
            <Text style={styles.ctaTitle}>Ready to Start Earning?</Text>
            <Text style={styles.ctaDescription}>
              Join our skill-based rewards club and start qualifying for crypto rewards through verified eco-challenges.
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Join Rewards Club</Text>
              <Ionicons name="arrow-forward" size={16} color="#10B981" />
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
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitleAccent: {
    color: '#F59E0B',
  },
  headerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#F0FDF4',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#10B981',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    marginBottom: 20,
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
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  winnerBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  prizeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  prizeAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  prizeCurrency: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  countdownSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 6,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  winnerInfo: {
    marginBottom: 20,
  },
  winnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  winnerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  winnerValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  performanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  performanceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  ctaContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  ctaCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default GiveawaysScreen;

