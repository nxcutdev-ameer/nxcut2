import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { colors } from "../Constants/colors";
import { clientRepository } from "../Repository/clientRepository";
import { formatCurrency } from "../Utils/helpers";
import { RootStackParamList } from "../Navigations/RootStackNavigator";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isLargeScreen = screenWidth >= 768;
const isTallScreen = screenHeight >= 800;

const horizontalPadding = isLargeScreen ? 18 : 6;
const topPadding = isTallScreen ? -32 : -6;
const cardPadding = isLargeScreen ? 24 : 20;
const cardSpacing = isLargeScreen ? 20 : 16;
const cardRadius = isLargeScreen ? 22 : 18;
const cardMaxWidth = Math.min(720, screenWidth - horizontalPadding * 2);
const metaGap = isLargeScreen ? 16 : 12;
const chipPaddingVertical = isLargeScreen ? 8 : 6;
const chipPaddingHorizontal = isLargeScreen ? 14 : 12;
const badgePaddingVertical = isLargeScreen ? 6 : 4;
const badgePaddingHorizontal = isLargeScreen ? 18 : 14;
const listPaddingBottom = isTallScreen ? 48 : 32;
const listPaddingHorizontal = isLargeScreen ? 12 : 4;
const messagePadding = isLargeScreen ? 20 : 16;
const messageMaxWidth = Math.min(cardMaxWidth, screenWidth - horizontalPadding * 2);
const loaderMinHeight = screenHeight * 0.3;
const messageMinHeight = screenHeight * 0.18;
const cardIconSize = isLargeScreen ? 54 : 46;
const cardIconRadius = isLargeScreen ? 16 : 14;
const statusFontSize = isLargeScreen ? 13 : 12;
const itemTitleLines = isLargeScreen ? 2 : 2;
const receiptIconSize = isLargeScreen ? 24 : 22;
const cashIconSize = isLargeScreen ? 16 : 14;
const eyeIconSize = isLargeScreen ? 20 : 18;

export type ClientSalesTabProps = {
  clientId: string;
};

