import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { activityHelpers } from '../lib/supabase';
import AnimatedCounter from './AnimatedCounter';

const { width } = Dimensions.get('window');

const ActivityHistoryScreen = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadActivities();
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await activityHelpers.getUserActivities(user.id, 100);
      if (error) {
        console.error('Activities error:', error);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Load activities error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const openPhotoModal = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setPhotoModalVisible(true);
  };

  const closePhotoModal = () => {
    setPhotoModalVisible(false);
    setSelectedPhoto(null);
  };

  const getActivityIcon = (activityName) => {
    switch (activityName) {
      case 'Walking/Biking': return '🚶‍♂️';
      case 'Public Transit': return '🚌';
      case 'Plant-Based Meals': return '🥗';
      case 'Recycling': return '♻️';
      case 'Energy Saving': return '💡';
      default: return '🌱';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getFilteredActivities = () => {
    if (filter === 'all') return activities;
    if (filter === 'verified') return activities.filter(a => a.verified || a.photo_url);
    if (filter === 'recent') return activities.slice(0, 10);
    return activities;
  };

  const filteredActivities = getFilteredActivities();
  const totalPoints = activities.reduce((sum, activity) => sum + (activity.points_earned || 0), 0);
  const totalCO2 = activities.reduce((sum, activity) => sum + (activity.co2_saved || 0), 0);
  const verifiedCount = activities.filter(a => a.verified || a.photo_url).length;

  const FilterButton = ({ filterType, label, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ActivityCard = ({ activity }) => (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityIconContainer}>
          <Text style={styles.activityEmoji}>
            {getActivityIcon(activity.activity_types?.name || 'Unknown')}
          </Text>
          {(activity.verified || activity.photo_url) && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>
            {activity.activity_types?.name || 'Unknown Activity'}
          </Text>
          <Text style={styles.activityDate}>
            {formatDate(activity.created_at)}
          </Text>
          {activity.notes && (
            <Text style={styles.activityNotes}>{activity.notes}</Text>
          )}
        </View>
        
        <View style={styles.activityRewards}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>⭐</Text>
            <Text style={styles.rewardValue}>{activity.points_earned || 0}</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>🌱</Text>
            <Text style={styles.rewardValue}>{(activity.co2_saved || 0).toFixed(1)}kg</Text>
          </View>
        </View>
      </View>

      {activity.photo_url && (
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={() => openPhotoModal(activity.photo_url)}
        >
          <Image
            source={{ uri: activity.photo_url }}
            style={styles.activityPhoto}
            resizeMode="cover"
          />
          <View style={styles.photoOverlay}>
            <Text style={styles.photoOverlayText}>📸 Tap to view</Text>
          </View>
        </TouchableOpacity>
      )}

      {(activity.location_lat && activity.location_lng) && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            Location verified ({activity.location_lat.toFixed(4)}, {activity.location_lng.toFixed(4)})
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading activity history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Activity History</Text>
        <Text style={styles.subtitle}>Your eco-journey timeline</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>✅</Text>
              <AnimatedCounter 
                value={activities.length} 
                style={styles.summaryValue}
              />
              <Text style={styles.summaryLabel}>Total Activities</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>⭐</Text>
              <AnimatedCounter 
                value={totalPoints} 
                style={styles.summaryValue}
              />
              <Text style={styles.summaryLabel}>Points Earned</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>🌱</Text>
              <AnimatedCounter 
                value={totalCO2} 
                suffix=" kg"
                style={styles.summaryValue}
              />
              <Text style={styles.summaryLabel}>CO2 Saved</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryIcon}>📸</Text>
              <AnimatedCounter 
                value={verifiedCount} 
                style={styles.summaryValue}
              />
              <Text style={styles.summaryLabel}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filtersContainer}>
          <Text style={styles.sectionTitle}>Filter</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <FilterButton
              filterType="all"
              label={`All (${activities.length})`}
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterButton
              filterType="verified"
              label={`Verified (${verifiedCount})`}
              isActive={filter === 'verified'}
              onPress={() => setFilter('verified')}
            />
            <FilterButton
              filterType="recent"
              label="Recent (10)"
              isActive={filter === 'recent'}
              onPress={() => setFilter('recent')}
            />
          </ScrollView>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>
            Activities ({filteredActivities.length})
          </Text>

          {filteredActivities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No activities yet</Text>
              <Text style={styles.emptyText}>
                Start logging eco-friendly activities to see your history here!
              </Text>
            </View>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Photo Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={closePhotoModal}
      >
        <View style={styles.photoModalOverlay}>
          <TouchableOpacity
            style={styles.photoModalCloseArea}
            onPress={closePhotoModal}
          >
            <View style={styles.photoModalContent}>
              <TouchableOpacity
                style={styles.photoModalCloseButton}
                onPress={closePhotoModal}
              >
                <Text style={styles.photoModalCloseText}>✕</Text>
              </TouchableOpacity>
              
              {selectedPhoto && (
                <Image
                  source={{ uri: selectedPhoto }}
                  style={styles.photoModalImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
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
  summaryContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#374151',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  activitiesContainer: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 24,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10b981',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  activityNotes: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  activityRewards: {
    alignItems: 'flex-end',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  photoContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  activityPhoto: {
    width: '100%',
    height: 150,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    alignItems: 'center',
  },
  photoOverlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
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
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoModalContent: {
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  photoModalCloseButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoModalCloseText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoModalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
});

export default ActivityHistoryScreen;

