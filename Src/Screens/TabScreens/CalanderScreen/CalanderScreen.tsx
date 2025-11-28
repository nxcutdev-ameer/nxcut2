import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  Fragment,
} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalanderScreenStyles } from "./CalanderScreenStyles";
import DraggableCalendarColumn from "../../../Components/DraggableCalendarColumn";
import TimeGutter from "../../../Components/TimeGutter";
import TimeGutterHeader from "../../../Components/TimeGutterHeader";
import {
  Menu,
  ChevronDown,
  SlidersHorizontal,
  Bell,
  X,
  Check,
  Plus,
  Calendar,
  Clock,
} from "lucide-react-native";
import Modal from "react-native-modal";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
  SCREEN_WIDTH,
} from "../../../Utils/helpers";
import useCalanderScreenVM from "./CalanderScreenVM";
import { colors } from "../../../Constants/colors";
import CustomToast from "../../../Components/CustomToast";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { CalendarList } from "react-native-calendars";
import { AppointmentCalanderBO } from "../../../Repository/appointmentsRepository";

type EditingState = {
  appointmentId: string;
  originalStaffId: string;
  pendingStaffId: string;
  originalStart: Date;
  originalEnd: Date;
  pendingStart: Date;
  pendingEnd: Date;
  resetKey: number;
  appointmentSnapshot: CalendarAppointment;
};

type CalendarAppointment = {
  title: string;
  start: Date;
  end: Date;
  data: AppointmentCalanderBO;
};

