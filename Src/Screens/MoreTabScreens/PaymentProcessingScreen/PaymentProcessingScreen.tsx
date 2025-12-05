import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react-native";
import { getHeightEquivalent, getWidthEquivalent, fontEq } from "../../../Utils/helpers";
import { colors } from "../../../Constants/colors";
import { PaymentProcessingScreenStyles } from "./PaymentProcessingScreenStyles";
import { paymobService } from "../../../Services/PaymobService";

interface PaymentProcessingRouteParams {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  billingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
}

const PaymentProcessingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as PaymentProcessingRouteParams;
  
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"processing" | "success" | "failed">("processing");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const paymentResponse = await paymobService.processPayment({
        amount: params.amount,
        currency: params.currency,
        orderId: params.orderId,
        customerInfo: params.customerInfo,
        billingData: params.billingData,
      });
      
      setPaymentUrl(paymentResponse.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize payment");
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === "payment_success") {
        setPaymentStatus("success");
        paymobService.handlePaymentSuccess(data);
      } else if (data.type === "payment_failure") {
        setPaymentStatus("failed");
        paymobService.handlePaymentFailure(data);
      }
    } catch (err) {
      console.error("Error parsing webview message:", err);
    }
  };

  const handleBack = () => {
    if (paymentStatus === "processing") {
      Alert.alert(
        "Cancel Payment",
        "Are you sure you want to cancel this payment?",
        [
          { text: "Continue Payment", style: "cancel" },
          { text: "Cancel", style: "destructive", onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderProcessingState = () => (
    <View style={PaymentProcessingScreenStyles.processingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={PaymentProcessingScreenStyles.processingTitle}>
        Processing Payment
      </Text>
      <Text style={PaymentProcessingScreenStyles.processingDescription}>
        Please wait while we process your payment...
      </Text>
    </View>
  );

  const renderSuccessState = () => (
    <View style={PaymentProcessingScreenStyles.statusContainer}>
      <CheckCircle size={64} color={colors.success} />
      <Text style={PaymentProcessingScreenStyles.statusTitle}>
        Payment Successful!
      </Text>
      <Text style={PaymentProcessingScreenStyles.statusDescription}>
        Your payment has been processed successfully.
      </Text>
      <TouchableOpacity
        style={PaymentProcessingScreenStyles.continueButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={PaymentProcessingScreenStyles.continueButtonText}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFailedState = () => (
    <View style={PaymentProcessingScreenStyles.statusContainer}>
      <XCircle size={64} color={colors.danger} />
      <Text style={PaymentProcessingScreenStyles.statusTitle}>
        Payment Failed
      </Text>
      <Text style={PaymentProcessingScreenStyles.statusDescription}>
        {error || "Your payment could not be processed. Please try again."}
      </Text>
      <TouchableOpacity
        style={PaymentProcessingScreenStyles.retryButton}
        onPress={initializePayment}
      >
        <Text style={PaymentProcessingScreenStyles.retryButtonText}>
          Try Again
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={PaymentProcessingScreenStyles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={PaymentProcessingScreenStyles.cancelButtonText}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderWebView = () => (
    <WebView
      source={{ uri: paymentUrl }}
      style={PaymentProcessingScreenStyles.webView}
      onMessage={handleWebViewMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={PaymentProcessingScreenStyles.webViewLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={PaymentProcessingScreenStyles.webViewLoadingText}>
            Loading payment form...
          </Text>
        </View>
      )}
    />
  );

  return (
    <SafeAreaView style={PaymentProcessingScreenStyles.mainContainer}>
      {/* Header */}
      <View style={PaymentProcessingScreenStyles.header}>
        <TouchableOpacity
          style={PaymentProcessingScreenStyles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={PaymentProcessingScreenStyles.headerTitle}>
          Payment Processing
        </Text>
        <View style={PaymentProcessingScreenStyles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={PaymentProcessingScreenStyles.content}>
        {loading && renderProcessingState()}
        {paymentStatus === "success" && renderSuccessState()}
        {paymentStatus === "failed" && renderFailedState()}
        {paymentStatus === "processing" && !loading && paymentUrl && renderWebView()}
      </View>
    </SafeAreaView>
  );
};

export default PaymentProcessingScreen;
