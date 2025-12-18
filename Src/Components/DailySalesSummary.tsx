import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import colors from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";

interface DailySalesSummaryProps {
  totalSales: number;
  totalTransactions: number;
  totalClients: number;
  paymentMethods: number;
  loading: boolean;
}

const DailySalesSummary: React.FC<DailySalesSummaryProps> = ({
  totalSales,
  totalTransactions,
  totalClients,
  paymentMethods,
  loading,
}) => {
  const { colors: paint } = colors;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paint.primary} />
          <Text style={[styles.loadingText, { color: paint.textSecondary }]}>
            Loading summary...
          </Text>
        </View>
      </View>
    );
  }

  const summaryItems = [
    {
      title: "Total Sales(inc Tips)",
      value: `AED ${formatCurrency(totalSales)}`,
      isAmount: true,
    },
    {
      title: "Total Transactions",
      value: totalTransactions.toString(),
      isAmount: false,
    },
    {
      title: "Total Clients",
      value: totalClients.toString(),
      isAmount: false,
    },
    {
      title: "Payment Methods",
      value: paymentMethods.toString(),
      isAmount: false,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {summaryItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.summaryCard,
              { backgroundColor: paint.background },
            ]}
          >
            <Text style={[styles.title, { color: paint.textSecondary }]}>
              {item.title}
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: item.isAmount ? paint.primary : paint.text,
                  fontSize: item.isAmount ? Platform.OS === 'android' ?fontEq(12): fontEq(18) : Platform.OS === 'android' ?fontEq(12): fontEq(22),
                  fontWeight: "700",
                },
              ]}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: getHeightEquivalent(12),
    marginBottom: getHeightEquivalent(12),
    marginHorizontal: getWidthEquivalent(16),
  },
  loadingContainer: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
  },
  loadingText: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    marginTop: getHeightEquivalent(12),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: getWidthEquivalent(12),
  },
  summaryCard: {
    width: "48%",
    paddingVertical: getHeightEquivalent(20),
    paddingHorizontal: getWidthEquivalent(16),
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: getHeightEquivalent(110),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: getHeightEquivalent(12),
    lineHeight: fontEq(18),
  },
  value: {
    fontSize: fontEq(22),
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
  },
});

export default DailySalesSummary;
