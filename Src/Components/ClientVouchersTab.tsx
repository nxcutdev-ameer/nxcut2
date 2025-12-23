import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { colors } from "../Constants/colors";
import { clientRepository, ClientVoucher } from "../Repository/clientRepository";
import { RootStackParamList } from "../Navigations/RootStackNavigator";

export type ClientVouchersTabProps = {
  clientId: string;
  /** If false, only show vouchers with remaining balance > 0 */
  includeZeroBalance?: boolean;
};

const ClientVouchersTab: React.FC<ClientVouchersTabProps> = ({
  clientId,
  includeZeroBalance = false,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const { styles, metaIconSize, activityIconSize } = useMemo(
    () => createResponsiveStyles(screenWidth, screenHeight),
    [screenWidth, screenHeight]
  );

  const [vouchers, setVouchers] = useState<ClientVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    if (!clientId) {
      setVouchers([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await clientRepository.getClientVouchersByClientId({
        clientId,
        includeZeroBalance,
      });

      if (__DEV__) {
        console.log("[ClientVouchersTab] fetched vouchers", {
          clientId,
          count: data?.length ?? 0,
        });
      }

      setVouchers(data || []);
    } catch (e: any) {
      setError(e?.message || "Unable to load vouchers");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, includeZeroBalance]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  if (!clientId) {
    return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>No Client Linked</Text>
          <Text style={styles.messageBody}>
            This client is not available. Please try again.
          </Text>
        </View>
    );
  }

  if (isLoading && vouchers.length === 0) {
    return (
      <View style={styles.fullStateContainer}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Unable to load vouchers</Text>
          <Text style={styles.messageBody}>{error}</Text>
        </View>
    );
  }

  if (vouchers.length === 0) {
    return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>No Active Vouchers</Text>
          <Text style={styles.messageBody}>
            You currently do not have any vouchers with remaining balance.
          </Text>
        </View>
    );
  }

  return (
    <FlatList
      data={vouchers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const title = item.voucher_name || "Voucher";

        const updatedAtLabel = (() => {
          if (!item.updated_at) {
            return "Updated date unavailable";
          }

          const timestamp = new Date(item.updated_at);
          try {
            return new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Dubai",
            }).format(timestamp);
          } catch (intlErr) {
            if (__DEV__) {
              console.warn(
                "[ClientVouchersTab] Intl date formatting failed; falling back",
                intlErr
              );
            }
            return timestamp.toLocaleString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          }
        })();

        const voucherCode = item.voucher_code || "No code available";
        const remainingBalance = Number(item.remaining_balance ?? 0);
        const usedAmount = Number(item.total_used ?? 0);
        const voucherStatus = remainingBalance > 0 ? "active" : "inactive";
        const statusStyle =
          voucherStatus === "active"
            ? styles.statusBadgeActive
            : styles.statusBadgeInactive;

        const handleViewSale = () => {
          if (!item.purchase_sale_id) {
            Alert.alert("Unavailable", "No sale is linked to this voucher.");
            return;
          }

          // App navigation uses TransactionDetailsScreen.
          navigation.navigate("TransactionDetailsScreen", {
            saleId: String(item.purchase_sale_id),
          });
        };

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{title}</Text>
              <View style={[styles.statusBadge, statusStyle]}>
                <Text style={styles.statusBadgeText}>
                  {voucherStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.cardMetaUsed}>Used: {usedAmount.toFixed(2)} AED</Text>

            <View style={styles.cardInfoRow}>
              <Ionicons
                name="calendar-outline"
                size={metaIconSize}
                color={colors.black}
                style={styles.metaIcon}
              />
              <Text style={styles.cardSubtitle}>{updatedAtLabel}</Text>
            </View>

            <View style={styles.cardInfoRow}>
              <Ionicons
                name="pricetag-outline"
                size={metaIconSize}
                color={colors.primary}
                style={styles.metaIcon}
              />
              <Text style={styles.codeText}>{voucherCode}</Text>
            </View>

            <View style={styles.cardInfoRow}>
              <Ionicons
                name="wallet-outline"
                size={metaIconSize}
                color={colors.primary}
                style={styles.metaIcon}
              />
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceText}>
                  {remainingBalance.toFixed(2)} AED
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.activityButton}
              onPress={handleViewSale}
              activeOpacity={0.85}
            >
              <Ionicons
                name="eye-outline"
                size={activityIconSize}
                color={colors.primary}
                style={styles.activityIcon}
              />
              <Text style={styles.activityText}>View Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.activityButton}
              onPress={() => {
                Alert.alert(
                  "Coming soon",
                  "Voucher activity screen is not wired in this app yet."
                );
              }}
              activeOpacity={0.85}
            >
              <Ionicons
                name="pulse-outline"
                size={activityIconSize}
                color={colors.primary}
                style={styles.activityIcon}
              />
              <Text style={styles.activityText}>View Activity</Text>
            </TouchableOpacity>
          </View>
        );
      }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={fetchVouchers}
          colors={[colors.primary]}
        />
      }
      contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
    />
  );
};

