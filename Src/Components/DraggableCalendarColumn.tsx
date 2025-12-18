import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Platform,
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
  globalSlotLock?: React.MutableRefObject<boolean>;
  globalLastPressTime?: React.MutableRefObject<number>;
  horizontalScrollRef?: React.RefObject<any>;
  screenWidth?: number;
  currentScrollX?: number;
  threeColumnWidth?: number;
  isProgrammaticScrollRef?: React.MutableRefObject<boolean>;
  verticalScrollRef?: React.RefObject<any>;
  screenHeight?: number;
  currentScrollY?: number;
  verticalScrollTopOffset?: number;
  staffHeaderScrollRef?: React.RefObject<any>;
  activeScrollDriverRef?: React.MutableRefObject<any>;
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
  globalSlotLock,
  globalLastPressTime,
  horizontalScrollRef,
  screenWidth,
  currentScrollX,
  threeColumnWidth,
  isProgrammaticScrollRef,
  verticalScrollRef,
  screenHeight,
  currentScrollY,
  verticalScrollTopOffset,
  staffHeaderScrollRef,
  activeScrollDriverRef,
}) => {
  const navigation = useNavigation<any>();
  const [selectedSlot, setSelectedSlot] = useState<{
    hourIndex: number;
    minuteOffset: number;
  } | null>(null);

  // Track touch and scroll state to prevent accidental slot selection
  const touchStartTime = React.useRef<number>(0);
  const touchStartPosition = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isScrolling = React.useRef<boolean>(false);
  const isSlotBeingPressed = React.useRef<boolean>(false); // Prevent multiple simultaneous touches
  const lastPressTime = React.useRef<number>(0); // Track last press time for cooldown
  const slotNavigationTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null); // Track navigation delay

  // Clear selection when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setSelectedSlot(null);
      // Reset all locks when returning to calendar screen (GLOBAL + LOCAL)
      if (globalSlotLock) globalSlotLock.current = false;
      if (globalLastPressTime) globalLastPressTime.current = 0;
      isSlotBeingPressed.current = false;
      lastPressTime.current = 0;
    });
    return unsubscribe;
  }, [navigation, globalSlotLock, globalLastPressTime]);

  // Cleanup navigation timeout on unmount
  useEffect(() => {
    return () => {
      if (slotNavigationTimeoutRef.current) {
        clearTimeout(slotNavigationTimeoutRef.current);
        slotNavigationTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle time slot click for creating new appointment
  const handleTimeSlotPress = (hourIndex: number, minuteOffset: number = 0) => {
    const now = Date.now();
    
    // GLOBAL cooldown: Check global lock across ALL columns
    if (globalLastPressTime?.current && now - globalLastPressTime.current < 3000) {
      return;
    }

    // GLOBAL lock: Check if ANY slot is being pressed
    if (globalSlotLock?.current) {
      return;
    }

    // Local cooldown: Prevent any press within 3000ms (3 seconds) of last press
    if (now - lastPressTime.current < 3000) {
      return;
    }

    // Prevent multiple simultaneous slot presses
    if (isSlotBeingPressed.current) {
      return;
    }

    // Don't trigger if user was scrolling
    if (isScrolling.current) {
      isScrolling.current = false;
      return;
    }

    // Calculate touch duration
    const touchDuration = now - touchStartTime.current;
    
    // Only trigger if touch was quick (less than 200ms) - intentional tap
    if (touchDuration > 200) {
      return;
    }

    // Mark that a slot is being pressed and record time (GLOBAL + LOCAL)
    if (globalSlotLock) globalSlotLock.current = true;
    if (globalLastPressTime) globalLastPressTime.current = now;
    isSlotBeingPressed.current = true;
    lastPressTime.current = now;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Set selected slot for visual feedback
    setSelectedSlot({ hourIndex, minuteOffset });

    // Calculate the exact time for the clicked slot
    const slotTime = new Date();
    slotTime.setHours(minHour + hourIndex, minuteOffset, 0, 0);

    // Navigate after 100ms delay to prevent accidental taps during scrolling
    slotNavigationTimeoutRef.current = setTimeout(() => {
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
    }, 400); // 100ms delay before navigation
    
    // Keep lock active for 3 seconds to ensure CreateAppointment screen is fully loaded
    setTimeout(() => {
      if (globalSlotLock) globalSlotLock.current = false;
      isSlotBeingPressed.current = false;
    }, 3000);
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

    // Sort by start time, then by duration (longer first)
    appointmentsWithLayout.sort((a, b) => {
      const startDiff = a.start.getTime() - b.start.getTime();
      if (startDiff !== 0) return startDiff;
      // If start times are equal, longer appointments first
      return (b.end.getTime() - b.start.getTime()) - (a.end.getTime() - a.start.getTime());
    });

    // Group overlapping appointments
    const groups: Array<typeof appointmentsWithLayout> = [];
    
    for (const appt of appointmentsWithLayout) {
      let addedToGroup = false;
      
      // Try to add to existing group
      for (const group of groups) {
        const overlapsWithGroup = group.some(other => 
          appt.start < other.end && appt.end > other.start
        );
        
        if (overlapsWithGroup) {
          group.push(appt);
          addedToGroup = true;
          break;
        }
      }
      
      // Create new group if doesn't overlap with any existing group
      if (!addedToGroup) {
        groups.push([appt]);
      }
    }

    // Assign columns within each group
    for (const group of groups) {
      if (group.length === 1) {
        group[0].column = 0;
        group[0].totalColumns = 1;
        continue;
      }

      // Find maximum number of simultaneous appointments
      const columns: Array<typeof appointmentsWithLayout> = [];
      
      for (const appt of group) {
        // Find first available column
        let columnIndex = 0;
        while (columnIndex < columns.length) {
          const column = columns[columnIndex];
          const hasOverlap = column.some(other => 
            appt.start < other.end && appt.end > other.start
          );
          
          if (!hasOverlap) {
            break;
          }
          columnIndex++;
        }
        
        // Add to column (create if doesn't exist)
        if (columnIndex >= columns.length) {
          columns.push([]);
        }
        columns[columnIndex].push(appt);
        
        appt.column = columnIndex;
        appt.totalColumns = columns.length;
      }
      
      // Update totalColumns for all appointments in group
      const maxColumns = columns.length;
      for (const appt of group) {
        appt.totalColumns = maxColumns;
      }
    }

    return appointmentsWithLayout;
  };

  const appointmentsWithLayout = calculateAppointmentLayout();

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
                      ? `${hour}:00\n    am`
                      : hour === 12
                      ? "12:00\n    pm"
                      : `${hour - 12}:00\n   pm`}
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
                onPressIn={(e) => {
                  touchStartTime.current = Date.now();
                  touchStartPosition.current = {
                    x: e.nativeEvent.pageX,
                    y: e.nativeEvent.pageY,
                  };
                  isScrolling.current = false;
                  
                  // Clear any pending navigation timeout
                  if (slotNavigationTimeoutRef.current) {
                    clearTimeout(slotNavigationTimeoutRef.current);
                    slotNavigationTimeoutRef.current = null;
                  }
                }}
                onPressOut={(e) => {
                  // Detect if finger moved significantly (more than 10 pixels)
                  const moveDistance = Math.sqrt(
                    Math.pow(e.nativeEvent.pageX - touchStartPosition.current.x, 2) +
                    Math.pow(e.nativeEvent.pageY - touchStartPosition.current.y, 2)
                  );
                  if (moveDistance > 10) {
                    isScrolling.current = true;
                    
                    // Cancel pending navigation if user is scrolling
                    if (slotNavigationTimeoutRef.current) {
                      clearTimeout(slotNavigationTimeoutRef.current);
                      slotNavigationTimeoutRef.current = null;
                    }
                  }
                }}
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
                onPressIn={(e) => {
                  touchStartTime.current = Date.now();
                  touchStartPosition.current = {
                    x: e.nativeEvent.pageX,
                    y: e.nativeEvent.pageY,
                  };
                  isScrolling.current = false;
                  
                  // Clear any pending navigation timeout
                  if (slotNavigationTimeoutRef.current) {
                    clearTimeout(slotNavigationTimeoutRef.current);
                    slotNavigationTimeoutRef.current = null;
                  }
                }}
                onPressOut={(e) => {
                  const moveDistance = Math.sqrt(
                    Math.pow(e.nativeEvent.pageX - touchStartPosition.current.x, 2) +
                    Math.pow(e.nativeEvent.pageY - touchStartPosition.current.y, 2)
                  );
                  if (moveDistance > 10) {
                    isScrolling.current = true;
                    
                    // Cancel pending navigation if user is scrolling
                    if (slotNavigationTimeoutRef.current) {
                      clearTimeout(slotNavigationTimeoutRef.current);
                      slotNavigationTimeoutRef.current = null;
                    }
                  }
                }}
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
                onPressIn={(e) => {
                  touchStartTime.current = Date.now();
                  touchStartPosition.current = {
                    x: e.nativeEvent.pageX,
                    y: e.nativeEvent.pageY,
                  };
                  isScrolling.current = false;
                  
                  // Clear any pending navigation timeout
                  if (slotNavigationTimeoutRef.current) {
                    clearTimeout(slotNavigationTimeoutRef.current);
                    slotNavigationTimeoutRef.current = null;
                  }
                }}
                onPressOut={(e) => {
                  const moveDistance = Math.sqrt(
                    Math.pow(e.nativeEvent.pageX - touchStartPosition.current.x, 2) +
                    Math.pow(e.nativeEvent.pageY - touchStartPosition.current.y, 2)
                  );
                  if (moveDistance > 10) {
                    isScrolling.current = true;
                    
                    // Cancel pending navigation if user is scrolling
                    if (slotNavigationTimeoutRef.current) {
                      clearTimeout(slotNavigationTimeoutRef.current);
                      slotNavigationTimeoutRef.current = null;
                    }
                  }
                }}
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
                onPressIn={(e) => {
                  touchStartTime.current = Date.now();
                  touchStartPosition.current = {
                    x: e.nativeEvent.pageX,
                    y: e.nativeEvent.pageY,
                  };
                  isScrolling.current = false;
                  
                  // Clear any pending navigation timeout
                  if (slotNavigationTimeoutRef.current) {
                    clearTimeout(slotNavigationTimeoutRef.current);
                    slotNavigationTimeoutRef.current = null;
                  }
                }}
                onPressOut={(e) => {
                  const moveDistance = Math.sqrt(
                    Math.pow(e.nativeEvent.pageX - touchStartPosition.current.x, 2) +
                    Math.pow(e.nativeEvent.pageY - touchStartPosition.current.y, 2)
                  );
                  if (moveDistance > 10) {
                    isScrolling.current = true;
                    
                    // Cancel pending navigation if user is scrolling
                    if (slotNavigationTimeoutRef.current) {
                      clearTimeout(slotNavigationTimeoutRef.current);
                      slotNavigationTimeoutRef.current = null;
                    }
                  }
                }}
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
          // Calculate width based on overlapping appointments
          const appointmentWidth = availableWidth / appointment.totalColumns;
          const leftOffset = appointmentWidth * appointment.column;

          const interactionsDisabled = Boolean(
            editingState && editingState.appointmentId !== appointment.data.id
          );

          const handleAppointmentLongPress = () => {
            if (!onStartEditing) {
              return;
            }

            if (interactionsDisabled) {
              return;
            }

            // Disable edit mode for paid appointments
            if (appointment.data.appointment.status === "paid") {
              return;
            }

            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
              onLongPress={interactionsDisabled ? undefined : handleAppointmentLongPress}
              canDrag={canDrag}
              dimmed={anotherAppointmentEditing}
              isEditing={isEditing}
              resetTrigger={resetTrigger}
              disableInteractions={interactionsDisabled}
              horizontalScrollRef={horizontalScrollRef}
              screenWidth={screenWidth}
              currentScrollX={currentScrollX}
              threeColumnWidth={threeColumnWidth}
              isProgrammaticScrollRef={isProgrammaticScrollRef}
              verticalScrollRef={verticalScrollRef}
              screenHeight={screenHeight}
              currentScrollY={currentScrollY}
              verticalScrollTopOffset={verticalScrollTopOffset}
              staffHeaderScrollRef={staffHeaderScrollRef}
              activeScrollDriverRef={activeScrollDriverRef}
              onPress={
                interactionsDisabled
                  ? undefined
                  : () => {
                      console.log("[DraggableCalendarColumn] Appointment tapped:");
                      console.log("  Status:", appointment.data.appointment.status);
                      console.log("  Appointment ID:", appointment.data.appointment.id);
                      
                      // Navigate to CreateAppointment in edit mode for scheduled appointments
                      if (appointment.data.appointment.status === "scheduled") {
                        console.log("  -> Navigating to edit mode");
                        console.log("  -> Appointment ID:", appointment.data.appointment.id);
                        navigation.navigate("CreateAppointment", {
                          mode: "edit",
                          appointmentId: appointment.data.appointment.id, // Pass only ID, not full data
                          appointmentData: appointment.data, // Keep for backward compatibility
                        });
                      } else {
                        console.log("  -> Navigating to details screen (status:", appointment.data.appointment.status, ")");
                        // Navigate to details screen for paid appointments (read-only)
                        navigation.navigate("AppointmentDetailsScreen", {
                          appointment: appointment.data,
                        });
                      }
                    }
              }
            />
          );
        })}
      </View>

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
    borderBottomColor: colors.backdrop,
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
    borderRadius: 6,
  },
  slotTimeText: {
    fontSize:Platform.OS === 'android' ?fontEq(8): fontEq(12),
   fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "500",
    color: colors.primary,

    backgroundColor: colors.white,
    paddingHorizontal: getWidthEquivalent(8),
    paddingVertical: getHeightEquivalent(2),
  },
});

export default DraggableCalendarColumn;
