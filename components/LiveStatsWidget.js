import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { cryptoApi } from '../lib/cryptoApi';
import { activityHelpers } from '../lib/supabase';
import AnimatedCounter from './AnimatedCounter';

const LiveStatsWidget = ({ user, onPress }) => {
  const [stats, setStats] = useState({
    totalUsers: 12847,
    totalActivities: 89234,
    totalCO2Saved: 2847.6,
    totalPoints: 1847293,
    cryptoPrices: {}
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadLiveStats();
    
    // Update every 30 seconds
    const interval = setInterval(loadLiveStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLiveStats = async () => {
    try {
      setLoading(true);
      
      // Load crypto prices
      const { data: cryptoData } = await cryptoApi.getCurrentPrices(['bitcoin', 'ethereum']);
      
      // Simulate growing user stats (in real app, this would come from database)
      const now = new Date();
      const timeDiff = now - lastUpdate;
      const minutesPassed = timeDiff / (1000 * 60);
      
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers + Math.floor(minutesPassed * 0.5), // ~0.5 users per minute
        totalActivities: prevStats.totalActivities + Math.floor(minutesPassed * 2), // ~2 activities per minute
        totalCO2Saved: prevStats.totalCO2Saved + (minutesPassed * 0.1), // ~0.1kg CO2 per minute
        totalPoints: prevStats.totalPoints + Math.floor(minutesPassed * 50), // ~50 points per minute
        cryptoPrices: cryptoData || prevStats.cryptoPrices
      }));
      
      setLastUpdate(now);
    } catch (error) {
      console.error('Error loading live stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatItem = ({ icon, value, label, suffix = '', color = '#10b981' }) => (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statContent}>
        <AnimatedCounter
          value={value}
          suffix={suffix}
          style={[styles.statValue, { color }]}
        />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const CryptoPriceItem = ({ coinId, symbol, color }) => {
    const price = stats.cryptoPrices[coinId];
    if (!price) return null;

    return (
      <View style={styles.cryptoItem}>
        <Text style={[styles.cryptoSymbol, { color }]}>{symbol}</Text>
        <Text style={styles.cryptoPrice}>
          {cryptoApi.formatPrice(price.usd)}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🌍 Live Global Impact</Text>
          {loading && (
            <ActivityIndicator size="small" color="#10b981" style={styles.loadingIndicator} />
          )}
        </View>
        <Text style={styles.subtitle}>Real-time eco-warrior stats</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatItem
          icon="👥"
          value={stats.totalUsers}
          label="Eco Warriors"
          color="#3b82f6"
        />
        
        <StatItem
          icon="✅"
          value={stats.totalActivities}
          label="Activities"
          color="#10b981"
        />
        
        <StatItem
          icon="🌱"
          value={stats.totalCO2Saved}
          label="CO2 Saved (kg)"
          suffix=""
          color="#22c55e"
        />
        
        <StatItem
          icon="⭐"
          value={stats.totalPoints}
          label="Total Points"
          color="#f59e0b"
        />
      </View>

      {/* Live Crypto Prices */}
      <View style={styles.cryptoContainer}>
        <Text style={styles.cryptoTitle}>💰 Live Crypto Prices</Text>
        <View style={styles.cryptoGrid}>
          <CryptoPriceItem
            coinId="bitcoin"
            symbol="BTC"
            color="#f59e0b"
          />
          <CryptoPriceItem
            coinId="ethereum"
            symbol="ETH"
            color="#8b5cf6"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.updateTime}>
          Updated: {lastUpdate.toLocaleTimeString()}
        </Text>
        <Text style={styles.tapHint}>Tap for details →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  cryptoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
    marginBottom: 16,
  },
  cryptoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  cryptoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cryptoItem: {
    alignItems: 'center',
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cryptoPrice: {
    fontSize: 12,
    color: '#d1d5db',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  updateTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  tapHint: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
});

export default LiveStatsWidget;

