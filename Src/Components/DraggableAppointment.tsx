import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, PanResponder } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";
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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [lastSnappedSlot, setLastSnappedSlot] = useState<number | null>(null);
  const [committedPosition, setCommittedPosition] = useState({ x: 0, y: 0 });
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const lastEventTimeRef = useRef<number>(event.start.getTime());
  const touchStartTime = useRef<number>(0);
  const hasMoved = useRef(false);
  const longPressTriggeredRef = useRef(false);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragEnabledRef = useRef<boolean>(canDrag);

  const pan = useRef(new Animated.ValueXY()).current;
  const resetTriggerRef = useRef<number | undefined>(resetTrigger);

  useEffect(() => {
    dragEnabledRef.current = canDrag;
    if (!canDrag) {
      setIsDragging(false);
      setShowPlaceholder(false);
    }
  }, [canDrag]);

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
    setShowPlaceholder(false);
    setCommittedPosition({ x: 0, y: 0 });
    pan.setValue({ x: 0, y: 0 });
  }, [pan, resetTrigger]);

  // Calculate initial position and height
  const getInitialTop = () => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const minutesFromMinHour = (startHour - minHour) * 60 + startMinute;
    return (minutesFromMinHour / 60) * hourHeight;
  };

  const getInitialHeight = () => {
    const durationMs = event.end.getTime() - event.start.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    return (durationMinutes / 60) * hourHeight;
  };

  const initialTop = getInitialTop();
  const initialHeight = getInitialHeight();
  const slotHeight = hourHeight / 4; // 15-minute slots
  const calendarHeight = (maxHour - minHour + 1) * hourHeight;
  const maxStartY = Math.max(0, calendarHeight - initialHeight);

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

    // Only reset if the time changed AND we're not currently dragging
    // This prevents reset during our own optimistic update
    if (currentEventTime !== lastEventTime && !isDragging) {
      console.log(
        "[DraggableAppointment] Event time changed from backend, resetting position"
      );
      setCommittedPosition({ x: 0, y: 0 });
      pan.setValue({ x: 0, y: 0 });
      lastEventTimeRef.current = currentEventTime;
    }
  }, [event.start.getTime(), isDragging]);

  // Snap to 15-minute intervals
  const snapToTimeSlot = (yPosition: number) => {
    const clampedPosition = clamp(yPosition, 0, maxStartY);
    const snappedSlot = Math.round(clampedPosition / slotHeight);
    return clamp(snappedSlot * slotHeight, 0, maxStartY);
  };

  // Get current time slot index
  const getTimeSlotIndex = (yPosition: number) => {
    const clampedPosition = clamp(yPosition, 0, maxStartY);
    return Math.round(clampedPosition / slotHeight);
  };

  // Convert Y position to time
  const yPositionToTime = (yPos: number) => {
    const minutesFromMinHour = (yPos / hourHeight) * 60;
    const totalMinutes = minHour * 60 + minutesFromMinHour;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    const newDate = new Date(event.start);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  // Main appointment tap/drag handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt) => {
        evt.stopPropagation();
        touchStartTime.current = Date.now();
        hasMoved.current = false;
        longPressTriggeredRef.current = false;

        onScrollEnable?.(false);

        pan.setValue({ x: 0, y: 0 });

        if (!dragEnabledRef.current && onLongPress) {
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
          }
          longPressTimeoutRef.current = setTimeout(() => {
            longPressTriggeredRef.current = true;
            dragEnabledRef.current = true;
            onLongPress(event.data.id, staffId);
          }, 400);
        }

        // Set initial slot for haptic feedback
        const currentY = initialTop + committedPosition.y;
        setLastSnappedSlot(getTimeSlotIndex(currentY));
      },
      onPanResponderMove: (event, gestureState) => {
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
            setShowPlaceholder(true);
            onScrollEnable?.(false);
          }
        }

        // Only process drag if we're in dragging mode
        if (!isDragging && !hasMoved.current) return;

        const baseY = initialTop + committedPosition.y;
        const desiredY = baseY + gestureState.dy;
        const clampedY = clamp(desiredY, 0, maxStartY);
        const translateY = clampedY - baseY;

        // Trigger haptic feedback when entering a new time slot
        const currentY = baseY + translateY;
        const currentSlot = getTimeSlotIndex(currentY);

        if (currentSlot !== lastSnappedSlot) {
          setLastSnappedSlot(currentSlot);
          // Light haptic feedback when crossing into new slot
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Update animated values
        pan.setValue({ x: gestureState.dx, y: translateY });
      },
      onPanResponderRelease: (_, gesture) => {
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }

        const longPressTriggered = longPressTriggeredRef.current;
        longPressTriggeredRef.current = false;

        if (!dragEnabledRef.current) {
          onScrollEnable?.(true);
          if (!hasMoved.current && !longPressTriggered && onPress) {
            onPress();
          }
          return;
        }

        // If it was a quick tap and didn't move much, treat as tap
        if (!hasMoved.current && onPress && !isEditing) {
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
        setShowPlaceholder(false);
        onScrollEnable?.(true);

        const baseY = initialTop + committedPosition.y;
        const desiredY = baseY + gesture.dy;
        const clampedY = clamp(desiredY, 0, maxStartY);
        const snappedY = snapToTimeSlot(clampedY);
        const finalOffsetY = snappedY - initialTop;
        const targetTranslateY = snappedY - baseY;

        // Calculate which staff column based on X movement
        const horizontalMovement = gesture.dx;
        let columnsMoved = 0;

        // Only move columns if dragged more than 40% of column width
        if (Math.abs(horizontalMovement) > columnWidth * 0.4) {
          columnsMoved = Math.round(horizontalMovement / columnWidth);
        }

        const newStartTime = yPositionToTime(snappedY);
        const durationMs = event.end.getTime() - event.start.getTime();
        const newEndTime = new Date(newStartTime.getTime() + durationMs);

        // Medium haptic feedback on drop
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Update the last event time to the new time we're setting
        lastEventTimeRef.current = newStartTime.getTime();

        // Animate to snapped position
        Animated.spring(pan, {
          toValue: { x: 0, y: targetTranslateY },
          useNativeDriver: false,
          friction: 8,
        }).start(() => {
          // Commit the final position so it stays there
          setCommittedPosition({ x: 0, y: finalOffsetY });
          pan.setValue({ x: 0, y: 0 });

          // Call onDragEnd after animation completes
          // Backend update will happen here, but UI is already updated
          onDragEnd(newStartTime, newEndTime, columnsMoved);
        });
      },
      onPanResponderTerminate: () => {
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }
        setIsDragging(false);
        setShowPlaceholder(false);
        onScrollEnable?.(true);
        pan.setValue({ x: 0, y: 0 });
        hasMoved.current = false;
      },
    })
  ).current;

  const animatedStyle = {
    transform: [{ translateX: pan.x }, { translateY: pan.y }],
  };

  return (
    <>
      {/* Placeholder/Ghost - Shows original position while dragging */}
      {showPlaceholder && (
        <View
          style={[
            styles.appointmentContainer,
            styles.placeholderContainer,
            {
              top: initialTop + committedPosition.y,
              left: leftOffset,
              height: initialHeight,
              width: columnWidth - getWidthEquivalent(4),
              backgroundColor:
                event.data.appointment.status === 'scheduled'
                  ? colors.gray[200]
                  : event.data.staff.calendar_color || colors.gray[100],
            },
          ]}
        >
          <View style={styles.placeholderContent}>
            <Text
              style={[styles.clientName, styles.placeholderText]}
              numberOfLines={1}
            >
              {event.data.appointment.client.first_name}{" "}
              {event.data.appointment.client.last_name}
            </Text>
            <Text
              style={[styles.serviceName, styles.placeholderText]}
              numberOfLines={1}
            >
              {event.data.service.name}
            </Text>
          </View>
        </View>
      )}

      {/* Actual Draggable Appointment */}
      <Animated.View
        {...panResponder.panHandlers}
        pointerEvents={isDragging ? "box-only" : "auto"}
        style={[
          styles.appointmentContainer,
          {
            top: initialTop,
            left: leftOffset,
            height: initialHeight,
            width: columnWidth - getWidthEquivalent(4),
            backgroundColor:
              event.data.appointment.status === 'scheduled'
                ? colors.gray[200]
                : event.data.staff.calendar_color || colors.gray[100],
            opacity: isDragging ? 0.9 : 1,
            elevation: isDragging ? 8 : 2,
            shadowOpacity: isDragging ? 0.3 : 0.1,
            zIndex: isDragging ? 1000 : 1,
            borderWidth: isEditing ? 2 : 0,
            borderColor: isEditing ? colors.primary : "transparent",
          },
          animatedStyle,
        ]}
      >
        <View style={styles.contentContainer}>
          <Text 
            style={[
              styles.clientName,
              event.data.appointment.status === 'scheduled' && { color: colors.gray[600] }
            ]} 
            numberOfLines={1}
          >
            {event.data.appointment.client.first_name}{" "}
            {event.data.appointment.client.last_name}
          </Text>
          <Text 
            style={[
              styles.serviceName,
              event.data.appointment.status === 'scheduled' && { color: colors.gray[500] }
            ]} 
            numberOfLines={1}
          >
            {event.data.service.name}
          </Text>
          <Text 
            style={[
              styles.timeText,
              event.data.appointment.status === 'scheduled' && { color: colors.gray[500] }
            ]}
          >
            {event.start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {event.end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Drag Indicator */}
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
  placeholderContainer: {
    opacity: 0.3,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: colors.gray[400],
    borderLeftWidth: 4,
    backgroundColor: "transparent",
  },
  placeholderContent: {
    flex: 1,
    opacity: 0.5,
  },
  placeholderText: {
    opacity: 0.6,
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
});

export default DraggableAppointment;
