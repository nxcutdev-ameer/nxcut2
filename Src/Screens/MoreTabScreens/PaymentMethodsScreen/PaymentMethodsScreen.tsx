import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronLeft,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Shield,
  Smartphone,
  Landmark,
  MoreVertical,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../Constants/colors";
import { PaymentMethodsScreenStyles } from "./PaymentMethodsScreenStyles";
import { usePaymentMethodsVM, PaymentMethod } from "./PaymentMethodsScreenVM";
import { getHeightEquivalent, getWidthEquivalent } from "../../../Utils/helpers";

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const {
    loading,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    updatePaymentMethod,
  } = usePaymentMethodsVM();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await fetchPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentMethods();
    setRefreshing(false);
  };

  const handleUpdatePaymentMethod = () => {
   // navigation.navigate("UpdatePaymentMethodScreen" as never);
  };
  const handleAddPaymentMethod = () => {
    navigation.navigate("AddPaymentMethodScreen" as never);
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePaymentMethod(methodId);
              await loadPaymentMethods();
            } catch (err) {
              Alert.alert("Error", "Failed to delete payment method");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await setDefaultPaymentMethod(methodId);
      await loadPaymentMethods();
    } catch (err) {
      Alert.alert("Error", "Failed to set default payment method");
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard size={24} color={colors.black} />;
      case "wallet":
        return <Smartphone size={24} color={colors.black} />;
      case "bank":
        return <Landmark size={24} color={colors.black} />;
      default:
        return <CreditCard size={24} color={colors.black} />;
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={PaymentMethodsScreenStyles.paymentMethodCard}>
      <View style={PaymentMethodsScreenStyles.paymentMethodHeader}>
        <View style={PaymentMethodsScreenStyles.paymentMethodInfo}>
          <View style={PaymentMethodsScreenStyles.paymentMethodIcon}>
            {getPaymentMethodIcon(method.type)}
          </View>
          <View style={PaymentMethodsScreenStyles.paymentMethodDetails}>
            <Text style={PaymentMethodsScreenStyles.paymentMethodName}>
              {method.name}
            </Text>
            {method.lastFour && (
              <Text style={PaymentMethodsScreenStyles.paymentMethodDetails}>
                **** **** **** {method.lastFour}
              </Text>
            )}
            {method.expiryDate && (
              <Text style={PaymentMethodsScreenStyles.paymentMethodDetails}>
                Expires {method.expiryDate}
              </Text>
            )}
          </View>
        </View>
        <View style={PaymentMethodsScreenStyles.paymentMethodActions}>
          {/* {method.isDefault && (
            <View style={PaymentMethodsScreenStyles.defaultBadge}>
              <Shield size={16} color={colors.white} />
              <Text style={PaymentMethodsScreenStyles.defaultBadgeText}>
                Default
              </Text>
            </View>
          )} */}
                <TouchableOpacity
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.white,
                    borderColor: colors.gray[300],
                   // borderWidth: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => setShowMenuModal(true)}
                >
                  <MoreVertical size={20} color={colors.text} />
                </TouchableOpacity>
          {/* <TouchableOpacity
            style={PaymentMethodsScreenStyles.actionButton}
            onPress={() => handleDeletePaymentMethod(method.id)}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );

  return (
    <View style={PaymentMethodsScreenStyles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[
          colors.gradient.start,
          colors.gradient.middle,
          colors.gradient.end,
        ]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={PaymentMethodsScreenStyles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={PaymentMethodsScreenStyles.header}>
            <TouchableOpacity
              style={PaymentMethodsScreenStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={PaymentMethodsScreenStyles.headerTitle}>
              Payment Methods
            </Text>
            <View style={PaymentMethodsScreenStyles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={PaymentMethodsScreenStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Add Payment Method Button */}
        <TouchableOpacity
          style={PaymentMethodsScreenStyles.addButton}
          onPress={handleAddPaymentMethod}
        >
          <View style={PaymentMethodsScreenStyles.addButtonIcon}>
            <Plus size={24} color={colors.black} />
          </View>
          <Text style={PaymentMethodsScreenStyles.addButtonText}>
            Add Payment Method
          </Text>
        </TouchableOpacity>

        {/* Payment Methods List */}
        <View style={PaymentMethodsScreenStyles.paymentMethodsList}>
          {paymentMethods.length === 0 ? (
            <View style={PaymentMethodsScreenStyles.emptyState}>
              <CreditCard size={64} color={colors.gray[300]} />
              <Text style={PaymentMethodsScreenStyles.emptyStateTitle}>
                No Payment Methods
              </Text>
              <Text style={PaymentMethodsScreenStyles.emptyStateDescription}>
                Add a payment method to start accepting payments
              </Text>
            </View>
          ) : (
            paymentMethods.map(renderPaymentMethod)
          )}
        </View>

        {/* Security Notice */}
        {/* <View style={PaymentMethodsScreenStyles.securityNotice}>
          <Shield size={20} color={colors.primary} />
          <Text style={PaymentMethodsScreenStyles.securityNoticeText}>
            Your payment information is encrypted and secure
          </Text>
        </View> */}
      </ScrollView>
         {/* Menu Modal */}
      <Modal
        isVisible={showMenuModal}
        onBackdropPress={() => setShowMenuModal(false)}
        onSwipeComplete={() => setShowMenuModal(false)}
        swipeDirection="down"
        style={{ justifyContent: "flex-end", margin: 0 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 12,
            paddingBottom: 34,
          }}
        >
          {/* Drag Indicator */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.gray[300],
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          {/* Update Button */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: getHeightEquivalent(26),
              paddingHorizontal: getWidthEquivalent(20),
              backgroundColor: colors.white,
            }}
            onPress={handleUpdatePaymentMethod}
          >
                <Text
                  style={{
                    marginLeft: getWidthEquivalent(12),
                    fontSize: getHeightEquivalent(16),
                    fontWeight: "500",
                    color: colors.black,
                  }}
                >
                  Update
                </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentMethodsScreen;
