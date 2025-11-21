import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import { X, ChevronDown } from "lucide-react-native";
import colors from "../../../Constants/colors";
import { FilterScreenStyles } from "./FilterScreenStyles";
import InlineRangeCalendar, {
  DateRangeValue,
} from "../../../Components/InlineRangeCalendar";

interface FilterScreenProps {
  visible: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date, period: string) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialPeriod?: string;
}

const DATE_RANGE_OPTIONS = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 Days",
  "Last 90 days",
  "Last Month",
  "Last Year",
  "Week to date",
  "Month to date",
  "Quarter to date",
  "Year to date",
  "All time",
];

const FilterScreen: React.FC<FilterScreenProps> = ({
  visible,
  onClose,
  onApply,
  initialStartDate,
  initialEndDate,
  initialPeriod,
}) => {
  const { colors: paint } = colors;

  // Helper function to format date for calendar (avoid timezone issues)
  const formatDateForCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculate default Month to date range
  const getMonthToDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: startOfMonth, end: today };
  };

  const defaultRange = getMonthToDateRange();

  const [selectedPeriod, setSelectedPeriod] = useState(
    initialPeriod || "Month to date"
  );
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || defaultRange.start
  );
  const [endDate, setEndDate] = useState<Date>(
    initialEndDate || defaultRange.end
  );
  const [calendarSelection, setCalendarSelection] = useState<DateRangeValue>({
    startDate: initialStartDate || defaultRange.start,
    endDate: initialEndDate || defaultRange.end,
  });

  // Manual input states
  const [startDateInput, setStartDateInput] = useState(
    formatDateForCalendar(initialStartDate || defaultRange.start)
  );
  const [endDateInput, setEndDateInput] = useState(
    formatDateForCalendar(initialEndDate || defaultRange.end)
  );

  // Sync with initial dates when modal opens
  useEffect(() => {
    if (visible) {
      const newStartDate = initialStartDate || defaultRange.start;
      const newEndDate = initialEndDate || defaultRange.end;
      const newPeriod = initialPeriod || "Month to date";
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      setSelectedPeriod(newPeriod);
      setStartDateInput(formatDateForCalendar(newStartDate));
      setEndDateInput(formatDateForCalendar(newEndDate));
      setStartDateError("");
      setEndDateError("");
      setCalendarSelection({
        startDate: newStartDate,
        endDate: newEndDate,
      });
    }
  }, [visible, initialStartDate, initialEndDate, initialPeriod]);
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  const isDateRangeValid = () => {
    if (!startDateInput || !endDateInput) return false;
    if (startDateInput.length !== 10 || endDateInput.length !== 10)
      return false;
    if (startDateError || endDateError) return false;

    const [startYear, startMonth, startDay] = startDateInput
      .split("-")
      .map(Number);
    const [endYear, endMonth, endDay] = endDateInput.split("-").map(Number);

    if (
      [startYear, startMonth, startDay, endYear, endMonth, endDay].some(isNaN)
    ) {
      return false;
    }

    const normalizedStart = new Date(startYear, startMonth - 1, startDay);
    const normalizedEnd = new Date(endYear, endMonth - 1, endDay);

    return normalizedStart <= normalizedEnd;
  };

  const isApplyDisabled = !isDateRangeValid();

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const validateDateFormat = (dateString: string): boolean => {
    // Check format YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    // Check if valid date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    setShowPeriodDropdown(false);

    const today = new Date();
    let newStartDate = new Date();
    let newEndDate = new Date();

    switch (period) {
      case "Today":
        newStartDate = today;
        newEndDate = today;
        break;
      case "Yesterday":
        newStartDate = new Date(today.setDate(today.getDate() - 1));
        newEndDate = new Date(newStartDate);
        break;
      case "Last 7 days":
        newStartDate = new Date(today.setDate(today.getDate() - 7));
        newEndDate = new Date();
        break;
      case "Last 30 Days":
        newStartDate = new Date(today.setDate(today.getDate() - 30));
        newEndDate = new Date();
        break;
      case "Last 90 days":
        newStartDate = new Date(today.setDate(today.getDate() - 90));
        newEndDate = new Date();
        break;
      case "Last Month":
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "Last Year":
        newStartDate = new Date(today.getFullYear() - 1, 0, 1);
        newEndDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case "Week to date":
        const dayOfWeek = today.getDay();
        newStartDate = new Date(today.setDate(today.getDate() - dayOfWeek));
        newEndDate = new Date();
        break;
      case "Month to date":
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newEndDate = new Date();
        break;
      case "Quarter to date":
        const quarter = Math.floor(today.getMonth() / 3);
        newStartDate = new Date(today.getFullYear(), quarter * 3, 1);
        newEndDate = new Date();
        break;
      case "Year to date":
        newStartDate = new Date(today.getFullYear(), 0, 1);
        newEndDate = new Date();
        break;
      case "All time":
        newStartDate = new Date(2020, 0, 1);
        newEndDate = new Date();
        break;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setStartDateInput(formatDateForCalendar(newStartDate));
    setEndDateInput(formatDateForCalendar(newEndDate));
    setStartDateError("");
    setEndDateError("");
    setCalendarSelection({
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };

  const handleStartDateInputChange = (text: string) => {
    setStartDateInput(text);

    // Validate on every change
    if (text.length === 0) {
      setStartDateError("");
      return;
    }

    // Check format as user types
    const partialRegex = /^\d{0,4}(-\d{0,2}(-\d{0,2})?)?$/;
    if (!partialRegex.test(text)) {
      setStartDateError("Invalid Date format.");
      return;
    }

    // Validate complete date when exactly 10 characters
    if (text.length === 10) {
      if (validateDateFormat(text)) {
        // Parse date parts to avoid timezone issues
        const [year, month, day] = text.split("-").map(Number);
        const newDate = new Date(year, month - 1, day);
        setStartDate(newDate);
        setCalendarSelection((prev) => ({
          ...prev,
          startDate: newDate,
        }));
        setStartDateError("");

        // Validate range with current end date
        if (endDate) {
          const normalizedEnd = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );
          if (newDate > normalizedEnd) {
            setStartDateError("Start date cannot be after end date");
          } else {
            setStartDateError("");
          }
        }

        setSelectedPeriod("Custom");
      } else {
        setStartDateError("Invalid Date format.");
      }
    } else if (text.length < 10) {
      setStartDateError("");
    } else {
      setStartDateError("Invalid Date format.");
    }
  };

  const handleEndDateInputChange = (text: string) => {
    setEndDateInput(text);

    // Validate on every change
    if (text.length === 0) {
      setEndDateError("");
      return;
    }

    // Check format as user types
    const partialRegex = /^\d{0,4}(-\d{0,2}(-\d{0,2})?)?$/;
    if (!partialRegex.test(text)) {
      setEndDateError("Invalid Date format.");
      return;
    }

    // Validate complete date when exactly 10 characters
    if (text.length === 10) {
      if (validateDateFormat(text)) {
        // Parse date parts to avoid timezone issues
        const [year, month, day] = text.split("-").map(Number);
        const newDate = new Date(year, month - 1, day);
        setEndDate(newDate);
        setCalendarSelection((prev) => ({
          ...prev,
          endDate: newDate,
        }));

        const normalizedStart = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );

        if (newDate < normalizedStart) {
          setEndDateError("Ending date cannot be before starting date");
        } else {
          setEndDateError("");
        }

        setSelectedPeriod("Custom");
      } else {
        setEndDateError("Invalid Date format.");
      }
    } else if (text.length < 10) {
      setEndDateError("");
    } else {
      setEndDateError("Invalid Date format.");
    }
  };

  const handleApply = () => {
    onApply(startDate, endDate, selectedPeriod);
    onClose();
  };

  const handleCalendarChange = ({
    startDate: start,
    endDate: end,
  }: DateRangeValue) => {
    setCalendarSelection({
      startDate: start,
      endDate: end,
    });

    if (start) {
      setStartDate(start);
      setStartDateInput(formatDateForCalendar(start));
      setStartDateError("");
    }

    if (end) {
      const normalizedEnd = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );
      setEndDate(normalizedEnd);
      setEndDateInput(formatDateForCalendar(normalizedEnd));
      setEndDateError("");
    } else if (start) {
      setEndDate(start);
      setEndDateInput(formatDateForCalendar(start));
      setEndDateError("");
    }

    setSelectedPeriod("Custom");
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={onClose}
      style={FilterScreenStyles.modal}
      backdropOpacity={0.5}
    >
      <SafeAreaView
        edges={["top", "bottom"]}
        style={[FilterScreenStyles.container, { backgroundColor: paint.white }]}
      >
        {/* Header */}
        <View style={FilterScreenStyles.header}>
          <View style={FilterScreenStyles.headerContent}>
            <Text
              style={[FilterScreenStyles.headerTitle, { color: paint.text }]}
            >
              Select Period
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={FilterScreenStyles.closeButton}
            >
              <X size={20} color={paint.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={FilterScreenStyles.scrollView}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Range Dropdown */}
          <View style={FilterScreenStyles.section}>
            <Text
              style={[
                FilterScreenStyles.sectionLabel,
                { color: paint.textSecondary },
              ]}
            >
              Date range
            </Text>
            <TouchableOpacity
              style={[
                FilterScreenStyles.dropdown,
                {
                  backgroundColor: paint.background,
                  borderColor: paint.gray[300],
                },
              ]}
              onPress={() => setShowPeriodDropdown(!showPeriodDropdown)}
            >
              <Text
                style={[FilterScreenStyles.dropdownText, { color: paint.text }]}
              >
                {selectedPeriod}
              </Text>
              <ChevronDown size={20} color={paint.textSecondary} />
            </TouchableOpacity>

            {/* Dropdown Options */}
            {showPeriodDropdown && (
              <View
                style={[
                  FilterScreenStyles.dropdownMenu,
                  { backgroundColor: paint.white, borderColor: paint.border },
                ]}
              >
                <ScrollView
                  style={FilterScreenStyles.dropdownScroll}
                  nestedScrollEnabled
                >
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        FilterScreenStyles.dropdownOption,
                        selectedPeriod === option && {
                          backgroundColor: paint.backgroundSecondary,
                        },
                      ]}
                      onPress={() => handlePeriodSelect(option)}
                    >
                      <Text
                        style={[
                          FilterScreenStyles.dropdownOptionText,
                          {
                            color: paint.text,
                            fontWeight:
                              selectedPeriod === option ? "600" : "400",
                          },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {/* Date Inputs */}
            <View style={FilterScreenStyles.dateInputsContainer}>
              <View style={FilterScreenStyles.dateInputWrapper}>
                <Text
                  style={[
                    FilterScreenStyles.inputLabel,
                    { color: paint.textSecondary },
                  ]}
                >
                  Starting
                </Text>
                <TextInput
                  style={[
                    FilterScreenStyles.dateInput,
                    {
                      backgroundColor: paint.background,
                      borderColor: startDateError ? paint.danger : paint.gray[300],
                      color: paint.text,
                    },
                  ]}
                  value={startDateInput}
                  onChangeText={handleStartDateInputChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={paint.textSecondary}
                  maxLength={10}
                />
                {startDateError ? (
                  <Text
                    style={[
                      FilterScreenStyles.errorText,
                      { color: paint.danger },
                    ]}
                  >
                    {startDateError}
                  </Text>
                ) : null}
              </View>

              <View style={FilterScreenStyles.dateInputWrapper}>
                <Text
                  style={[
                    FilterScreenStyles.inputLabel,
                    { color: paint.textSecondary },
                  ]}
                >
                  Ending
                </Text>
                <TextInput
                  style={[
                    FilterScreenStyles.dateInput,
                    {
                      backgroundColor: paint.background,
                      borderColor: endDateError ? paint.danger : paint.gray[300],
                      color: paint.text,
                    },
                  ]}
                  value={endDateInput}
                  onChangeText={handleEndDateInputChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={paint.textSecondary}
                  maxLength={10}
                />
                {endDateError ? (
                  <Text
                    style={[
                      FilterScreenStyles.errorText,
                      { color: paint.danger },
                    ]}
                  >
                    {endDateError}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Calendar View */}
          <View style={FilterScreenStyles.calendarSection}>
            {/* <Text
              style={[
                FilterScreenStyles.calendarHint,
                { color: paint.textSecondary },
              ]}
            >
              {`Selected range: ${formatDateForDisplay(startDate)} — ${formatDateForDisplay(endDate)}`}
            </Text> */}
            <View style={FilterScreenStyles.calendarWrapper}>
              <InlineRangeCalendar
                locale="en-US"
                startDate={calendarSelection.startDate}
                endDate={calendarSelection.endDate}
                onChange={handleCalendarChange}
                startWeekOnMonday={false}
                validRange={{
                  startDate: new Date(2020, 0, 1),
                  endDate: new Date(new Date().getFullYear() + 5, 11, 31),
                }}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          style={[FilterScreenStyles.footer, { borderTopColor: paint.border }]}
        >
          <TouchableOpacity
            style={[
              FilterScreenStyles.applyButton,
              {
                backgroundColor: isApplyDisabled
                  ? `${paint.black}80`
                  : paint.black,
              },
            ]}
            onPress={handleApply}
            disabled={isApplyDisabled}
          >
            <Text style={FilterScreenStyles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
export default FilterScreen;
