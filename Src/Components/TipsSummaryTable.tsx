import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TeamMemberTipSummaryBO } from "../Repository/teamRepository";
import colors from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";

interface TipsTableProps {
  tips: TeamMemberTipSummaryBO[];
}

const TipsTable: React.FC<TipsTableProps> = ({ tips }) => {


  const columns = [
    { key: "staffName", title: "Team member", width: getWidthEquivalent(150) },
    {
      key: "tipsCollected",
      title: "Tips collected",
      width: getWidthEquivalent(150),
    },
  ];

  const renderRow = (tip: TeamMemberTipSummaryBO, index: number) => {
    const rowData = {
      staffName:
        `${tip.team_member} `,
      tipsCollected: `AED ${(tip.collected_tips || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
    };

    const isFirstRow = index === 0;

    return (
      <View
        key={tip.staff_id || index}
        style={[
          styles.row,
        ]}
      >
        {columns.map((column) => (
          <View key={column.key} style={[styles.cell, { width: column.width }]}>
            <Text 
              style={[
                styles.cellText, 
                isFirstRow && styles.totalCellText
              ]} 
              numberOfLines={2}
            >
              {rowData[column.key as keyof typeof rowData]}
            </Text>
          </View>
        ))}
      </View>
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
    fontSize: fontEq(12),
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
  cell: {
    justifyContent: "center",
    paddingHorizontal: getWidthEquivalent(8),
    minHeight: getHeightEquivalent(40),
  },
  cellText: {
    fontSize: fontEq(12),
    color: colors.colors.text,
    textAlign: "center",
    fontWeight: "500",
  },
  totalCellText: {
    fontSize: fontEq(12),
    fontWeight: "600",
    color: colors.colors.primary,
  },
  emptyContainer: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontEq(14),
    color: colors.colors.textSecondary,
    fontStyle: "italic",
  },
});

export default TipsTable;