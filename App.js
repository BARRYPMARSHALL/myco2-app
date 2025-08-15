import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { auth } from './lib/supabase';
import { monthlyResetService } from './lib/monthlyResetService';

// Import screens
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import ActivityTrackingScreen from './components/ActivityTrackingScreen';
import AchievementsScreen from './components/AchievementsScreen';
import ActivityHistoryScreen from './components/ActivityHistoryScreen';
import CryptoGiveawaysScreen from './components/CryptoGiveawaysScreen';
import ProfileScreenWithAuth from './components/ProfileScreenWithAuth';
import SubscriptionScreen from './components/SubscriptionScreen';
import SharingScreen from './components/SharingScreen';
import TermsOfServiceScreen from './components/TermsOfServiceScreen';
import PaymentScreen from './components/PaymentScreen';
import RevenueTrackingScreen from './components/RevenueTrackingScreen';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [navigationParams, setNavigationParams] = useState(null);

  useEffect(() => {
    // Check initial session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await auth.getCurrentUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (authUser) => {
    setUser(authUser);
    setActiveTab('home');
    
    // Check for monthly reset
    try {
      const resetResult = await monthlyResetService.initializeResetCheck(authUser.id);
      
      if (resetResult.shouldShowNotification && resetResult.notificationMessage) {
        Alert.alert(
          resetResult.notificationMessage.title,
          resetResult.notificationMessage.message,
          [{ text: 'Got it!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error checking monthly reset:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out');
      } else {
        setUser(null);
        setActiveTab('home');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleStatsUpdate = () => {
    // This function can be used to refresh stats across components
    // For now, we'll just trigger a re-render by updating the user object
    if (user) {
      setUser({ ...user });
    }
  };

  const TabButton = ({ icon, label, tabKey, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Handle navigation between screens
  const handleNavigation = (screen, params = {}) => {
    setActiveTab(screen);
    setNavigationParams(params);
  };

  // Handle successful payment
  const handlePaymentSuccess = (subscription) => {
    // Navigate back to subscription screen
    setActiveTab('subscription');
    setNavigationParams(null);
    
    // Show success message
    Alert.alert(
      'Payment Successful!',
      'Your subscription is now active. Start earning crypto rewards!',
      [{ text: 'Start Earning', onPress: () => setActiveTab('activities') }]
    );
  };

  const renderScreen = () => {
    if (!user) {
      return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen user={user} onStatsUpdate={handleStatsUpdate} onNavigate={handleNavigation} />;
      case 'activities':
        return <ActivityTrackingScreen user={user} onStatsUpdate={handleStatsUpdate} />;
      case 'leaderboard':
        return <LeaderboardScreen user={user} />;
      case 'giveaways':
        return <CryptoGiveawaysScreen user={user} />;
      case 'achievements':
        return <AchievementsScreen user={user} />;
      case 'history':
        return <ActivityHistoryScreen user={user} />;
      case 'subscription':
        return <SubscriptionScreen user={user} onNavigate={handleNavigation} />;
      case 'sharing':
        return <SharingScreen user={user} onStatsUpdate={handleStatsUpdate} />;
      case 'terms':
        return <TermsOfServiceScreen onNavigate={handleNavigation} />;
      case 'payment':
        return <PaymentScreen user={user} selectedPlan={navigationParams?.selectedPlan} onPaymentSuccess={handlePaymentSuccess} onNavigate={handleNavigation} />;
      case 'revenue':
        return <RevenueTrackingScreen user={user} onNavigate={handleNavigation} />;
      case 'profile':
        return <ProfileScreenWithAuth user={user} onSignOut={handleSignOut} onNavigate={handleNavigation} />;
      default:
        return <HomeScreen user={user} onStatsUpdate={handleStatsUpdate} onNavigate={handleNavigation} />;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingIcon}>🌱</Text>
          <Text style={styles.loadingTitle}>MYCO2.app</Text>
          <Text style={styles.loadingSubtitle}>Loading your eco-crypto journey...</Text>
          <ActivityIndicator size="large" color="#10b981" style={styles.loadingSpinner} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0a" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      {user && (
        <View style={styles.bottomNav}>
          <TabButton
            icon="🏠"
            label="Home"
            tabKey="home"
            isActive={activeTab === 'home'}
            onPress={() => setActiveTab('home')}
          />
          <TabButton
            icon="📊"
            label="Track"
            tabKey="activities"
            isActive={activeTab === 'activities'}
            onPress={() => setActiveTab('activities')}
          />
          <TabButton
            icon="💎"
            label="Plans"
            tabKey="subscription"
            isActive={activeTab === 'subscription'}
            onPress={() => setActiveTab('subscription')}
          />
          <TabButton
            icon="🎁"
            label="Giveaways"
            tabKey="giveaways"
            isActive={activeTab === 'giveaways'}
            onPress={() => setActiveTab('giveaways')}
          />
          <TabButton
            icon="👤"
            label="Profile"
            tabKey="profile"
            isActive={activeTab === 'profile'}
            onPress={() => setActiveTab('profile')}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0f0a',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 30,
  },
  loadingSpinner: {
    marginTop: 20,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#10b981',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabIconActive: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default App;
