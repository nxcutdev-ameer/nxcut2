import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
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

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

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
  isLoading?: boolean;
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
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 1)).current;
  const isClosingRef = useRef(false);
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

  const animateToValue = useCallback(
    (toValue: number, onFinished?: () => void) => {
      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinished?.();
        }
      });
    },
    [slideAnim]
  );

  const animateIn = useCallback(() => {
    isClosingRef.current = false;
    animateToValue(0);
  }, [animateToValue]);

  const animateOut = useCallback(
    (after?: () => void) => {
      if (isClosingRef.current) {
        return;
      }

      isClosingRef.current = true;
      animateToValue(1, () => {
        isClosingRef.current = false;
        setInternalVisible(false);
        after?.();
      });
    },
    [animateToValue]
  );

  useEffect(() => {
    if (visible) {
      slideAnim.stopAnimation();
      slideAnim.setValue(1);
      setInternalVisible(true);
      animateIn();
    } else if (internalVisible && !isClosingRef.current) {
      animateOut();
    }
  }, [visible, internalVisible, animateIn, animateOut, slideAnim]);

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

  const closeModal = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

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

    closeModal();
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

  const overlayOpacity = visible
    ? 1
    : slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
        extrapolate: "clamp",
      });

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenHeight],
    extrapolate: "clamp",
  });

  const containerOpacity = slideAnim.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [1, 0.25, 0],
    extrapolate: "clamp",
  });

  const shouldRenderModal = visible || internalVisible;

  if (!shouldRenderModal) {
    return null;
  }

  return (
    <Modal
      visible={shouldRenderModal}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
      hardwareAccelerated
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <AnimatedSafeAreaView
          edges={["left", "right"]}
          style={[
            styles.filterContainer,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
            { transform: [{ translateY }], opacity: containerOpacity },
          ]}
        >
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeaderTitle}>{title}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.dateRangeSection}>
              {/* <Text style={styles.sectionTitle}>Custom Date Range</Text> */}
              <View style={styles.dateRangeButton}>
                <View style={styles.dateRange}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateValue}>
                      <Text style={styles.dateLabel}>From</Text>{" "}
                      {formatDisplayDate(selectedStartDate)}
                    </Text>
                  </View>
                  <View style={styles.dateSeparator} />
                  <View style={styles.dateItem}>
                    <Text style={styles.dateValue}>
                      <Text style={styles.dateLabel}>To</Text>{" "}
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
        </AnimatedSafeAreaView>
      </Animated.View>

      {/* Overlay Loading Indicator - Shows when Apply is clicked */}
      {isLoading && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: colors.white,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            },
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
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
    fontSize:Platform.OS === 'android' ?fontEq(16): fontEq(22),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
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
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(18),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  dateValue: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "400",
    color: colors.text,
  },
  dateSeparator: {
    width: 2,
    height: 10,
    backgroundColor: colors.border,
    marginHorizontal: getWidthEquivalent(10),
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
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
   // marginBottom: getHeightEquivalent(-20),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: Platform.OS === 'android'? getHeightEquivalent(2):  getHeightEquivalent(-20),
  },
  filterButton: {
    backgroundColor: colors.black,
    paddingVertical: getHeightEquivalent(16),
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  filterButtonText: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    color: colors.white,
  },
  filterButtonTextDisabled: {
    color: colors.gray[500],
  },
});

export default SelectPeriodModal;
