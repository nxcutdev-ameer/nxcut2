import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-paper-dates";
import { PaperCalendarStyles } from "./PaperCalendarStyles";

type PaintPalette = {
  border: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  white: string;
};

type RangeChange = {
  startDate?: Date;
  endDate?: Date;
};

interface PaperCalendarProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: RangeChange) => void;
  onReset: () => void;
  paint: PaintPalette;
}

const formatDisplayDate = (date?: Date) => {
  if (!date) {
    return "--";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PaperCalendar: React.FC<PaperCalendarProps> = ({
  startDate,
  endDate,
  onChange,
  onReset,
  paint,
}) => {
  const monthRef = useMemo(() => new Date(), []);

  const currentMonthStart = useMemo(() => {
    return new Date(monthRef.getFullYear(), monthRef.getMonth(), 1);
  }, [monthRef]);

  const currentMonthEnd = useMemo(() => {
    return new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0);
  }, [monthRef]);

  const headerTitle = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(currentMonthStart);
  }, [currentMonthStart]);

  const handleChange = useCallback(
    (range: RangeChange) => {
      onChange(range);
    },
    [onChange]
  );

  return (
    <View
      style={[
        PaperCalendarStyles.container,
        {
          borderColor: paint.border,
          backgroundColor: paint.white,
        },
      ]}
    >
      <View
        style={[
          PaperCalendarStyles.header,
          {
            backgroundColor: paint.backgroundSecondary,
            borderBottomWidth: 1,
            borderColor: paint.border,
          },
        ]}
      >
        <Text style={[PaperCalendarStyles.headerTitle, { color: paint.text }]}>
          {headerTitle}
        </Text>
        <TouchableOpacity
          onPress={onReset}
          style={[
            PaperCalendarStyles.resetButton,
            {
              borderColor: paint.border,
              backgroundColor: paint.white,
            },
          ]}
        >
          <Text
            style={[PaperCalendarStyles.resetText, { color: paint.primary }]}
          >
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          PaperCalendarStyles.rangeSummary,
          {
            borderColor: paint.border,
            backgroundColor: paint.background,
          },
        ]}
      >
        <View style={PaperCalendarStyles.rangeItem}>
          <Text style={[PaperCalendarStyles.rangeLabel, { color: paint.textSecondary }]}>
            From
          </Text>
          <Text style={[PaperCalendarStyles.rangeValue, { color: paint.text }]}>
            {formatDisplayDate(startDate)}
          </Text>
        </View>
        <View
          style={[
            PaperCalendarStyles.divider,
            {
              backgroundColor: paint.border,
            },
          ]}
        />
        <View style={PaperCalendarStyles.rangeItem}>
          <Text style={[PaperCalendarStyles.rangeLabel, { color: paint.textSecondary }]}>
            To
          </Text>
          <Text style={[PaperCalendarStyles.rangeValue, { color: paint.text }]}>
            {formatDisplayDate(endDate)}
          </Text>
        </View>
      </View>

      <View style={PaperCalendarStyles.calendarWrapper}>
        <Calendar
          locale="en"
          mode="range"
          startDate={startDate}
          endDate={endDate}
          onChange={handleChange}
          startYear={currentMonthStart.getFullYear()}
          endYear={currentMonthStart.getFullYear()}
          validRange={{ startDate: currentMonthStart, endDate: currentMonthEnd }}
          startWeekOnMonday={false}
        />
      </View>
    </View>
  );
};

export default PaperCalendar;
