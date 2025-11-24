import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { colors } from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";
import DraggableAppointment from "./DraggableAppointment";
import { AppointmentCalanderBO } from "../Repository/appointmentsRepository";

interface DraggableCalendarColumnProps {
  staffName: string;
  staffId: string;
  columnIndex: number;
  allStaffIds: string[];
  appointments: {
    title: string;
    start: Date;
    end: Date;
    data: AppointmentCalanderBO;
  }[];
  onAppointmentUpdate: (
    appointmentServiceId: string,
    newStartTime: Date,
    newEndTime: Date,
    newStaffId?: string
  ) => Promise<void>;
  showHours: boolean;
  columnWidth: number;
  hourHeight: number;
  minHour: number;
  maxHour: number;
  onScrollEnable?: (enabled: boolean) => void;
  editingState?: {
    appointmentId: string;
    pendingStaffId: string;
    resetKey: number;
  } | null;
  onStartEditing?: (
    appointment: {
      title: string;
      start: Date;
      end: Date;
      data: AppointmentCalanderBO;
    },
    staffId: string
  ) => void;
  onAppointmentPreview?: (
    appointmentServiceId: string,
    newStartTime: Date,
    newEndTime: Date,
    targetStaffId: string
  ) => void;
  totalStaffColumns: number;
}

