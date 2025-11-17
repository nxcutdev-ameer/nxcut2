import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { colors } from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";
import {
  InlineRangeCalendar,
  type DateRangeValue,
} from "./InlineRangeCalendar";

type PeriodRange = { fromDate: string; toDate: string };

interface SelectPeriodModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (range: PeriodRange) => void;
  onDateRangeSelect?: (startDate: Date, endDate: Date) => void;
  initialFromDate?: string | null;
  initialToDate?: string | null;
  title?: string;
  mode?: "picker" | "calendar";
}

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
    label: "Month to Date",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date();
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

const toDateOrUndefined = (value?: string | null) =>
  value ? new Date(value) : undefined;

const formatDisplayDate = (date?: Date) =>
  date
    ? date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Select Date";

const SelectPeriodModal: React.FC<SelectPeriodModalProps> = ({
  visible,
  onClose,
  onApply,
  onDateRangeSelect,
  initialFromDate,
  initialToDate,
  title = "Select Period",
  mode: _mode = "picker",
}) => {
  const insets = useSafeAreaInsets();
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    toDateOrUndefined(initialFromDate)
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    toDateOrUndefined(initialToDate)
  );
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(
    null
  );
  const monthToDatePeriod = predefinedPeriods.find(
    (period) => period.label === "Month to Date"
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const hasInitialRange = Boolean(initialFromDate && initialToDate);

    if (hasInitialRange) {
      setSelectedStartDate(toDateOrUndefined(initialFromDate));
      setSelectedEndDate(toDateOrUndefined(initialToDate));
      setSelectedQuickOption(null);
      return;
    }

    if (monthToDatePeriod) {
      const { start, end } = monthToDatePeriod.getValue();
      setSelectedStartDate(new Date(start));
      setSelectedEndDate(new Date(end));
      setSelectedQuickOption(monthToDatePeriod.label);
    } else {
      setSelectedStartDate(undefined);
      setSelectedEndDate(undefined);
      setSelectedQuickOption(null);
    }
  }, [visible, initialFromDate, initialToDate, monthToDatePeriod]);

  const handleApplyRange = () => {
    if (!selectedStartDate || !selectedEndDate) {
      return;
    }

    const fromDate = new Date(selectedStartDate);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(selectedEndDate);
    toDate.setHours(23, 59, 59, 999);

    if (onApply) {
      onApply({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });
    }

    if (onDateRangeSelect) {
      onDateRangeSelect(fromDate, toDate);
    }

    onClose();
  };

  const handlePredefinedPeriod = (period: (typeof predefinedPeriods)[0]) => {
    const { start, end } = period.getValue();
    setSelectedStartDate(new Date(start));
    setSelectedEndDate(new Date(end));
    setSelectedQuickOption(period.label);
  };

  const handleCalendarChange = ({ startDate, endDate }: DateRangeValue) => {
    setSelectedQuickOption(null);
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
      hardwareAccelerated
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView
          edges={["left", "right"]}
          style={[
            styles.filterContainer,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeaderTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={25} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.dateRangeSection}>
              <Text style={styles.sectionTitle}>Custom Date Range</Text>
              <View style={styles.dateRangeButton}>
                <View style={styles.dateRange}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>From</Text>
                    <Text style={styles.dateValue}>
                      {formatDisplayDate(selectedStartDate)}
                    </Text>
                  </View>
                  <View style={styles.dateSeparator} />
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>To</Text>
                    <Text style={styles.dateValue}>
                      {formatDisplayDate(selectedEndDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.predefinedSection}>
              <Text style={styles.sectionTitle}>Quick Select</Text>
              <View style={styles.predefinedGrid}>
                {predefinedPeriods.map((period) => (
                  <TouchableOpacity
                    key={period.label}
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
              <View style={styles.calendarWrapper}>
                <InlineRangeCalendar
                  startDate={selectedStartDate}
                  endDate={selectedEndDate}
                  onChange={handleCalendarChange}
                  locale="en-US"
                />
              </View>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleApplyRange}
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
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
  contentContainer: {
    paddingBottom: getHeightEquivalent(24),
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
    backgroundColor: `${colors.borderFocus}15`,
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
  calendarWrapper: {
    marginTop: getHeightEquivalent(24),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  footer: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(12),
    marginBottom: getHeightEquivalent(-20),
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

export default SelectPeriodModal;
