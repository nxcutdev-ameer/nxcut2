import React, { useMemo, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Landmark,
  X,
} from "lucide-react-native";
import { getHeightEquivalent, getWidthEquivalent } from "../../../Utils/helpers";
import { colors } from "../../../Constants/colors";
import Modal from "react-native-modal";

function WalletScreen() {
  const navigation = useNavigation();
  const [isActionsModalVisible, setIsActionsModalVisible] = useState(false);

  const walletActions = useMemo(
    () => [
      {
        id: "Account Summary",
        label: "Account Summary",
        subtitle: "View account summary",
      },
      {
        id: "Account Details",
        label: "Account Details",
        subtitle: "View account details",
      },
    ],
    []
  );

  return (
    <SafeAreaView style={WalletScreenStyles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={WalletScreenStyles.banner}>
        <Pressable
          style={({ pressed }) => [
            WalletScreenStyles.backButton,
            pressed && WalletScreenStyles.backButtonPressed,
          ]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={22} color={colors.white} />
        </Pressable>

        <View style={WalletScreenStyles.bannerContent}>
          <Text style={WalletScreenStyles.bannerLabel}>All accounts</Text>
          <Text style={WalletScreenStyles.bannerAmount}>AED 0.00</Text>
          <Pressable
            onPress={() => setIsActionsModalVisible(true)}
            style={({ pressed }) => [
              WalletScreenStyles.walletButton,
              pressed && WalletScreenStyles.walletButtonPressed,
            ]}
          >
            <View style={WalletScreenStyles.walletButtonContent}>
              <Text style={WalletScreenStyles.walletButtonText}>Actions</Text>
              {isActionsModalVisible ? (
                <ChevronUp size={16} color={colors.white} />
              ) : (
                <ChevronDown size={16} color={colors.white} />
              )}
            </View>
          </Pressable>
        </View>
      </View>

      <View style={WalletScreenStyles.content}>
        <View style={WalletScreenStyles.card}>
          <Pressable
            style={({ pressed }) => [
              WalletScreenStyles.cardItem,
              pressed && WalletScreenStyles.cardItemPressed,
            ]}
            onPress={() => navigation.navigate("PaymentMethodsScreen")}
            android_ripple={{ color: "rgba(22, 119, 255, 0.12)", borderless: false }}
          >
            <View style={WalletScreenStyles.cardItemContent}>
              <View style={WalletScreenStyles.cardItemLeft}>
                <View style={WalletScreenStyles.cardIconBadge}>
                  <CreditCard size={18} color={colors.primary} />
                </View>
                <Text style={WalletScreenStyles.cardItemLabel}>
                  Payment methods
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </Pressable>

          <View style={WalletScreenStyles.cardDivider} />

          {/* <Pressable
            style={({ pressed }) => [
              WalletScreenStyles.cardItem,
              pressed && WalletScreenStyles.cardItemPressed,
            ]}
            onPress={() => {}}
            android_ripple={{ color: "rgba(22, 119, 255, 0.12)", borderless: false }}
          >
            <View style={WalletScreenStyles.cardItemContent}>
              <View style={WalletScreenStyles.cardItemLeft}>
                <View style={WalletScreenStyles.cardIconBadge}>
                  <Landmark size={18} color={colors.primary} />
                </View>
                <Text style={WalletScreenStyles.cardItemLabel}>
                  Bank account
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </Pressable> */}
        </View>
      </View>

      <Modal
        isVisible={isActionsModalVisible}
        onBackdropPress={() => setIsActionsModalVisible(false)}
        onBackButtonPress={() => setIsActionsModalVisible(false)}
        style={WalletScreenStyles.modal}
        swipeDirection={"down"}
        onSwipeComplete={() => setIsActionsModalVisible(false)}
        backdropOpacity={0.4}
      >
        <TouchableWithoutFeedback>
          <View style={WalletScreenStyles.modalContent}>
            <View style={WalletScreenStyles.modalHeader}>
              <View style={WalletScreenStyles.modalHandle} />
              <Pressable
                style={WalletScreenStyles.modalCloseButton}
                onPress={() => setIsActionsModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close actions"
              >
                <X size={18} color={colors.text} />
              </Pressable>
            </View>
            <Text style={WalletScreenStyles.modalTitle}>Actions</Text>
            {walletActions.map((action) => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  WalletScreenStyles.modalItem,
                  pressed && WalletScreenStyles.modalItemPressed,
                ]}
                onPress={() => {
                  setIsActionsModalVisible(false);
                }}
              >
                <View style={WalletScreenStyles.modalItemContent}>
                  <View style={WalletScreenStyles.modalItemTextGroup}>
                    <Text style={WalletScreenStyles.modalItemLabel}>{action.label}</Text>
                    <Text style={WalletScreenStyles.modalItemSubtitle}>{action.subtitle}</Text>
                  </View>
                  <ChevronRight size={18} color={colors.gray[400]} />
                </View>
              </Pressable>
            ))}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const WalletScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: getHeightEquivalent(24),
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(24),
    paddingVertical: getHeightEquivalent(36),
    gap: getHeightEquivalent(26),
    backgroundColor: colors.primary,
    borderBottomLeftRadius: getWidthEquivalent(24),
    borderBottomRightRadius: getWidthEquivalent(24),
    shadowColor: colors.primary,
    shadowOpacity: getHeightEquivalent(0.15),
    shadowOffset: { width: 0, height: getHeightEquivalent(6) },
    shadowRadius: getHeightEquivalent(12),
    elevation: 4,
  },
  backButton: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(40),
    borderRadius: getWidthEquivalent(20),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  backButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  bannerContent: {
    flex: 1,
    justifyContent: "center",
  },
  bannerLabel: {
    fontSize: getHeightEquivalent(16),
    fontWeight: "500",
    color: colors.white,
  },
  bannerAmount: {
    marginTop: getHeightEquivalent(4),
    fontSize: getHeightEquivalent(26),
    fontWeight: "700",
    color: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: getWidthEquivalent(24),
    paddingTop: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
  },
  walletButton: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: getWidthEquivalent(24),
    paddingVertical: getHeightEquivalent(4),
    paddingHorizontal: getWidthEquivalent(16),
    alignSelf: "flex-start",
    marginVertical: getHeightEquivalent(12),
  },
  walletButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  walletButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  walletButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(6),
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: getWidthEquivalent(28),
    borderTopRightRadius: getWidthEquivalent(28),
    paddingTop: getHeightEquivalent(20),
    paddingBottom: getHeightEquivalent(32),
    paddingHorizontal: getWidthEquivalent(24),
  },
  modalHandle: {
    width: getWidthEquivalent(48),
    height: getHeightEquivalent(5),
    borderRadius: getWidthEquivalent(12),
    backgroundColor: colors.gray[200],
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getHeightEquivalent(12),
  },
  modalCloseButton: {
    paddingVertical: getHeightEquivalent(4),
    paddingHorizontal: getWidthEquivalent(8),
    borderRadius: getWidthEquivalent(12),
  },
  modalTitle: {
    fontSize: getHeightEquivalent(18),
    fontWeight: "600",
    color: colors.text,
    marginBottom: getHeightEquivalent(12),
  },
  modalItem: {
    paddingVertical: getHeightEquivalent(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  modalItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: getWidthEquivalent(16),
  },
  modalItemTextGroup: {
    flex: 1,
  },
  modalItemLabel: {
    fontSize: getHeightEquivalent(16),
    fontWeight: "600",
    color: colors.text,
  },
  modalItemSubtitle: {
    marginTop: getHeightEquivalent(4),
    fontSize: getHeightEquivalent(13),
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: getWidthEquivalent(20),
    paddingHorizontal: getWidthEquivalent(18),
    paddingVertical: getHeightEquivalent(18),
    marginTop: getHeightEquivalent(12),
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardItem: {
    paddingVertical: getHeightEquivalent(6),
    borderRadius: getWidthEquivalent(14),
    paddingHorizontal: getWidthEquivalent(12),
  },
  cardItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardItemPressed: {
    backgroundColor: "rgba(22, 119, 255, 0.08)",
    transform: [{ scale: 0.99 }],
  },
  cardItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(12),
  },
  cardItemLabel: {
    fontSize: getHeightEquivalent(16),
    fontWeight: "500",
    color: colors.text,
  },
  cardIconBadge: {
    width: getWidthEquivalent(36),
    height: getWidthEquivalent(36),
    borderRadius: getWidthEquivalent(12),
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray[200],
    marginVertical: getHeightEquivalent(8),
  },
  modalItemPressed: {
    backgroundColor: colors.gray[100],
  },
});

export default WalletScreen;