const savingOverlayStyles = StyleSheet.create({
  modalStyle: {
    margin: 0,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: getHeightEquivalent(100), // Trim from bottom to not cover tab navigator
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

// Filter Panel Modal Component
const FilterPanelModal = ({
  visible,
  onClose,
  onClear,
  onApply,
  allLocations,
  pageFilter,
  toggleLocationFilter,
}: {
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  allLocations: any[];
  pageFilter: any;
  toggleLocationFilter: (locationId: string) => void;
}) => {
  return (
    <Modal
      isVisible={visible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      onBackdropPress={onClose}
      style={CalanderScreenStyles.filterPanelModal}
    >
      <SafeAreaView
        edges={["top", "right", "bottom"]}
        style={CalanderScreenStyles.filterPanel}
      >
        {/* Header */}
        <View style={CalanderScreenStyles.filterPanelHeader}>
          <Text style={CalanderScreenStyles.filterPanelTitle}>
            Filter Appointments
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={CalanderScreenStyles.filterCloseButton}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={CalanderScreenStyles.filterPanelContent}>
          {/* Location Filter */}
          <View style={CalanderScreenStyles.filterOption}>
            <Text style={CalanderScreenStyles.filterOptionText}>Locations</Text>
          </View>

          {allLocations.map((location) => {
            const isSelected = pageFilter.location_ids?.includes(location.id);
            return (
              <TouchableOpacity
                key={location.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginVertical: 2,
                }}
                onPress={() => toggleLocationFilter(location.id)}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected
                      ? colors.primary
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {isSelected && (
                    <Check size={16} color={colors.white} strokeWidth={3} />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: isSelected ? "600" : "400",
                  }}
                >
                  {location.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={CalanderScreenStyles.filterPanelButtons}>
          <TouchableOpacity
            style={CalanderScreenStyles.filterClearButton}
            onPress={onClear}
          >
            <Text style={CalanderScreenStyles.filterClearButtonText}>
              Clear All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={CalanderScreenStyles.filterApplyButton}
            onPress={onApply}
          >
            <Text style={CalanderScreenStyles.filterApplyButtonText}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const CalanderScreen = () => {
  const {
    currentDate,
    updateCurrentDate,
    calanderData,
    toast,
    hideToast,
    user,
    pageFilter,
    allLocations,
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    toggleLocationFilter,
    clearAllFilters,
    applyFilters,
    updateAppointmentTime,
    fetchCalanderAppointmentsData,
  } = useCalanderScreenVM();

  const navigation: any = useNavigation();
  const route = useRoute();
  // State for carousel pagination
  const [currentStaffIndex, setCurrentStaffIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);
  const calendarVerticalScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const staffHeaderScrollRef = useRef<ScrollView>(null);
  const isScrollingFromStaffHeader = useRef(false);
  const isScrollingFromCalendar = useRef(false);
  const isScrollingVerticalFromTimeGutter = useRef(false);
  const isScrollingVerticalFromCalendar = useRef(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const savedHorizontalScrollPosition = useRef(0);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const hasPendingChanges = useMemo(() => {
    if (!editingState) {
      return false;
    }

    return (
      editingState.pendingStaffId !== editingState.originalStaffId ||
      editingState.pendingStart.getTime() !== editingState.originalStart.getTime() ||
      editingState.pendingEnd.getTime() !== editingState.originalEnd.getTime()
    );
  }, [editingState]);

  const handleStartEditing = useCallback(
    (appointment: CalendarAppointment, staffId: string) => {
      setEditingState((current) => {
        if (current?.appointmentId === appointment.data.id) {
          return current;
        }

        return {
          appointmentId: appointment.data.id,
          originalStaffId: staffId,
          pendingStaffId: staffId,
          originalStart: appointment.start,
          originalEnd: appointment.end,
          pendingStart: appointment.start,
          pendingEnd: appointment.end,
          resetKey: Date.now(),
          appointmentSnapshot: appointment,
        };
      });
    },
    []
  );

  const handleAppointmentPreview = useCallback(
    (
      appointmentId: string,
      newStartTime: Date,
      newEndTime: Date,
      targetStaffId: string
    ) => {
      setEditingState((current) => {
        if (!current || current.appointmentId !== appointmentId) {
          return current;
        }

        const staffChanged = current.pendingStaffId !== targetStaffId;
        const timeChanged =
          current.pendingStart.getTime() !== newStartTime.getTime() ||
          current.pendingEnd.getTime() !== newEndTime.getTime();

        let updatedSnapshot = current.appointmentSnapshot;

        if (staffChanged || timeChanged) {
          updatedSnapshot = {
            ...current.appointmentSnapshot,
            start: new Date(newStartTime),
            end: new Date(newEndTime),
            data: {
              ...current.appointmentSnapshot.data,
              staff_id: targetStaffId,
              staff: current.appointmentSnapshot.data.staff
                ? {
                    ...current.appointmentSnapshot.data.staff,
                    id: targetStaffId,
                  }
                : current.appointmentSnapshot.data.staff,
            },
          };
        }

        return {
          ...current,
          pendingStart: newStartTime,
          pendingEnd: newEndTime,
          pendingStaffId: targetStaffId,
          appointmentSnapshot: updatedSnapshot,
          resetKey: staffChanged || timeChanged ? Date.now() : current.resetKey,
        };
      });
    },
    []
  );

  const handleCancelEditing = useCallback(() => {
    setEditingState((current) => {
      if (!current) {
        return null;
      }

      return {
        ...current,
        pendingStart: current.originalStart,
        pendingEnd: current.originalEnd,
        pendingStaffId: current.originalStaffId,
        resetKey: current.resetKey + 1,
      };
    });

    setTimeout(() => {
      setEditingState(null);
      setScrollEnabled(true);
    }, 0);
  }, []);

  const handleSaveEditing = useCallback(async () => {
    if (!editingState || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const {
        appointmentId,
        pendingStart,
        pendingEnd,
        pendingStaffId,
        originalStaffId,
        originalStart,
        originalEnd,
      } = editingState;

      const hasTimeChange =
        pendingStart.getTime() !== originalStart.getTime() ||
        pendingEnd.getTime() !== originalEnd.getTime();
      const hasStaffChange = pendingStaffId !== originalStaffId;

      if (hasTimeChange || hasStaffChange) {
        const success = await updateAppointmentTime(
          appointmentId,
          pendingStart,
          pendingEnd,
          hasStaffChange ? pendingStaffId : undefined
        );

        if (!success) {
          Alert.alert(
            "Save failed",
            "We couldn't update this appointment. Please try again."
          );
          return;
        }
      }
    } catch (error) {
      console.error("[CalanderScreen] Failed to save appointment changes:", error);
      Alert.alert(
        "Save failed",
        "Something went wrong while saving. Please try again."
      );
    } finally {
      setIsSaving(false);
      setScrollEnabled(true);
      setEditingState(null);
    }
  }, [editingState, isSaving, updateAppointmentTime]);

  // Bottom sheet setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle scroll end to update current index
  const handleScrollEnd = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setCurrentStaffIndex(index);
  };

  // Navigate between staff members
  const navigateToStaff = (direction: "prev" | "next") => {
    let newIndex = currentStaffIndex;
    if (direction === "prev" && currentStaffIndex > 0) {
      newIndex = currentStaffIndex - 1;
    } else if (
      direction === "next" &&
      currentStaffIndex < calanderData.length - 1
    ) {
      newIndex = currentStaffIndex + 1;
    }

    setCurrentStaffIndex(newIndex);
    scrollViewRef.current?.scrollTo({
      x: newIndex * SCREEN_WIDTH,
      animated: true,
    });
  };

  // Header action handlers

  const handleDatePress = () => {
    console.log("Date pressed - opening bottom sheet");
    console.log("Bottom sheet ref:", bottomSheetRef.current);
    bottomSheetRef.current?.expand();
    setIsBottomSheetOpen(true);
  };

  const handleFilterPress = () => {
    openFilterPanel();
  };

  const handleNotificationPress = () => {
    navigation.navigate("NotificationScreen");
  };

  const handleProfilePress = () => {
    navigation.navigate("ProfileAreaScreen");
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return (
        user.first_name.charAt(0) + user.last_name.charAt(0)
      ).toUpperCase();
    } else if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U"; // Default fallback
  };

  // Bottom sheet callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("Bottom sheet index changed to:", index);
    if (index === -1) {
      setIsBottomSheetOpen(false);
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={() => bottomSheetRef.current?.close()}
      />
    ),
    []
  );

  // Handle date selection from calendar
  const handleDateSelect = (day: any) => {
    const selectedDate = new Date(day.dateString);
    updateCurrentDate(selectedDate);
    bottomSheetRef.current?.close();
    setIsBottomSheetOpen(false);
  };

  // Format date for calendar
  const getMarkedDates = () => {
    const dateString = currentDate.toISOString().split("T")[0];
    return {
      [dateString]: {
        selected: true,
        selectedColor: colors.primary,
      },
    };
  };

  const timeColumnWidth = useMemo(() => getWidthEquivalent(60), []);

  // All columns now have consistent width since time labels are in a separate fixed column
  const getColumnWidth = useCallback(
    (index: number) => getWidthEquivalent(120),
    []
  );

  // Calculate the width for 3 columns (including separators)
  const threeColumnWidth = useMemo(() => {
    const columnWidth = getColumnWidth(0);
    const separatorWidth = 2;
    // 3 columns + 2 separators between them
    return (columnWidth * 3) + (separatorWidth * 2);
  }, [getColumnWidth]);

  const columnConfigs = useMemo(() => {
    return calanderData.map((item, index) => ({
      item,
      index,
      columnWidth: getColumnWidth(index),
    }));
  }, [calanderData, getColumnWidth]);

  const allStaffIds = useMemo(
    () => calanderData.map((staff) => staff.staffId),
    [calanderData]
  );

  // Animate overlay appearance and disappearance
  useEffect(() => {
    if (isSaving) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isSaving, overlayOpacity]);

  // Restore horizontal scroll position when scrollEnabled changes (during drag)
  useEffect(() => {
    if (scrollEnabled && savedHorizontalScrollPosition.current > 0) {
      // Small delay to ensure ScrollView is ready
      setTimeout(() => {
        if (horizontalScrollRef.current) {
          horizontalScrollRef.current.scrollTo({
            x: savedHorizontalScrollPosition.current,
            y: 0,
            animated: false,
          });
        }
        if (staffHeaderScrollRef.current) {
          staffHeaderScrollRef.current.scrollTo({
            x: savedHorizontalScrollPosition.current,
            y: 0,
            animated: false,
          });
        }
      }, 50);
    }
  }, [scrollEnabled]);

  // Refresh calendar when returning from other screens (create/cancel appointment)
  useFocusEffect(
    useCallback(() => {
      const params = route.params as any;
      if (params?.refresh) {
        // Clear the refresh param
        navigation.setParams({ refresh: undefined });
      }
      
      // Always refresh when screen comes into focus
      const locationIds = pageFilter.location_ids.length > 0 
        ? pageFilter.location_ids 
        : allLocations.map((loc) => loc.id);
      // Function signature: fetchCalanderAppointmentsData(date: string, locationIds?: string[])
      const dateString = currentDate.toISOString().split('T')[0];
      fetchCalanderAppointmentsData(dateString, locationIds);
    }, [route.params, fetchCalanderAppointmentsData, pageFilter, allLocations, currentDate, navigation])
  );

  return (
    <>
      <SafeAreaView edges={['top', 'bottom']} style={CalanderScreenStyles.mainContainer}>
        {/* Header Section: TimeGutterHeader (LEFT) spanning both rows + Date & Staff Headers (RIGHT) stacked */}
        <View style={{ flexDirection: 'row', width: '100%' }}>
          {/* LEFT: Time Gutter Header - Spans both Date and Staff header */}
          <TimeGutterHeader headerHeight={getHeightEquivalent(135)} />

          {/* RIGHT: Stacked Headers Container */}
          <View style={{ flex: 1, flexDirection: 'column' }}>
            {/* Top: Date Header */}
            <View style={CalanderScreenStyles.newHeaderContainer}>
              {/* Center - Date */}
              <TouchableOpacity
                onPress={handleDatePress}
                style={CalanderScreenStyles.dateContainer}
              >
                <Text style={CalanderScreenStyles.dateText}>
                  {formatDate(currentDate)}
                </Text>
                <ChevronDown size={20} color={colors.text} />
              </TouchableOpacity>

              {/* Right Side - Filter, Notification, Profile */}
              <View style={CalanderScreenStyles.rightHeaderContainer}>
                <TouchableOpacity
                  onPress={handleFilterPress}
                  style={CalanderScreenStyles.headerButton}
                >
                  <SlidersHorizontal size={20} color={colors.black} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNotificationPress}
                  style={CalanderScreenStyles.headerButton}
                >
                  <Bell size={20} color={colors.text} />
                  {/* Notification badge */}
                  <View style={CalanderScreenStyles.notificationBadge} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleProfilePress}
                  style={CalanderScreenStyles.profileButton}
                >
                  <Text style={CalanderScreenStyles.profileInitials}>
                    {getUserInitials()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom: Staff Header */}
            {calanderData.length > 0 && (
              <ScrollView
                ref={staffHeaderScrollRef}
                scrollEnabled={true}
                horizontal={true}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                snapToInterval={threeColumnWidth}
                snapToAlignment="start"
                decelerationRate="fast"
                onScroll={(event) => {
                  // Sync calendar columns when staff header is scrolled
                  if (isScrollingFromCalendar.current) {
                    isScrollingFromCalendar.current = false;
                    return;
                  }
                  const offsetX = event.nativeEvent.contentOffset.x;
                  savedHorizontalScrollPosition.current = offsetX;
                  if (horizontalScrollRef.current) {
                    isScrollingFromStaffHeader.current = true;
                    horizontalScrollRef.current.scrollTo({
                      x: offsetX,
                      y: 0,
                      animated: false,
                    });
                  }
                }}
                style={{
                  height: 55,
                }}
                contentContainerStyle={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 5,
                  backgroundColor: colors.white,
                }}
              >
                {/* Staff headers - all have equal width */}
                {calanderData.map((staff, index) => (
                  <Fragment key={index}>
                    {/* Add separator width for columns after the first one */}
                    {index > 0 && (
                      <View
                        style={{
                          width: 1,
                          height: "100%",
                          backgroundColor: "transparent",
                        }}
                      />
                    )}
                    <View
                      style={{
                        width: getColumnWidth(index),
                        height: "100%",
                        backgroundColor: colors.white,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View style={CalanderScreenStyles.staffImageContainer}>
                        <Text
                          style={{
                            color: colors.white,
                            fontWeight: "bold",
                            fontSize: fontEq(10),
                          }}
                        >
                          {staff?.staffName?.charAt(0).toUpperCase() || "S"}
                        </Text>
                      </View>
                      <Text style={CalanderScreenStyles.staffName}>
                        {staff?.staffName || "Staff"}
                      </Text>
                    </View>
                  </Fragment>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

      <View style={CalanderScreenStyles.bodyContainer}>
        <View style={{ flex: 1, flexDirection: "column" }}>
            <View style={{ flexDirection: "row", flex: 1 }}>
              {/* Fixed Time Gutter Column with Red Line */}
              <View style={{ width: getWidthEquivalent(40) }}>
                <ScrollView
                  ref={verticalScrollRef}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={scrollEnabled}
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    // Sync calendar vertical scroll
                    if (isScrollingVerticalFromCalendar.current) {
                      isScrollingVerticalFromCalendar.current = false;
                      return;
                    }
                    if (calendarVerticalScrollRef.current) {
                      isScrollingVerticalFromTimeGutter.current = true;
                      calendarVerticalScrollRef.current.scrollTo({
                        y: event.nativeEvent.contentOffset.y,
                        animated: false,
                      });
                    }
                  }}
                >
                  <View style={{ position: 'relative' }}>
                    {/* Current Time Indicator - Ellipse and Line */}
                    {(() => {
                      const currentHour = currentTime.getHours();
                      const currentMinute = currentTime.getMinutes();
                      const minHour = 8;
                      const maxHour = 23;
                      const hourHeight = getHeightEquivalent(80);
                      
                      if (currentHour < minHour || currentHour > maxHour) {
                        return null;
                      }
                      
                      const minutesFromMinHour = (currentHour - minHour) * 60 + currentMinute;
                      const currentTimePosition = (minutesFromMinHour / 60) * hourHeight;
                      
                      return (
                        <>
                          {/* Ellipse with time */}
                          <View
                            style={{
                              position: 'absolute',
                             // left: getWidthEquivalent(1),
                              top: currentTimePosition - getHeightEquivalent(10),
                              width: getWidthEquivalent(38),
                              height: getHeightEquivalent(20),
                              borderRadius: getWidthEquivalent(10),
                              borderWidth: 1.5,
                              borderColor: '#D32F2F',
                              backgroundColor: colors.white,
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 3000,
                              elevation: 20,
                              pointerEvents: 'none',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84,
                            }}
                          >
                            <Text style={{ fontSize: fontEq(8), fontWeight: '700', color: '#D32F2F' }}>
                              {currentTime.getHours().toString().padStart(2, '0')}:
                              {currentTime.getMinutes().toString().padStart(2, '0')}
                            </Text>
                          </View>
                          {/* Red line in TimeGutter */}
                          <View
                            style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: currentTimePosition,
                              height: 2,
                              backgroundColor: '#D32F2F',
                              zIndex: 2500,
                              pointerEvents: 'none',
                              elevation: 10,
                            }}
                          />
                        </>
                      );
                    })()}

                    <TimeGutter
                      minHour={8}
                      maxHour={23}
                      hourHeight={getHeightEquivalent(80)}
                    />
                  </View>
                </ScrollView>
              </View>

              {/* Scrollable Appointment Columns */}
              <ScrollView
                ref={calendarVerticalScrollRef}
                bounces={false}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                style={{ flex: 1 }}
                scrollEventThrottle={16}
                onScroll={(event) => {
                  // Sync TimeGutter vertical scroll
                  if (isScrollingVerticalFromTimeGutter.current) {
                    isScrollingVerticalFromTimeGutter.current = false;
                    return;
                  }
                  if (verticalScrollRef.current) {
                    isScrollingVerticalFromCalendar.current = true;
                    verticalScrollRef.current.scrollTo({
                      y: event.nativeEvent.contentOffset.y,
                      animated: false,
                    });
                  }
                }}
              >
                <View style={{ position: 'relative' }}>
                  {/* Current Time Line - extends across calendar */}
                  {(() => {
                    const currentHour = currentTime.getHours();
                    const currentMinute = currentTime.getMinutes();
                    const minHour = 8;
                    const maxHour = 23;
                    const hourHeight = getHeightEquivalent(80);
                    
                    if (currentHour < minHour || currentHour > maxHour) {
                      return null;
                    }
                    
                    const minutesFromMinHour = (currentHour - minHour) * 60 + currentMinute;
                    const currentTimePosition = (minutesFromMinHour / 60) * hourHeight;
                    
                    return (
                      <View
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: currentTimePosition,
                          height: 2,
                          backgroundColor: '#D32F2F',
                          zIndex: 2500,
                          pointerEvents: 'none',
                          elevation: 10,
                        }}
                      />
                    );
                  })()}

                  </View>

                <ScrollView
                  ref={horizontalScrollRef}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={scrollEnabled}
                  scrollEventThrottle={16}
                  directionalLockEnabled={true}
                  snapToInterval={threeColumnWidth}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  onScroll={(event) => {
                    // Sync staff header horizontal scroll
                    if (isScrollingFromStaffHeader.current) {
                      isScrollingFromStaffHeader.current = false;
                      return;
                    }
                    const offsetX = event.nativeEvent.contentOffset.x;
                    savedHorizontalScrollPosition.current = offsetX;
                    if (staffHeaderScrollRef.current) {
                      isScrollingFromCalendar.current = true;
                      staffHeaderScrollRef.current.scrollTo({
                        x: offsetX,
                        y: 0,
                        animated: false,
                      });
                    }
                  }}
                  contentContainerStyle={{
                    flexDirection: "row",
                  }}
                >
                  {columnConfigs.map(({ item, index, columnWidth }) => {
                  let columnAppointments = item.staffAppointments;

                  if (editingState) {
                    const {
                      appointmentId,
                      originalStaffId,
                      pendingStaffId,
                      pendingStart,
                      pendingEnd,
                      appointmentSnapshot,
                    } = editingState;

                    const isRelevantColumn =
                      item.staffId === originalStaffId ||
                      item.staffId === pendingStaffId;

                    if (isRelevantColumn) {
                      const baseList = columnAppointments.filter(
                        (appt) => appt.data.id !== appointmentId
                      );

                      if (item.staffId === pendingStaffId) {
                        const existing = columnAppointments.find(
                          (appt) => appt.data.id === appointmentId
                        );

                        const sourceAppointment = existing ?? appointmentSnapshot;

                        const updatedAppointment = {
                          ...sourceAppointment,
                          start: new Date(pendingStart),
                          end: new Date(pendingEnd),
                          data: {
                            ...sourceAppointment.data,
                            staff_id: item.staffId,
                            staff: sourceAppointment.data.staff
                              ? {
                                  ...sourceAppointment.data.staff,
                                  id: item.staffId,
                                }
                              : sourceAppointment.data.staff,
                          },
                        };

                        columnAppointments = [...baseList, updatedAppointment].sort(
                          (a, b) => a.start.getTime() - b.start.getTime()
                        );
                      } else {
                        columnAppointments = baseList;
                      }
                    }
                  }

                    return (
                      <Fragment key={index}>
                        <DraggableCalendarColumn
                          staffName={item.staffName}
                          staffId={item.staffId}
                          columnIndex={index}
                          allStaffIds={allStaffIds}
                          appointments={columnAppointments}
                          onAppointmentUpdate={(
                            appointmentServiceId,
                            newStartTime,
                            newEndTime,
                            newStaffId
                          ) => {
                            updateAppointmentTime(
                              appointmentServiceId,
                              newStartTime,
                              newEndTime,
                              newStaffId
                            ).then((success) => {
                              if (success) {
                                console.log("Appointment synced with backend successfully");
                              } else {
                                console.error("Failed to sync appointment with backend");
                              }
                            });
                            return Promise.resolve();
                          }}
                          showHours={false}
                          columnWidth={columnWidth}
                          hourHeight={getHeightEquivalent(80)}
                          minHour={8}
                          maxHour={23}
                          onScrollEnable={setScrollEnabled}
                          editingState={editingState}
                          onStartEditing={handleStartEditing}
                          onAppointmentPreview={handleAppointmentPreview}
                          totalStaffColumns={calanderData.length}
                        />
                        {index < columnConfigs.length - 1 && (
                          <View
                            style={{
                              width: 1,
                              height: "100%",
                              backgroundColor: "rgba(0, 0, 0, 0.2)",
                              position: "relative",
                              zIndex: 1,
                            }}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </ScrollView>
              </ScrollView>
            </View>
        </View>
      </View>

      {editingState && (
          <View style={CalanderScreenStyles.editingFooter}>
            <TouchableOpacity
              style={[
                CalanderScreenStyles.editingButton,
                CalanderScreenStyles.editingCancelButton,
              ]}
              onPress={handleCancelEditing}
              disabled={isSaving}
              activeOpacity={0.4}
            >
              <Text
                style={[
                  CalanderScreenStyles.editingButtonText,
                  CalanderScreenStyles.editingCancelText,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                CalanderScreenStyles.editingButton,
                CalanderScreenStyles.editingSaveButton,
              ]}
              onPress={handleSaveEditing}
              disabled={isSaving}
              activeOpacity={0.4}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text
                  style={[
                    CalanderScreenStyles.editingButtonText,
                    CalanderScreenStyles.editingSaveText,
                  ]}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <CustomToast
          message={toast.message}
          visible={toast.visible}
          type={toast.type}
          onHide={hideToast}
        />

        {/* Date Picker Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          backgroundStyle={{
            backgroundColor: colors.white,
          }}
          handleIndicatorStyle={{
            backgroundColor: colors.gray[300],
          }}
        >
          <BottomSheetView style={CalanderScreenStyles.bottomSheetContent}>
            <Text style={CalanderScreenStyles.bottomSheetTitle}>Select Date</Text>
            <CalendarList
              current={currentDate.toISOString().split("T")[0]}
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              pastScrollRange={12}
              futureScrollRange={12}
              scrollEnabled={true}
              showScrollIndicator={false}
              horizontal={false}
              pagingEnabled={false}
              // Make calendar width responsive with proper margins
              calendarWidth={SCREEN_WIDTH - getWidthEquivalent(32)}
              // Let the calendar height be determined by its content
              theme={{
                // Base colors
                backgroundColor: colors.white,
                calendarBackground: colors.white,
                
                // Date selection
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                selectedDotColor: colors.white,
                
                // Today's date
                todayTextColor: colors.primary,
                todayBackgroundColor: `${colors.primary}20`, // 20% opacity
                
                // Day text
                dayTextColor: colors.text,
                textDayFontSize: fontEq(14), // Slightly smaller for better fit
                textDayFontWeight: '500',
                
                // Month header
                textMonthFontSize: fontEq(18),
                textMonthFontWeight: '700',
                monthTextColor: colors.text,
                
                // Day names (Mon, Tue, etc.)
                textSectionTitleColor: colors.textSecondary,
                textDayHeaderFontSize: fontEq(12),
                textDayHeaderFontWeight: '600',
                
                // Navigation arrows
                arrowColor: colors.primary,
                disabledArrowColor: colors.gray[300],
                
                // Dot markers
                dotColor: colors.primary,
                
                // Disabled dates
                textDisabledColor: colors.gray[300],
                
                // General styles
                indicatorColor: colors.primary,
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
              }}
              // Calendar container styles
              style={{
                height: getHeightEquivalent(467),
                alignSelf: 'center',
                paddingVertical: getHeightEquivalent(8),
              }}
            />
          </BottomSheetView>
        </BottomSheet>

        {/* Filter Panel Modal */}
        <FilterPanelModal
          visible={showFilterPanel}
          onClose={closeFilterPanel}
          onClear={clearAllFilters}
          onApply={applyFilters}
          allLocations={allLocations}
          pageFilter={pageFilter}
          toggleLocationFilter={toggleLocationFilter}
        />
      </SafeAreaView>

      {/* Saving Overlay Modal */}
      <Modal
        isVisible={isSaving}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0}
        style={savingOverlayStyles.modalStyle}
        hasBackdrop={false}
        coverScreen={true}
        statusBarTranslucent={true}
      >
        <Animated.View 
          style={[
            savingOverlayStyles.overlayContainer,
            { opacity: overlayOpacity }
          ]}
        >
          <View style={savingOverlayStyles.spinnerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

export default CalanderScreen;
