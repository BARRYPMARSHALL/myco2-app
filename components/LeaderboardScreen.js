import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { activityHelpers } from '../lib/supabase';
import AnimatedCounter from './AnimatedCounter';

const LeaderboardScreen = ({ user }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const [selectedMetric, setSelectedMetric] = useState('points');
  const [globalStats, setGlobalStats] = useState({
    total_users: 0,
    total_co2_saved: 0,
    total_activities: 0,
    total_points: 0
  });

  useEffect(() => {
    loadLeaderboard();
    loadGlobalStats();
  }, [selectedPeriod, selectedMetric]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await activityHelpers.getLeaderboard(selectedMetric, selectedPeriod, 50);
      
      if (error) {
        Alert.alert('Error', 'Failed to load leaderboard');
        console.error('Leaderboard error:', error);
      } else {
        setLeaderboardData(data || []);
        
        // Find current user's rank
        const currentUserRank = data?.findIndex(item => item.user_id === user.id) + 1;
        setUserRank(currentUserRank > 0 ? currentUserRank : null);
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
      Alert.alert('Error', 'Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadGlobalStats = async () => {
    try {
      const { data, error } = await activityHelpers.getGlobalStats();
      if (error) {
        console.error('Global stats error:', error);
      } else {
        setGlobalStats(data || {
          total_users: 0,
          total_co2_saved: 0,
          total_activities: 0,
          total_points: 0
        });
      }
    } catch (error) {
      console.error('Global stats error:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
    loadGlobalStats();
  };

  const formatValue = (value, metric) => {
    if (metric === 'points') {
      return Math.round(value).toLocaleString();
    } else if (metric === 'co2_saved') {
      return `${parseFloat(value).toFixed(2)} kg`;
    } else if (metric === 'activities') {
      return Math.round(value).toString();
    }
    return value.toString();
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'points': return '⭐';
      case 'co2_saved': return '🌱';
      case 'activities': return '✅';
      default: return '🏆';
    }
  };

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'points': return 'Points';
      case 'co2_saved': return 'CO2 Saved';
      case 'activities': return 'Activities';
      default: return 'Score';
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all_time': return 'All Time';
      default: return 'All Time';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#10b981';
    }
  };

  const getMembershipBadge = (points) => {
    if (points >= 10000) return { emoji: '🌍', name: 'Planet Saver', color: '#8b5cf6' };
    if (points >= 5000) return { emoji: '🏆', name: 'Green Champion', color: '#059669' };
    if (points >= 1000) return { emoji: '⭐', name: 'Eco Warrior', color: '#3b82f6' };
    return { emoji: '🌱', name: 'Eco Starter', color: '#6b7280' };
  };

  const PeriodButton = ({ period, label, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const MetricButton = ({ metric, label, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.metricButton, isActive && styles.metricButtonActive]}
      onPress={onPress}
    >
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={[styles.metricButtonText, isActive && styles.metricButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, suffix = '', icon, color }) => (
    <View style={[styles.globalStatCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={[styles.statIcon, { color }]}>{icon}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <AnimatedCounter 
        value={value} 
        suffix={suffix}
        style={[styles.statValue, { color }]}
      />
    </View>
  );

  const LeaderboardItem = ({ item, rank, isCurrentUser }) => {
    const membershipBadge = getMembershipBadge(item.total_points || 0);
    
    return (
      <View style={[styles.leaderboardItem, isCurrentUser && styles.currentUserItem]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
            {getRankIcon(rank)}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: membershipBadge.color }]}>
            <Text style={styles.avatarText}>
              {item.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, isCurrentUser && styles.currentUsername]}>
              {item.username || `User ${item.user_id.slice(0, 8)}`}
              {isCurrentUser && ' (You)'}
            </Text>
            <View style={styles.membershipBadge}>
              <Text style={styles.membershipEmoji}>{membershipBadge.emoji}</Text>
              <Text style={[styles.membershipText, { color: membershipBadge.color }]}>
                {membershipBadge.name}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.scoreContainer}>
          <AnimatedCounter
            value={selectedMetric === 'points' ? item.total_points :
                   selectedMetric === 'co2_saved' ? parseFloat(item.total_co2_saved) :
                   item.total_activities}
            suffix={selectedMetric === 'co2_saved' ? ' kg' : ''}
            style={[styles.scoreText, { color: getRankColor(rank) }]}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>See how you rank among eco-warriors!</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Global Impact Stats */}
        <View style={styles.globalStatsContainer}>
          <Text style={styles.sectionTitle}>Global Impact</Text>
          <View style={styles.globalStatsGrid}>
            <StatCard
              title="Total Users"
              value={globalStats.total_users}
              icon="👥"
              color="#8b5cf6"
            />
            <StatCard
              title="CO2 Saved"
              value={parseFloat(globalStats.total_co2_saved)}
              suffix=" kg"
              icon="🌱"
              color="#10b981"
            />
            <StatCard
              title="Activities"
              value={globalStats.total_activities}
              icon="✅"
              color="#3b82f6"
            />
            <StatCard
              title="Total Points"
              value={globalStats.total_points}
              icon="⭐"
              color="#f59e0b"
            />
          </View>
        </View>

        {/* User Rank Card */}
        {userRank && (
          <View style={styles.userRankCard}>
            <Text style={styles.userRankTitle}>Your Rank</Text>
            <View style={styles.userRankContent}>
              <Text style={styles.userRankNumber}>#{userRank}</Text>
              <View style={styles.userRankInfo}>
                <Text style={styles.userRankLabel}>out of {leaderboardData.length} eco-warriors</Text>
                <Text style={styles.userRankMetric}>
                  {getMetricIcon(selectedMetric)} {getMetricLabel(selectedMetric)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Period Filter */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Time Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <PeriodButton
              period="today"
              label="Today"
              isActive={selectedPeriod === 'today'}
              onPress={() => setSelectedPeriod('today')}
            />
            <PeriodButton
              period="week"
              label="This Week"
              isActive={selectedPeriod === 'week'}
              onPress={() => setSelectedPeriod('week')}
            />
            <PeriodButton
              period="month"
              label="This Month"
              isActive={selectedPeriod === 'month'}
              onPress={() => setSelectedPeriod('month')}
            />
            <PeriodButton
              period="all_time"
              label="All Time"
              isActive={selectedPeriod === 'all_time'}
              onPress={() => setSelectedPeriod('all_time')}
            />
          </ScrollView>
        </View>

        {/* Metric Filter */}
        <View style={styles.metricsContainer}>
          <Text style={styles.filterTitle}>Ranking By</Text>
          <View style={styles.metricsGrid}>
            <MetricButton
              metric="points"
              label="Points"
              icon="⭐"
              isActive={selectedMetric === 'points'}
              onPress={() => setSelectedMetric('points')}
            />
            <MetricButton
              metric="co2_saved"
              label="CO2 Saved"
              icon="🌱"
              isActive={selectedMetric === 'co2_saved'}
              onPress={() => setSelectedMetric('co2_saved')}
            />
            <MetricButton
              metric="activities"
              label="Activities"
              icon="✅"
              isActive={selectedMetric === 'activities'}
              onPress={() => setSelectedMetric('activities')}
            />
          </View>
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>
            Top Eco-Warriors - {getPeriodLabel(selectedPeriod)}
          </Text>
          <Text style={styles.leaderboardSubtitle}>
            Ranked by {getMetricLabel(selectedMetric).toLowerCase()}
          </Text>

          {leaderboardData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptyText}>
                Be the first to log activities and appear on the leaderboard!
              </Text>
            </View>
          ) : (
            leaderboardData.map((item, index) => (
              <LeaderboardItem
                key={item.user_id}
                item={item}
                rank={index + 1}
                isCurrentUser={item.user_id === user.id}
              />
            ))
          )}
        </View>

        {/* Rewards Info */}
        <View style={styles.rewardsInfoContainer}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard Rewards</Text>
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardTitle}>Weekly Champions</Text>
              <Text style={styles.rewardAmount}>$1,000 Bitcoin</Text>
            </View>
            <Text style={styles.rewardDescription}>
              Top performer each week wins crypto rewards
            </Text>
          </View>
          
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardTitle}>Monthly Champions</Text>
              <Text style={styles.rewardAmount}>$5,000 Ethereum</Text>
            </View>
            <Text style={styles.rewardDescription}>
              Monthly leaderboard winner gets premium crypto prizes
            </Text>
          </View>
          
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardTitle}>Mega Championship</Text>
              <Text style={styles.rewardAmount}>$100,000 Mixed Crypto</Text>
            </View>
            <Text style={styles.rewardDescription}>
              Ultimate eco-warrior championship with massive rewards
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  globalStatsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  globalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  globalStatCard: {
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
  userRankCard: {
    backgroundColor: '#1f2937',
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  userRankTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
    fontWeight: '600',
  },
  userRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginRight: 16,
  },
  userRankInfo: {
    flex: 1,
  },
  userRankLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  userRankMetric: {
    fontSize: 14,
    color: '#9ca3af',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
  },
  filterButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricButton: {
    backgroundColor: '#374151',
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricButtonActive: {
    backgroundColor: '#10b981',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricButtonText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  metricButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  leaderboardContainer: {
    marginBottom: 30,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  leaderboardItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#1f2937',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  currentUsername: {
    color: '#10b981',
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  rewardsInfoContainer: {
    marginBottom: 30,
  },
  rewardCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default LeaderboardScreen;

