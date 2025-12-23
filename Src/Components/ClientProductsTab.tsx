import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
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
import { clientRepository } from "../Repository/clientRepository";
import { fontEq, formatCurrency } from "../Utils/helpers";
import { RootStackParamList } from "../Navigations/RootStackNavigator";

export type ClientProductsTabProps = {
  clientId: string;
  limitRecords?: number;
};

type ProductPurchaseRow = {
  id: string;
  item_name: string | null;
  quantity: number | null;
  created_at: string | null;
  sales: {
    sale_id: string;
    total_amount: number | null;
    location?: { name?: string | null } | null;
  } | null;
};

const ClientProductsTab: React.FC<ClientProductsTabProps> = ({
  clientId,
  limitRecords,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();

  const styles = useMemo(() => createStyles(width), [width]);

  const [products, setProducts] = useState<ProductPurchaseRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!clientId) {
      setProducts([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await clientRepository.getProductPurchasesByClientId({
        clientId,
        limitRecords,
      });

      if (__DEV__) {
        console.log("[ClientProductsTab] fetched products", {
          clientId,
          count: data?.length ?? 0,
        });
      }

      setProducts(data || []);
    } catch (e: any) {
      setError(e?.message || "Unable to load products");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, limitRecords]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  if (isLoading && products.length === 0) {
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
          <Text style={styles.messageTitle}>Unable to load products</Text>
          <Text style={styles.messageBody}>{error}</Text>
        </View>
    );
  }

  if (products.length === 0) {
    return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>No Products Found</Text>
          <Text style={styles.messageBody}>
            You currently do not have any product purchases on record.
          </Text>
        </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
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

        const sale = item.sales;
        const total = sale?.total_amount ?? 0;
        const quantity = item.quantity ?? 1;
        const locationName = sale?.location?.name ?? null;

        const handleViewSale = () => {
          if (!sale?.sale_id) {
            Alert.alert(
              "Unavailable",
              "No sale is linked to this product purchase."
            );
            return;
          }

          navigation.navigate("TransactionDetailsScreen", {
            saleId: String(sale.sale_id),
          });
        };

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Ionicons name="cube-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>
                  {item.item_name || "Product"}
                </Text>
                {!!locationName && (
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={colors.text}
                      style={styles.locationIcon}
                    />
                    <Text style={styles.cardLocation}>{locationName}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardAmountPill}>
                <Text style={styles.cardAmountLabel}>Total</Text>
                <Text style={styles.cardAmount}>
                  AED {formatCurrency(Number(total))}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Ionicons
                  name="cube"
                  size={14}
                  color={colors.text}
                  style={styles.metaChipIcon}
                />
                <Text style={styles.metaChipText}>Qty {quantity}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.text}
                  style={styles.metaChipIcon}
                />
                <Text style={styles.metaChipText}>{createdAt}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.viewSaleButton}
                onPress={handleViewSale}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="eye-outline"
                  size={18}
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
          onRefresh={fetchProducts}
          colors={[colors.primary]}
        />
      }
      contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
    />
  );
};

const createStyles = (width: number) => {
  const clamp = (value: number, min: number, max?: number) => {
    const minApplied = Math.max(value, min);
    if (typeof max === "number") {
      return Math.min(minApplied, max);
    }
    return minApplied;
  };

  const horizontalPadding = clamp(width * 0.01, 6, 16);
  const cardPadding = clamp(width * 0.045, 16, 28);
  const cardRadius = clamp(width * 0.04, 14, 24);
  const iconSize = clamp(width * 0.12, 38, 56);
  const pillPaddingV = clamp(width * 0.025, 6, 12);
  const pillPaddingH = clamp(width * 0.035, 10, 18);
  const metaGap = clamp(width * 0.035, 10, 18);
  const metaPaddingV = clamp(width * 0.022, 5, 10);
  const metaPaddingH = clamp(width * 0.03, 8, 14);

  return StyleSheet.create({
    listContent: {
      paddingBottom: 32,
      paddingHorizontal: clamp(width * 0.01, 4, 16),
    },
    fullStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: horizontalPadding,
    },
    loaderContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    messageContainer: {
      backgroundColor: colors.white,
      borderRadius: clamp(cardRadius * 0.7, 12, 20),
      borderWidth: 1,
      borderColor: colors.gray[200],
      padding: clamp(cardPadding, 16, 24),
      marginHorizontal: horizontalPadding,
      width:"100%"
    },
    messageTitle: {
      fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      fontWeight: "600",
      color: colors.black,
      marginBottom: clamp(8, 6, 12),
    },
    messageBody: {
      fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      color: colors.gray[700],
      lineHeight: clamp(20, 18, 26),
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: cardRadius,
      padding: cardPadding,
      marginBottom: clamp(16, 12, 24),
      borderWidth: 2,
      borderColor: "rgba(0,0,0,0.08)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.04,
      shadowRadius: clamp(cardRadius, 12, 24),
      elevation: 4,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: clamp(cardPadding * 0.9, 12, 20),
    },
    cardIconWrap: {
      width: iconSize,
      height: iconSize,
      borderRadius: clamp(iconSize * 0.28, 12, 20),
      backgroundColor: "rgba(0,0,0,0.04)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: clamp(width * 0.03, 10, 18),
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(15),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      fontWeight: "700",
      color: colors.black,
    },
    cardLocation: {
      fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      color: colors.gray[700],
      opacity: 0.75,
    },
    locationRow: {
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: clamp(width * 0.015, 4, 10),
    },
    locationIcon: {
      opacity: 0.7,
    },
    cardAmountPill: {
      paddingVertical: pillPaddingV,
      paddingHorizontal: pillPaddingH,
      borderRadius: clamp(cardRadius * 0.8, 12, 22),
      backgroundColor: "rgba(0,0,0,0.04)",
      alignItems: "flex-end",
    },
    cardAmountLabel: {
      fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(11),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      fontWeight: "600",
      letterSpacing: 0.5,
      color: colors.gray[700],
      textTransform: "uppercase",
    },
    cardAmount: {
      fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      fontWeight: "700",
      color: colors.black,
    },
    metaRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: clamp(12, 10, 20),
      gap: metaGap,
      flexWrap: "wrap",
    },
    metaChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: metaPaddingV,
      paddingHorizontal: metaPaddingH,
      borderRadius: clamp(metaPaddingH, 8, 16),
      backgroundColor: "rgba(0,0,0,0.04)",
    },
    metaChipIcon: {
      marginRight: clamp(width * 0.015, 4, 8),
    },
    metaChipText: {
      fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      fontWeight: "600",
      color: colors.gray[700],
    },
    cardFooter: {
      marginTop: clamp(12, 12, 24),
    },
    viewSaleButton: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: clamp(width * 0.02, 6, 14),
      paddingVertical: 14,
      borderRadius: clamp(cardRadius * 0.9, 12, 24),
      backgroundColor: "rgba(99, 102, 241, 0.10)",
    },
    viewSaleText: {
      fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      fontWeight: "700",
      color: colors.black,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
  });
};

export default ClientProductsTab;