const ClientSalesTab: React.FC<ClientSalesTabProps> = ({ clientId }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientRepository.getSalesByClientId({ clientId });
      setSales(data ?? []);
    } catch (e: any) {
      setError(e?.message || "Unable to load sales");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleRefresh = useCallback(async () => {
    await fetchSales();
  }, [fetchSales]);

  const renderSaleItems = useCallback((sale: any) => {
    const appointmentServices = sale.appointment?.appointment_services ?? [];
    const saleItems = sale.sale_items ?? [];

    if (appointmentServices.length > 0) {
      return appointmentServices.map((serviceEntry: any) => {
        const linkedSaleItem = saleItems.find(
          (saleItem: any) =>
            saleItem.appointment_service_id &&
            saleItem.appointment_service_id === serviceEntry.id
        );

        const amount =
          linkedSaleItem?.total_price ??
          (linkedSaleItem?.unit_price && linkedSaleItem?.quantity
            ? Number(linkedSaleItem.unit_price) * Number(linkedSaleItem.quantity)
            : undefined) ??
          serviceEntry?.price ??
          serviceEntry?.service?.price ??
          0;

        const title =
          serviceEntry?.service?.name ??
          serviceEntry?.name ??
          linkedSaleItem?.item_name ??
          "Service";

        return (
          <View key={serviceEntry.id ?? linkedSaleItem?.id ?? title} style={styles.itemRow}>
            <View style={styles.itemHeading}>
              <Text style={styles.itemTitle} numberOfLines={itemTitleLines}>
                {title}
              </Text>
              <Text style={styles.itemTotal}>AED {Number(amount ?? 0).toFixed(2)}</Text>
            </View>
          </View>
        );
      });
    }

    if (saleItems.length === 0) {
      return <Text style={styles.cardMeta}>No items recorded for this sale.</Text>;
    }

    return saleItems.map((item: any) => {
      const staffName = item.staff ? [item.staff.first_name, item.staff.last_name].filter(Boolean).join(" ") : "No staff recorded";

      return (
        <View key={item.id} style={styles.itemRow}>
          <View style={styles.itemHeading}>
            <Text style={styles.itemTitle} numberOfLines={itemTitleLines}>
              {item.item_name ?? "Item"}
            </Text>
            <Text style={styles.itemTotal}>AED {Number(item.total_price ?? (item.unit_price && item.quantity ? Number(item.unit_price) * Number(item.quantity) : 0)).toFixed(2)}</Text>
          </View>
          <Text style={styles.itemMeta}>{staffName}</Text>
        </View>
      );
    });
  }, []);

  if (isLoading && sales.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>Unable to load sales</Text>
        <Text style={styles.messageBody}>{error}</Text>
      </View>
    );
  }

  if (sales.length === 0) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>No Sales Found</Text>
        <Text style={styles.messageBody}>
          This client does not have any completed sales yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <FlatList
          data={sales}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }) => {
            const createdAt = item.created_at
              ? new Date(item.created_at).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date not available";

            const total = item.total_amount || 0;
            const appointmentStatus = (item.appointment?.status || "").toLowerCase();
            const displayStatus = appointmentStatus;
            const statusStyle =
              displayStatus === "paid"
                ? styles.statusBadgeSuccess
                : displayStatus === "pending"
                ? styles.statusBadgeWarning
                : styles.statusBadgeNeutral;

            const totalFormatted = formatCurrency(Number(total));

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  {/* <View style={styles.cardIconWrap}>
                    <Ionicons
                      name="receipt-outline"
                      size={receiptIconSize}
                      color={colors.primary}
                    />
                  </View> */}

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>Sale</Text>
                    <Text style={styles.DateLabel}>{createdAt}</Text>
                  </View>

                  <View style={[styles.statusBadge, statusStyle]}>
                    <Text style={styles.statusBadgeText}>
                      {displayStatus || "unknown"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />
                {renderSaleItems(item)}
                <View style={styles.cardDivider} />

                <View style={styles.metaRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <View style={styles.metaChip}>
                    <Ionicons
                      name="cash-outline"
                      size={cashIconSize}
                      color={colors.text}
                      style={styles.metaChipIcon}
                    />
                    <Text style={styles.amountChipText}>AED {totalFormatted}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.viewSaleButton}
                    onPress={() =>
                      navigation.navigate("TransactionDetailsScreen", {
                        saleId: String(item.id),
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={eyeIconSize}
                      color={colors.black}
                    />
                    <Text style={styles.viewSaleText}>View Sale</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    paddingHorizontal: horizontalPadding,
    paddingTop: topPadding,
  },
  listContent: {
    paddingBottom: listPaddingBottom,
    paddingHorizontal: listPaddingHorizontal,
    alignItems: isLargeScreen ? "center" : undefined,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: loaderMinHeight,
  },
  messageContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: messagePadding,
    marginHorizontal: 4,
    maxWidth: messageMaxWidth,
    alignSelf: "center",
    width: "100%",
    minHeight: messageMinHeight,
    justifyContent: "center",
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  messageBody: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: cardRadius,
    padding: cardPadding,
    marginBottom: cardSpacing,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    width: "100%",
    maxWidth: cardMaxWidth,
    alignSelf: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: cardSpacing,
  },
  cardIconWrap: {
    width: cardIconSize,
    height: cardIconSize,
    borderRadius: cardIconRadius,
    backgroundColor: "rgba(99, 102, 241, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: isLargeScreen ? 16 : 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: isLargeScreen ? 18 : 17,
    fontWeight: "700",
    color: colors.text,
  },
  totalLabel: {
    fontSize: isLargeScreen ? 18 : 17,
    fontWeight: "500",
    color: colors.text,
  },
   DateLabel: {
    fontSize: isLargeScreen ? 14 : 13,
    fontWeight: "500",
    color: colors.text,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.7,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginVertical: isLargeScreen ? 14 : 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: metaGap,
    flexWrap: "wrap",
    justifyContent:'space-between',
    marginBottom: metaGap,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: chipPaddingVertical,
    paddingHorizontal: chipPaddingHorizontal,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  metaChipIcon: {
    marginRight: 6,
  },
  amountChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.black,
  },
  itemRow: {
    marginBottom: cardSpacing,
    width: "100%",
  },
  itemHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: isLargeScreen ? 6 : 4,
    gap: isLargeScreen ? 16 : 12,
  },
  itemTitle: {
    fontSize: isLargeScreen ? 15 : 14,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.black,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  cardFooter: {
    marginTop: cardSpacing,
  },
  statusBadge: {
    borderRadius: 999,
    paddingVertical: badgePaddingVertical,
    paddingHorizontal: badgePaddingHorizontal,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  statusBadgeSuccess: {
    backgroundColor: "rgba(46, 204, 113, 0.2)",
  },
  statusBadgeWarning: {
    backgroundColor: "rgba(241, 196, 15, 0.2)",
  },
  statusBadgeNeutral: {
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  statusBadgeText: {
    fontSize: statusFontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.text,
  },
  viewSaleButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: isLargeScreen ? 10 : 8,
    paddingVertical: isLargeScreen ? 14 : 12,
    borderRadius: 12,
    backgroundColor: "rgba(99, 102, 241, 0.10)",
    borderColor: colors.border,
    borderWidth:1
  },
  viewSaleText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});

export default ClientSalesTab;
