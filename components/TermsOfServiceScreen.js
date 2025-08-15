import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const TermsOfServiceScreen = ({ onNavigate }) => {
  const handleNavigation = (screen) => {
    if (onNavigate) {
      onNavigate(screen);
    } else {
      Alert.alert('Navigation', `Would navigate to ${screen}`);
    }
  };

  const handleAlternativeEntry = () => {
    Alert.alert(
      'Alternative Entry Method',
      'No Purchase Necessary: To enter rewards selections without a subscription, mail your name, email, and phone number to:\n\nMYCO2.app Alternative Entry\nP.O. Box [TO BE ADDED]\n[City, State ZIP]\n\nLimit one entry per request. Subject to verification and eligibility requirements.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.subtitle}>MYCO2.app Skill-Based Eco-Challenges Rewards Club</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Program Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Program Description</Text>
          <Text style={styles.text}>
            MYCO2.app operates as a subscription-based rewards club promoting skill-based eco-challenges. 
            Membership fees provide access to tracking tools, AI personalization, and participation in challenges 
            where points are earned through verifiable sustainable actions (e.g., AI-verified photos, wearable data). 
            Points convert to entries in rewards selections, which are skill-influenced promotions, not lotteries.
          </Text>
        </View>

        {/* Eligibility and Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Eligibility and Limits</Text>
          <Text style={styles.text}>
            • Membership is limited to one account per person/email{'\n'}
            • Must be 18+ years old to participate{'\n'}
            • We reserve the right to verify activities and disqualify fraudulent entries{'\n'}
            • This program complies with all applicable laws and is void where prohibited{'\n'}
            • Available worldwide except where restricted by local law
          </Text>
        </View>

        {/* Skill-Based Nature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Skill-Based Eco-Challenges</Text>
          <Text style={styles.text}>
            MYCO2.app rewards are based on skill, effort, and consistency in completing eco-friendly activities:
            {'\n\n'}• Walking/Biking: Requires physical effort and route planning{'\n'}
            • Public Transit: Requires research and scheduling skills{'\n'}
            • Plant-Based Meals: Requires nutritional knowledge and preparation{'\n'}
            • Recycling: Requires sorting knowledge and proper disposal{'\n'}
            • Energy Saving: Requires monitoring and conservation planning{'\n\n'}
            All activities require verification through photos, GPS data, or connected devices, 
            demonstrating skill and effort rather than chance.
          </Text>
        </View>

        {/* Rewards and Selections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Rewards and Selections</Text>
          <Text style={styles.text}>
            • Rewards are allocated based on points earned from skill-based activities{'\n'}
            • Selections use a transparent algorithm (Mersenne Twister with public seed){'\n'}
            • 50% of net profits fund rewards, 10% support environmental charities{'\n'}
            • All selections are promotional and not based on chance alone{'\n'}
            • Higher skill and consistency lead to more entries and better odds
          </Text>
        </View>

        {/* No Purchase Necessary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. No Purchase Necessary</Text>
          <Text style={styles.text}>
            While membership unlocks full features, a free alternative entry method is available 
            for rewards selections. See "Alternative Entry" button below for details.
          </Text>
          <TouchableOpacity 
            style={styles.alternativeButton}
            onPress={handleAlternativeEntry}
          >
            <Text style={styles.alternativeButtonText}>📮 Alternative Entry Method</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Subscription Tiers</Text>
          <Text style={styles.text}>
            • Eco Warrior (FREE): Earn points through social sharing only{'\n'}
            • Green Champion ($9.99/month): 1x points from activities + sharing{'\n'}
            • Planet Saver ($19.99/month): 3x points from activities + sharing{'\n\n'}
            Points reset monthly to ensure fair competition. All tiers participate in the same reward selections.
          </Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Important Disclaimers</Text>
          <Text style={styles.text}>
            • MYCO2.app is not a gambling service, lottery, or raffle{'\n'}
            • Participation requires skill and effort in eco-activities{'\n'}
            • No guarantees of rewards; outcomes depend on user performance{'\n'}
            • Crypto rewards may be subject to taxes - consult a professional{'\n'}
            • Environmental impact calculations are estimates based on research
          </Text>
        </View>

        {/* Changes and Notices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes and Notices</Text>
          <Text style={styles.text}>
            We may update these terms with 30 days' notice via email or in-app notification. 
            Continued use constitutes acceptance of updated terms.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Governing Law</Text>
          <Text style={styles.text}>
            These terms are governed by the laws of [JURISDICTION TO BE ADDED]. 
            Disputes will be resolved via binding arbitration.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.text}>
            For questions about these terms or the rewards program:{'\n\n'}
            Email: legal@myco2.app{'\n'}
            Website: https://myco2.app/terms{'\n'}
            Address: [TO BE ADDED]
          </Text>
        </View>

        {/* Footer Disclaimer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MYCO2.app Rewards Club: Skill-based eco-challenges for sustainability. 
            Not a lottery or gambling. 18+ only. Void where prohibited.
          </Text>
          <Text style={styles.lastUpdated}>
            Last Updated: December 2024
          </Text>
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
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  alternativeButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  alternativeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  footer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen;

