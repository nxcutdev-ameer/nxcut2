import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import colors from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";
import { PaymentSummaryData } from "../Screens/MoreTabScreens/PaymentSummaryScreen/PaymentSummaryScreenVM";

interface PaymentSummaryTableProps {
  data: PaymentSummaryData[];
  loading: boolean;
}

const PaymentSummaryTable: React.FC<PaymentSummaryTableProps> = ({
  data,
  loading,
}) => {
  const { colors: paint } = colors;

  const formatCurrency = (amount: number) => amount.toFixed(2);

  const renderTableHeader = () => (
    <View
      style={[
        styles.tableRow,
        styles.headerRow,
        { backgroundColor: paint.backgroundSecondary },
      ]}
    >
      <View style={[styles.cell, styles.methodColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Payment Method</Text>
      </View>
      <View style={[styles.cell, styles.countColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>No. of Payments</Text>
      </View>
      <View style={[styles.cell, styles.amountColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Payment Amount</Text>
      </View>
      <View style={[styles.cell, styles.countColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>No. of Refunds</Text>
      </View>
      <View style={[styles.cell, styles.amountColumn]}>
        <Text style={[styles.headerText, { color: paint.text }]}>Refunds</Text>
      </View>
    </View>
  );

  const renderTableRow = (item: PaymentSummaryData, index: number) => (
    <View
      key={`${item.paymentMethod}-${index}`}
      style={[styles.tableRow, { borderBottomColor: paint.border }]}
    >
      <View style={[styles.cell, styles.methodColumn]}>
        <Text style={[styles.bodyText, { color: paint.text }]}>{item.paymentMethod}</Text>
      </View>
      <View style={[styles.cell, styles.countColumn]}>
        <Text style={[styles.bodyText, { color: paint.text }]}>{item.numberOfPayments}</Text>
      </View>
      <View style={[styles.cell, styles.amountColumn]}>
        <Text style={[styles.bodyText, { color: paint.text, fontWeight: "600" }]}>AED {formatCurrency(item.paymentAmount)}</Text>
      </View>
      <View style={[styles.cell, styles.countColumn]}>
        <Text style={[styles.bodyText, { color: paint.text }]}>{item.numberOfRefunds}</Text>
      </View>
      <View style={[styles.cell, styles.amountColumn]}>
        <Text style={[styles.bodyText, { color: paint.text, fontWeight: "600" }]}>AED {formatCurrency(item.refundAmount)}</Text>
      </View>
    </View>
  );

  const renderTotalRow = () => {
    if (data.length === 0) return null;

    const totals = data.reduce(
      (acc, item) => ({
        numberOfPayments: acc.numberOfPayments + item.numberOfPayments,
        paymentAmount: acc.paymentAmount + item.paymentAmount,
        numberOfRefunds: acc.numberOfRefunds + item.numberOfRefunds,
        refundAmount: acc.refundAmount + item.refundAmount,
      }),
      {
        numberOfPayments: 0,
        paymentAmount: 0,
        numberOfRefunds: 0,
        refundAmount: 0,
      }
    );

    return (
      <View
        style={[
          styles.tableRow,
          styles.totalRow,
          { backgroundColor: paint.surface, borderBottomColor: paint.border },
        ]}
      >
        <View style={[styles.cell, styles.methodColumn]}>
          <Text style={[styles.bodyText, styles.totalText, { color: paint.text }]}>Total</Text>
        </View>
        <View style={[styles.cell, styles.countColumn]}>
          <Text style={[styles.bodyText, styles.totalText, { color: paint.text }]}>
            {totals.numberOfPayments}
          </Text>
        </View>
        <View style={[styles.cell, styles.amountColumn]}>
          <Text style={[styles.bodyText, styles.totalText, { color: paint.primary }]}>
            AED {formatCurrency(totals.paymentAmount)}
          </Text>
        </View>
        <View style={[styles.cell, styles.countColumn]}>
          <Text style={[styles.bodyText, styles.totalText, { color: paint.text }]}>
            {totals.numberOfRefunds}
          </Text>
        </View>
        <View style={[styles.cell, styles.amountColumn]}>
          <Text style={[styles.bodyText, styles.totalText, { color: paint.text }]}>
            AED {formatCurrency(totals.refundAmount)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: paint.textSecondary }]}>
        No payment data found for this date
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paint.primary} />
        <Text style={[styles.loadingText, { color: paint.textSecondary }]}>
          Loading payment summary...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.table}>
          {renderTableHeader()}
          {data.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {data.map((item, index) => renderTableRow(item, index))}
              {renderTotalRow()}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: getHeightEquivalent(10),
    marginBottom: getHeightEquivalent(16),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContainer: {
   // paddingHorizontal: getWidthEquivalent(6),
    alignItems: "center",
  },
  table: {
    minWidth: getWidthEquivalent(780),
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: getHeightEquivalent(12),
    //paddingHorizontal: getWidthEquivalent(6),
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerRow: {
    borderBottomWidth: 2,
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: "#E0E0E0",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: getWidthEquivalent(8),
  },
  methodColumn: {
    flex: 1,
    width: getWidthEquivalent(100),
  },
  countColumn: {
    flex: 1,
    width: getWidthEquivalent(100),
  },
  amountColumn: {
    flex: 1,
  },
  headerText: {
    fontSize: fontEq(12),
    fontWeight: "600",
    textAlign: "center",
    width: getWidthEquivalent(100),
  },
  bodyText: {
    fontSize: fontEq(13),
    textAlign: "center",
    width: getWidthEquivalent(100),
  },
  totalText: {
    fontSize: fontEq(14),
    fontWeight: "700",
  },
  emptyState: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontEq(16),
    fontStyle: "italic",
  },
  loadingContainer: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: getHeightEquivalent(16),
  },
  loadingText: {
    fontSize: fontEq(16),
    marginTop: getHeightEquivalent(12),
  },
});

export default PaymentSummaryTable;
