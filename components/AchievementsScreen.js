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
  Share,
} from 'react-native';
import { achievementHelpers, activityHelpers } from '../lib/supabase';
import AnimatedCounter from './AnimatedCounter';

const AchievementsScreen = ({ user }) => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    totalCO2Saved: 0,
    totalActivities: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await Promise.all([
        loadAchievements(),
        loadUserAchievements(),
        loadUserStats()
      ]);
    } catch (error) {
      console.error('Error loading achievements data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const { data, error } = await achievementHelpers.getAchievements();
      if (error) {
        console.error('Achievements error:', error);
      } else {
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Load achievements error:', error);
    }
  };

  const loadUserAchievements = async () => {
    try {
      // This would need to be implemented in the database helpers
      // For now, we'll simulate based on user stats
      setUserAchievements([]);
    } catch (error) {
      console.error('Load user achievements error:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data, error } = await activityHelpers.getUserStats(user.id);
      if (error) {
        console.error('Stats error:', error);
      } else {
        setUserStats(data || {
          totalPoints: 0,
          totalCO2Saved: 0,
          totalActivities: 0
        });
      }
    } catch (error) {
      console.error('Load user stats error:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getAchievementProgress = (achievement) => {
    const stats = userStats;
    
    if (achievement.points_required) {
      return Math.min(100, (stats.totalPoints / achievement.points_required) * 100);
    }
    if (achievement.activities_required) {
      return Math.min(100, (stats.totalActivities / achievement.activities_required) * 100);
    }
    if (achievement.co2_required) {
      return Math.min(100, (parseFloat(stats.totalCO2Saved) / achievement.co2_required) * 100);
    }
    
    return 0;
  };

  const isAchievementUnlocked = (achievement) => {
    const progress = getAchievementProgress(achievement);
    return progress >= 100;
  };

  const getAchievementIcon = (achievementName) => {
    const icons = {
      'First Steps': '👶',
      'Getting Started': '🌱',
      'Eco Warrior': '⚔️',
      'Green Champion': '🏆',
      'Planet Saver': '🌍',
      'Carbon Crusher': '💪',
      'Sustainability Star': '⭐',
      'Environmental Hero': '🦸',
      'Climate Champion': '🌡️',
      'Green Guardian': '🛡️',
      'Eco Explorer': '🔍',
      'Nature Lover': '🌿',
      'Photo Verified': '📸',
      'Community Builder': '👥',
      'Streak Master': '🔥'
    };
    return icons[achievementName] || '🏅';
  };

  const getAchievementCategory = (achievement) => {
    if (achievement.points_required) return 'points';
    if (achievement.activities_required) return 'activities';
    if (achievement.co2_required) return 'environmental';
    return 'special';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'all': '🏆',
      'points': '⭐',
      'activities': '✅',
      'environmental': '🌱',
      'special': '🎯'
    };
    return icons[category] || '🏅';
  };

  const getCategoryName = (category) => {
    const names = {
      'all': 'All',
      'points': 'Points',
      'activities': 'Activities',
      'environmental': 'Environmental',
      'special': 'Special'
    };
    return names[category] || 'Unknown';
  };

  const shareAchievement = async (achievement) => {
    try {
      const message = `🎉 I just unlocked the "${achievement.name}" achievement on MYCO2.app! 🌱\n\n${achievement.description}\n\nJoin me in making a positive environmental impact! #MYCO2app #EcoWarrior #ClimateAction`;
      
      await Share.share({
        message: message,
        title: `Achievement Unlocked: ${achievement.name}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getMembershipLevel = (points) => {
    if (points >= 10000) return { name: 'Planet Saver', emoji: '🌍', color: '#8b5cf6', nextLevel: null, nextPoints: null };
    if (points >= 5000) return { name: 'Green Champion', emoji: '🏆', color: '#059669', nextLevel: 'Planet Saver', nextPoints: 10000 };
    if (points >= 1000) return { name: 'Eco Warrior', emoji: '⭐', color: '#3b82f6', nextLevel: 'Green Champion', nextPoints: 5000 };
    return { name: 'Eco Starter', emoji: '🌱', color: '#6b7280', nextLevel: 'Eco Warrior', nextPoints: 1000 };
  };

  const membership = getMembershipLevel(userStats.totalPoints);

  // Create default achievements if none exist
  const defaultAchievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Log your first eco-friendly activity',
      icon: '👶',
      activities_required: 1,
      category: 'activities'
    },
    {
      id: 2,
      name: 'Getting Started',
      description: 'Complete 5 eco-friendly activities',
      icon: '🌱',
      activities_required: 5,
      category: 'activities'
    },
    {
      id: 3,
      name: 'Eco Warrior',
      description: 'Earn 1,000 points',
      icon: '⚔️',
      points_required: 1000,
      category: 'points'
    },
    {
      id: 4,
      name: 'Green Champion',
      description: 'Earn 5,000 points',
      icon: '🏆',
      points_required: 5000,
      category: 'points'
    },
    {
      id: 5,
      name: 'Planet Saver',
      description: 'Earn 10,000 points',
      icon: '🌍',
      points_required: 10000,
      category: 'points'
    },
    {
      id: 6,
      name: 'Carbon Crusher',
      description: 'Save 50kg of CO2',
      icon: '💪',
      co2_required: 50,
      category: 'environmental'
    },
    {
      id: 7,
      name: 'Climate Champion',
      description: 'Save 100kg of CO2',
      icon: '🌡️',
      co2_required: 100,
      category: 'environmental'
    },
    {
      id: 8,
      name: 'Photo Verified',
      description: 'Upload your first photo verification',
      icon: '📸',
      activities_required: 1,
      category: 'special'
    }
  ];

  const achievementsToShow = achievements.length > 0 ? achievements : defaultAchievements;
  const filteredAchievements = selectedCategory === 'all' 
    ? achievementsToShow 
    : achievementsToShow.filter(a => getAchievementCategory(a) === selectedCategory);

  const categories = ['all', 'points', 'activities', 'environmental', 'special'];

  const CategoryButton = ({ category, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
      onPress={onPress}
    >
      <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
      <Text style={[styles.categoryButtonText, isActive && styles.categoryButtonTextActive]}>
        {getCategoryName(category)}
      </Text>
    </TouchableOpacity>
  );

  const AchievementCard = ({ achievement }) => {
    const progress = getAchievementProgress(achievement);
    const isUnlocked = isAchievementUnlocked(achievement);
    
    return (
      <TouchableOpacity
        style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}
        onPress={() => isUnlocked && shareAchievement(achievement)}
      >
        <View style={styles.achievementHeader}>
          <View style={[styles.achievementIcon, isUnlocked && styles.achievementIconUnlocked]}>
            <Text style={styles.achievementEmoji}>
              {getAchievementIcon(achievement.name)}
            </Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, isUnlocked && styles.achievementNameUnlocked]}>
              {achievement.name}
            </Text>
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>
          </View>
          {isUnlocked && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => shareAchievement(achievement)}
            >
              <Text style={styles.shareButtonText}>📤</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` },
                isUnlocked && styles.progressFillComplete
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {isUnlocked ? 'Completed!' : `${Math.round(progress)}%`}
          </Text>
        </View>

        {!isUnlocked && (
          <View style={styles.requirementContainer}>
            <Text style={styles.requirementText}>
              {achievement.points_required && `Need ${achievement.points_required - userStats.totalPoints} more points`}
              {achievement.activities_required && `Need ${achievement.activities_required - userStats.totalActivities} more activities`}
              {achievement.co2_required && `Need ${(achievement.co2_required - parseFloat(userStats.totalCO2Saved)).toFixed(1)}kg more CO2 saved`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }

  const unlockedCount = filteredAchievements.filter(a => isAchievementUnlocked(a)).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Achievements</Text>
        <Text style={styles.subtitle}>Track your eco-warrior progress!</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Membership Progress Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <View style={[styles.membershipBadge, { backgroundColor: membership.color }]}>
              <Text style={styles.membershipEmoji}>{membership.emoji}</Text>
            </View>
            <View style={styles.membershipInfo}>
              <Text style={styles.membershipName}>{membership.name}</Text>
              <Text style={styles.username}>{user.username || 'Eco Warrior'}</Text>
            </View>
          </View>

          {membership.nextLevel && (
            <View style={styles.nextLevelContainer}>
              <Text style={styles.nextLevelTitle}>Next Level: {membership.nextLevel}</Text>
              <View style={styles.nextLevelProgress}>
                <View style={styles.nextLevelProgressBar}>
                  <View 
                    style={[
                      styles.nextLevelProgressFill, 
                      { width: `${(userStats.totalPoints / membership.nextPoints) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.nextLevelProgressText}>
                  {userStats.totalPoints} / {membership.nextPoints} points
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Achievement Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Achievement Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏅</Text>
              <AnimatedCounter 
                value={unlockedCount} 
                style={styles.statValue}
              />
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎯</Text>
              <AnimatedCounter 
                value={filteredAchievements.length} 
                style={styles.statValue}
              />
              <Text style={styles.statLabel}>Total</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <AnimatedCounter 
                value={Math.round((unlockedCount / filteredAchievements.length) * 100)} 
                suffix="%"
                style={styles.statValue}
              />
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <CategoryButton
                key={category}
                category={category}
                isActive={selectedCategory === category}
                onPress={() => setSelectedCategory(category)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>
            {getCategoryName(selectedCategory)} Achievements ({unlockedCount}/{filteredAchievements.length})
          </Text>

          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyTitle}>No achievements yet</Text>
              <Text style={styles.emptyText}>
                Start logging activities to unlock your first achievements!
              </Text>
            </View>
          ) : (
            filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>💡 Achievement Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>📸</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Photo Verification</Text>
              <Text style={styles.tipText}>
                Upload photos of your activities to earn 2x points and unlock special achievements faster!
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🔥</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Daily Consistency</Text>
              <Text style={styles.tipText}>
                Log activities daily to build streaks and unlock time-based achievements!
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>📤</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Share Your Success</Text>
              <Text style={styles.tipText}>
                Tap unlocked achievements to share them on social media and inspire others!
              </Text>
            </View>
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
  membershipCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  membershipEmoji: {
    fontSize: 24,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#9ca3af',
  },
  nextLevelContainer: {
    marginTop: 16,
  },
  nextLevelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
  },
  nextLevelProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextLevelProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginRight: 12,
  },
  nextLevelProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  nextLevelProgressText: {
    fontSize: 12,
    color: '#9ca3af',
    minWidth: 80,
  },
  statsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#10b981',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    opacity: 0.7,
  },
  achievementCardUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: '#10b981',
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 4,
  },
  achievementNameUnlocked: {
    color: '#ffffff',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  shareButton: {
    backgroundColor: '#374151',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6b7280',
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    minWidth: 60,
    textAlign: 'right',
  },
  requirementContainer: {
    marginTop: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
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
  tipsContainer: {
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
});

export default AchievementsScreen;

