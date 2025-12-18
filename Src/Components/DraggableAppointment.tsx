import React, { useRef, useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated, PanResponder, GestureResponderEvent, PanResponderGestureState, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Tag } from "lucide-react-native";
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
  horizontalScrollRef?: React.RefObject<any>;
  screenWidth?: number;
  currentScrollX?: number;
  currentScrollY?: number;
  threeColumnWidth?: number;
  isProgrammaticScrollRef?: React.MutableRefObject<boolean>;
  verticalScrollRef?: React.RefObject<any>;
  screenHeight?: number;
  verticalScrollTopOffset?: number;
  staffHeaderScrollRef?: React.RefObject<any>;
  activeScrollDriverRef?: React.MutableRefObject<any>;
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
  const [isDragging, setIsDragging] = useState(false);
  const [committedPosition, setCommittedPosition] = useState({ x: 0, y: 0 });
  // Ghost placeholder to indicate initial position while dragging
  const [showGhost, setShowGhost] = useState(false);
  const ghostRef = useRef({ top: 0, left: 0, height: 0, width: 0, color: colors.primary });
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
  const intentionalTouchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalTouchTriggeredRef = useRef(false);
  const dragEnabledRef = useRef<boolean>(canDrag);
  const lastSnappedColumnRef = useRef<number>(0);
  const lastSnappedSlotRef = useRef<number | null>(null);
  const disableInteractionsRef = useRef(disableInteractions);
  const wasEditingRef = useRef(isEditing);
  const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoScrollTimeRef = useRef<number>(0);
  const isAutoScrollingRef = useRef<boolean>(false);
  const scrollStartOffsetRef = useRef<number>(0);
  const lastKnownScrollXRef = useRef<number>(0);
  const targetScrollXRef = useRef<number>(0); // Track intended scroll position
  
  // Initialize and update dragWidthRef to control width during drag/editing
  const currentCalculatedWidth = columnWidth - getWidthEquivalent(4);
  const dragWidthRef = useRef<number>(currentCalculatedWidth);
  
  // Keep drag width in sync: full column width while dragging/editing, normal width otherwise
  useEffect(() => {
    const effectiveColumnWidth = (dragColumnWidthRef.current ?? columnWidthRef.current) || columnWidth;
    if (isDragging || isEditing) {
      dragWidthRef.current = effectiveColumnWidth; // full width while dragging/editing
    } else {
      dragWidthRef.current = (columnWidthRef.current || columnWidth) - getWidthEquivalent(4); // default compact width
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isEditing, columnWidth]);
  
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
      if (intentionalTouchTimeoutRef.current) {
        clearTimeout(intentionalTouchTimeoutRef.current);
        intentionalTouchTimeoutRef.current = null;
      }
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
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
  // columnIndexRef is synced via useEffect below to preserve manual updates
  totalStaffColumnsRef.current = totalStaffColumns;
  columnWidthRef.current = columnWidth;
  dragColumnWidthRef.current = dragColumnWidth;

  // Sync columnIndexRef from prop when not dragging
  // This allows initialization but preserves manual updates after drops
  useEffect(() => {
    if (!isDragging) {
      columnIndexRef.current = columnIndex;
    }
  }, [columnIndex, isDragging]);

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

  // Track horizontal scroll position for auto-scroll compensation
  const scrollOffsetRef = useRef<number>(0);
  const dragStartScrollRef = useRef<number>(0);

  // Track vertical scroll position for auto-scroll compensation
  const verticalScrollOffsetRef = useRef<number>(0);
  const dragStartScrollYRef = useRef<number>(0);

  // Effect to track scroll changes during drag
  useEffect(() => {
    if (isDragging && currentScrollX !== undefined) {
      // Calculate how much the view has scrolled since drag started
      const scrollDelta = currentScrollX - dragStartScrollRef.current;
      scrollOffsetRef.current = scrollDelta;
    } else if (!isDragging) {
      // Reset when drag ends to prevent accumulation
      scrollOffsetRef.current = 0;
    }
  }, [currentScrollX, isDragging]);

  // Auto-scroll refs for vertical
  const autoScrollVerticalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoScrollVerticalTimeRef = useRef<number>(0);
  const isAutoScrollingVerticalRef = useRef<boolean>(false);
  const currentScrollYRef = useRef<number>(0);
  const currentAutoScrollDirectionRef = useRef<'up' | 'down' | null>(null);
  const targetScrollYRef = useRef<number>(0);
  const autoScrollVerticalRafRef = useRef<number | null>(null);
  const startVerticalAutoScroll = (direction: 'up' | 'down') => {
    if (!verticalScrollRef?.current) return;
    isAutoScrollingVerticalRef.current = true;
    currentAutoScrollDirectionRef.current = direction;

    const STEP = 16; // pixels per frame
    const stepFunc = () => {
      if (!verticalScrollRef?.current) return;
      if (!isAutoScrollingVerticalRef.current || currentAutoScrollDirectionRef.current !== direction) {
        autoScrollVerticalRafRef.current && cancelAnimationFrame(autoScrollVerticalRafRef.current);
        autoScrollVerticalRafRef.current = null;
        return;
      }
      const delta = direction === 'down' ? STEP : -STEP;
      const nextY = Math.max(0, (currentScrollYRef.current || 0) + delta);
      targetScrollYRef.current = nextY;
      verticalScrollRef.current.scrollTo({ x: 0, y: nextY, animated: false });
      // Optimistically update currentScrollYRef to reflect immediate scroll
      currentScrollYRef.current = nextY;
      autoScrollVerticalRafRef.current = requestAnimationFrame(stepFunc);
    };
    // kick off
    autoScrollVerticalRafRef.current && cancelAnimationFrame(autoScrollVerticalRafRef.current);
    autoScrollVerticalRafRef.current = requestAnimationFrame(stepFunc);
  };
  const stopVerticalAutoScroll = () => {
    isAutoScrollingVerticalRef.current = false;
    currentAutoScrollDirectionRef.current = null;
    if (autoScrollVerticalRafRef.current) {
      cancelAnimationFrame(autoScrollVerticalRafRef.current);
      autoScrollVerticalRafRef.current = null;
    }
    if (autoScrollVerticalIntervalRef.current) {
      clearInterval(autoScrollVerticalIntervalRef.current);
      autoScrollVerticalIntervalRef.current = null;
    }
  };

  // Update currentScrollYRef when currentScrollY changes
  useEffect(() => {
    if (currentScrollY !== undefined) {
      currentScrollYRef.current = currentScrollY;
    }
  }, [currentScrollY]);

  // Auto-scroll helper function - horizontal and vertical
  const handleAutoScroll = (pageX: number, pageY: number, gestureState: PanResponderGestureState) => {
    if (!horizontalScrollRef?.current || !screenWidth || !threeColumnWidth || currentScrollX === undefined) {
      return;
    }

    const EDGE_THRESHOLD = 80; // Distance from edge to trigger scroll

    // Calculate position relative to screen
    const relativeX = pageX;

    // Check if near right edge
    const isNearRightEdge = relativeX > screenWidth - EDGE_THRESHOLD;
    // Check if near left edge
    const isNearLeftEdge = relativeX < EDGE_THRESHOLD;

    // Clear existing interval to prevent multiple triggers
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    if (isNearRightEdge) {
      // Scroll right by ONE column for controlled movement
      const currentScroll = targetScrollXRef.current || currentScrollX || 0;
      
      // Calculate max scroll based on total columns
      // Each "page" shows 3 columns, so max scroll = (total columns - 3) * column width
      const totalColumns = totalStaffColumnsRef.current || 3;
      const columnWidth = threeColumnWidth / 3;
      const maxScrollPosition = Math.max(0, (totalColumns - 3) * columnWidth);
      
      // Don't auto-scroll if already at or very close to the end
      // Add small margin (10px) to prevent edge case issues
      if (currentScroll >= maxScrollPosition - 10) {
        return;
      }
      
      const targetScroll = Math.min(currentScroll + columnWidth, maxScrollPosition);
      
      // Slower throttle for more controlled scrolling
      const now = Date.now();
      if (now - lastAutoScrollTimeRef.current > 400 && !isAutoScrollingRef.current) { // 400ms throttle
        lastAutoScrollTimeRef.current = now;
        isAutoScrollingRef.current = true;
        
        // Update target position immediately
        targetScrollXRef.current = targetScroll;
        
        // AUTO-SCROLL DRIVER: Take control
        if (activeScrollDriverRef) {
          activeScrollDriverRef.current = 'auto';
        } else if (isProgrammaticScrollRef) {
          // Fallback for backward compatibility
          isProgrammaticScrollRef.current = true;
        }
        
        horizontalScrollRef.current.scrollTo({
          x: targetScroll,
          y: 0,
          animated: true,
        });

        // SYNC: Scroll staff header securely
        if (staffHeaderScrollRef?.current) {
           staffHeaderScrollRef.current.scrollTo({
            x: targetScroll,
            y: 0,
            animated: true,
          });
        }
        
        // Reset flags after animation completes
        setTimeout(() => {
          isAutoScrollingRef.current = false;
          if (activeScrollDriverRef) {
             activeScrollDriverRef.current = null;
          } else if (isProgrammaticScrollRef) {
            isProgrammaticScrollRef.current = false;
          }
        }, 350); // Wait for animation to complete
      }
    } else if (isNearLeftEdge) {
      // Scroll left by ONE column for controlled movement
      const currentScroll = targetScrollXRef.current || currentScrollX || 0;
      
      // Don't auto-scroll if already at or very close to the start
      // Add small margin (10px) to prevent edge case issues
      if (currentScroll <= 10) {
        return;
      }
      
      const columnWidth = threeColumnWidth / 3; // Single column width
      const targetScroll = Math.max(0, currentScroll - columnWidth);
      
      // Slower throttle for more controlled scrolling
      const now = Date.now();
      if (now - lastAutoScrollTimeRef.current > 400 && !isAutoScrollingRef.current) { // 400ms throttle
        lastAutoScrollTimeRef.current = now;
        isAutoScrollingRef.current = true;
        
        // Update target position immediately
        targetScrollXRef.current = targetScroll;
        
        // AUTO-SCROLL DRIVER: Take control
        if (activeScrollDriverRef) {
          activeScrollDriverRef.current = 'auto';
        } else if (isProgrammaticScrollRef) {
           // Fallback
          isProgrammaticScrollRef.current = true;
        }
        
        horizontalScrollRef.current.scrollTo({
          x: targetScroll,
          y: 0,
          animated: true,
        });

        // SYNC: Scroll staff header securely
        if (staffHeaderScrollRef?.current) {
          staffHeaderScrollRef.current.scrollTo({
            x: targetScroll,
            y: 0,
            animated: true,
          });
        }
        
        // Reset flags after animation completes
        setTimeout(() => {
          isAutoScrollingRef.current = false;
          if (activeScrollDriverRef) {
             activeScrollDriverRef.current = null;
          } else if (isProgrammaticScrollRef) {
            isProgrammaticScrollRef.current = false;
          }
        }, 350); // Wait for animation to complete
      }
    }

    // VERTICAL AUTO-SCROLL
    if (verticalScrollRef?.current && screenHeight && currentScrollY !== undefined) {
      const EDGE_THRESHOLD = 80; // Distance from edge to trigger scroll
      const SCROLL_AMOUNT = 100; // Pixels to scroll per interval (increased to 100px)
      const SCROLL_INTERVAL = 250; // Scroll every 250ms for smooth continuous effect

      // Check if near top or bottom edge
      // For top edge, we need to account for the header offset + threshold
      const topTriggerZone = (verticalScrollTopOffset || 0) + EDGE_THRESHOLD;
      const isNearTopEdge = pageY < topTriggerZone;
      const isNearBottomEdge = pageY > screenHeight - EDGE_THRESHOLD;

      if (isNearBottomEdge) {
        if (currentAutoScrollDirectionRef.current !== 'down') {
          stopVerticalAutoScroll();
          startVerticalAutoScroll('down');
        }
      } else if (isNearTopEdge) {
        if (currentAutoScrollDirectionRef.current !== 'up') {
          stopVerticalAutoScroll();
          startVerticalAutoScroll('up');
        }
      } else {
        // Not near any edge, stop scrolling
        stopVerticalAutoScroll();
      }
    }
  };

  // Stop auto-scroll helper
  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    stopVerticalAutoScroll();
    currentAutoScrollDirectionRef.current = null;
  };

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
        
        // Smart scroll tracking initialization
        const currentScroll = currentScrollX || 0;
        const scrollChanged = Math.abs(currentScroll - (dragStartScrollRef.current || 0)) > 5;
        
        // Only reset scrollOffset if scroll position changed significantly since last drag
        // This prevents resetting when appointment is already at the visible position
        if (scrollChanged || !dragStartScrollRef.current) {
          scrollOffsetRef.current = 0;
          dragStartScrollRef.current = currentScroll;
        }
        
        // Track vertical scroll at drag start for compensation
        dragStartScrollYRef.current = currentScrollY || 0;
        
        lastKnownScrollXRef.current = currentScroll;
        targetScrollXRef.current = currentScroll;
        // Width is preserved via dragWidthRef update at component level

        // For paid appointments, require intentional touch (600ms hold without movement)
        if (event.data.appointment.status === "paid") {
          touchStartTime.current = Date.now();
          hasMoved.current = false;
          intentionalTouchTriggeredRef.current = false;
          suppressTapRef.current = true; // Suppress quick taps by default
          
          // Start timer for intentional touch
          if (intentionalTouchTimeoutRef.current) {
            clearTimeout(intentionalTouchTimeoutRef.current);
          }
          intentionalTouchTimeoutRef.current = setTimeout(() => {
            // Only trigger if user hasn't moved
            if (!hasMoved.current && !disableInteractions) {
              intentionalTouchTriggeredRef.current = true;
              suppressTapRef.current = false;
              // Light haptic feedback to confirm intentional touch registered
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }, 10); // 400ms hold required for paid appointments (same as long press)
          
          onScrollEnable?.(true);
          return;
        }

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
          }, 300);
        }

        // Set initial slot for haptic feedback
        const currentCommitted = committedPositionRef.current;
        const currentY = initialTopRef.current + currentCommitted.y;
        lastSnappedSlotRef.current = getTimeSlotIndex(currentY);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Prevent any dragging for paid appointments
        if (event.data.appointment.status === "paid") {
          const distanceMoved = Math.max(
            Math.abs(gestureState.dx),
            Math.abs(gestureState.dy)
          );
          
          // If user moves more than 8px, cancel intentional touch and mark as moved
          // This prevents accidental touches during scrolling
          if (distanceMoved > 8) {
            hasMoved.current = true;
            suppressTapRef.current = true;
            intentionalTouchTriggeredRef.current = false;
            if (intentionalTouchTimeoutRef.current) {
              clearTimeout(intentionalTouchTimeoutRef.current);
              intentionalTouchTimeoutRef.current = null;
            }
          }
          return;
        }

        if (disableInteractionsRef.current && !isEditing) {
          return;
        }

        const distanceMoved = Math.max(
          Math.abs(gestureState.dx),
          Math.abs(gestureState.dy)
        );

        // NEW: Increased threshold to prevent accidental taps during scrolling
        // If user moves more than 15px, consider it scrolling, not a tap
        if (distanceMoved > 15) {
          hasMoved.current = true;
          suppressTapRef.current = true; // Suppress tap if scrolling
        }

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

        // Handle auto-scroll when dragging near edges
        if (isDragging || hasMoved.current) {
          const touchX = evt.nativeEvent.pageX;
          const touchY = evt.nativeEvent.pageY;
          handleAutoScroll(touchX, touchY, gestureState);
        }

        const currentCommitted = committedPositionRef.current;
        const baseY = initialTopRef.current + currentCommitted.y;
        // Compensate vertical scroll delta so the card tracks the finger exactly
        // Use projected vertical scroll to keep under finger during vertical auto-scroll
        const projectedScrollY = (isAutoScrollingVerticalRef.current ? (targetScrollYRef.current || currentScrollY || 0) : (currentScrollY || 0));
        const verticalScrollDelta = projectedScrollY - (dragStartScrollYRef.current || 0);
        const desiredY = baseY + gestureState.dy + verticalScrollDelta;
        const clampedY = clamp(desiredY, 0, maxStartY);
        
        // Use raw position for smooth dragging (no snapping)
        // We still calculate snapped position for haptic feedback
        const snappedYForFeedback = snapToTimeSlot(clampedY);
        const translateY = clampedY - baseY;

        const columnWidthValue = columnWidthRef.current;
        const dragColumnWidthValue = dragColumnWidthRef.current ?? undefined;
        const effectiveColumnWidth = dragColumnWidthValue ?? columnWidthValue;
        if (effectiveColumnWidth <= 0) {
          return;
        }

        const columnIndexValue = columnIndexRef.current;
        const totalStaffColumnsValue = totalStaffColumnsRef.current;
        // Prevent dragging to the left of the first column (index 0)
        const minOffsetX = -columnIndexValue * effectiveColumnWidth;
        const maxOffsetX =
          (totalStaffColumnsValue - columnIndexValue - 1) * effectiveColumnWidth;

        // Calculate proposed position from gesture + scroll compensation
        // Scroll compensation allows appointment to move to columns beyond initial view
        // Use projected scroll X to keep the card under the finger during auto-scroll
        const projectedScrollX = (isAutoScrollingRef.current ? (targetScrollXRef.current ?? currentScrollX ?? 0) : (currentScrollX ?? 0));
        const scrollCompensation = projectedScrollX - (dragStartScrollRef.current || 0);
        const proposedOffsetX = currentCommitted.x + gestureState.dx + scrollCompensation;
        const clampedOffsetX = clamp(proposedOffsetX, minOffsetX, maxOffsetX);
        
        // Ultra-responsive column snapping while tracking finger
        // Use a balanced threshold and add a small hysteresis to reduce flicker
        const columnFloat = clampedOffsetX / effectiveColumnWidth;
        const baseColumn = Math.floor(columnFloat);
        const fraction = columnFloat - baseColumn;
        
        // Determine scroll bounds to refine snapping near edges
        const totalColumnsBound = totalStaffColumnsValue;
        const colWidth = effectiveColumnWidth;
        const maxScrollPos = Math.max(0, (totalColumnsBound - 3) * colWidth);
        const projScrollX = projectedScrollX;
        const isAtStart = projScrollX <= 2;
        const isAtEnd = projScrollX >= maxScrollPos - 2;

        // Hysteresis: once we’ve snapped up, require more to snap back
        // Treat prevColumn as absolute to avoid boundary desync
        const prevColumn = (lastSnappedColumnRef.current ?? 0);
        let forwardThreshold = 0.35; // move to next column when > 35%
        let backThreshold = 0.65;    // move back to previous when < 35% from prev (i.e., > 65% in reverse)

        // Tighten thresholds at hard edges to avoid accidental wrap
        if (isAtStart) {
          forwardThreshold = 0.6; // need to cross 60% into next col to leave first column
        }
        if (isAtEnd) {
          backThreshold = 0.6; // need to go back >40% into previous col to leave last visible
        }

        let targetColumn = baseColumn;
        if (fraction >= forwardThreshold) {
          targetColumn = baseColumn + 1;
        } else if (fraction < (1 - backThreshold)) {
          targetColumn = baseColumn;
        } else {
          // At hard edges, don’t fall back to previous snapped column; keep base
          if (isAtStart || isAtEnd) {
            targetColumn = baseColumn;
          } else {
            targetColumn = prevColumn;
          }
        }
        
        // Convert to absolute column, clamp to [0, total-1], then back to relative
        const absoluteTargetColumn = columnIndexValue + targetColumn;
        const clampedAbsoluteColumn = Math.max(0, Math.min(totalStaffColumnsValue - 1, absoluteTargetColumn));
        const snappedColumn = clampedAbsoluteColumn - columnIndexValue;
        // Update absolute snapped column for consistent next-frame behavior
        lastSnappedColumnRef.current = clampedAbsoluteColumn;
        
        const totalOffsetX = snappedColumn * effectiveColumnWidth;
        const snappedTranslateX = totalOffsetX - currentCommitted.x;
        // Jumping behaviour: always snap horizontally to the current snapped column
        const translateX = snappedTranslateX;

        // Haptic feedback on column change
        // Haptic feedback on absolute column transitions only
        if (clampedAbsoluteColumn !== lastSnappedColumnRef.current) {
          lastSnappedColumnRef.current = clampedAbsoluteColumn;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Enhanced haptic feedback when entering a new time slot
        const currentSlot = getTimeSlotIndex(snappedYForFeedback);
        const previousSlot = lastSnappedSlotRef.current;

        if (currentSlot !== previousSlot) {
          lastSnappedSlotRef.current = currentSlot;
          // Medium haptic feedback (stronger than before) when crossing time slots
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Update animated values - usage raw translateY for smooth follow
        pan.setValue({ x: translateX, y: translateY });
      },
      onPanResponderRelease: (_evt: GestureResponderEvent, gesture: PanResponderGestureState) => {
        // Stop auto-scroll when releasing
        stopAutoScroll();
        isAutoScrollingRef.current = false;

        // For paid appointments - only allow intentional touch (600ms hold without movement)
        if (event.data.appointment.status === "paid") {
          onScrollEnable?.(true);
          
          // Clear the intentional touch timer
          if (intentionalTouchTimeoutRef.current) {
            clearTimeout(intentionalTouchTimeoutRef.current);
            intentionalTouchTimeoutRef.current = null;
          }
          
          // Only trigger onPress if intentional touch was registered (600ms hold without movement)
          if (intentionalTouchTriggeredRef.current && onPress && !disableInteractions) {
            onPress();
          }
          
          // Reset flags
          intentionalTouchTriggeredRef.current = false;
          suppressTapRef.current = false;
          hasMoved.current = false;
          pan.setValue({ x: 0, y: 0 });
          return;
        }

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
        // Include vertical scroll delta in drop calculation
        // Use projected vertical scroll for final landing position
        const projectedScrollY = (isAutoScrollingVerticalRef.current ? (targetScrollYRef.current || currentScrollY || 0) : (currentScrollY || 0));
        const verticalScrollDelta = projectedScrollY - (dragStartScrollYRef.current || 0);
        const desiredY = baseY + gesture.dy + verticalScrollDelta;
        const clampedY = clamp(desiredY, 0, maxStartY);
        const snappedY = snapToTimeSlot(clampedY);
        const finalOffsetY = snappedY - initialTopRef.current;
        const targetTranslateY = snappedY - baseY;

        const columnWidthValue = columnWidthRef.current;
        const dragColumnWidthValue = dragColumnWidthRef.current ?? undefined;
        const effectiveColumnWidth = dragColumnWidthValue ?? columnWidthValue;
        if (effectiveColumnWidth <= 0) {
          onScrollEnable?.(true);
          return;
        }

        const columnIndexValue = columnIndexRef.current;
        const totalStaffColumnsValue = totalStaffColumnsRef.current;
        const minOffsetX = -columnIndexValue * effectiveColumnWidth;
        const maxOffsetX = (totalStaffColumnsValue - columnIndexValue - 1) * effectiveColumnWidth;

        // Include scroll compensation in final position calculation
        // On release, use the latest target scroll position if auto-scrolling
        const projectedScrollX = (isAutoScrollingRef.current ? (targetScrollXRef.current ?? currentScrollX ?? 0) : (currentScrollX ?? 0));
        const releaseScrollCompensation = projectedScrollX - (dragStartScrollRef.current || 0);
        const proposedOffsetX = currentCommitted.x + gesture.dx + releaseScrollCompensation;
        const clampedOffsetX = clamp(proposedOffsetX, minOffsetX, maxOffsetX);

        // Calculate column snap for final position
        const columnFloat = clampedOffsetX / effectiveColumnWidth;
        const baseColumn = Math.floor(columnFloat);
        const fraction = columnFloat - baseColumn;
        const targetColumn = fraction >= 0.35 ? baseColumn + 1 : baseColumn;

        // Clamp to valid column range  
        const minColumn = -columnIndexValue;
        const maxColumn = totalStaffColumnsValue - columnIndexValue - 1;
        // Convert to absolute, clamp, then back to relative for drop
        const absoluteTargetColumn = columnIndexValue + targetColumn;
        const clampedAbsoluteColumn = Math.max(0, Math.min(totalStaffColumnsValue - 1, absoluteTargetColumn));
        const snappedColumn = clampedAbsoluteColumn - columnIndexValue;

        const columnsMoved = snappedColumn;
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

        // Update event's staff color immediately for UI feedback if staff changed
        const newAbsColumn = Math.max(0, Math.min(totalStaffColumnsValue - 1, columnIndexRef.current + columnsMoved));
        if (newAbsColumn !== columnIndexRef.current && event.data.staff) {
          // optimistic: if you have a mapping from column index -> staff info, plug it here
          // For now, keep border and background using existing event.data.staff.calendar_color,
          // parent should re-render with the updated staff after onDragEnd persists the change.
        }

        // Commit snapped position instantly to avoid any drift
        setCommittedPosition({ x: finalOffsetX, y: 0 });
        committedPositionRef.current = { x: finalOffsetX, y: 0 };
        pan.setValue({ x: 0, y: 0 });

        setDisplayStart(newStartTime);
        setDisplayEnd(finalEndTime);

        const landedSlot = getTimeSlotIndex(snapToTimeSlot(initialTopRef.current + finalOffsetY));
        lastSnappedSlotRef.current = landedSlot;
        lastSnappedColumnRef.current = 0;

        // Update column index ref to match new position for next drag
        // Clamp within valid bounds to avoid overshooting at edges
        const nextColumnIndex = columnIndexRef.current + columnsMoved;
        const maxColumnIndex = Math.max(0, totalStaffColumnsValue - 1);
        columnIndexRef.current = Math.max(0, Math.min(maxColumnIndex, nextColumnIndex));

        // Reset scroll targeting to actual position to avoid stale projected scroll on next drag
        targetScrollXRef.current = currentScrollX ?? 0;
        isAutoScrollingRef.current = false;
        if (activeScrollDriverRef) {
          activeScrollDriverRef.current = null;
        } else if (isProgrammaticScrollRef) {
          isProgrammaticScrollRef.current = false;
        }

        // dragStartScrollRef will be updated on next drag start
        //scrollOffsetRef automatically resets via useEffect when isDragging changes

        // Backend update will happen here, but UI is already updated
      },
      onPanResponderTerminate: () => {
        stopAutoScroll();
        isAutoScrollingRef.current = false;
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
    // Use preserved width during drag, recalculate on drop
    width: isDragging ? dragWidthRef.current : columnWidth - getWidthEquivalent(4),
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
    borderWidth: isEditing || isDragging ? 2 : 0,
    borderColor: isEditing || isDragging ? "#3C096C" : "transparent",
    borderLeftColor:
      event.data.appointment.status === "paid"
        ? colors.gray[500]
        : colors.primary,
  };

  const renderAppointmentContent = () => {
    // Calculate if appointment is small (less than 45 minutes)
    const durationMs = displayEnd.getTime() - displayStart.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const isSmall = durationMinutes < 45;

    return (
      <View style={styles.contentContainer}>
        {/* Tag icon in top right corner
        <View style={styles.tagIconContainer}>
          <Tag
            size={isSmall ? 10 : 12}
            color={event.data.appointment.status === "scheduled" ? colors.black : colors.white}
            strokeWidth={2.5}
          />
        </View> */}

        <Text
          style={[
            styles.timeText,
            event.data.appointment.status === "scheduled" && {
              color: colors.black,
            },
            isSmall && { fontSize: fontEq(8) },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayStart.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}{" "}
          -{" "}
          {displayEnd.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </Text>
        <Text
          style={[
            styles.clientName,
            event.data.appointment.status === "scheduled" && {
              color: colors.black,
            },
            isSmall && { fontSize: fontEq(11) },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {event.data.appointment.client.first_name}{" "}
          {event.data.appointment.client.last_name}
        </Text>
        <Text
          style={[
            styles.serviceName,
            event.data.appointment.status === "scheduled" && {
              color: colors.black,
            },
            isSmall && { fontSize: fontEq(9), marginBottom: 0 },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {event.data.service.name}
        </Text>
      </View>
    );
  };

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
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingHorizontal: getWidthEquivalent(6),
    paddingTop: getHeightEquivalent(4),
    paddingBottom: getHeightEquivalent(4),
    marginHorizontal: getWidthEquivalent(2),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
  },
  tagIconContainer: {
    position: "absolute",
    top: getHeightEquivalent(2),
    right: getWidthEquivalent(2),
    zIndex: 10,
  },
  clientName: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "700",
    color: colors.text,
    marginBottom: getHeightEquivalent(2),
    includeFontPadding: false,
  },
  serviceName: {
    fontSize:Platform.OS === 'android' ?fontEq(8): fontEq(10),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "500",
    color: colors.black,
    marginBottom: getHeightEquivalent(2),
    includeFontPadding: false,
  },
  timeText: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "400",
    color: colors.black,
    includeFontPadding: false,
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
