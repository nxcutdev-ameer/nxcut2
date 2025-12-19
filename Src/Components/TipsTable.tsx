import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SaleTipBO } from "../Repository/teamRepository";
import colors from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../Navigations/RootStackNavigator";
import { StackNavigationProp } from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface TipsTableProps {
  tips: SaleTipBO[];
}

const TipsTable: React.FC<TipsTableProps> = ({ tips }) => {
  const navigation = useNavigation<NavigationProp>();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPaymentMethod = (method: string | null | undefined) => {
    if (!method) return "N/A";
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  const handleRowPress = (tip: SaleTipBO) => {
    if (tip.sale_id) {
      navigation.navigate("TransactionDetailsScreen", {
        saleId: tip.sale_id.toString(),
        fallbackTransaction: tip.sales || undefined,
      });
    }
  };

  const columns = [
    { key: "tipId", title: "Tip ID", width: 100 },
    { key: "tipAmount", title: "Tip Amount", width: 120 },
    { key: "staffName", title: "Staff Name", width: 150 },
    { key: "paymentMethod", title: "Payment Method", width: 130 },
    { key: "saleTotal", title: "Sale Total", width: 120 },
    { key: "dateTime", title: "Date & Time", width: 180 },
  ];

  const renderRow = (tip: SaleTipBO, index: number) => {
    const rowData = {
      tipId: tip.sale_id?.toString() || "N/A",
      tipAmount: `AED ${(tip.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      staffName: `${tip.team_members?.first_name || ''} ${tip.team_members?.last_name || ''}`.trim() || "N/A",
      paymentMethod: formatPaymentMethod(tip.payment_method_tip),
      saleTotal: `AED ${(tip.sales?.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      dateTime: formatDateTime(tip.created_at || ''),
    };

    return (
      <TouchableOpacity 
        key={tip.id || index} 
        onPress={() => handleRowPress(tip)}
        activeOpacity={0.7}
      >
        <View style={[styles.row, index % 2 === 0 && styles.evenRow]}>
          {columns.map((column) => (
            <View key={column.key} style={[styles.cell, { width: column.width }]}>
              <Text 
                style={[
                  styles.cellText, 
                  column.key === "tipId" && styles.clickableText
                ]} 
                numberOfLines={2}
              >
                {rowData[column.key as keyof typeof rowData]}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.header}>
        {columns.map((column) => (
          <View key={column.key} style={[styles.headerCell, { width: column.width }]}>
            <Text style={styles.headerText}>{column.title}</Text>
          </View>
        ))}
      </View>

      {/* Table Body */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {tips.length > 0 ? (
          tips.map((tip, index) => renderRow(tip, index))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tips data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.colors.white,
    borderRadius: getWidthEquivalent(12),
    marginHorizontal: getWidthEquivalent(20),
    marginBottom: getHeightEquivalent(10),
    shadowColor: colors.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.colors.border + "20",
    maxHeight: getHeightEquivalent(500), // Maximum height for vertical scrolling
  },
  header: {
    flexDirection: "row",
    backgroundColor: colors.colors.primary + "10",
    borderTopLeftRadius: getWidthEquivalent(12),
    borderTopRightRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(8),
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(8),
  },
  headerText: {
    fontSize:Platform.OS === 'android' ?fontEq(8): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    color: colors.colors.primary,
    textAlign: "center",
  },
  body: {
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.border + "30",
  },
  evenRow: {
    backgroundColor: colors.colors.background + "50",
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: getWidthEquivalent(8),
    minHeight: getHeightEquivalent(40),
  },
  cellText: {
    fontSize:Platform.OS === 'android' ?fontEq(8): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    color: colors.colors.text,
    textAlign: "center",
    fontWeight: "500",
  },
  clickableText: {
    color: colors.colors.primary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: "center",
  },
  emptyText: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    color: colors.colors.textSecondary,
    fontStyle: "italic",
  },
});

export default TipsTable;