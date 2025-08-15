import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { CardField, useStripe, useConfirmSetupIntent } from '@stripe/stripe-react-native';
import { stripeHelpers, SUBSCRIPTION_PLANS } from '../lib/stripeConfig';

const PaymentScreen = ({ user, selectedPlan, onPaymentSuccess, onNavigate }) => {
  const { confirmSetupIntent } = useConfirmSetupIntent();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [setupIntent, setSetupIntent] = useState(null);

  useEffect(() => {
    createSetupIntent();
  }, []);

  const createSetupIntent = async () => {
    try {
      setLoading(true);
      const { success, setupIntent, error } = await stripeHelpers.createSetupIntent(user.id);
      
      if (success) {
        setSetupIntent(setupIntent);
      } else {
        Alert.alert('Error', error || 'Failed to initialize payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please complete your card information');
      return;
    }

    if (!setupIntent) {
      Alert.alert('Error', 'Payment not initialized. Please try again.');
      return;
    }

    try {
      setLoading(true);

      // Confirm setup intent to save payment method
      const { error, setupIntent: confirmedSetupIntent } = await confirmSetupIntent(
        setupIntent.client_secret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        Alert.alert('Payment Error', error.message);
        return;
      }

      // Create subscription with the saved payment method
      const plan = SUBSCRIPTION_PLANS[selectedPlan];
      const { success, subscription, error: subscriptionError } = await stripeHelpers.createSubscription(
        user.id,
        plan.priceId,
        confirmedSetupIntent.payment_method
      );

      if (success) {
        Alert.alert(
          'Success!',
          `Welcome to ${plan.name}! Your subscription is now active.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                if (onPaymentSuccess) {
                  onPaymentSuccess(subscription);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Subscription Error', subscriptionError || 'Failed to create subscription');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plan = SUBSCRIPTION_PLANS[selectedPlan];

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid plan selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Subscription</Text>
        <Text style={styles.subtitle}>{plan.name} - {stripeHelpers.formatPrice(plan.price)}/month</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={styles.planSummary}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>{stripeHelpers.formatPrice(plan.price)}/month</Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What's included:</Text>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureIcon}>✅</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Form */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          <View style={styles.cardContainer}>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
                expiration: 'MM/YY',
                cvc: 'CVC',
                postalCode: '12345',
              }}
              cardStyle={styles.cardField}
              style={styles.cardFieldContainer}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>

          <View style={styles.securityInfo}>
            <Text style={styles.securityText}>
              🔒 Your payment information is encrypted and secure
            </Text>
            <Text style={styles.securitySubtext}>
              Powered by Stripe • PCI DSS compliant
            </Text>
          </View>
        </View>

        {/* Billing Information */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Billing Details</Text>
          
          <View style={styles.billingItem}>
            <Text style={styles.billingLabel}>Plan:</Text>
            <Text style={styles.billingValue}>{plan.name}</Text>
          </View>
          
          <View style={styles.billingItem}>
            <Text style={styles.billingLabel}>Billing Cycle:</Text>
            <Text style={styles.billingValue}>Monthly</Text>
          </View>
          
          <View style={styles.billingItem}>
            <Text style={styles.billingLabel}>Next Billing Date:</Text>
            <Text style={styles.billingValue}>
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={[styles.billingItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>Total Today:</Text>
            <Text style={styles.totalValue}>{stripeHelpers.formatPrice(plan.price)}</Text>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            You can cancel anytime from your account settings.
          </Text>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (!cardComplete || loading) && styles.paymentButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={!cardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.paymentButtonText}>
              Subscribe for {stripeHelpers.formatPrice(plan.price)}/month
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onNavigate && onNavigate('subscription')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

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
    fontSize: 24,
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
  planSummary: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  featuresContainer: {
    marginTop: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  paymentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  cardFieldContainer: {
    height: 50,
  },
  cardField: {
    backgroundColor: 'transparent',
    textColor: '#ffffff',
    placeholderColor: '#9ca3af',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
  },
  securityInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 4,
  },
  securitySubtext: {
    fontSize: 10,
    color: '#6b7280',
  },
  billingSection: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  billingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  billingLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  billingValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  totalItem: {
    borderBottomWidth: 0,
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  termsSection: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  paymentButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentButtonDisabled: {
    backgroundColor: '#374151',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default PaymentScreen;

