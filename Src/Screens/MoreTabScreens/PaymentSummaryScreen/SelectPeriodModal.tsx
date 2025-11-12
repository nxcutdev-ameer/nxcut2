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
import { Calendar } from "react-native-paper-dates";

interface SelectPeriodModalProps {
  onClose: () => void;
  visible: boolean;
  updateVisible: (visible: boolean) => void;
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
  currentStartDate?: Date;
  currentEndDate?: Date;
}

export const SelectPeriodModal: React.FC<SelectPeriodModalProps> = ({
  onClose,
  visible,
  updateVisible,
  onDateRangeSelect,
  currentStartDate,
  currentEndDate,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    currentStartDate
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    currentEndDate
  );
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(null);

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleCalendarChange = ({
    startDate,
    endDate,
  }: {
    startDate?: Date;
    endDate?: Date;
  }) => {
    if (startDate) {
      setSelectedStartDate(startDate);
    }

    if (endDate) {
      const normalizedEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      setSelectedEndDate(normalizedEnd);
    } else if (startDate) {
      setSelectedEndDate(startDate);
    }

    setSelectedQuickOption(null);
  };

  const handleApply = () => {
    if (selectedStartDate && selectedEndDate) {
      onDateRangeSelect(selectedStartDate, selectedEndDate);
    }
    onClose();
  };

  const predefinedPeriods = [
    {
      label: "Today",
      getValue: () => {
        const today = new Date();
        return { start: today, end: today };
      },
    },
    {
      label: "Yesterday",
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      },
    },
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
      label: "This Month",
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      },
    },
    {
      label: "Last Month",
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
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

          <View style={styles.dateRangeSummary}>
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
          </View>

          <View style={styles.calendarContainer}>
            <Calendar
              locale="en-US"
              mode="range"
              startWeekOnMonday={false}
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              onChange={handleCalendarChange}
              validRange={{
                startDate: new Date(2020, 0, 1),
                endDate: new Date(new Date().getFullYear() + 5, 11, 31),
              }}
              startYear={2020}
              endYear={new Date().getFullYear() + 5}
            />
          </View>
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
                  selectedQuickOption === period.label && styles.predefinedButtonSelected
                ]}
              >
                <Text style={[
                  styles.predefinedButtonText,
                  selectedQuickOption === period.label && styles.predefinedButtonTextSelected
                ]}>
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
    backgroundColor: colors.gray[100],
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
  dateRangeSummary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: getWidthEquivalent(16),
    backgroundColor: colors.background,
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
    borderColor: colors.borderFocus,
    backgroundColor: `${colors.borderFocus}15`, // 15 is hex for ~8% opacity
  },
  predefinedButtonText: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: colors.text,
  },
  predefinedButtonTextSelected: {
    color: colors.borderFocus,
    fontWeight: "600",
  },
  calendarContainer: {
    marginTop: getHeightEquivalent(16),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.white,
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
    backgroundColor: colors.gray[300],
  },
  filterButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.white,
  },
  filterButtonTextDisabled: {
    color: colors.gray[500],
  },
});