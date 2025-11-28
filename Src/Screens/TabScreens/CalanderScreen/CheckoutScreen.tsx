import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../Constants/colors';
import { fontEq, getHeightEquivalent, getWidthEquivalent } from '../../../Utils/helpers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PaymentMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

interface CheckoutScreenProps {
  route: {
    params: {
      total: number;
    };
  };
}

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { total } = route.params;
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      title: 'Card',
      subtitle: 'Credit/Debit card',
      icon: 'credit-card-outline',
    },
    {
      id: 'cash',
      title: 'Cash',
      subtitle: 'Pay with cash',
      icon: 'cash',
    },
    {
      id: 'courtesy',
      title: 'Courtesy',
      subtitle: 'Complimentary service',
      icon: 'gift-outline',
    },
    {
      id: 'membership',
      title: 'Membership',
      subtitle: 'Payment method',
      icon: 'card-account-details-outline',
    },
    {
      id: 'online',
      title: 'Online',
      subtitle: 'Online payment',
      icon: 'web',
    },
    {
      id: 'split',
      title: 'Split Payment',
      subtitle: 'Use multiple methods',
      icon: 'account-multiple-outline',
    },
    {
      id: 'voucher',
      title: 'Voucher',
      subtitle: 'Payment method',
      icon: 'ticket-outline',
    },
    {
      id: 'wire',
      title: 'Wire Transfer',
      subtitle: 'Payment method',
      icon: 'bank-transfer',
    },
  ];

  const handlePaymentMethodPress = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handlePay = () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }
    // Handle payment logic here
    console.log(`Processing payment with method: ${selectedMethod}, amount: ${total}`);
    // Navigate back or to success screen
      alert("Comming soon , Checkout with the web application.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>How would you like to pay?</Text>

        <View style={styles.methodsList}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
              ]}
              onPress={() => handlePaymentMethodPress(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.methodContent}>
                <View
                  style={[
                    styles.iconContainer,
                    selectedMethod === method.id && styles.iconContainerSelected,
                  ]}
                >
                  <Icon
                    name={method.icon}
                    size={24}
                    color={selectedMethod === method.id ? colors.primary : colors.gray[600]}
                  />
                </View>
                <View style={styles.methodText}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            !selectedMethod && styles.payButtonDisabled,
          ]}
          onPress={handlePay}
          disabled={!selectedMethod}
          activeOpacity={0.8}
        >
          <Text style={styles.payButtonText}>
            Pay AED {total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: getWidthEquivalent(8),
  },
  title: {
    fontSize: fontEq(20),
    fontWeight: "700",
    color: colors.text,
  },
  placeholder: {
    width: getWidthEquivalent(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: getWidthEquivalent(16),
  },
  subtitle: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.text,
    marginTop: getHeightEquivalent(24),
    marginBottom: getHeightEquivalent(16),
  },
  methodsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: getHeightEquivalent(24),
  },

  methodCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: getWidthEquivalent(10),
    padding: getWidthEquivalent(12),
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: getHeightEquivalent(12),
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}05`,
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: getWidthEquivalent(26),
    height: getWidthEquivalent(26),
    borderRadius: getWidthEquivalent(18),
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: getWidthEquivalent(8),
  },

  methodTitle: {
    fontSize: fontEq(14),
    fontWeight: "600",
    color: colors.text,
    marginBottom: getHeightEquivalent(2),
  },
  iconContainerSelected: {
    backgroundColor: `${colors.primary}15`,
  },
  methodText: {
    flex: 1,
  },
  methodSubtitle: {
    fontSize: fontEq(12),
    fontWeight: "400",
    color: colors.gray[600],
  },

  radioButton: {
    width: getWidthEquivalent(20),
    height: getWidthEquivalent(20),
    borderRadius: getWidthEquivalent(10),
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },

  radioButtonInner: {
    width: getWidthEquivalent(10),
    height: getWidthEquivalent(10),
    borderRadius: getWidthEquivalent(5),
    backgroundColor: colors.primary,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  footer: {
    padding: getWidthEquivalent(16),
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payButtonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    fontSize: fontEq(18),
    fontWeight: "700",
    color: colors.white,
  },
});

export default CheckoutScreen;
