import React, { useRef, useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../Constants/colors";
import { fontEq, getHeightEquivalent, getWidthEquivalent } from "../Utils/helpers";
import { AppointmentCalanderBO } from "../Repository/appointmentsRepository";

interface DraggableAppointmentProps {
  event: {
    title: string;
    start: Date;
    end: Date;
    data: AppointmentCalanderBO;
  };
  onDragEnd: (
    newStartTime: Date,
    newEndTime: Date,
    columnsMoved: number
  ) => void;
  onResizeEnd: (newEndTime: Date) => void;
  hourHeight: number;
  columnWidth: number;
  leftOffset?: number;
  minHour: number;
  maxHour: number;
  staffIndex: number;
  staffId: string;
  onScrollEnable?: (enabled: boolean) => void;
  onPress?: () => void;
  onLongPress?: (appointmentId: string, staffId: string) => void;
  canDrag?: boolean;
  isEditing?: boolean;
  resetTrigger?: number;
  dragColumnWidth?: number;
  columnStart?: number;
  columnIndex?: number;
  totalStaffColumns?: number;
  dimmed?: boolean;
  disableInteractions?: boolean;
}

const DraggableAppointment: React.FC<DraggableAppointmentProps> = ({
  event,
  onDragEnd,
  onResizeEnd,
  hourHeight,
  columnWidth,
  leftOffset = 0,
  minHour,
  maxHour,
  staffIndex,
  staffId,
  onScrollEnable,
  onPress,
  onLongPress,
  canDrag = false,
  isEditing = false,
  resetTrigger,
  dragColumnWidth,
  columnStart = 0,
  columnIndex = 0,
  totalStaffColumns = 1,
  dimmed = false,
  disableInteractions = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [committedPosition, setCommittedPosition] = useState({ x: 0, y: 0 });
  const [displayStart, setDisplayStart] = useState(event.start);
  const [displayEnd, setDisplayEnd] = useState(event.end);
  const propTimesRef = useRef({
    start: event.start.getTime(),
    end: event.end.getTime(),
  });
  const lastEventTimeRef = useRef<number>(event.start.getTime());
  const touchStartTime = useRef<number | null>(null);
  const hasMoved = useRef(false);
  const longPressTriggeredRef = useRef(false);
  const suppressTapRef = useRef(false);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragEnabledRef = useRef<boolean>(canDrag);
  const lastSnappedColumnRef = useRef<number>(0);
  const lastSnappedSlotRef = useRef<number | null>(null);
  const disableInteractionsRef = useRef(disableInteractions);
  const wasEditingRef = useRef(isEditing);

  const pan = useRef(new Animated.ValueXY()).current;
  const resetTriggerRef = useRef<number | undefined>(resetTrigger);

  dragEnabledRef.current = canDrag;
  disableInteractionsRef.current = disableInteractions;
  wasEditingRef.current = isEditing;

  useEffect(() => {
    if (!canDrag) {
      setIsDragging(false);
    }
  }, [canDrag]);

  useEffect(() => {
    if (wasEditingRef.current && !isEditing) {
      setCommittedPosition({ x: 0, y: 0 });
      committedPositionRef.current = { x: 0, y: 0 };
      pan.setValue({ x: 0, y: 0 });
      setDisplayStart(new Date(event.start));
      setDisplayEnd(new Date(event.end));
    }

    wasEditingRef.current = isEditing;
  }, [event.end, event.start, isEditing, pan]);

  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetTrigger === undefined) {
      resetTriggerRef.current = resetTrigger;
      return;
    }

    if (resetTriggerRef.current === resetTrigger) {
      return;
    }

    resetTriggerRef.current = resetTrigger;

    setIsDragging(false);
    setCommittedPosition({ x: 0, y: 0 });
    pan.setValue({ x: 0, y: 0 });
    setDisplayStart(new Date(event.start));
    setDisplayEnd(new Date(event.end));
  }, [canDrag, isEditing, pan, resetTrigger]);

  useEffect(() => {
    const startMs = event.start.getTime();
    const endMs = event.end.getTime();
    const prevTimes = propTimesRef.current;
    const timesChanged = prevTimes.start !== startMs || prevTimes.end !== endMs;

    propTimesRef.current = { start: startMs, end: endMs };

    if (!timesChanged || isDragging) {
      return;
    }

    setDisplayStart(new Date(event.start));
    setDisplayEnd(new Date(event.end));
    setCommittedPosition({ x: 0, y: 0 });
    pan.setValue({ x: 0, y: 0 });
  }, [event.end, event.start, isDragging, pan]);

  useEffect(() => {
    if (isDragging) {
      return;
    }

    setCommittedPosition((prev) => {
      if (prev.y === 0) {
        return prev;
      }

      const updated = { x: prev.x, y: 0 };
      committedPositionRef.current = updated;
      return updated;
    });
  }, [displayStart, displayEnd, isDragging]);

  const prevLayoutRef = useRef({ columnWidth, leftOffset });

  useEffect(() => {
    const { columnWidth: prevWidth, leftOffset: prevOffset } = prevLayoutRef.current;
    const widthChanged = prevWidth !== columnWidth;
    const offsetChanged = prevOffset !== leftOffset;

    prevLayoutRef.current = { columnWidth, leftOffset };

    if (!widthChanged && !offsetChanged) {
      return;
    }

    if (isDragging) {
      return;
    }

    setCommittedPosition({ x: 0, y: 0 });
    pan.setValue({ x: 0, y: 0 });
  }, [columnWidth, leftOffset, pan, isDragging]);

  const prevStaffRef = useRef({ staffId, columnIndex });

  useEffect(() => {
    const previous = prevStaffRef.current;
    const staffChanged = previous.staffId !== staffId;
    const columnChanged = previous.columnIndex !== columnIndex;

    prevStaffRef.current = { staffId, columnIndex };

    if ((!staffChanged && !columnChanged) || isDragging) {
      return;
    }

    setCommittedPosition((prev) => {
      if (prev.x === 0) {
        return prev;
      }

      const updated = { x: 0, y: prev.y };
      committedPositionRef.current = updated;
      return updated;
    });
    pan.setValue({ x: 0, y: 0 });
  }, [columnIndex, isDragging, pan, staffId]);

  // Calculate initial position and height
  const getInitialTop = () => {
    const startHour = displayStart.getHours();
    const startMinute = displayStart.getMinutes();
    const minutesFromMinHour = (startHour - minHour) * 60 + startMinute;
    return (minutesFromMinHour / 60) * hourHeight;
  };

  const getInitialHeight = () => {
    const durationMs = displayEnd.getTime() - displayStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    return (durationMinutes / 60) * hourHeight;
  };

  const initialTop = getInitialTop();
  const initialHeight = getInitialHeight();
  const slotHeight = hourHeight / 4; // 15-minute slots
  const calendarHeight = (maxHour - minHour + 1) * hourHeight;
  const maxStartY = Math.max(0, calendarHeight - initialHeight);

  const initialTopRef = useRef(initialTop);
  const initialHeightRef = useRef(initialHeight);
  const maxStartYRef = useRef(maxStartY);
  const committedPositionRef = useRef(committedPosition);
  const columnIndexRef = useRef(columnIndex);
  const totalStaffColumnsRef = useRef(totalStaffColumns);
  const columnWidthRef = useRef(columnWidth);
  const dragColumnWidthRef = useRef(dragColumnWidth);

  initialTopRef.current = initialTop;
  initialHeightRef.current = initialHeight;
  maxStartYRef.current = maxStartY;
  committedPositionRef.current = committedPosition;
  columnIndexRef.current = columnIndex;
  totalStaffColumnsRef.current = totalStaffColumns;
  columnWidthRef.current = columnWidth;
  dragColumnWidthRef.current = dragColumnWidth;

  const clamp = (value: number, min: number, max: number) => {
    if (max <= min) {
      return min;
    }
    return Math.min(Math.max(value, min), max);
  };

  // Reset committed position only when event time actually changes from backend
  useEffect(() => {
    const currentEventTime = event.start.getTime();
    const lastEventTime = lastEventTimeRef.current;

    if (currentEventTime === lastEventTime) {
      return;
    }

    if (isEditing) {
      setCommittedPosition({ x: 0, y: 0 });
      pan.setValue({ x: 0, y: 0 });
      lastEventTimeRef.current = currentEventTime;
      return;
    }

    if (!isDragging) {
      console.log(
        "[DraggableAppointment] Event time changed from backend, resetting position"
      );
      setCommittedPosition({ x: 0, y: 0 });
      pan.setValue({ x: 0, y: 0 });
      lastEventTimeRef.current = currentEventTime;
    }
  }, [event.start.getTime(), isDragging, isEditing, pan]);

  // Snap to 15-minute intervals
  const snapToTimeSlot = (yPosition: number) => {
    const clampedPosition = clamp(yPosition, 0, maxStartYRef.current);
    const snappedSlot = Math.round(clampedPosition / slotHeight);
    return clamp(snappedSlot * slotHeight, 0, maxStartYRef.current);
  };

  // Get current time slot index
  const getTimeSlotIndex = (yPosition: number) => {
    const clampedPosition = clamp(yPosition, 0, maxStartYRef.current);
    return Math.round(clampedPosition / slotHeight);
  };

  // Convert Y position to time
  const yPositionToTime = (yPos: number) => {
    const minutesFromMinHour = (yPos / hourHeight) * 60;
    const totalMinutes = minHour * 60 + minutesFromMinHour;
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;
    const hours = Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    const newDate = new Date(displayStart);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  useEffect(() => {
    if (isDragging) {
      return;
    }

    const currentSlotIndex = getTimeSlotIndex(
      initialTopRef.current + committedPosition.y
    );
    lastSnappedSlotRef.current = currentSlotIndex;
  }, [committedPosition.y, isDragging]);

  // Main appointment tap/drag handler
  // Recreate PanResponder when isEditing changes to capture updated closure values
  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () =>
        wasEditingRef.current || !disableInteractionsRef.current,
      onStartShouldSetPanResponderCapture: () =>
        wasEditingRef.current || !disableInteractionsRef.current,
      onMoveShouldSetPanResponder: () =>
        wasEditingRef.current || !disableInteractionsRef.current,
      onMoveShouldSetPanResponderCapture: () =>
        wasEditingRef.current || !disableInteractionsRef.current,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        evt.stopPropagation();

        if (disableInteractionsRef.current && !isEditing) {
          suppressTapRef.current = true;
          onScrollEnable?.(true);
          return;
        }

        touchStartTime.current = Date.now();
        hasMoved.current = false;
        longPressTriggeredRef.current = false;
        lastSnappedColumnRef.current = 0;

        onScrollEnable?.(false);

        pan.setValue({ x: 0, y: 0 });

        if (!dragEnabledRef.current && onLongPress) {
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
          }
          longPressTimeoutRef.current = setTimeout(() => {
            longPressTriggeredRef.current = true;
            dragEnabledRef.current = true;
            suppressTapRef.current = true;
            onLongPress(event.data.id, staffId);
          }, 400);
        }

        // Set initial slot for haptic feedback
        const currentCommitted = committedPositionRef.current;
        const currentY = initialTopRef.current + currentCommitted.y;
        lastSnappedSlotRef.current = getTimeSlotIndex(currentY);
      },
      onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (disableInteractionsRef.current && !isEditing) {
          return;
        }

        const distanceMoved = Math.max(
          Math.abs(gestureState.dx),
          Math.abs(gestureState.dy)
        );

        if (!dragEnabledRef.current) {
          if (distanceMoved > 8 && longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
          }
          return;
        }

        if (disableInteractionsRef.current && !isEditing) {
          onScrollEnable?.(true);
          return;
        }

        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }

        // Track if user has moved significantly
        if (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10) {
          if (!hasMoved.current) {
            hasMoved.current = true;
            // Now start dragging
            setIsDragging(true);
            onScrollEnable?.(false);
          }
        }

        // Only process drag in dragging mode
        if (!isDragging && !hasMoved.current) return;

        const currentCommitted = committedPositionRef.current;
        const baseY = initialTopRef.current + currentCommitted.y;
        const desiredY = baseY + gestureState.dy;
        const clampedY = clamp(desiredY, 0, maxStartY);
        const snappedYDuringDrag = snapToTimeSlot(clampedY);
        const translateY = snappedYDuringDrag - baseY;

        const columnWidthValue = columnWidthRef.current;
        const dragColumnWidthValue = dragColumnWidthRef.current ?? undefined;
        const effectiveColumnWidth = dragColumnWidthValue ?? columnWidthValue;
        if (effectiveColumnWidth <= 0) {
          return;
        }

        const columnIndexValue = columnIndexRef.current;
        const totalStaffColumnsValue = totalStaffColumnsRef.current;
        // Prevent dragging to the left of the first column (index 0)
        // minOffsetX is 0 if already in first column, otherwise allows moving left to first column
        const minOffsetX = -columnIndexValue * effectiveColumnWidth;
        const maxOffsetX =
          (totalStaffColumnsValue - columnIndexValue - 1) * effectiveColumnWidth;

        const proposedOffsetX = currentCommitted.x + gestureState.dx;
        const clampedOffsetX = clamp(proposedOffsetX, minOffsetX, maxOffsetX);
        const snappedColumn = Math.round(clampedOffsetX / effectiveColumnWidth);
        const totalOffsetX = snappedColumn * effectiveColumnWidth;
        const translateX = totalOffsetX - currentCommitted.x;

        if (snappedColumn !== lastSnappedColumnRef.current) {
          lastSnappedColumnRef.current = snappedColumn;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Trigger haptic feedback when entering a new time slot
        const currentY = baseY + translateY;
        const currentSlot = getTimeSlotIndex(currentY);

        const previousSlot = lastSnappedSlotRef.current;

        if (currentSlot !== previousSlot) {
          lastSnappedSlotRef.current = currentSlot;
          // Light haptic feedback when crossing into new slot
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Update animated values
        pan.setValue({ x: translateX, y: translateY });
      },
      onPanResponderRelease: (_evt: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (disableInteractionsRef.current && !isEditing) {
          onScrollEnable?.(true);
          suppressTapRef.current = false;
          pan.setValue({ x: 0, y: 0 });
          return;
        }

        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }

        const longPressTriggered = longPressTriggeredRef.current;
        longPressTriggeredRef.current = false;
        const suppressTap = suppressTapRef.current;
        suppressTapRef.current = false;

        if (!dragEnabledRef.current) {
          onScrollEnable?.(true);
          if (
            !hasMoved.current &&
            !longPressTriggered &&
            !suppressTap &&
            onPress &&
            !disableInteractions
          ) {
            onPress();
          }
          return;
        }

        if (longPressTriggered && !hasMoved.current) {
          onScrollEnable?.(true);
          pan.setValue({ x: 0, y: 0 });
          return;
        }

        // If it was a quick tap and didn't move much, treat as tap
        if (
          !hasMoved.current &&
          onPress &&
          !isEditing &&
          !suppressTap &&
          !disableInteractions
        ) {
          onScrollEnable?.(true);
          pan.setValue({ x: 0, y: 0 });
          onPress();
          return;
        }

        // Only update backend if user actually dragged
        if (!hasMoved.current) {
          onScrollEnable?.(true);
          return;
        }

        setIsDragging(false);
        onScrollEnable?.(true);

        const currentCommitted = committedPositionRef.current;
        const baseY = initialTopRef.current + currentCommitted.y;
        const desiredY = baseY + gesture.dy;
        const clampedY = clamp(desiredY, 0, maxStartY);
        const snappedY = snapToTimeSlot(clampedY);
        const finalOffsetY = snappedY - initialTopRef.current;
        const targetTranslateY = snappedY - baseY;

        const columnWidthValue = columnWidthRef.current;
        const dragColumnWidthValue = dragColumnWidthRef.current ?? undefined;
        const effectiveColumnWidth = dragColumnWidthValue ?? columnWidthValue;
        if (effectiveColumnWidth <= 0) {
          return;
        }

        const columnIndexValue = columnIndexRef.current;
        const totalStaffColumnsValue = totalStaffColumnsRef.current;
        // Prevent dragging to the left of the first column (index 0)
        // minOffsetX is 0 if already in first column, otherwise allows moving left to first column
        const minOffsetX = -columnIndexValue * effectiveColumnWidth;
        const maxOffsetX =
          (totalStaffColumnsValue - columnIndexValue - 1) * effectiveColumnWidth;

        const proposedOffsetX = currentCommitted.x + gesture.dx;
        const clampedOffsetX = clamp(proposedOffsetX, minOffsetX, maxOffsetX);
        const columnsMoved = Math.round(clampedOffsetX / effectiveColumnWidth);
        const finalOffsetX = columnsMoved * effectiveColumnWidth;
        const targetTranslateX = finalOffsetX - currentCommitted.x;

        const newStartTime = yPositionToTime(snappedY);
        const durationMs = event.end?.getTime() - event.start?.getTime();
        let newEndTime = new Date(newStartTime);
        if (durationMs && !Number.isNaN(durationMs)) {
          newEndTime = new Date(newStartTime.getTime() + durationMs);
        }

        // Medium haptic feedback on drop
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const finalEndTime = new Date(newEndTime);

        // Notify parent immediately so layout (including widths) recalculates while animating
        onDragEnd(newStartTime, finalEndTime, columnsMoved);

        // Commit snapped position instantly to avoid any drift
        setCommittedPosition({ x: finalOffsetX, y: 0 });
        committedPositionRef.current = { x: finalOffsetX, y: 0 };
        pan.setValue({ x: 0, y: 0 });

        setDisplayStart(newStartTime);
        setDisplayEnd(finalEndTime);

        const landedSlot = getTimeSlotIndex(snapToTimeSlot(initialTopRef.current + finalOffsetY));
        lastSnappedSlotRef.current = landedSlot;
        lastSnappedColumnRef.current = 0;

        // Backend update will happen here, but UI is already updated
      },
      onPanResponderTerminate: () => {
        dragEnabledRef.current = canDrag;
        onScrollEnable?.(true);
        pan.setValue({ x: 0, y: 0 });
      },
    }),
    [isEditing] // Recreate when isEditing changes
  );

  const animatedStyle = {
    transform: [{ translateX: pan.x }, { translateY: pan.y }],
  };

  const baseOpacity = dimmed ? 0.3 : isDragging ? 0.8 : 1;

  const baseCardStyle = {
    top: initialTop + committedPosition.y,
    left: Math.max(0, leftOffset + committedPosition.x), // Prevent going negative (under TimeGutter)
    height: initialHeight,
    width: columnWidth - getWidthEquivalent(4),
    backgroundColor:
      event.data.appointment.status === "paid"
        ? colors.gray[300]
        : event.data.staff?.calendar_color || colors.primary,
  };

  const cardStyle = {
    ...baseCardStyle,
    opacity: baseOpacity,
    elevation: isDragging ? 8 : 2,
    shadowOpacity: isDragging ? 0.3 : 0.1,
    zIndex: isDragging ? 1000 : 1,
    borderWidth: isEditing ? 2 : 0,
    borderColor: isEditing ? "#3C096C" : "transparent",
  };

  const renderAppointmentContent = () => (
    <View style={styles.contentContainer}>
      <Text
        style={[
          styles.clientName,
          event.data.appointment.status === "scheduled" && {
            color: colors.gray[600],
          },
        ]}
        numberOfLines={1}
      >
        {event.data.appointment.client.first_name} {" "}
        {event.data.appointment.client.last_name}
      </Text>
      <Text
        style={[
          styles.serviceName,
          event.data.appointment.status === "scheduled" && {
            color: colors.gray[500],
          },
        ]}
        numberOfLines={1}
      >
        {event.data.service.name}
      </Text>
      <Text
        style={[
          styles.timeText,
          event.data.appointment.status === "scheduled" && {
            color: colors.gray[500],
          },
        ]}
      >
        {displayStart.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {" "}-{" "}
        {displayEnd.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );

  return (
    <>
      {isDragging && (
        <View
          pointerEvents="none"
          style={[styles.appointmentContainer, baseCardStyle, styles.dragPlaceholder]}
        >
          {renderAppointmentContent()}
        </View>
      )}
      <Animated.View
        {...(disableInteractions && !isEditing
          ? {}
          : panResponder.panHandlers)}
        pointerEvents={isDragging ? "box-only" : "auto"}
        style={[
          styles.appointmentContainer,
          cardStyle,
          animatedStyle,
        ]}
      >
        {renderAppointmentContent()}

        {isDragging && (
          <View style={styles.dragIndicator}>
            <View style={styles.dragLine} />
            <View style={styles.dragLine} />
            <View style={styles.dragLine} />
          </View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  appointmentContainer: {
    position: "absolute",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingHorizontal: getWidthEquivalent(6),
    paddingTop: getHeightEquivalent(4),
    paddingBottom: getHeightEquivalent(20),
    marginHorizontal: getWidthEquivalent(2),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
  },
  clientName: {
    fontSize: fontEq(12),
    fontWeight: "700",
    color: colors.text,
    marginBottom: getHeightEquivalent(2),
  },
  serviceName: {
    fontSize: fontEq(10),
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: getHeightEquivalent(2),
  },
  timeText: {
    fontSize: fontEq(9),
    fontWeight: "500",
    color: colors.textSecondary,
  },
  dragIndicator: {
    position: "absolute",
    top: getHeightEquivalent(8),
    left: getWidthEquivalent(8),
    flexDirection: "row",
    gap: 2,
  },
  dragLine: {
    width: 2,
    height: getHeightEquivalent(12),
    backgroundColor: colors.gray[400],
    borderRadius: 1,
  },
  dragPlaceholder: {
    opacity: 0.25,
    zIndex: 100,
  },
});

export default DraggableAppointment;
