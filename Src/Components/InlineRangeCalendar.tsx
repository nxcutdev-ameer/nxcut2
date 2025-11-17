import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import colors from "../Constants/colors";
import { fontEq, getHeightEquivalent, getWidthEquivalent } from "../Utils/helpers";

export interface DateRangeValue {
  startDate?: Date;
  endDate?: Date;
}

export interface ValidRangeConfig {
  startDate?: Date;
  endDate?: Date;
  disabledDates?: Date[];
}

interface InlineRangeCalendarProps {
  locale?: string;
  startDate?: Date;
  endDate?: Date;
  onChange: (range: DateRangeValue) => void;
  startWeekOnMonday?: boolean;
  validRange?: ValidRangeConfig;
}

const DAYS_IN_WEEK = 7;

const isSameDay = (a?: Date, b?: Date) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isBefore = (a?: Date, b?: Date) => {
  if (!a || !b) return false;
  return a.getTime() < b.getTime();
};

const isAfter = (a?: Date, b?: Date) => {
  if (!a || !b) return false;
  return a.getTime() > b.getTime();
};

const isWithin = (date: Date, start?: Date, end?: Date) => {
  if (!start || !end) return false;
  const time = date.setHours(0, 0, 0, 0);
  const startTime = start.setHours(0, 0, 0, 0);
  const endTime = end.setHours(0, 0, 0, 0);
  return time >= startTime && time <= endTime;
};

const isDisabled = (date: Date, validRange?: ValidRangeConfig) => {
  if (!validRange) return false;
  const { startDate, endDate, disabledDates } = validRange;
  if (startDate && isBefore(date, startDate)) return true;
  if (endDate && isAfter(date, endDate)) return true;
  if (disabledDates && disabledDates.some((d) => isSameDay(d, date))) return true;
  return false;
};

const getDaysGrid = (
  monthDate: Date,
  locale: string,
  startWeekOnMonday: boolean
) => {
  const firstDayOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  );

  const grid: { date: Date; isCurrentMonth: boolean }[] = [];

  const weekStartsOn = startWeekOnMonday ? 1 : 0;
  const firstWeekDay = firstDayOfMonth.getDay();
  const leadingDays = (firstWeekDay - weekStartsOn + 7) % 7;

  for (let i = leadingDays; i > 0; i--) {
    const date = new Date(firstDayOfMonth);
    date.setDate(firstDayOfMonth.getDate() - i);
    grid.push({ date, isCurrentMonth: false });
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    grid.push({
      date: new Date(
        firstDayOfMonth.getFullYear(),
        firstDayOfMonth.getMonth(),
        i
      ),
      isCurrentMonth: true,
    });
  }

  const trailingDays = 42 - grid.length;
  for (let i = 1; i <= trailingDays; i++) {
    const date = new Date(lastDayOfMonth);
    date.setDate(lastDayOfMonth.getDate() + i);
    grid.push({ date, isCurrentMonth: false });
  }

  const weekDayNames = Array.from({ length: DAYS_IN_WEEK }).map((_, index) => {
    const refDate = new Date(2020, 5, 7 + index);
    const dayName = refDate.toLocaleDateString(locale, {
      weekday: "short",
    });
    return dayName.substring(0, 2);
  });

  if (startWeekOnMonday) {
    const mondayFirst = weekDayNames.slice(1).concat(weekDayNames.slice(0, 1));
    return { grid, weekDayNames: mondayFirst };
  }

  return { grid, weekDayNames };
};

