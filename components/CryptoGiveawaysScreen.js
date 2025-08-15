import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { cryptoApi, CryptoPriceUpdater } from '../lib/cryptoApi';
import drawSystemAPI, { getNextDraws, getUserDrawEntries, getRecentWinners } from '../lib/drawSystemApi';
import CountdownTimer from './CountdownTimer';
import AnimatedCounter from './AnimatedCounter';

const CryptoGiveawaysScreen = ({ user }) => {
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [prizeValues, setPrizeValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priceUpdater] = useState(new CryptoPriceUpdater(30000)); // 30 second updates
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Draw system state
  const [nextDraws, setNextDraws] = useState({});
  const [userEntries, setUserEntries] = useState({});
  const [recentWinners, setRecentWinners] = useState([]);
  const [drawSystemLoading, setDrawSystemLoading] = useState(true);

  useEffect(() => {
    loadCryptoData();
    loadDrawSystemData();
    startRealTimeUpdates();

    return () => {
      priceUpdater.stop();
    };
  }, []);

  const loadCryptoData = async () => {
    try {
      setLoading(true);
      const { data, error } = await cryptoApi.getGiveawayPrizes();
      
      if (!error && data) {
        setCryptoPrices(data);
        const prizes = cryptoApi.calculatePrizeValues(data);
        setPrizeValues(prizes);
        setLastUpdate(new Date());
      } else {
        console.error('Error loading crypto data:', error);
      }
    } catch (error) {
      console.error('Error in loadCryptoData:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDrawSystemData = async () => {
    try {
      setDrawSystemLoading(true);
      
      // Initialize draw system if needed
      await drawSystemAPI.initializeDraws();
      
      // Load next draws
      const nextDrawsResult = await getNextDraws();
      if (nextDrawsResult.success) {
        setNextDraws(nextDrawsResult.next_draws);
      }
      
      // Load user entries if user is logged in
      if (user?.id) {
        const userEntriesResult = await getUserDrawEntries(user.id);
        if (userEntriesResult.success) {
          setUserEntries(userEntriesResult.user_entries);
        }
      }
      
      // Load recent winners
      const winnersResult = await getRecentWinners();
      if (winnersResult.success) {
        setRecentWinners(winnersResult.recent_winners.slice(0, 5)); // Show top 5
      }
      
    } catch (error) {
      console.error('Error loading draw system data:', error);
    } finally {
      setDrawSystemLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    const unsubscribe = priceUpdater.subscribe((update) => {
      if (update.type === 'price_update') {
        setCryptoPrices(update.data);
        const prizes = cryptoApi.calculatePrizeValues(update.data);
        setPrizeValues(prizes);
        setLastUpdate(new Date());
      } else if (update.type === 'error') {
        console.error('Price update error:', update.error);
      }
    });

    priceUpdater.start();
    return unsubscribe;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCryptoData();
    loadDrawSystemData();
  };

  const shareGiveaway = async (giveawayType) => {
    try {
      let message = '';
      
      switch (giveawayType) {
        case 'weekly':
          message = `🚀 Join MYCO2.app's Weekly Bitcoin Giveaway! 🚀\n\n💰 Win $1,000 worth of Bitcoin every week!\n🌱 Just log eco-friendly activities to enter\n📸 Photo verification gives you 2x entries!\n\nDownload MYCO2.app and start earning crypto while saving the planet! 🌍\n\n#MYCO2app #Bitcoin #EcoWarrior #CryptoGiveaway`;
          break;
        case 'monthly':
          message = `🎉 MASSIVE Monthly Ethereum Giveaway on MYCO2.app! 🎉\n\n💎 Win $5,000 worth of Ethereum every month!\n🏆 Top eco-warriors compete for the ultimate prize\n🌱 Every green action gets you closer to winning!\n\nJoin the eco-crypto revolution now! 🚀\n\n#MYCO2app #Ethereum #ClimateAction #CryptoRewards`;
          break;
        case 'mega':
          message = `🔥 ULTIMATE $100K Crypto Championship on MYCO2.app! 🔥\n\n💰 $100,000 in mixed cryptocurrency prizes!\n🌍 The biggest eco-crypto giveaway ever!\n🏆 Prove you're the ultimate Planet Saver!\n\nThis is your chance to win life-changing crypto while saving the Earth! 🌱\n\n#MYCO2app #CryptoChampionship #PlanetSaver #100K`;
          break;
      }

      await Share.share({
        message: message,
        title: 'MYCO2.app Crypto Giveaway',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getNextDrawDate = (type) => {
    const now = new Date();
    let nextDraw = new Date();

    switch (type) {
      case 'weekly':
        // Next Sunday at 8 PM UTC
        nextDraw.setDate(now.getDate() + (7 - now.getDay()));
        nextDraw.setHours(20, 0, 0, 0);
        if (nextDraw <= now) {
          nextDraw.setDate(nextDraw.getDate() + 7);
        }
        break;
      case 'monthly':
        // Last day of current month at 8 PM UTC
        nextDraw = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        nextDraw.setHours(20, 0, 0, 0);
        if (nextDraw <= now) {
          nextDraw = new Date(now.getFullYear(), now.getMonth() + 2, 0);
          nextDraw.setHours(20, 0, 0, 0);
        }
        break;
      case 'mega':
        // December 31st at 8 PM UTC
        nextDraw = new Date(now.getFullYear(), 11, 31);
        nextDraw.setHours(20, 0, 0, 0);
        if (nextDraw <= now) {
          nextDraw = new Date(now.getFullYear() + 1, 11, 31);
          nextDraw.setHours(20, 0, 0, 0);
        }
        break;
    }

    return nextDraw;
  };

  const CryptoPriceCard = ({ coinId, coinName, symbol }) => {
    const price = cryptoPrices[coinId];
    if (!price) return null;

    const change = cryptoApi.formatPercentageChange(price.usd_24h_change || 0);

    return (
      <View style={styles.priceCard}>
        <View style={styles.priceHeader}>
          <Text style={styles.coinSymbol}>{symbol}</Text>
          <Text style={styles.coinName}>{coinName}</Text>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.priceValue}>
            {cryptoApi.formatPrice(price.usd)}
          </Text>
          <Text style={[
            styles.priceChange,
            { color: change.isPositive ? '#10b981' : '#ef4444' }
          ]}>
            {change.display}
          </Text>
        </View>
      </View>
    );
  };

  const GiveawayCard = ({ 
    title, 
    subtitle, 
    prizeAmount, 
    cryptoAmount, 
    cryptoSymbol, 
    frequency, 
    type,
    backgroundColor,
    accentColor 
  }) => (
    <View style={[styles.giveawayCard, { backgroundColor }]}>
      <View style={styles.giveawayHeader}>
        <Text style={styles.giveawayTitle}>{title}</Text>
        <Text style={styles.giveawaySubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.prizeContainer}>
        <Text style={styles.prizeLabel}>Prize Pool</Text>
        <View style={styles.prizeAmount}>
          <AnimatedCounter
            value={prizeAmount}
            prefix="$"
            style={[styles.prizeValue, { color: accentColor }]}
          />
          <Text style={styles.prizeUsd}>USD</Text>
        </View>
        {cryptoAmount && (
          <Text style={styles.cryptoAmount}>
            ≈ {cryptoAmount.toFixed(4)} {cryptoSymbol}
          </Text>
        )}
      </View>

      <View style={styles.countdownContainer}>
        <Text style={styles.countdownLabel}>Next Selection In:</Text>
        <CountdownTimer
          targetDate={getNextDrawDate(type)}
          style={styles.countdown}
          textStyle={styles.countdownText}
        />
      </View>

      <View style={styles.giveawayActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: accentColor }]}
          onPress={() => Alert.alert(
            'How to Earn Entries',
            `To earn entries for the ${title}:\n\n• Complete skill-based eco-activities daily\n• Photo verification gives 2x entries\n• Higher points = more entries\n• Stay active to maintain eligibility\n\nThis is a skill-based promotional contest, not a game of chance! 🌱`
          )}
        >
          <Text style={styles.actionButtonText}>How to Earn Entries</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => shareGiveaway(type)}
        >
          <Text style={styles.shareButtonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading crypto giveaways...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Rewards Selection Program</Text>
        <Text style={styles.subtitle}>Skill-Based Eco-Challenges Rewards Club</Text>
        <Text style={styles.disclaimer}>
          Earn entries through verified eco-activities • Not a game of chance
        </Text>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Live Crypto Prices */}
        <View style={styles.pricesContainer}>
          <Text style={styles.sectionTitle}>🔴 Live Crypto Prices</Text>
          <View style={styles.pricesGrid}>
            <CryptoPriceCard
              coinId="bitcoin"
              coinName="Bitcoin"
              symbol="BTC"
            />
            <CryptoPriceCard
              coinId="ethereum"
              coinName="Ethereum"
              symbol="ETH"
            />
          </View>
        </View>

        {/* Active Giveaways */}
        <View style={styles.giveawaysContainer}>
          <Text style={styles.sectionTitle}>🏆 Active Rewards Selections</Text>

          {/* Weekly Bitcoin Giveaway */}
          <GiveawayCard
            title="Weekly Bitcoin Rewards Selection"
            subtitle="Every Sunday at 8 PM UTC"
            prizeAmount={prizeValues.weekly?.usdValue || 1000}
            cryptoAmount={prizeValues.weekly?.bitcoin?.amount}
            cryptoSymbol="BTC"
            frequency="Weekly"
            type="weekly"
            backgroundColor="#1f2937"
            accentColor="#f59e0b"
          />

          {/* Monthly Ethereum Giveaway */}
          <GiveawayCard
            title="Monthly Ethereum Rewards Selection"
            subtitle="Last day of every month"
            prizeAmount={prizeValues.monthly?.usdValue || 5000}
            cryptoAmount={prizeValues.monthly?.ethereum?.amount}
            cryptoSymbol="ETH"
            frequency="Monthly"
            type="monthly"
            backgroundColor="#1f2937"
            accentColor="#8b5cf6"
          />

          {/* Mega Championship */}
          <GiveawayCard
            title="Mega Championship"
            subtitle="Ultimate eco-warrior prize"
            prizeAmount={prizeValues.mega?.usdValue || 100000}
            cryptoAmount={null}
            cryptoSymbol="Mixed"
            frequency="Annual"
            type="mega"
            backgroundColor="#1f2937"
            accentColor="#10b981"
          />
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.sectionTitle}>❓ How It Works</Text>
          
          <View style={styles.stepCard}>
            <Text style={styles.stepIcon}>1️⃣</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Log Eco Activities</Text>
              <Text style={styles.stepDescription}>
                Track your eco-friendly actions like walking, recycling, or eating plant-based meals
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepIcon}>2️⃣</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn Entries</Text>
              <Text style={styles.stepDescription}>
                Each activity gives you entries. Photo verification doubles your entries!
              </Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepIcon}>3️⃣</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Win Crypto</Text>
              <Text style={styles.stepDescription}>
                Higher points = better chances. Winners are selected randomly based on activity level
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.sectionTitle}>📋 Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Must be 18+ to participate{'\n'}
            • Minimum 10 activities logged to be eligible{'\n'}
            • Photo verification increases winning chances{'\n'}
            • Winners announced via app notifications{'\n'}
            • Crypto prizes sent to verified wallets only{'\n'}
            • Subject to local regulations and laws
          </Text>
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
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#d1d5db',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#d1d5db',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  pricesContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  pricesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  priceHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  coinSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  coinName: {
    fontSize: 12,
    color: '#9ca3af',
  },
  priceInfo: {
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  giveawaysContainer: {
    marginBottom: 20,
  },
  giveawayCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  giveawayHeader: {
    marginBottom: 16,
  },
  giveawayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  giveawaySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  prizeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
  },
  prizeLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  prizeAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  prizeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  prizeUsd: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  cryptoAmount: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  countdown: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countdownText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  giveawayActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#374151',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  howItWorksContainer: {
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  termsContainer: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
});

export default CryptoGiveawaysScreen;