const DraggableCalendarColumn: React.FC<DraggableCalendarColumnProps> = ({
  staffName,
  staffId,
  columnIndex,
  allStaffIds,
  appointments,
  onAppointmentUpdate,
  showHours,
  columnWidth,
  hourHeight,
  minHour,
  maxHour,
  onScrollEnable,
  editingState,
  onStartEditing,
  onAppointmentPreview,
  totalStaffColumns,
}) => {
  const navigation = useNavigation<any>();
  const [selectedSlot, setSelectedSlot] = useState<{
    hourIndex: number;
    minuteOffset: number;
  } | null>(null);

  // Clear selection when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setSelectedSlot(null);
    });
    return unsubscribe;
  }, [navigation]);

  // Handle time slot click for creating new appointment
  const handleTimeSlotPress = (hourIndex: number, minuteOffset: number = 0) => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Set selected slot for visual feedback
    setSelectedSlot({ hourIndex, minuteOffset });

    // Calculate the exact time for the clicked slot
    const slotTime = new Date();
    slotTime.setHours(minHour + hourIndex, minuteOffset, 0, 0);

    // Wait 0.5 second then navigate
    setTimeout(() => {
      navigation.navigate("CreateAppointment", {
        prefilledData: {
          date: new Date(), // Current date - can be enhanced to use calendar date
          time: `${slotTime.getHours().toString().padStart(2, "0")}:${slotTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`,
          staffId: staffId,
          staffName: staffName,
        },
      });
    }, 500);
  };
  const hours = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i
  );

  const handleResizeEnd = (
    appointmentServiceId: string,
    originalStart: Date,
    newEndTime: Date
  ) => {
    // Fire and forget - don't await, let backend update happen in background
    onAppointmentUpdate(appointmentServiceId, originalStart, newEndTime).catch(
      (error) => {
        console.error(
          "[DraggableCalendarColumn] Background resize update failed:",
          error
        );
      }
    );
  };

  // Detect overlapping appointments and calculate layout
  const calculateAppointmentLayout = () => {
    const appointmentsWithLayout = appointments.map((appt, index) => ({
      ...appt,
      index,
      column: 0,
      totalColumns: 1,
    }));

    // Sort by start time
    appointmentsWithLayout.sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );

    // Find overlapping groups
    for (let i = 0; i < appointmentsWithLayout.length; i++) {
      const current = appointmentsWithLayout[i];
      const overlapping = [current];

      // Find all appointments that overlap with current
      for (let j = 0; j < appointmentsWithLayout.length; j++) {
        if (i === j) continue;
        const other = appointmentsWithLayout[j];

        // Check if they overlap
        if (
          (other.start < current.end && other.end > current.start) ||
          (current.start < other.end && current.end > other.start)
        ) {
          overlapping.push(other);
        }
      }

      // Assign columns to overlapping appointments
      if (overlapping.length > 1) {
        overlapping.sort((a, b) => a.start.getTime() - b.start.getTime());
        overlapping.forEach((appt, idx) => {
          appt.column = idx;
          appt.totalColumns = overlapping.length;
        });
      }
    }

    return appointmentsWithLayout;
  };

  const appointmentsWithLayout = calculateAppointmentLayout();

  // Current time indicator
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if current time is within the calendar range
    if (currentHour < minHour || currentHour > maxHour) {
      return null;
    }

    const minutesFromMinHour = (currentHour - minHour) * 60 + currentMinute;
    return (minutesFromMinHour / 60) * hourHeight;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <View style={[styles.columnContainer, { width: columnWidth }]}>
      {/* Time labels vertical separator */}
      {showHours && (
        <View style={styles.timeSeparatorContainer}>
          <View style={styles.timeSeparatorLine} />
        </View>
      )}

      {/* Time slots background */}
      <View style={styles.timeSlotsContainer}>
        {hours.map((hour, index) => {
          const isSlot0Selected =
            selectedSlot?.hourIndex === index &&
            selectedSlot?.minuteOffset === 0;
          const isSlot15Selected =
            selectedSlot?.hourIndex === index &&
            selectedSlot?.minuteOffset === 15;
          const isSlot30Selected =
            selectedSlot?.hourIndex === index &&
            selectedSlot?.minuteOffset === 30;
          const isSlot45Selected =
            selectedSlot?.hourIndex === index &&
            selectedSlot?.minuteOffset === 45;

          return (
            <View key={hour} style={[styles.hourSlot, { height: hourHeight }]}>
              {showHours && (
                <View style={styles.hourLabelContainer}>
                  <Text style={styles.hourLabel}>
                    {hour === 0
                      ? "12:00\nam"
                      : hour < 12
                      ? `${hour}:00\nam`
                      : hour === 12
                      ? "12:00\npm"
                      : `${hour - 12}:00\npm`}
                  </Text>
                </View>
              )}

              {/* Clickable 15-minute time slots */}
              <TouchableOpacity
                style={[
                  styles.timeSlotTouchable,
                  {
                    height: hourHeight / 4,
                    left: showHours ? getWidthEquivalent(60) : 0,
                    borderWidth: isSlot0Selected ? 2 : 0,
                    borderColor: isSlot0Selected
                      ? colors.primary
                      : "transparent",
                  },
                ]}
                onPress={() => handleTimeSlotPress(index, 0)}
                activeOpacity={0.7}
              >
                {isSlot0Selected && (
                  <Text style={styles.slotTimeText}>
                    {(minHour + index).toString().padStart(2, "0")}:00 -{" "}
                    {(minHour + index).toString().padStart(2, "0")}:15
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeSlotTouchable,
                  {
                    height: hourHeight / 4,
                    top: hourHeight / 4,
                    left: showHours ? getWidthEquivalent(60) : 0,
                    borderWidth: isSlot15Selected ? 2 : 0,
                    borderColor: isSlot15Selected
                      ? colors.primary
                      : "transparent",
                  },
                ]}
                onPress={() => handleTimeSlotPress(index, 15)}
                activeOpacity={0.7}
              >
                {isSlot15Selected && (
                  <Text style={styles.slotTimeText}>
                    {(minHour + index).toString().padStart(2, "0")}:15 -{" "}
                    {(minHour + index).toString().padStart(2, "0")}:30
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeSlotTouchable,
                  {
                    height: hourHeight / 4,
                    top: hourHeight / 2,
                    left: showHours ? getWidthEquivalent(60) : 0,
                    borderWidth: isSlot30Selected ? 2 : 0,
                    borderColor: isSlot30Selected
                      ? colors.primary
                      : "transparent",
                  },
                ]}
                onPress={() => handleTimeSlotPress(index, 30)}
                activeOpacity={0.7}
              >
                {isSlot30Selected && (
                  <Text style={styles.slotTimeText}>
                    {(minHour + index).toString().padStart(2, "0")}:30 -{" "}
                    {(minHour + index).toString().padStart(2, "0")}:45
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeSlotTouchable,
                  {
                    height: hourHeight / 4,
                    top: (hourHeight * 3) / 4,
                    left: showHours ? getWidthEquivalent(60) : 0,
                    borderWidth: isSlot45Selected ? 2 : 0,
                    borderColor: isSlot45Selected
                      ? colors.primary
                      : "transparent",
                  },
                ]}
                onPress={() => handleTimeSlotPress(index, 45)}
                activeOpacity={0.7}
              >
                {isSlot45Selected && (
                  <Text style={styles.slotTimeText}>
                    {(minHour + index).toString().padStart(2, "0")}:45 -{" "}
                    {(minHour + index).toString().padStart(2, "0")}:50
                  </Text>
                )}
              </TouchableOpacity>

              {/* 15-minute interval lines */}
              <View
                style={[
                  styles.quarterLine,
                  { top: hourHeight / 4 },
                  showHours && { left: getWidthEquivalent(60) },
                ]}
              />
              <View
                style={[
                  styles.quarterLine,
                  { top: hourHeight / 2 },
                  showHours && { left: getWidthEquivalent(60) },
                ]}
              />
              <View
                style={[
                  styles.quarterLine,
                  { top: (hourHeight * 3) / 4 },
                  showHours && { left: getWidthEquivalent(60) },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Appointments overlay */}
      <View
        style={[
          styles.appointmentsContainer,
          showHours && { left: getWidthEquivalent(60) },
        ]}
      >
        {appointmentsWithLayout.map((appointment) => {
          const isEditing =
            editingState?.appointmentId === appointment.data.id;
          const anotherAppointmentEditing = Boolean(
            editingState && editingState.appointmentId !== appointment.data.id
          );
          const canDrag = Boolean(isEditing);
          const resetTrigger = isEditing ? editingState?.resetKey : undefined;

          const availableWidth = showHours
            ? columnWidth - getWidthEquivalent(60)
            : columnWidth;
          const appointmentWidth = availableWidth / appointment.totalColumns;
          const leftOffset = appointmentWidth * appointment.column;

          const handleAppointmentLongPress = () => {
            if (!onStartEditing) {
              return;
            }

            // Prevent starting a new edit while another appointment is active
            if (editingState && !isEditing) {
              return;
            }

            onStartEditing(appointment, staffId);
          };

          const handleAppointmentDragEnd = (
            newStart: Date,
            newEnd: Date,
            columnsMoved: number
          ) => {
            if (!isEditing) {
              return;
            }

            let targetStaffId = staffId;

            if (columnsMoved !== 0) {
              const targetIndex = columnIndex + columnsMoved;

              if (targetIndex >= 0 && targetIndex < allStaffIds.length) {
                targetStaffId = allStaffIds[targetIndex];
              }
            }

            onAppointmentPreview?.(
              appointment.data.id,
              newStart,
              newEnd,
              targetStaffId
            );
          };

          return (
            <DraggableAppointment
              key={appointment.data.id}
              event={appointment}
              onDragEnd={(newStart, newEnd, columnsMoved) =>
                handleAppointmentDragEnd(newStart, newEnd, columnsMoved)
              }
              onResizeEnd={(newEnd) =>
                handleResizeEnd(appointment.data.id, appointment.start, newEnd)
              }
              hourHeight={hourHeight}
              columnWidth={appointmentWidth}
              leftOffset={leftOffset}
              dragColumnWidth={availableWidth}
              columnIndex={columnIndex}
              totalStaffColumns={totalStaffColumns}
              minHour={minHour}
              maxHour={maxHour}
              staffIndex={appointment.index}
              staffId={staffId}
              onScrollEnable={onScrollEnable}
              onLongPress={handleAppointmentLongPress}
              canDrag={canDrag}
              dimmed={anotherAppointmentEditing}
              isEditing={isEditing}
              resetTrigger={resetTrigger}
              onPress={() =>
                navigation.navigate("AppointmentDetailsScreen", {
                  appointment: appointment.data,
                })
              }
            />
          );
        })}
      </View>

      {/* Current Time Indicator */}
      {currentTimePosition !== null && (
        <View
          style={[
            styles.currentTimeIndicator,
            {
              top: currentTimePosition,
              left: 0,
              width: columnWidth,
            },
          ]}
        >
          {showHours && (
            <View style={styles.currentTimeCircle}>
              <Text style={styles.currentTimeText}>
                {currentTime.getHours().toString().padStart(2, "0")}:
                {currentTime.getMinutes().toString().padStart(2, "0")}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.currentTimeLine,
              showHours && { left: getWidthEquivalent(60) },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  columnContainer: {
    position: "relative",
  },
  timeSlotsContainer: {
    flex: 1,
  },
  hourSlot: {
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  hourLabelContainer: {
    position: "absolute",
    left: 0,
    top: -10,
    width: getWidthEquivalent(60),
    alignItems: "center",
    justifyContent: "center",
  },
  hourLabel: {
    fontSize: fontEq(12),
    fontWeight: "700",
    color: colors.black,
  },
  quarterLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.gray[100],
  },
  appointmentsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  currentTimeIndicator: {
    position: "absolute",
    zIndex: 1000,
    pointerEvents: "none",
    flexDirection: "row",
    alignItems: "center",
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#FF4444",
  },
  currentTimeCircle: {
    position: "absolute",
    left: 0,
    width: getWidthEquivalent(55),
    height: getHeightEquivalent(24),
    borderRadius: getWidthEquivalent(12),
    backgroundColor: "#FF4444",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
  },
  currentTimeText: {
    fontSize: fontEq(10),
    fontWeight: "600",
    color: colors.white,
  },
  timeSeparatorContainer: {
    position: "absolute",
    left: getWidthEquivalent(55),
    top: 0,
    bottom: 0,
    width: 1,
    zIndex: 10,
  },
  timeSeparatorLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.gray[300],
  },
  timeSlotTouchable: {
    position: "absolute",
    right: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  slotTimeText: {
    fontSize: fontEq(12),
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: getWidthEquivalent(8),
    paddingVertical: getHeightEquivalent(2),
  },
});

export default DraggableCalendarColumn;
