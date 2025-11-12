import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../../Constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import { DatePickerModal } from "react-native-paper-dates";

export const SelectPeriodModal = ({
  onClose,
  onApply,
  currentFromDate,
  currentToDate,
}: {
  onClose: () => void;
  onApply: (filter: { fromDate: string; toDate: string }) => void;
  currentFromDate: string;
  currentToDate: string;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    currentFromDate ? new Date(currentFromDate) : undefined
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    currentToDate ? new Date(currentToDate) : undefined
  );
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(
    null
  );

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDateConfirm = ({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) => {
    if (startDate) setSelectedStartDate(startDate);
    if (endDate) setSelectedEndDate(endDate);
    setShowDatePicker(false);
  };

  const handleApply = () => {
    if (selectedStartDate && selectedEndDate) {
      // Convert to ISO string format for API
      const fromDate = new Date(selectedStartDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(selectedEndDate);
      toDate.setHours(23, 59, 59, 999);

      onApply({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });
    }
    onClose();
  };

  const predefinedPeriods = [
    {
      label: "Last 7 Days",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { start, end };
      },
    },
    {
      label: "Last 30 Days",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { start, end };
      },
    },
    {
      label: "Last 6 Months",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        return { start, end };
      },
    },
  ];

  const handlePredefinedPeriod = (period: (typeof predefinedPeriods)[0]) => {
    const { start, end } = period.getValue();
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    setSelectedQuickOption(period.label);
  };

  const handleCustomDatePress = () => {
    setSelectedQuickOption(null);
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={styles.filterContainer}
    >
      <View style={styles.filterHeader}>
        <Text style={styles.filterHeaderTitle}>Select Period</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={25} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Date Range Selection */}
        <View style={styles.dateRangeSection}>
          <Text style={styles.sectionTitle}>Custom Date Range</Text>

          <TouchableOpacity
            onPress={handleCustomDatePress}
            style={styles.dateRangeButton}
          >
            <View style={styles.dateRange}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>From</Text>
                <Text style={styles.dateValue}>
                  {formatDateDisplay(selectedStartDate)}
                </Text>
              </View>
              <View style={styles.dateSeparator} />
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>To</Text>
                <Text style={styles.dateValue}>
                  {formatDateDisplay(selectedEndDate)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Predefined Periods */}
        <View style={styles.predefinedSection}>
          <Text style={styles.sectionTitle}>Quick Select</Text>
          <View style={styles.predefinedGrid}>
            {predefinedPeriods.map((period, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePredefinedPeriod(period)}
                style={[
                  styles.predefinedButton,
                  selectedQuickOption === period.label &&
                    styles.predefinedButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.predefinedButtonText,
                    selectedQuickOption === period.label &&
                      styles.predefinedButtonTextSelected,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Apply Button */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity
          onPress={handleApply}
          style={[
            styles.filterButton,
            (!selectedStartDate || !selectedEndDate) &&
              styles.filterButtonDisabled,
          ]}
          disabled={!selectedStartDate || !selectedEndDate}
        >
          <Text
            style={[
              styles.filterButtonText,
              (!selectedStartDate || !selectedEndDate) &&
                styles.filterButtonTextDisabled,
            ]}
          >
            Apply Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        locale="en-US"
        mode="range"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        startDate={selectedStartDate}
        endDate={selectedEndDate}
        onConfirm={handleDateConfirm}
        label="Select date range"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flex: 1,
    backgroundColor: colors.white,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filterHeader: {
    height: getHeightEquivalent(60),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: getWidthEquivalent(20),
    backgroundColor: colors.white,
  },
  filterHeaderTitle: {
    fontSize: fontEq(22),
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.border + "30",
  },
  content: {
    flex: 1,
    paddingHorizontal: getWidthEquivalent(20),
    paddingTop: getHeightEquivalent(20),
  },
  sectionTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.text,
    marginBottom: getHeightEquivalent(15),
  },
  dateRangeSection: {
    marginBottom: getHeightEquivalent(30),
  },
  dateRangeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: getWidthEquivalent(16),
    backgroundColor: colors.white,
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: fontEq(14),
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.text,
  },
  dateSeparator: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: getWidthEquivalent(16),
  },
  predefinedSection: {
    marginBottom: getHeightEquivalent(20),
  },
  predefinedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  predefinedButton: {
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  predefinedButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  predefinedButtonText: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: colors.text,
  },
  predefinedButtonTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  filterButtonContainer: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(20),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  filterButton: {
    backgroundColor: colors.primary,
    paddingVertical: getHeightEquivalent(16),
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonDisabled: {
    backgroundColor: colors.border,
  },
  filterButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.white,
  },
  filterButtonTextDisabled: {
    color: colors.textSecondary,
  },
});
