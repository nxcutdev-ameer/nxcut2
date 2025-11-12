import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  CreditCard,
  Smartphone,
  Landmark,
  Check,
} from "lucide-react-native";
import { colors } from "../../../Constants/colors";
import { AddPaymentMethodScreenStyles } from "./AddPaymentMethodScreenStyles";

interface PaymentMethodType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [loading, setLoading] = useState(false);

  const paymentMethodTypes: PaymentMethodType[] = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <CreditCard size={24} color={colors.primary} />,
      description: "Add a credit or debit card",
    },
    // {
    //   id: "wallet",
    //   name: "Digital Wallet",
    //   icon: <Smartphone size={24} color={colors.primary} />,
    //   description: "Apple Pay, Google Pay, etc.",
    // },
    // {
    //   id: "bank",
    //   name: "Bank Account",
    //   icon: <Landmark size={24} color={colors.primary} />,
    //   description: "Direct bank transfer",
    // },
  ];

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert("Error", "Please select a payment method type");
      return;
    }

    if (selectedType === "card") {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        Alert.alert("Error", "Please fill in all card details");
        return;
      }
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "Success",
        "Payment method added successfully",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add payment method");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Add slash after 2 digits
    const formatted = cleaned.replace(/(\d{2})(?=\d)/g, "$1/");
    setExpiryDate(formatted);
  };

  const renderPaymentMethodType = (type: PaymentMethodType) => (
    <TouchableOpacity
      key={type.id}
      style={[
        AddPaymentMethodScreenStyles.paymentTypeCard,
        selectedType === type.id && AddPaymentMethodScreenStyles.paymentTypeCardSelected,
      ]}
      onPress={() => setSelectedType(type.id)}
    >
      <View style={AddPaymentMethodScreenStyles.paymentTypeContent}>
        <View style={AddPaymentMethodScreenStyles.paymentTypeIcon}>
          {type.icon}
        </View>
        <View style={AddPaymentMethodScreenStyles.paymentTypeInfo}>
          <Text style={AddPaymentMethodScreenStyles.paymentTypeName}>
            {type.name}
          </Text>
          <Text style={AddPaymentMethodScreenStyles.paymentTypeDescription}>
            {type.description}
          </Text>
        </View>
        {selectedType === type.id && (
          <View style={AddPaymentMethodScreenStyles.selectedIndicator}>
            <Check size={20} color={colors.white} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCardForm = () => (
    <View style={AddPaymentMethodScreenStyles.formContainer}>
      <Text style={AddPaymentMethodScreenStyles.formTitle}>Card Details</Text>
      
      <View style={AddPaymentMethodScreenStyles.inputGroup}>
        <Text style={AddPaymentMethodScreenStyles.inputLabel}>Card Number</Text>
        <TextInput
          style={AddPaymentMethodScreenStyles.input}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={formatCardNumber}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={AddPaymentMethodScreenStyles.rowInputs}>
        <View style={AddPaymentMethodScreenStyles.inputGroup}>
          <Text style={AddPaymentMethodScreenStyles.inputLabel}>Expiry Date</Text>
          <TextInput
            style={AddPaymentMethodScreenStyles.input}
            placeholder="MM/YY"
            value={expiryDate}
            onChangeText={formatExpiryDate}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={AddPaymentMethodScreenStyles.inputGroup}>
          <Text style={AddPaymentMethodScreenStyles.inputLabel}>CVV</Text>
          <TextInput
            style={AddPaymentMethodScreenStyles.input}
            placeholder="123"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <View style={AddPaymentMethodScreenStyles.inputGroup}>
        <Text style={AddPaymentMethodScreenStyles.inputLabel}>Cardholder Name</Text>
        <TextInput
          style={AddPaymentMethodScreenStyles.input}
          placeholder="John Doe"
          value={cardholderName}
          onChangeText={setCardholderName}
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={AddPaymentMethodScreenStyles.mainContainer}>
      {/* Header */}
      <View style={AddPaymentMethodScreenStyles.header}>
        <TouchableOpacity
          style={AddPaymentMethodScreenStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={AddPaymentMethodScreenStyles.headerTitle}>
          Add Payment Method
        </Text>
        <View style={AddPaymentMethodScreenStyles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={AddPaymentMethodScreenStyles.content}>
        {/* Payment Method Types */}
        <View style={AddPaymentMethodScreenStyles.section}>
          <Text style={AddPaymentMethodScreenStyles.sectionTitle}>
            Choose Payment Method
          </Text>
          {paymentMethodTypes.map(renderPaymentMethodType)}
        </View>

        {/* Card Form */}
        {selectedType === "card" && renderCardForm()}

        {/* Other Payment Method Forms */}
        {selectedType === "wallet" && (
          <View style={AddPaymentMethodScreenStyles.formContainer}>
            <Text style={AddPaymentMethodScreenStyles.formTitle}>
              Digital Wallet Setup
            </Text>
            <Text style={AddPaymentMethodScreenStyles.formDescription}>
              Digital wallet integration will be handled through your device's
              wallet app (Apple Pay, Google Pay, etc.)
            </Text>
          </View>
        )}

        {selectedType === "bank" && (
          <View style={AddPaymentMethodScreenStyles.formContainer}>
            <Text style={AddPaymentMethodScreenStyles.formTitle}>
              Bank Account Details
            </Text>
            <Text style={AddPaymentMethodScreenStyles.formDescription}>
              Bank account integration requires additional verification and
              will be processed separately.
            </Text>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            AddPaymentMethodScreenStyles.saveButton,
            loading && AddPaymentMethodScreenStyles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={AddPaymentMethodScreenStyles.saveButtonText}>
            {loading ? "Adding..." : "Add Payment Method"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddPaymentMethodScreen;