const createResponsiveStyles = (screenWidth: number, screenHeight: number) => {
  const isLargeScreen = screenWidth >= 768;
  const isTallScreen = screenHeight >= 800;
  const horizontalPadding = isLargeScreen ? 28 : 16;
  const topPadding = isTallScreen ? -32 : -16;
  const cardSpacing = isLargeScreen ? 20 : 12;
  const cardMaxWidth = Math.min(720, screenWidth - horizontalPadding * 2);
  const listPaddingBottom = isTallScreen ? 48 : 32;
  const listPaddingHorizontal = isLargeScreen ? 12 : 8;
  const messagePadding = isLargeScreen ? 20 : 16;
  const messageRadius = isLargeScreen ? 16 : 12;
  const messageMaxWidth = Math.min(680, screenWidth - horizontalPadding * 2);
  const loaderMinHeight = screenHeight * 0.3;
  const titleFontSize = isLargeScreen ? 26 : 24;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
      paddingHorizontal: horizontalPadding,
      paddingTop: topPadding,
    },
    title: {
      fontSize: titleFontSize,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 4,
    },
    header: {
      marginBottom: cardSpacing,
      maxWidth: cardMaxWidth,
      width: "100%",
      alignSelf: "center",
    },
    listContent: {
      paddingBottom: listPaddingBottom,
      paddingHorizontal: listPaddingHorizontal,
      alignItems: isLargeScreen ? "center" : undefined,
      flexGrow: 1,
    },
    fullStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalPadding,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      minHeight: loaderMinHeight,
    },
    messageContainer: {
      backgroundColor: colors.white,
      borderRadius: messageRadius,
      borderWidth: 1,
      borderColor: colors.gray[200],
      padding: messagePadding,
      marginHorizontal: 4,
      maxWidth: messageMaxWidth,
      alignSelf: "center",
      width: "100%",
    },
    messageTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.black,
      marginBottom: 8,
    },
    messageBody: {
      fontSize: 14,
      color: colors.gray[700],
      opacity: 0.9,
      lineHeight: 20,
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.08)",
      width: isLargeScreen ? cardMaxWidth : "100%",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.black,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 99,
      backgroundColor: "rgba(0,0,0,0.08)",
    },
    statusBadgeActive: {
      backgroundColor: "rgba(46, 204, 113, 0.18)",
    },
    statusBadgeInactive: {
      backgroundColor: "rgba(231, 76, 60, 0.18)",
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      color: colors.black,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.black,
      opacity: 0.6,
      marginBottom: 12,
    },
    cardMetaUsed: {
      fontSize: 12,
      color: colors.black,
      opacity: 0.6,
      marginBottom: 8,
    },
    cardInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaIcon: {
      marginRight: 4,
    },
    codeText: {
      fontSize: 12,
      fontWeight: "300",
      letterSpacing: 0.5,
      color: colors.black,
      paddingVertical: 10,
    },
    balanceBadge: {
      backgroundColor: "rgba(0,0,0,0.04)",
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    balanceText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.success,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    activityButton: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      gap: 6,
    },
    activityIcon: {
      marginRight: 4,
    },
    activityText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
  });

  return {
    styles,
    metaIconSize: isLargeScreen ? 18 : 16,
    activityIconSize: isLargeScreen ? 18 : 16,
  };
};

export default ClientVouchersTab;
