import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";

interface SalePaymentMethod {
  payment_method: string;
  amount: number;
  sales: {
    id: number;
    location_id: string;
    created_at: string;
    tip_amount: number;
    appointment?: {
      id: string;
      appointment_services?: Array<{
        staff?: {
          id: string;
          first_name: string;
          last_name: string;
        } | null;
      }>;
    } | null;
  };
  adjustedTipAmount?: number; // Add processed tip amount
  isTipTransaction?: boolean; // Flag for tip transactions
}

interface SalesTableProps {
  data: SalePaymentMethod[];
  loading: boolean;
}

const SalesTable: React.FC<SalesTableProps> = ({ data, loading }) => {
  const { colors: paint } = colors;
  const navigation = useNavigation<any>();

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderTableHeader = () => (
    <View
      style={[
        styles.tableRow,
        styles.headerRow,
        { backgroundColor: paint.backgroundSecondary },
      ]}
    >
      <View style={[styles.headerCell, styles.timeColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Time</Text>
      </View>
      <View style={[styles.headerCell, styles.paymentColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Payment</Text>
      </View>
      <View style={[styles.headerCell, styles.amountColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Amount</Text>
      </View>
      <View style={[styles.headerCell, styles.tipColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Tip</Text>
      </View>
      <View style={[styles.headerCell, styles.totalColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Total</Text>
      </View>
      <View style={[styles.headerCell, styles.staffColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Staff</Text>
      </View>
    </View>
  );

  const handleRowPress = (item: SalePaymentMethod) => {
    const saleId = item?.sales?.id ? String(item.sales.id) : undefined;
    navigation.navigate("TransactionDetailsScreen", {
      saleId,
      fallbackTransaction: item,
    });
  };

  const renderTableRow = ({ item }: { item: SalePaymentMethod }) => {
    const adjustedTip = item.adjustedTipAmount || 0;
    const total = item.amount + adjustedTip;
    const displayPaymentMethod = item.isTipTransaction
      ? `${item.payment_method} (Tip)`
      : item.payment_method;

    const staffNames =
      item?.sales?.appointment?.appointment_services
        ?.map((svc: any) => {
          const firstName = svc?.staff?.first_name
            ? String(svc.staff.first_name)
            : "";
          const lastName = svc?.staff?.last_name ? String(svc.staff.last_name) : "";
          const fullName = `${firstName} ${lastName}`.trim();
          return fullName;
        })
        .filter((name: any) => typeof name === "string" && name.trim().length > 0)
        .filter((name: string, index: number, all: string[]) => all.indexOf(name) === index)
        .join(", ") ??
      "";

    return (
      <TouchableOpacity
        style={[styles.tableRow, { borderBottomColor: paint.border }]}
        onPress={() => handleRowPress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cell, styles.timeColumn, { color: paint.text }]}>
          {formatTime(item.sales.created_at)}
        </Text>
        <Text
          style={[styles.cell, styles.paymentColumn, { color: paint.text }]}
        >
          {displayPaymentMethod}
        </Text>
        <Text style={[styles.cell, styles.amountColumn, { color: paint.text }]}>
          {formatCurrency(item.amount)}
        </Text>
        <Text style={[styles.cell, styles.tipColumn, { color: paint.text }]}>
          {formatCurrency(adjustedTip)}
        </Text>
        <Text
          style={[
            styles.cell,
            styles.totalColumn,
            { color: paint.text, fontWeight: "600" },
          ]}
        >
          {formatCurrency(total)}
        </Text>
        <Text style={[styles.cell, styles.staffColumn, { color: paint.text }]}>
          {staffNames || "—"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: paint.textSecondary }]}>
        No sales data found for this date
      </Text>
    </View>
  );

  const calculateSummary = () => {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const totalTips = data.reduce(
      (sum, item) => sum + (item.adjustedTipAmount || 0),
      0
    );
    const grandTotal = totalAmount + totalTips;

    return { totalAmount, totalTips, grandTotal };
  };

  const renderSummary = () => {
    if (data.length === 0) return null;

    const { totalAmount, totalTips, grandTotal } = calculateSummary();

    return (
      <View
        style={[
          styles.summaryContainer,
          { backgroundColor: paint.backgroundSecondary },
        ]}
      >
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: paint.text }]}>
            Total Transactions: {data.length}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: paint.text }]}>
            Subtotal:
          </Text>
          <Text style={[styles.summaryValue, { color: paint.text }]}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: paint.text }]}>
            Tips:
          </Text>
          <Text style={[styles.summaryValue, { color: paint.text }]}>
            {formatCurrency(totalTips)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text
            style={[
              styles.summaryLabel,
              styles.totalLabel,
              { color: paint.text },
            ]}
          >
            Grand Total:
          </Text>
          <Text
            style={[
              styles.summaryValue,
              styles.totalValue,
              { color: paint.primary },
            ]}
          >
            {formatCurrency(grandTotal)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paint.primary} />
        <Text style={[styles.loadingText, { color: paint.textSecondary }]}>
          Loading sales data...
        </Text>
      </View>
    );
  }

  // Sort data by time before rendering
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.sales.created_at).getTime() -
      new Date(b.sales.created_at).getTime()
  );

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.container, styles.tableMinWidth]}>
          {renderTableHeader()}
          {sortedData.length === 0
            ? renderEmptyState()
            : sortedData.map((item, index) => (
                <View key={`${item.sales.id}-${index}`}>
                  {renderTableRow({ item })}
                </View>
              ))}
        </View>
      </ScrollView>

      <View style={styles.summaryWrapper}>{renderSummary()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: getHeightEquivalent(16),
  },
  tableMinWidth: {
    // Sum of fixed columns + minimum staff column.
    minWidth:
      getWidthEquivalent(70) +
      getWidthEquivalent(110) +
      getWidthEquivalent(80) +
      getWidthEquivalent(70) +
      getWidthEquivalent(80) +
      getWidthEquivalent(160),
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerRow: {
    borderBottomWidth: 2,
  },
  headerCell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: getWidthEquivalent(4),
  },
  headerText: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    textAlign: "center",
  },
  cell: {
       fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(13),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    textAlign: "center",
  },
  // Keep original columns "fixed" so they don't get squeezed/expanded by horizontal scroll.
  timeColumn: {
    width: getWidthEquivalent(70),
  },
  paymentColumn: {
    width: getWidthEquivalent(80),
  },
  amountColumn: {
    width: getWidthEquivalent(70),
  },
  tipColumn: {
    width: getWidthEquivalent(50),
  },
  totalColumn: {
    width: getWidthEquivalent(80),
  },

  // Staff is the only dynamic-width column.
  staffColumn: {
    minWidth: getWidthEquivalent(160),
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: "center",
  },
  emptyText: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontStyle: "italic",
  },
  loadingContainer: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: "center",
  },
  loadingText: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    marginTop: getHeightEquivalent(12),
  },
  summaryWrapper: {
    width: "100%",
  },
  summaryContainer: {
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(16),
    borderTopWidth: 2,
    borderTopColor: "#E0E0E0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: getHeightEquivalent(4),
  },
  summaryLabel: {
       fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: fontEq(14),
    fontWeight: "500",
  },
  totalRow: {
    marginTop: getHeightEquivalent(8),
    paddingTop: getHeightEquivalent(8),
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalLabel: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
  },
  totalValue: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
  },
});

export default SalesTable;