export const InlineRangeCalendar: React.FC<InlineRangeCalendarProps> = ({
  locale = "en-US",
  startDate,
  endDate,
  onChange,
  startWeekOnMonday = false,
  validRange,
}) => {
  const { colors: paint } = colors;

  const initialMonth = useMemo(() => {
    const reference = startDate || endDate || new Date();
    return new Date(reference.getFullYear(), reference.getMonth(), 1);
  }, [startDate, endDate]);

  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);

  useEffect(() => {
    setCurrentMonth(initialMonth);
  }, [initialMonth]);

  const { grid, weekDayNames } = useMemo(() => {
    return getDaysGrid(currentMonth, locale, startWeekOnMonday);
  }, [currentMonth, locale, startWeekOnMonday]);

  const goToPreviousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleSelectDate = (date: Date) => {
    if (isDisabled(date, validRange)) {
      return;
    }

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: date, endDate: undefined });
      return;
    }

    if (startDate && !endDate) {
      if (isBefore(date, startDate)) {
        onChange({ startDate: date, endDate: startDate });
        return;
      }
      onChange({ startDate, endDate: date });
    }
  };

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth, locale]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={styles.navButton}
          accessibilityRole="button"
        >
          <ChevronLeft size={20} color={paint.text} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: paint.text }]}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.navButton}
          accessibilityRole="button"
        >
          <ChevronRight size={20} color={paint.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {weekDayNames.map((day) => (
          <Text key={day} style={[styles.weekDayLabel, { color: paint.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {grid.map(({ date, isCurrentMonth }) => {
          const selectionStart = isSameDay(date, startDate);
          const selectionEnd = isSameDay(date, endDate);
          const inRange = isWithin(date, startDate, endDate) && !selectionStart && !selectionEnd;
          const disabled = isDisabled(date, validRange);
          const isToday = isSameDay(date, today);

          const isRangeEdge = selectionStart || selectionEnd;

          const backgroundColor = isRangeEdge
            ? paint.primaryLight
            : inRange
            ? paint.gray[200]
            : "transparent";

          const textColor = isRangeEdge
            ? paint.black ?? paint.text
            : !isCurrentMonth || disabled
            ? `${paint.textSecondary}80`
            : paint.text;

          return (
            <TouchableOpacity
              key={`${date.toISOString()}`}
              style={styles.dayWrapper}
              onPress={() => handleSelectDate(date)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{
                disabled,
                selected: selectionStart || selectionEnd,
              }}
            >
              <View
                style={[
                  styles.dayInner,
                  selectionStart && styles.rangeStart,
                  selectionEnd && styles.rangeEnd,
                  inRange && styles.rangeBetween,
                  { backgroundColor },
                  isRangeEdge
                    ? {
                        borderColor: paint.primary,
                        borderWidth: 1,
                      }
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: textColor },
                    isToday && !selectionStart && !selectionEnd
                      ? { borderColor: paint.primary, borderWidth: 1, borderRadius: 999 }
                      : null,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = {
  container: {
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(8),
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: getHeightEquivalent(12),
  },
  navButton: {
    width: getWidthEquivalent(34),
    height: getWidthEquivalent(34),
    borderRadius: getWidthEquivalent(17),
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  monthLabel: {
    fontSize: fontEq(18),
    fontWeight: "600" as const,
  },
  weekRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: getHeightEquivalent(8),
  },
  weekDayLabel: {
    width: `${100 / DAYS_IN_WEEK}%`,
    textAlign: "center" as const,
    fontSize: fontEq(13),
    fontWeight: "500" as const,
  },
  daysContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  dayWrapper: {
    width: `${100 / DAYS_IN_WEEK}%`,
    paddingVertical: getHeightEquivalent(6),
    alignItems: "center" as const,
  },
  dayInner: {
    minWidth: getWidthEquivalent(34),
    minHeight: getWidthEquivalent(34),
    borderRadius: getWidthEquivalent(10),
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  dayLabel: {
    fontSize: fontEq(15),
    fontWeight: "600" as const,
    paddingHorizontal: getWidthEquivalent(4),
    paddingVertical: getHeightEquivalent(2),
  },
  rangeStart: {
  //  borderTopLeftRadius: getWidthEquivalent(16),
   // borderBottomLeftRadius: getWidthEquivalent(16),
  },
  rangeEnd: {
  //  borderTopRightRadius: getWidthEquivalent(16),
  //  borderBottomRightRadius: getWidthEquivalent(16),
  },
  rangeBetween: {
    borderRadius: getWidthEquivalent(8),
  },
} as const;

export default InlineRangeCalendar;
