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
  staffIndex: number;
  staffId: string;
  onScrollEnable?: (enabled: boolean) => void;
  onPress?: () => void;
}

const DraggableAppointment: React.FC<DraggableAppointmentProps> = ({
  event,
  onDragEnd,
  onResizeEnd,
  hourHeight,
  columnWidth,
  leftOffset = 0,
  minHour,
  staffIndex,
  staffId,
  onScrollEnable,
  onPress,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [lastSnappedSlot, setLastSnappedSlot] = useState<number | null>(null);
  const [committedPosition, setCommittedPosition] = useState({ x: 0, y: 0 });
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const lastEventTimeRef = useRef<number>(event.start.getTime());
  const touchStartTime = useRef<number>(0);
  const hasMoved = useRef(false);

  const pan = useRef(new Animated.ValueXY()).current;

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
    const slotHeight = hourHeight / 4; // 15-minute slots
    return Math.round(yPosition / slotHeight) * slotHeight;
  };

  // Get current time slot index
  const getTimeSlotIndex = (yPosition: number) => {
    const slotHeight = hourHeight / 4; // 15-minute slots
    return Math.round(yPosition / slotHeight);
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

        // Don't start dragging immediately, wait for movement
        // setIsDragging(true);
        // setShowPlaceholder(true);
        // onScrollEnable?.(false);

        // Start from committed position
        pan.setOffset({
          x: committedPosition.x,
          y: committedPosition.y,
        });
        pan.setValue({ x: 0, y: 0 });

        // Set initial slot for haptic feedback
        const currentY = initialTop + committedPosition.y;
        setLastSnappedSlot(getTimeSlotIndex(currentY));
      },
      onPanResponderMove: (event, gestureState) => {
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

        // Trigger haptic feedback when entering a new time slot
        const currentY = initialTop + committedPosition.y + gestureState.dy;
        const currentSlot = getTimeSlotIndex(currentY);

        if (currentSlot !== lastSnappedSlot) {
          setLastSnappedSlot(currentSlot);
          // Light haptic feedback when crossing into new slot
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Update animated values
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const touchDuration = Date.now() - touchStartTime.current;

        // If it was a quick tap and didn't move much, treat as tap
        if (!hasMoved.current && onPress) {
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
        pan.flattenOffset();

        const currentY = initialTop + committedPosition.y + gesture.dy;
        const snappedY = snapToTimeSlot(currentY);
        const finalOffsetY = snappedY - initialTop;

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
          toValue: { x: 0, y: finalOffsetY },
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
