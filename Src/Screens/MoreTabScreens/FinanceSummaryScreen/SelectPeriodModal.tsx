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
  visible,
  updateVisible,
  onApply,
}: {
  onClose: () => void;
  visible: boolean;
  updateVisible: (visible: boolean) => void;
  onApply: (filter: { fromDate: string; toDate: string }) => void;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>();
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(null);

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

  const handleQuickPeriod = (label: string, start: Date, end: Date) => {
    setSelectedQuickOption(label);
    setSelectedStartDate(start);
    setSelectedEndDate(end);
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

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Period</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Quick Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Options</Text>
          <View style={styles.optionsGrid}>
            {predefinedPeriods.map((period) => {
              const { start, end } = period.getValue();
              return (
                <TouchableOpacity
                  key={period.label}
                  style={[
                    styles.option,
                    selectedQuickOption === period.label && styles.selectedOption,
                  ]}
                  onPress={() => handleQuickPeriod(period.label, start, end)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedQuickOption === period.label && styles.selectedOptionText,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Date Range</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonLabel}>From</Text>
              <Text style={styles.dateButtonText}>
                {formatDateDisplay(selectedStartDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonLabel}>To</Text>
              <Text style={styles.dateButtonText}>
                {formatDateDisplay(selectedEndDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={[
            styles.applyButton,
            (!selectedStartDate || !selectedEndDate) && styles.disabledButton
          ]}
          onPress={handleApply}
          disabled={!selectedStartDate || !selectedEndDate}
        >
          <Text style={[
            styles.applyButtonText,
            (!selectedStartDate || !selectedEndDate) && styles.disabledButtonText
          ]}>
            Apply Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        locale="en"
        mode="range"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        startDate={selectedStartDate}
        endDate={selectedEndDate}
        onConfirm={handleDateConfirm}
        validRange={{
          startDate: new Date(2020, 0, 1),
          endDate: new Date(),
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontEq(20),
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    padding: getWidthEquivalent(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: getWidthEquivalent(20),
    paddingTop: getHeightEquivalent(20),
  },
  section: {
    marginBottom: getHeightEquivalent(32),
  },
  sectionTitle: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.text,
    marginBottom: getHeightEquivalent(16),
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getWidthEquivalent(12),
  },
  option: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(8),
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.white,
  },
  dateRangeContainer: {
    flexDirection: "row",
    gap: getWidthEquivalent(12),
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(8),
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonLabel: {
    fontSize: fontEq(12),
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: getHeightEquivalent(4),
  },
  dateButtonText: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    alignItems: "center",
    marginTop: getHeightEquivalent(32),
  },
  disabledButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  applyButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.white,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
});