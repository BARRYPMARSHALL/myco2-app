import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { revenueHelpers } from '../lib/stripeConfig';
import AnimatedCounter from './AnimatedCounter';

const RevenueTrackingScreen = ({ user, onNavigate }) => {
  const [revenueStats, setRevenueStats] = useState(null);
  const [prizePool, setPrizePool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadRevenueData();
  }, [selectedPeriod]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      
      // Load revenue statistics
      const { success: statsSuccess, stats } = await revenueHelpers.getRevenueStats(selectedPeriod);
      if (statsSuccess) {
        setRevenueStats(stats);
      }

      // Load prize pool information
      const { success: prizeSuccess, prizePool: prizeData } = await revenueHelpers.getPrizePoolAmount();
      if (prizeSuccess) {
        setPrizePool(prizeData);
      }
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRevenueData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, icon, color, prefix = '$' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={styles.statContent}>
        <AnimatedCounter
          value={value || 0}
          prefix={prefix}
          style={[styles.statValue, { color }]}
        />
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const AllocationCard = ({ title, amount, percentage, color, description }) => (
    <View style={styles.allocationCard}>
      <View style={styles.allocationHeader}>
        <Text style={styles.allocationTitle}>{title}</Text>
        <Text style={[styles.allocationPercentage, { color }]}>{percentage}%</Text>
      </View>
      <AnimatedCounter
        value={amount || 0}
        prefix="$"
        style={[styles.allocationAmount, { color }]}
      />
      <Text style={styles.allocationDescription}>{description}</Text>
    </View>
  );

  if (loading && !revenueStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading revenue data...</Text>
      </View>
    );
  }

  const allocation = revenueStats ? revenueHelpers.calculateRevenueAllocation(revenueStats.totalRevenue || 0) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💰 Revenue Analytics</Text>
        <Text style={styles.subtitle}>MYCO2.app Financial Dashboard</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Revenue Overview</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Revenue"
              value={revenueStats?.totalRevenue || 0}
              subtitle={`This ${selectedPeriod}`}
              icon="cash"
              color="#10b981"
            />
            
            <StatCard
              title="Active Subscribers"
              value={revenueStats?.activeSubscribers || 0}
              subtitle="Paying users"
              icon="people"
              color="#3b82f6"
              prefix=""
            />
            
            <StatCard
              title="Monthly Growth"
              value={revenueStats?.growthRate || 0}
              subtitle="Revenue increase"
              icon="trending-up"
              color="#f59e0b"
              prefix=""
            />
            
            <StatCard
              title="Churn Rate"
              value={revenueStats?.churnRate || 0}
              subtitle="Monthly cancellations"
              icon="trending-down"
              color="#ef4444"
              prefix=""
            />
          </View>
        </View>

        {/* Revenue Allocation */}
        {allocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Revenue Allocation</Text>
            
            <View style={styles.allocationGrid}>
              <AllocationCard
                title="Prize Pool"
                amount={allocation.prizes}
                percentage={50}
                color="#f59e0b"
                description="Weekly & monthly crypto rewards"
              />
              
              <AllocationCard
                title="Charity Donations"
                amount={allocation.charity}
                percentage={10}
                color="#10b981"
                description="Environmental organizations"
              />
              
              <AllocationCard
                title="Operations"
                amount={allocation.operating}
                percentage={40}
                color="#6366f1"
                description="Development & maintenance"
              />
            </View>
          </View>
        )}

        {/* Prize Pool Status */}
        {prizePool && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Prize Pool Status</Text>
            
            <View style={styles.prizePoolContainer}>
              <View style={styles.prizePoolCard}>
                <Text style={styles.prizePoolTitle}>Total Prize Pool</Text>
                <AnimatedCounter
                  value={prizePool.prizePool}
                  prefix="$"
                  style={styles.prizePoolAmount}
                />
                <Text style={styles.prizePoolSubtitle}>Available for rewards</Text>
              </View>
              
              <View style={styles.prizeBreakdown}>
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeLabel}>Weekly Bitcoin Prize</Text>
                  <Text style={styles.prizeValue}>${prizePool.weeklyPrize.toLocaleString()}</Text>
                </View>
                
                <View style={styles.prizeItem}>
                  <Text style={styles.prizeLabel}>Monthly Ethereum Prize</Text>
                  <Text style={styles.prizeValue}>${prizePool.monthlyPrize.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Subscription Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Subscription Breakdown</Text>
          
          <View style={styles.subscriptionBreakdown}>
            <View style={styles.subscriptionItem}>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionPlan}>Green Champion</Text>
                <Text style={styles.subscriptionPrice}>$9.99/month</Text>
              </View>
              <View style={styles.subscriptionStats}>
                <Text style={styles.subscriptionCount}>
                  {revenueStats?.greenChampionCount || 0} subscribers
                </Text>
                <Text style={styles.subscriptionRevenue}>
                  ${((revenueStats?.greenChampionCount || 0) * 9.99).toLocaleString()}/month
                </Text>
              </View>
            </View>
            
            <View style={styles.subscriptionItem}>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionPlan}>Planet Saver</Text>
                <Text style={styles.subscriptionPrice}>$19.99/month</Text>
              </View>
              <View style={styles.subscriptionStats}>
                <Text style={styles.subscriptionCount}>
                  {revenueStats?.planetSaverCount || 0} subscribers
                </Text>
                <Text style={styles.subscriptionRevenue}>
                  ${((revenueStats?.planetSaverCount || 0) * 19.99).toLocaleString()}/month
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onNavigate && onNavigate('subscription')}
            >
              <Ionicons name="card" size={24} color="#10b981" />
              <Text style={styles.actionButtonText}>Manage Subscriptions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onNavigate && onNavigate('giveaways')}
            >
              <Ionicons name="gift" size={24} color="#f59e0b" />
              <Text style={styles.actionButtonText}>View Prize Draws</Text>
            </TouchableOpacity>
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#10b981',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
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
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '500',
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  allocationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  allocationCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '31%',
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allocationTitle: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '600',
  },
  allocationPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  allocationAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  allocationDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  prizePoolContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
  },
  prizePoolCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  prizePoolTitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 8,
  },
  prizePoolAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  prizePoolSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  prizeBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  prizeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prizeLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  prizeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  subscriptionBreakdown: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#10b981',
  },
  subscriptionStats: {
    alignItems: 'flex-end',
  },
  subscriptionCount: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
  },
  subscriptionRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
  },
  actionButtonText: {
    fontSize: 14,
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RevenueTrackingScreen;

