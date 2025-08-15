import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth, db } from '../lib/supabase';
import AnimatedCounter from './AnimatedCounter';

const ProfileScreenWithAuth = ({ user, onSignOut, onNavigate }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserAchievements();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await db.getUser(user.id);
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAchievements = async () => {
    try {
      const { data, error } = await db.getUserAchievements(user.id);
      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const getMembershipBadge = (type) => {
    switch (type) {
      case 'planet_saver': return { emoji: '🌍', name: 'Planet Saver', color: '#8b5cf6' };
      case 'green_champion': return { emoji: '🏆', name: 'Green Champion', color: '#059669' };
      default: return { emoji: '🌱', name: 'Eco Starter', color: '#6b7280' };
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: onSignOut 
        }
      ]
    );
  };

  // Handle navigation actions
  const handleAction = (action) => {
    switch (action) {
      case 'history':
        if (onNavigate) {
          onNavigate('history');
        } else {
          Alert.alert('Activity History', 'View your complete activity timeline with photos and achievements.');
        }
        break;
      case 'notifications':
        Alert.alert('Notification Settings', 'Notification preferences coming soon!');
        break;
      case 'privacy':
        Alert.alert('Privacy Settings', 'Privacy controls coming soon!');
        break;
      default:
        Alert.alert('Feature', 'This feature is coming soon!');
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return '#8b5cf6';
      case 'epic': return '#7c3aed';
      case 'rare': return '#2563eb';
      default: return '#059669';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const membershipBadge = getMembershipBadge(userProfile.membership_type);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userProfile.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.username}>{userProfile.username}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
        
        <View style={styles.membershipBadge}>
          <Text style={styles.membershipEmoji}>{membershipBadge.emoji}</Text>
          <Text style={[styles.membershipText, { color: membershipBadge.color }]}>
            {membershipBadge.name}
          </Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Points</Text>
          <AnimatedCounter 
            value={userProfile.total_points || 0} 
            style={styles.statValue}
          />
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>CO2 Saved</Text>
          <AnimatedCounter 
            value={userProfile.total_co2_saved || 0} 
            suffix=" kg"
            style={styles.statValue}
          />
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Activities</Text>
          <AnimatedCounter 
            value={userProfile.total_activities || 0} 
            style={styles.statValue}
          />
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <AnimatedCounter 
            value={userProfile.current_streak || 0} 
            suffix=" days"
            style={styles.statValue}
          />
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Achievements ({achievements.length})</Text>
        
        {achievements.length > 0 ? (
          <View style={styles.achievementsGrid}>
            {achievements.map((userAchievement) => (
              <View 
                key={userAchievement.id} 
                style={[
                  styles.achievementCard,
                  { borderColor: getRarityColor(userAchievement.achievements.rarity) }
                ]}
              >
                <Text style={styles.achievementIcon}>
                  {userAchievement.achievements.icon === 'star' && '⭐'}
                  {userAchievement.achievements.icon === 'shield' && '🛡️'}
                  {userAchievement.achievements.icon === 'leaf' && '🍃'}
                  {userAchievement.achievements.icon === 'fire' && '🔥'}
                  {userAchievement.achievements.icon === 'trophy' && '🏆'}
                  {userAchievement.achievements.icon === 'globe' && '🌍'}
                </Text>
                <Text style={styles.achievementName}>
                  {userAchievement.achievements.name}
                </Text>
                <Text style={styles.achievementDesc}>
                  {userAchievement.achievements.description}
                </Text>
                <Text style={[
                  styles.achievementRarity,
                  { color: getRarityColor(userAchievement.achievements.rarity) }
                ]}>
                  {userAchievement.achievements.rarity.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🎯 No achievements yet!</Text>
            <Text style={styles.emptySubtext}>Complete eco-activities to unlock badges</Text>
          </View>
        )}
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Account</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleAction('history')}
        >
          <Text style={styles.actionText}>📊 View Activity History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleAction('terms')}
        >
          <Text style={styles.actionText}>📋 Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleAction('notifications')}
        >
          <Text style={styles.actionText}>🔔 Notification Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleAction('privacy')}
        >
          <Text style={styles.actionText}>🔒 Privacy Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.signOutButton]} 
          onPress={handleSignOut}
        >
          <Text style={[styles.actionText, styles.signOutText]}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  membershipEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  membershipText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginRight: '2%',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginRight: '2%',
    borderWidth: 2,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementRarity: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
  },
  signOutButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    color: '#ef4444',
  },
});

export default ProfileScreenWithAuth;

