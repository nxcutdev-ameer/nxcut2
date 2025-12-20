import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../../Constants/colors";
import { RootStackParamList } from "../../../Navigations/RootStackNavigator";
import { useTransactionDetailsScreenVM } from "./TransactionDetailsScreenVM";
import { fontEq } from "../../../Utils/helpers";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const baseSpacing = Math.max(screenWidth * 0.05, 16);
const secondarySpacing = Math.max(screenWidth * 0.035, 12);
const cardRadius = Math.min(screenWidth * 0.06, 18);
const cardPadding = Math.max(screenWidth * 0.045, 16);
const avatarSize = Math.max(screenWidth * 0.14, 48);
const closeButtonSize = Math.max(screenWidth * 0.1, 36);
const titleFontSize = Platform.OS === 'android' ? fontEq(16) : Math.min(26, screenWidth * 0.07);
const headingFontSize = Platform.OS === 'android' ? fontEq(14) : Math.max(16, screenWidth * 0.045);
const sectionTitleFontSize = Platform.OS === 'android' ? fontEq(12) : Math.max(14, screenWidth * 0.04);
const subtitleFontSize = Platform.OS === 'android' ? fontEq(12) : Math.max(12, screenWidth * 0.035);
const bodyFontSize = Platform.OS === 'android' ? fontEq(11) : Math.max(12, screenWidth * 0.036);
const smallFontSize = Platform.OS === 'android' ? fontEq(9): Math.max(12, screenWidth * 0.032);
const priceFontSize = Platform.OS === 'android' ? fontEq(10) : Math.max(12, screenWidth * 0.036);
const amountFontSize = Platform.OS === 'android' ? fontEq(10) : Math.max(16, screenWidth * 0.045);
const summaryValueFontSize = Platform.OS === 'android' ? fontEq(12) : Math.max(16, screenWidth * 0.043);
const dividerThickness = Math.max(screenHeight * 0.0015, 1);

type TransactionDetailsProps = StackScreenProps<
  RootStackParamList,
  "TransactionDetailsScreen"
>;

