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
  StatusBar,
  Pressable,
} from "react-native";
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  Fragment,
} from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CalanderScreenStyles } from "./CalanderScreenStyles";
import DraggableCalendarColumn from "../../../Components/DraggableCalendarColumn";
import TimeGutter from "../../../Components/TimeGutter";
import TimeGutterHeader from "../../../Components/TimeGutterHeader";
import {
  ChevronDown,
  SlidersVertical,
  Bell,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import Modal from "react-native-modal";
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import useCalanderScreenVM from "./CalanderScreenVM";
import { colors } from "../../../Constants/colors";
import CustomToast from "../../../Components/CustomToast";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import DateModal from "../../../Components/DateModal";

// import BottomSheet, {
//   BottomSheetView,
//   BottomSheetBackdrop,
// } from "@gorhom/bottom-sheet";
import { AppointmentCalanderBO } from "../../../Repository/appointmentsRepository";
import { useCalendarEditingStore } from "../../../Store/useCalendarEditingStore";

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
    bottom: getHeightEquivalent(100),
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
    showToast,
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
  const insets = useSafeAreaInsets();
  
  // State for carousel pagination
  const [currentStaffIndex, setCurrentStaffIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);
  const calendarVerticalScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  
  const [scrollEnabled, setScrollEnabled] = useState(true);
  
  // Footer Store Actions (Selected individually to avoid re-renders on state changes)
  const showEditingFooter = useCalendarEditingStore(state => state.showEditingFooter);
  const hideEditingFooter = useCalendarEditingStore(state => state.hideEditingFooter);
  const setFooterIsSaving = useCalendarEditingStore(state => state.setIsSaving);
  const updateCallbacks = useCalendarEditingStore(state => state.updateCallbacks);
  const savedHorizontalScrollPosition = useRef(0);
  const lastHorizontalScrollX = useRef(0);
  const isProgrammaticScroll = useRef(false); // Track programmatic scrolls (auto-scroll)
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [currentScrollX, setCurrentScrollX] = useState(0);
  const [currentScrollY, setCurrentScrollY] = useState(0);

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
      
      // Show global footer
      showEditingFooter({
        onSave: handleSaveEditing,
        onCancel: handleCancelEditing
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
    setEditingState(null);
    setScrollEnabled(true);
    hideEditingFooter();
  }, [hideEditingFooter]);

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

      const success = await updateAppointmentTime(
        editingState.appointmentId,
        new Date(editingState.pendingStart),
        new Date(editingState.pendingEnd),
        editingState.pendingStaffId
      );

      if (success) {
        setEditingState(null);
        hideEditingFooter();
        showToast("Appointment updated successfully", "success");
      } else {
        showToast("Failed to update appointment", "error");
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast("An error occurred while saving", "error");
    } finally {
      setIsSaving(false);
    }
  }, [editingState, isSaving, updateAppointmentTime]);

  // Sync store callbacks when editing state changes to avoid stale closures
  useEffect(() => {
    if (editingState) {
        updateCallbacks({
            onSave: handleSaveEditing,
            onCancel: handleCancelEditing
        });
    }
  }, [editingState, handleSaveEditing, handleCancelEditing]);

  // Simple modal state for DateModal
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  
  // State for staff order edit modal
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{
    staffId: string;
    staffName: string;
    currentOrder: number;
  } | null>(null);
  
  // Prevent multiple date changes from scroll
  const isNavigatingDate = useRef(false);
  const lastScrollDirection = useRef<'left' | 'right' | null>(null);
  const scrollStartX = useRef<number>(0);
  const ignoreScrollEvents = useRef(false);
  
  // Uncomment the lines below to restore BottomSheet
  // // Bottom sheet setup
  // const bottomSheetRef = useRef<BottomSheet>(null);
  // const snapPoints = useMemo(() => ["50%", "80%"], []);
  // const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Track initial mount for auto-scroll
  const isInitialMount = useRef(true);
  const previousDate = useRef(currentDate);
  const isComingFromAppointmentScreen = useRef(false);
  const isRefreshingData = useRef(false);

  // Auto-scroll to current time on mount and date change
  useEffect(() => {
    // Only scroll if we have calendar data loaded
    if (!calanderData || calanderData.length === 0) {
      return;
    }

    // Check if date actually changed (not just a refresh)
    const dateChanged = previousDate.current.toDateString() !== currentDate.toDateString();
    
    // Skip scroll if:
    // 1. Not initial mount AND date hasn't changed (just a data refresh)
    // 2. Currently refreshing data (coming back from appointment screens)
    if (isRefreshingData.current) {
      console.log('[CalendarScroll] Skipping auto-scroll - data refresh in progress');
      return;
    }
    
    if (!isInitialMount.current && !dateChanged) {
      console.log('[CalendarScroll] Skipping auto-scroll - no date change, just data refresh');
      return;
    }

    const scrollToCurrentTime = () => {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const minHour = 8;
      const maxHour = 23;
      const hourHeight = getHeightEquivalent(80);

      // Only scroll if current time is within calendar hours
      if (currentHour >= minHour && currentHour <= maxHour) {
        const minutesFromMinHour = (currentHour - minHour) * 60 + currentMinute;
        const currentTimePosition = (minutesFromMinHour / 60) * hourHeight;

        // Get screen height to calculate center position
        const screenHeight = Dimensions.get('window').height;
        const statusBarHeight = insets.top;
        const dateHeaderHeight = getHeightEquivalent(135);
        const staffHeaderHeight = getHeightEquivalent(85);
        const tabBarHeight = getHeightEquivalent(100);
        
        // Calculate actual visible calendar height
        const visibleHeight = screenHeight - statusBarHeight - dateHeaderHeight - staffHeaderHeight - tabBarHeight;
        
        // Calculate scroll position to center the current time
        const scrollY = currentTimePosition - (visibleHeight / 2);
        
        console.log('[CalendarScroll] Centering current time (initial mount or date change):', {
          currentHour,
          currentMinute,
          currentTimePosition,
          screenHeight,
          visibleHeight,
          scrollY: Math.max(0, scrollY),
          isInitialMount: isInitialMount.current,
          dateChanged
        });
        
        // Delay to ensure ScrollView is mounted and rendered with data
        setTimeout(() => {
          if (verticalScrollRef.current) {
            verticalScrollRef.current.scrollTo({
              y: Math.max(0, scrollY), // Ensure non-negative
              animated: true,
            });
          }
          // UNIFIED SCROLL: Only need to scroll one ref now (calendarVerticalScrollRef removed)
        }, 500); // 500ms delay after data is loaded
      }
    };

    // Scroll when calendar data is available and when date changes
    scrollToCurrentTime();
    
    // Mark as no longer initial mount and update previous date
    isInitialMount.current = false;
    previousDate.current = currentDate;
  }, [currentDate, calanderData, insets.top]);

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
  // Simple modal open function
  const handleDatePress = () => {
    console.log("Date pressed - opening date modal");
    setIsDateModalVisible(true);
  };
  
  // Uncomment to restore BottomSheet
  // const handleDatePress = () => {
  //   console.log("Date pressed - opening bottom sheet");
  //   console.log("Bottom sheet ref:", bottomSheetRef.current);
  //   bottomSheetRef.current?.expand();
  //   setIsBottomSheetOpen(true);
  // };

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

  // Simple date selection handler for DateModal
  const handleDateSelect = (date: Date) => {
    console.log("Date selected:", date);
    updateCurrentDate(date);
    setIsDateModalVisible(false);
  };

  // Handler to open order edit modal
  const handleStaffOrderPress = (staffId: string, staffName: string, currentOrder: number) => {
    setSelectedStaff({ staffId, staffName, currentOrder });
    setIsOrderModalVisible(true);
  };

  // Handler to update staff order
  const handleUpdateStaffOrder = async (direction: 'increase' | 'decrease') => {
    if (!selectedStaff) return;

    const newOrder = direction === 'increase' 
      ? selectedStaff.currentOrder + 1 
      : Math.max(0, selectedStaff.currentOrder - 1);

    // Import the teamRepository
    const { teamRepository } = await import('../../../Repository/teamRepository');
    
    const success = await teamRepository.updateTeamMemberOrder(
      selectedStaff.staffId,
      newOrder
    );

    if (success) {
      showToast(`Order updated to ${newOrder}`, "success");
      setSelectedStaff({ ...selectedStaff, currentOrder: newOrder });
      
      // Refresh calendar data to reflect new order
      const locationIds = pageFilter.location_ids.length > 0 
        ? pageFilter.location_ids 
        : allLocations.map((loc) => loc.id);
      const dateString = currentDate.toISOString().split('T')[0];
      fetchCalanderAppointmentsData(dateString, locationIds);
    } else {
      showToast("Failed to update order", "error");
    }
  };

  // Global lock for slot presses across ALL columns
  const globalSlotLock = useRef<boolean>(false);
  const globalLastPressTime = useRef<number>(0);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track scroll start to detect continuous scroll gestures
  const handleHorizontalScrollBegin = (event: any) => {
    scrollStartX.current = event.nativeEvent.contentOffset.x;
  };

  const timeColumnWidth = useMemo(() => getWidthEquivalent(60), []);

  // All columns now have consistent width since time labels are in a separate fixed column
  const getColumnWidth = useCallback(
    (index: number) => getWidthEquivalent(111),
    []
  );

  // Calculate the width for 3 columns (including separators)
  const threeColumnWidth = useMemo(() => {
    const columnWidth = getColumnWidth(0);
    const separatorWidth = 1.5;
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
      }, 50);
    }
  }, [scrollEnabled]);

  // Track if we're returning from an appointment screen
  const isReturningFromAppointmentScreen = useRef(false);
  
  // Refresh calendar when returning from other screens (create/cancel appointment)
  useFocusEffect(
    useCallback(() => {
      // Ignore scroll events temporarily when returning from another screen
      // This prevents the back swipe gesture from triggering date changes or scrolling
      ignoreScrollEvents.current = true;
      lastScrollDirection.current = null; // Reset scroll direction
      isNavigatingDate.current = false; // Reset navigation flag
      
      const params = route.params as any;
      const dataChanged = params?.dataChanged;
      const isRefreshing = params?.refresh;
      
      // Clear the params
      if (dataChanged || isRefreshing) {
        navigation.setParams({ dataChanged: undefined, refresh: undefined });
      }
      
      // Check if returning from appointment screen
      const isReturningFromAppointment = isComingFromAppointmentScreen.current;
      
      console.log('[CalendarScroll-Focus] Screen focused:', {
        isComingFromAppointmentScreen: isComingFromAppointmentScreen.current,
        dataChanged,
        isReturningFromAppointment,
        reason: isReturningFromAppointment ? 'Returning from appointment screen' : 'Tab navigation or other navigation'
      });
      
      // Set refresh flag to prevent auto-scroll in useEffect when:
      // 1. Returning from appointment screens (even if no data changed)
      // 2. Data changed and we're refreshing
      if (isReturningFromAppointment) {
        isRefreshingData.current = true;
        console.log('[CalendarScroll-Focus] Blocking auto-scroll - returning from appointment screen');
      }
      
      // Only refresh calendar data if backend interaction occurred (dataChanged flag)
      if (dataChanged) {
        console.log('[CalendarScroll-Focus] Backend data changed - refreshing calendar');
        const locationIds = pageFilter.location_ids.length > 0 
          ? pageFilter.location_ids 
          : allLocations.map((loc) => loc.id);
        const dateString = currentDate.toISOString().split('T')[0];
        fetchCalanderAppointmentsData(dateString, locationIds);
      } else if (!isReturningFromAppointment) {
        // Auto-scroll when navigating from tabs (not returning from appointment screens and no data change)
        console.log('[CalendarScroll-Focus] Tab navigation - performing auto-scroll');
        const scrollToCurrentTime = () => {
          const currentHour = new Date().getHours();
          const currentMinute = new Date().getMinutes();
          const minHour = 8;
          const maxHour = 23;
          const hourHeight = getHeightEquivalent(80);

          // Only scroll if current time is within calendar hours
          if (currentHour >= minHour && currentHour <= maxHour) {
            const minutesFromMinHour = (currentHour - minHour) * 60 + currentMinute;
            const currentTimePosition = (minutesFromMinHour / 60) * hourHeight;

            // Get screen height to calculate center position
            const screenHeight = Dimensions.get('window').height;
            const statusBarHeight = insets.top;
            const dateHeaderHeight = getHeightEquivalent(135);
            const staffHeaderHeight = getHeightEquivalent(85);
            const tabBarHeight = getHeightEquivalent(100);
            
            // Calculate actual visible calendar height
            const visibleHeight = screenHeight - statusBarHeight - dateHeaderHeight - staffHeaderHeight - tabBarHeight;
            
            // Calculate scroll position to center the current time
            const scrollY = currentTimePosition - (visibleHeight / 2);
            
            console.log('[CalendarScroll-Focus] Auto-scrolling to current time (tab navigation):', {
              currentHour,
              currentMinute,
              scrollY: Math.max(0, scrollY)
            });
            
            // Scroll to current time (unified scroll)
            if (verticalScrollRef.current) {
              verticalScrollRef.current.scrollTo({
                y: Math.max(0, scrollY),
                animated: false, // Instant scroll for smooth transition
              });
            }
            // UNIFIED SCROLL: Only need to scroll one ref now
          }
        };
        
        // Small delay to ensure view is ready
        setTimeout(() => {
          scrollToCurrentTime();
        }, 100);
      } else {
        console.log('[CalendarScroll-Focus] No backend changes - skipping refresh');
      }
      
      // Reset the flags after a delay to allow data to load
      setTimeout(() => {
        isComingFromAppointmentScreen.current = false;
        isRefreshingData.current = false;
        console.log('[CalendarScroll-Focus] Flags reset - auto-scroll re-enabled');
      }, 700); // Reset after data loads (matches the 500ms delay in useEffect + buffer)
      
      // Re-enable scroll events after a longer delay (1000ms) to ensure back swipe completes
      setTimeout(() => {
        ignoreScrollEvents.current = false;
      }, 1000);
    }, [route.params, fetchCalanderAppointmentsData, pageFilter, allLocations, currentDate, navigation, insets.top])
  );
  
  // Track when navigating to AppointmentDetailsScreen or CreateAppointmentScreen
  // Auto-scroll is disabled ONLY when returning from these specific screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Check if we're navigating to AppointmentDetailsScreen or CreateAppointmentScreen
      const state = navigation.getState();
      const routes = state.routes;
      const currentRoute = routes[routes.length - 1];
      
      // Only disable auto-scroll for these two specific screens
      if (currentRoute?.name === 'AppointmentDetailsScreen' || 
          currentRoute?.name === 'CreateAppointment') {
        isComingFromAppointmentScreen.current = true;
        console.log('[CalendarScroll-Focus] Navigating to appointment screen (auto-scroll will be disabled):', currentRoute.name);
      } else {
        isComingFromAppointmentScreen.current = false;
        console.log('[CalendarScroll-Focus] Navigating to other screen (auto-scroll will work):', currentRoute?.name);
      }
    });
    
    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent={true}
      />
      <SafeAreaView
        edges={["bottom"]}
        style={CalanderScreenStyles.mainContainer}
      >
        <View
          style={{
            backgroundColor: colors.white,
            // shadowColor: "#00000079",
            // shadowOffset: { width: 0, height: 2 }, // downward shadow
            // shadowOpacity: 0.35,
            // shadowRadius: 4,
            // elevation: 4, // Android shadow
            // zIndex: 1,
            paddingTop: insets.top,
          }}
        >
          {/* Header Section: Date Header only - Staff headers integrated with calendar */}
          <View style={{ flexDirection: "row", width: "100%" }}>
            {/* LEFT: Time Gutter Header spacer */}
            <View style={{ width: getWidthEquivalent(40) }} />
            
            {/* RIGHT: Date Header */}
            <View style={[CalanderScreenStyles.newHeaderContainer, { flex: 1 }]}>
              {/* Center - Date */}
              <Pressable
                onPress={handleDatePress}
                style={({ pressed }) => [
                  CalanderScreenStyles.dateContainer,
                  {
                    backgroundColor: pressed
                      ? colors.gray[100]
                      : "transparent", // gray when pressed
                    borderRadius: 50, // rounded corners
                  },
                ]}
              >
                <Text style={CalanderScreenStyles.dateText}>
                  {formatDate(currentDate)}
                </Text>
                <ChevronDown size={20} color={colors.text} />
              </Pressable>

              {/* Right Side - Filter, Notification, Profile */}
              <View style={CalanderScreenStyles.rightHeaderContainer}>
                <TouchableOpacity
                  onPress={handleFilterPress}
                  style={CalanderScreenStyles.headerButton}
                >
                  <SlidersVertical
                    size={24}
                    color={colors.black}
                    strokeWidth={1.7}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNotificationPress}
                  style={CalanderScreenStyles.headerButton}
                >
                  <Bell size={24} color={colors.black} strokeWidth={1.7} />
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
          </View>
        </View>
        <View style={CalanderScreenStyles.bodyContainer}>
          {/* UNIFIED VERTICAL SCROLL: Time gutter and calendar scroll together */}
          <ScrollView
            ref={verticalScrollRef}
            bounces={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            scrollEventThrottle={16}
            decelerationRate="fast"
            directionalLockEnabled={true}
            removeClippedSubviews={false}
            onScroll={(event) => {
              setCurrentScrollY(event.nativeEvent.contentOffset.y);
            }}
            style={{ flex: 1 }}
          >
            {/* INTEGRATED VERTICAL SCROLL: Time gutter and calendar scroll together */}
            <View style={{ flexDirection: "row" }}>
              {/* Fixed Time Gutter Column with Red Line and Header */}
              <View style={{ width: getWidthEquivalent(40) }}>
                {/* TimeGutterHeader for staff row */}
                <TimeGutterHeader headerHeight={getHeightEquivalent(85)} />
                <View style={{ position: "relative" }}>
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

                    const minutesFromMinHour =
                      (currentHour - minHour) * 60 + currentMinute;
                    const currentTimePosition =
                      (minutesFromMinHour / 60) * hourHeight;

                    return (
                      <>
                        {/* Ellipse with time */}
                        <View
                          style={{
                            position: "absolute",
                            top:
                              currentTimePosition - getHeightEquivalent(10),
                            width: getWidthEquivalent(40),
                            height: getHeightEquivalent(20),
                            borderRadius: getWidthEquivalent(10),
                            borderWidth: 2,
                            borderColor: "#D32F2F",
                            backgroundColor: colors.white,
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 3000,
                            elevation: 20,
                            pointerEvents: "none",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: fontEq(10),
                              fontWeight: "700",
                              color: "#D32F2F",
                              fontFamily: "Helvetica",
                            }}
                          >
                            {((currentTime.getHours() % 12) || 12)
                              .toString()
                              .padStart(2)}
                            :
                            {currentTime.getMinutes().toString().padStart(2,"0")}
                          </Text>
                        </View>
                        {/* Red line in TimeGutter */}
                        <View
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: currentTimePosition,
                            height: 2,
                            backgroundColor: "#D32F2F",
                            zIndex: 2500,
                            pointerEvents: "none",
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
                  {/* Small bottom padding for better scrolling */}
                  <View style={{ height: getHeightEquivalent(40) }} />
                </View>
              </View>

              {/* Calendar Columns - scrolls together with time gutter */}
              <View style={{ flex: 1 }}>
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
                onScrollBeginDrag={(event) => {
                  handleHorizontalScrollBegin(event);
                }}
                onScroll={(event) => {
                  setCurrentScrollX(event.nativeEvent.contentOffset.x);
                }}
                contentContainerStyle={{
                  flexDirection: "column",
                }}
              >
                {/* Staff Header Row - First row in calendar scroll */}
                <View style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  backgroundColor: colors.white,
                  shadowColor: "#00000079",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.35,
                  shadowRadius: 4,
                  elevation: 4,
                  zIndex: 2,
                }}>
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
                          height: getHeightEquivalent(85),
                          backgroundColor: colors.white,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View style={CalanderScreenStyles.staffImageContainer}>
                          <Text
                            style={{
                              color: colors.primary,
                              fontWeight: "bold",
                              fontSize: fontEq(10),
                            }}
                          >
                            {staff?.staffName?.charAt(0).toUpperCase() || "S"}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Text style={CalanderScreenStyles.staffName}>
                            {staff?.staffName || "Staff"}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleStaffOrderPress(
                              staff.staffId,
                              staff.staffName,
                              staff.order
                            )}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <ChevronDown size={14} color={colors.textSecondary} strokeWidth={2} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Fragment>
                  ))}
                </View>

                <View style={{ position: "relative" }}>
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

                    const minutesFromMinHour =
                      (currentHour - minHour) * 60 + currentMinute;
                    const currentTimePosition =
                      (minutesFromMinHour / 60) * hourHeight;

                    return (
                      <View
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: currentTimePosition,
                          height: 2,
                          backgroundColor: "#D32F2F",
                          zIndex: 2500,
                          pointerEvents: "none",
                          elevation: 10,
                        }}
                      />
                    );
                  })()}                 
                  {/* Calendar columns container */}
                  <View style={{ flexDirection: "row" }}>
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

                            const sourceAppointment =
                              existing ?? appointmentSnapshot;

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

                            columnAppointments = [
                              ...baseList,
                              updatedAppointment,
                            ].sort(
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
                                  console.log(
                                    "Appointment synced with backend successfully"
                                  );
                                } else {
                                  console.error(
                                    "Failed to sync appointment with backend"
                                  );
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
                            globalSlotLock={globalSlotLock}
                            globalLastPressTime={globalLastPressTime}
                            horizontalScrollRef={horizontalScrollRef}
                            screenWidth={SCREEN_WIDTH}
                            currentScrollX={currentScrollX}
                            threeColumnWidth={threeColumnWidth}
                            isProgrammaticScrollRef={isProgrammaticScroll}
                            verticalScrollRef={verticalScrollRef}
                            screenHeight={Dimensions.get("window").height}
                            currentScrollY={currentScrollY}
                            verticalScrollTopOffset={
                              getHeightEquivalent(135) + insets.top // TimeGutter header height + top inset
                            }
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
                  </View>
                </View>
              </ScrollView>
              </View>
            </View>
          </ScrollView>
        </View>



        <CustomToast
          message={toast.message}
          visible={toast.visible}
          type={toast.type}
          onHide={hideToast}
        />

        {/* Date Picker Bottom Sheet */}
        {/* NEW: DateModal Component */}
        <DateModal
          isVisible={isDateModalVisible}
          onClose={() => setIsDateModalVisible(false)}
          onSelectDate={handleDateSelect}
          selectedDate={currentDate}
          title="Select Date"
        />

        {/* REVERT: Uncomment to restore BottomSheet */}
        {/* <BottomSheet
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
            <Text style={CalanderScreenStyles.bottomSheetTitle}>
              Select Date
            </Text>
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
              calendarWidth={SCREEN_WIDTH - getWidthEquivalent(32)}
              theme={{
                backgroundColor: colors.white,
                calendarBackground: colors.white,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                selectedDotColor: colors.white,
                todayTextColor: colors.primary,
                todayBackgroundColor: `${colors.primary}20`,
                dayTextColor: colors.text,
                textDayFontSize: fontEq(14),
                textDayFontWeight: "500",
                textMonthFontSize: fontEq(18),
                textMonthFontWeight: "700",
                monthTextColor: colors.text,
                textSectionTitleColor: colors.textSecondary,
                textDayHeaderFontSize: fontEq(12),
                textDayHeaderFontWeight: "600",
                arrowColor: colors.primary,
                disabledArrowColor: colors.gray[300],
                dotColor: colors.primary,
                textDisabledColor: colors.gray[300],
                indicatorColor: colors.primary,
                textDayFontFamily: "System",
                textMonthFontFamily: "System",
                textDayHeaderFontFamily: "System",
              }}
              style={{
                height: getHeightEquivalent(467),
                alignSelf: "center",
                paddingVertical: getHeightEquivalent(8),
                zIndex:101,
              }}
            />
          </BottomSheetView>
        </BottomSheet> */}

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
        
        {/* Staff Order Edit Modal */}
        <Modal
          isVisible={isOrderModalVisible}
          onBackdropPress={() => setIsOrderModalVisible(false)}
          onBackButtonPress={() => setIsOrderModalVisible(false)}
          animationIn="fadeIn"
          animationOut="fadeOut"
          backdropOpacity={0.5}
          style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: 20,
              width: getWidthEquivalent(300),
              maxWidth: "90%",
            }}
          >
            <Text
              style={{
                fontSize: fontEq(18),
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Edit Shift Order
            </Text>
            <Text
              style={{
                fontSize: fontEq(14),
                color: colors.textSecondary,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {selectedStaff?.staffName}
            </Text>

            {/* Current Order Display */}
            <View
              style={{
                backgroundColor: colors.gray[50],
                padding: 16,
                borderRadius: 8,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: fontEq(12),
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                Current Order
              </Text>
              <Text
                style={{
                  fontSize: fontEq(24),
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                {selectedStaff?.currentOrder || 0}
              </Text>
            </View>

            {/* Order Control Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => handleUpdateStaffOrder('decrease')}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.gray[100],
                  paddingVertical: 12,
                  borderRadius: 8,
                  gap: 8,
                }}
              >
                <ChevronLeft size={20} color={colors.text} strokeWidth={2.5} />
                <Text
                  style={{
                    fontSize: fontEq(14),
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Decrease
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleUpdateStaffOrder('increase')}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: fontEq(14),
                    fontWeight: "600",
                    color: colors.white,
                  }}
                >
                  Increase
                </Text>
                <ChevronRight size={20} color={colors.white} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setIsOrderModalVisible(false)}
              style={{
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: fontEq(14),
                  fontWeight: "500",
                  color: colors.textSecondary,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
            { opacity: overlayOpacity },
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
