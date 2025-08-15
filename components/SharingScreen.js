import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { subscriptionHelpers } from '../lib/subscriptionHelpers';
import AnimatedCounter from './AnimatedCounter';

const SharingScreen = ({ user, onStatsUpdate }) => {
  const [sharingActivities, setSharingActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    loadSharingData();
  }, [user]);

  const loadSharingData = async () => {
    try {
      setLoading(true);
      
      // Load sharing activities
      const { data: activities, error: activitiesError } = await subscriptionHelpers.getSharingActivities(user.id);
      if (activitiesError) throw activitiesError;
      setSharingActivities(activities || []);

      // Load user subscription
      const { data: subscription, error: subError } = await subscriptionHelpers.getUserSubscription(user.id);
      if (subError) throw subError;
      setUserSubscription(subscription);
      
    } catch (error) {
      console.error('Error loading sharing data:', error);
      Alert.alert('Error', 'Failed to load sharing information');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform, contentType = 'general') => {
    try {
      setSharing(true);
      
      const shareMessages = {
        general: "🌱 I'm saving the planet and earning crypto with MYCO2.app! Join me in the eco-revolution and win Bitcoin & Ethereum prizes! #MYCO2app #EcoWarrior #CryptoRewards",
        achievement: "🏆 Just unlocked a new achievement on MYCO2.app! Every eco-activity counts towards crypto prizes. Join the green revolution! #MYCO2app #Achievement",
        activity: "🌍 Just logged another eco-activity on MYCO2.app! Walking, recycling, plant-based meals - every action earns crypto rewards! #MYCO2app #EcoActivity",
        leaderboard: "📊 Climbing the MYCO2.app leaderboard! Competing with eco-warriors worldwide for Bitcoin & Ethereum prizes! #MYCO2app #Leaderboard"
      };

      const message = shareMessages[contentType] || shareMessages.general;
      
      // Use React Native's Share API
      const result = await Share.share({
        message: message,
        title: 'MYCO2.app - Eco-Crypto Revolution',
        url: 'https://myco2.app' // Replace with your actual app URL
      });

      if (result.action === Share.sharedAction) {
        // Add sharing points
        const { points, error } = await subscriptionHelpers.addSharingPoints(
          user.id,
          platform,
          contentType
        );
        
        if (error) throw error;
        
        Alert.alert(
          'Shared Successfully! 🎉',
          `You earned ${points} point${points !== 1 ? 's' : ''} for sharing!`,
          [{ text: 'Awesome!', onPress: () => {
            loadSharingData();
            if (onStatsUpdate) onStatsUpdate();
          }}]
        );
      }
      
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to record sharing activity');
    } finally {
      setSharing(false);
    }
  };

  const SharingPlatformCard = ({ platform }) => (
    <TouchableOpacity
      style={[styles.platformCard, { borderColor: platform.color }]}
      onPress={() => handleShare(platform.id)}
      disabled={sharing}
    >
      <Text style={styles.platformEmoji}>{platform.emoji}</Text>
      <Text style={styles.platformName}>{platform.name}</Text>
      <Text style={styles.platformPoints}>+1 point</Text>
      <View style={[styles.shareButton, { backgroundColor: platform.color }]}>
        <Text style={styles.shareButtonText}>Share</Text>
      </View>
    </TouchableOpacity>
  );

  const ContentTypeCard = ({ title, description, contentType, emoji }) => (
    <View style={styles.contentCard}>
      <Text style={styles.contentEmoji}>{emoji}</Text>
      <Text style={styles.contentTitle}>{title}</Text>
      <Text style={styles.contentDescription}>{description}</Text>
      
      <View style={styles.quickShareButtons}>
        {subscriptionHelpers.getSharingPlatforms().slice(0, 3).map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[styles.quickShareButton, { backgroundColor: platform.color }]}
            onPress={() => handleShare(platform.id, contentType)}
            disabled={sharing}
          >
            <Text style={styles.quickShareEmoji}>{platform.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const RecentSharingActivity = ({ activity }) => {
    const platform = subscriptionHelpers.getSharingPlatforms().find(p => p.id === activity.platform);
    const timeAgo = new Date(activity.shared_at).toLocaleDateString();
    
    return (
      <View style={styles.activityItem}>
        <Text style={styles.activityEmoji}>{platform?.emoji || '📱'}</Text>
        <View style={styles.activityDetails}>
          <Text style={styles.activityPlatform}>{platform?.name || activity.platform}</Text>
          <Text style={styles.activityDate}>{timeAgo}</Text>
        </View>
        <Text style={styles.activityPoints}>+{activity.points_earned}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading sharing options...</Text>
      </View>
    );
  }

  const isEcoWarrior = userSubscription?.subscription_plans?.name === 'eco_warrior';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📱 Social Sharing</Text>
          <Text style={styles.subtitle}>
            {isEcoWarrior 
              ? 'Your main way to earn points! Share and inspire others.'
              : 'Earn bonus points by sharing your eco-journey!'
            }
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sharing Points</Text>
            <AnimatedCounter
              value={userSubscription?.sharing_points || 0}
              style={styles.statValue}
            />
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Times Shared</Text>
            <AnimatedCounter
              value={sharingActivities.length}
              style={styles.statValue}
            />
          </View>
        </View>

        {/* Eco Warrior Special Message */}
        {isEcoWarrior && (
          <View style={styles.ecoWarriorCard}>
            <Text style={styles.ecoWarriorEmoji}>🌱</Text>
            <Text style={styles.ecoWarriorTitle}>Eco Warrior - Free Tier</Text>
            <Text style={styles.ecoWarriorText}>
              As an Eco Warrior, sharing is your superpower! Earn points by spreading the eco-revolution. 
              Upgrade to Green Champion or Planet Saver to earn points from activities too!
            </Text>
          </View>
        )}

        {/* Quick Share Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Quick Share Content</Text>
          
          <ContentTypeCard
            emoji="🌍"
            title="General App Share"
            description="Share the MYCO2.app mission and invite friends to join"
            contentType="general"
          />
          
          <ContentTypeCard
            emoji="🏆"
            title="Achievement Share"
            description="Celebrate your eco-achievements and inspire others"
            contentType="achievement"
          />
          
          <ContentTypeCard
            emoji="📊"
            title="Leaderboard Share"
            description="Show off your ranking and challenge friends"
            contentType="leaderboard"
          />
        </View>

        {/* All Platforms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Share on All Platforms</Text>
          <View style={styles.platformsGrid}>
            {subscriptionHelpers.getSharingPlatforms().map((platform) => (
              <SharingPlatformCard key={platform.id} platform={platform} />
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Recent Sharing Activity</Text>
          {sharingActivities.length > 0 ? (
            <View style={styles.activityList}>
              {sharingActivities.slice(0, 10).map((activity) => (
                <RecentSharingActivity key={activity.id} activity={activity} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📱</Text>
              <Text style={styles.emptyTitle}>No sharing activity yet</Text>
              <Text style={styles.emptyText}>
                Start sharing to earn your first points and help spread the eco-revolution!
              </Text>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Sharing Tips</Text>
          <Text style={styles.tipsText}>
            • Share regularly to maximize your points{'\n'}
            • Use relevant hashtags: #MYCO2app #EcoWarrior{'\n'}
            • Tag friends to invite them to join{'\n'}
            • Share achievements to inspire others{'\n'}
            • Each share earns you 1 point = 1 prize ticket
          </Text>
        </View>
      </ScrollView>

      {sharing && (
        <View style={styles.sharingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.sharingText}>Recording share...</Text>
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  ecoWarriorCard: {
    backgroundColor: '#0f1419',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
  },
  ecoWarriorEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  ecoWarriorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  ecoWarriorText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  contentEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  quickShareButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickShareEmoji: {
    fontSize: 18,
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
  },
  platformEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  platformName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  platformPoints: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 12,
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityList: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityPlatform: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  activityDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  emptyState: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#374151',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  sharingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
});

export default SharingScreen;