const TransactionDetailsScreen: React.FC<TransactionDetailsProps> = ({
  navigation,
  route,
}) => {
  const viewModel = useTransactionDetailsScreenVM(route);

  const {
    sale,
    isLoading,
    error,
    refetch,
    clientName,
    clientPhone,
    clientInitial,
    createdAtLabel,
    paymentMethod,
    subtotal,
    taxAmount,
    voucherDiscount,
    payableAmount,
    totalAmount,
    adjustedTip,
    // transactionId,
    appointmentServiceCreatedAtLabel,
    combinedItems,
    paymentMethods,
    formatCurrency,
  } = viewModel;

  const totalSectionAmount = subtotal + taxAmount + adjustedTip;
  const payableSectionAmount = totalSectionAmount - voucherDiscount;

  const tipPaymentMethod =
    sale?.sale_tips
      ?.map((tip: any) => tip?.payment_methods?.name)
      .find((name: any) => typeof name === "string" && name.trim().length > 0)
      ?.trim() ??
    null;

  const tipStaffNames =
    sale?.sale_tips
      ?.map((tip: any) => {
        const firstName = tip?.staff?.first_name ? String(tip.staff.first_name) : "";
        const lastName = tip?.staff?.last_name ? String(tip.staff.last_name) : "";
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName;
      })
      .filter((name: any) => typeof name === "string" && name.trim().length > 0)
      .filter((name: string, index: number, all: string[]) => all.indexOf(name) === index)
      .join(", ") ??
    "";

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Unable to load sale</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Ionicons
              name="refresh"
              size={18}
              color={colors.text}
              style={styles.retryIcon}
            />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : !sale ? (
        <View style={styles.centerState}>
          <Ionicons name="file-tray-outline" size={40} color={colors.border} />
          <Text style={styles.errorTitle}>Sale not found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.title}>Sale Summary</Text>
              <Text style={styles.dateText}>
                {appointmentServiceCreatedAtLabel}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Close sale details"
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.5}
            onPress={() => {
              const clientItem =
                sale?.appointment?.client ?? sale?.client ?? null;

              if (!clientItem) {
                return;
              }

              navigation.navigate("ClientDetail", { item: clientItem });
            }}
          >
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>{clientInitial}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{clientName}</Text>
              <Text style={styles.contactPhone}>{clientPhone}</Text>
            </View>
          </TouchableOpacity>

          <View
            style={[
              styles.Card,
              {
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowRadius: 16,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={colors.black}
                style={styles.summaryIcon}
              />
              <View style={styles.summaryTextGroup}>
                <Text style={styles.idLabel}>VAT Invoice# {sale.id}</Text>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.price}>
                  {formatCurrency(totalSectionAmount)}
                </Text>
              </View>
            </View>
            {/* <View style={[styles.summaryRow, styles.summaryRowLast]}>
              <Ionicons
                name="card-outline"
                size={18}
                color={colors.text}
                style={styles.summaryIcon}
              />
              <View style={styles.summaryTextGroup}>
                <Text style={styles.summaryLabel}>Payment Method</Text>
                <Text style={styles.summaryValue}>{paymentMethod}</Text>
              </View>
            </View> */}
          </View>

          {combinedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="file-tray-outline"
                size={40}
                color={colors.border}
              />
              <Text style={styles.emptyTitle}>No sale items</Text>
              <Text style={styles.emptyBody}>
                There are no linked services or sale items for this record.
              </Text>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.Card}>
                {combinedItems.map((item: any, index: number) => (
                  <View key={item.id}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <View style={styles.itemAmountGroup}>
                        {item.unitPrice && item.amount > item.unitPrice ? (
                          <Text
                            style={[styles.itemAmount, styles.itemAmountStruck]}
                          >
                            {formatCurrency(item.amount)}
                          </Text>
                        ) : null}
                        <Text style={styles.price}>
                          {formatCurrency(item.unitPrice ?? item.amount)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.itemMeta}>{item.staff}</Text>
                    {index < combinedItems.length - 1 ? (
                      <View style={styles.itemDivider} />
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* <View style={styles.section}>
            <View style={styles.Card}>
              <Text style={styles.sectionTitle}>Staff Information</Text>
              <Text style={styles.sectionSubtitle}>
                Receptionist:{" "}
                {sale?.appointment?.appointment_services?.[0]?.staff
                  ?.first_name ?? "Unknown"}
              </Text>
            </View>
          </View> */}
          <View style={styles.section}>
            <View style={styles.Card}>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Subtotal</Text>
                <Text style={styles.price}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>VAT 5%</Text>
                <Text style={styles.price}>+{formatCurrency(taxAmount)}</Text>
              </View>
              {(() => {
                const saleTips = sale?.sale_tips ?? [];

                return saleTips.length > 0
                  ? saleTips
                      .filter((tip: any) => Number(tip?.amount ?? 0) > 0)
                      .map((tip: any, index: number) => {
                      const firstName = tip?.staff?.first_name
                        ? String(tip.staff.first_name)
                        : "";
                      const lastName = tip?.staff?.last_name
                        ? String(tip.staff.last_name)
                        : "";
                      const staffName = `${firstName} ${lastName}`.trim();
                      const tipLabel = staffName ? `Tip • ${staffName}` : "Tip";
                      const amount = Number(tip?.amount ?? 0);

                      return (
                        <View
                          key={tip?.id ?? `${amount}-${index}`}
                          style={[styles.billingRow, styles.tipRow]}
                        >
                          <Text style={[styles.billingLabel, styles.tipLabel]}>
                            {tipLabel}
                          </Text>
                          <Text style={[styles.price, styles.tipValue]}>
                            +{formatCurrency(amount)}
                          </Text>
                        </View>
                      );
                    })
                : adjustedTip > 0
                  ? (
                      <View style={[styles.billingRow, styles.tipRow]}>
                        <Text style={[styles.billingLabel, styles.tipLabel]}>
                          Tip
                        </Text>
                        <Text style={[styles.price, styles.tipValue]}>
                          +{formatCurrency(adjustedTip)}
                        </Text>
                      </View>
                    )
                  : null;
             })()}
           </View>
         </View>
          {/* <View style={styles.section}>
            <View
              style={[
                styles.Card,
                { flexDirection: "row", justifyContent: "space-between" },
              ]}
            >
              <Text style={styles.sectionTitle}>
                Amount paid through voucher
              </Text>
              <Text style={styles.price}>-{formatCurrency(voucherDiscount)}</Text> 
            </View>
          </View> */}
          <View style={styles.section}>
            <View style={styles.Card}>
              <View style={styles.billingRow}>
                <Text style={styles.sectionTitle}>Total</Text>
                <Text style={styles.itemAmountStruck}>
                  {formatCurrency(totalSectionAmount)}
                </Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.sectionTitle}>Payable Amount</Text>
                <Text style={styles.price}>
                  {formatCurrency(payableSectionAmount)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.Card}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              {paymentMethods.length === 0 ? (
                <View style={styles.paymentEmptyState}>
                  <Ionicons
                    name="card-outline"
                    size={22}
                    color={colors.primary}
                    style={styles.paymentEmptyIcon}
                  />
                  <Text style={styles.paymentEmptyTitle}>
                    No payment Methods
                  </Text>
                </View>
              ) : (
                <>
                  {paymentMethods.map((method: any) => {
                    const baseAmount = method?.amount ?? 0;
                    const tipAmount = method?.tip_amount ?? 0;
                    const hasTip = Number(tipAmount) > 0;

                    return (
                    <View
                      key={method?.id ?? method?.payment_method ?? String(baseAmount)}
                      style={styles.billingRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.billingLabel}>
                          • {method?.payment_method ?? "Unknown method"}
                        </Text>
                        {hasTip ? (
                          <Text style={[styles.billingLabel, styles.tipLabel]}>
                            {tipStaffNames ? `Tip • ${tipStaffNames}` : "Tip"}
                          </Text>
                        ) : null}
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.price}>{formatCurrency(baseAmount)}</Text>
                        {hasTip ? (
                          <Text style={[styles.price, styles.tipValue]}>
                            + {formatCurrency(tipAmount)}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                  })}
                  {adjustedTip > 0 ? (
                    <View style={[styles.billingRow, styles.tipRow]}>
                      <Text style={[styles.billingLabel, styles.tipLabel]}>
                        {tipPaymentMethod
                          ? `Tip via ${tipPaymentMethod}`
                          : "Tip Total"}
                      </Text>
                      <Text style={[styles.price, styles.tipValue]}>
                        {formatCurrency(adjustedTip)}
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
              {createdAtLabel ? (
                <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>
                  {createdAtLabel}
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: baseSpacing,
  },
  content: {
    padding: baseSpacing,
    paddingBottom: baseSpacing * 2,
  },
  errorTitle: {
    marginTop: secondarySpacing,
    fontSize: headingFontSize,
    fontWeight: "600",
    color: colors.text,
  },
  errorBody: {
    marginTop: secondarySpacing * 0.5,
    fontSize: bodyFontSize,
    color: colors.text,
    opacity: 0.7,
    textAlign: "center",
  },
  retryButton: {
    marginTop: secondarySpacing,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: cardRadius,
    paddingVertical: secondarySpacing * 0.8,
    paddingHorizontal: baseSpacing,
  },
  retryIcon: {
    marginRight: secondarySpacing * 0.6,
  },
  retryText: {
    fontSize: bodyFontSize,
    fontWeight: "600",
    color: colors.white,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: secondarySpacing,
  },
  headerTextGroup: {
    flex: 1,
    marginRight: secondarySpacing,
  },
  title: {
    fontSize: titleFontSize,
    fontWeight: "700",
    color: colors.text,
  },
  dateText: {
    marginTop: secondarySpacing * 0.35,
    fontSize: bodyFontSize,
    color: colors.text,
    opacity: 0.7,
  },
  closeButton: {
    width: closeButtonSize,
    height: closeButtonSize,
    borderRadius: closeButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: cardRadius,
    padding: cardPadding,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: secondarySpacing,
  },
  contactAvatar: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5E7FD",
    marginRight: secondarySpacing,
  },
  contactAvatarText: {
    fontSize: headingFontSize,
    fontWeight: "700",
    color: "#3C096C",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: headingFontSize,
    fontWeight: "600",
    color: colors.text,
  },
  contactPhone: {
    marginTop: secondarySpacing * 0.2,
    fontSize: bodyFontSize,
    color: colors.text,
    opacity: 0.6,
  },
  Card: {
    backgroundColor: "#fff",
    borderRadius: cardRadius,
    padding: cardPadding,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginTop: secondarySpacing,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: secondarySpacing,
  },
  summaryRowLast: {
    marginBottom: 0,
  },
  summaryIcon: {
    marginRight: secondarySpacing,
  },
  summaryTextGroup: {
    flex: 1,
  },
  idLabel: {
    fontSize: smallFontSize,
    color: colors.text,
    opacity: 0.6,
  },
  summaryLabel: {
    marginTop: secondarySpacing * 0.2,
    fontSize: bodyFontSize,
    color: colors.text,
    opacity: 0.7,
  },
  summaryValue: {
    marginTop: secondarySpacing * 0.2,
    fontSize: summaryValueFontSize,
    fontWeight: "600",
    color: colors.text,
  },
  price: {
    marginTop: secondarySpacing * 0.3,
    fontSize: priceFontSize,
    fontWeight: "600",
    color: colors.black,
  },
  emptyState: {
    alignItems: "center",
    padding: cardPadding,
    borderRadius: cardRadius,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: "rgba(0,0,0,0.02)",
    marginTop: secondarySpacing,
  },
  emptyTitle: {
    marginTop: secondarySpacing,
    fontSize: headingFontSize,
    fontWeight: "600",
    color: colors.text,
  },
  emptyBody: {
    marginTop: secondarySpacing * 0.4,
    fontSize: bodyFontSize,
    color: colors.text,
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    marginTop: secondarySpacing,
  },
  sectionTitle: {
    fontSize: sectionTitleFontSize,
    color: colors.text,
    marginBottom: secondarySpacing * 0.6,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: subtitleFontSize,
    color: colors.text,
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: secondarySpacing * 0.5,
  },
  itemTitle: {
    fontSize: bodyFontSize,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: secondarySpacing,
  },
  itemAmountGroup: {
    alignItems: "flex-end",
  },
  itemAmount: {
    fontSize: amountFontSize,
    fontWeight: "700",
    color: colors.text,
  },
  itemAmountStruck: {
    textDecorationLine: "line-through",
    color: colors.text,
    opacity: 0.6,
  },
  itemMeta: {
    fontSize: smallFontSize,
    color: colors.text,
    opacity: 0.6,
  },
  itemDivider: {
    height: dividerThickness,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: secondarySpacing,
  },
  billingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: secondarySpacing,
  },
  billingLabel: {
    fontSize: bodyFontSize,
    color: colors.text,
    opacity: 0.7,
  },
  tipRow: {
    backgroundColor: "#FFF5E6",
    paddingVertical: secondarySpacing * 0.6,
    paddingHorizontal: baseSpacing,
    borderRadius: 12,
  },
  tipLabel: {
    color: "#7B3F00",
    fontWeight: "700",
  },
  tipValue: {
    color: "#7B3F00",
  },
  paymentEmptyState: {
    marginTop: secondarySpacing,
    alignItems: "center",
    paddingVertical: secondarySpacing,
    paddingHorizontal: baseSpacing,
    borderRadius: cardRadius,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  paymentEmptyIcon: {
    marginBottom: secondarySpacing * 0.5,
  },
  paymentEmptyTitle: {
    fontSize: sectionTitleFontSize,
    fontWeight: "600",
    color: colors.text,
    marginBottom: secondarySpacing * 0.4,
    textAlign: "center",
  },
});

export default TransactionDetailsScreen;
