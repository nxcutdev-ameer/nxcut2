import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
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
import { useNavigation } from "@react-navigation/native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { CalendarList } from "react-native-calendars";

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
  } = useCalanderScreenVM();

  const navigation: any = useNavigation();
  // State for carousel pagination
  const [currentStaffIndex, setCurrentStaffIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Bottom sheet setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

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

  return (
    <SafeAreaView style={CalanderScreenStyles.mainContainer}>
      {/* New Header Design */}
      <View style={CalanderScreenStyles.newHeaderContainer}>
        {/* Left Side - Menu */}
        {/* <TouchableOpacity
          onPress={handleMenuPress}
          style={CalanderScreenStyles.headerButton}
        >
          <Menu size={24} color={colors.text} />
        </TouchableOpacity> */}

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
            <SlidersHorizontal size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNotificationPress}
            style={CalanderScreenStyles.headerButton}
          >
            <Bell size={24} color={colors.text} />
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
      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        horizontal
        //scrollEnabled={false}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={CalanderScreenStyles.bodyContainer}
      >
        <View style={{ flex: 1, flexDirection: "column" }}>
          {/* Staff Navigation Header */}

          {calanderData.length > 0 && (
            <ScrollView
              scrollEnabled={false}
              horizontal={true}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              //  showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                //marginBottom: getHeightEquivalent(200),
              }}
              style={[
                CalanderScreenStyles.staffNavigationBar,
                { overflow: "visible" },
              ]}
            >
              {/* Clock icon in spacing area */}
              <View
                style={{
                  width: getWidthEquivalent(50),
                  height: "100%",
                  backgroundColor: colors.white,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Clock size={getWidthEquivalent(24)} color={colors.primary} />
              </View>

              {/* Vertical line before first staff member */}
              {calanderData.length > 0 && (
                <View
                  style={{
                    width: 1,
                    height: "60%",
                    backgroundColor: colors.border,
                    alignSelf: "center",
                  }}
                />
              )}

              {calanderData.map((staff, index) => (
                <Fragment key={index}>
                  <View
                    style={{
                      width:
                        index === 0
                          ? getWidthEquivalent(118)
                          : index === 1 || index === 2
                          ? getWidthEquivalent(108)
                          : getWidthEquivalent(125),
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
                          fontSize: fontEq(18),
                        }}
                      >
                        {staff?.staffName?.charAt(0).toUpperCase() || "S"}
                      </Text>
                    </View>
                    <Text style={CalanderScreenStyles.staffName}>
                      {staff?.staffName || "Staff"}
                    </Text>
                  </View>
                  {index < calanderData.length - 1 && (
                    <View
                      style={{
                        width: 1,
                        height: "60%",
                        backgroundColor: colors.border,
                        alignSelf: "center",
                      }}
                    />
                  )}
                </Fragment>
              ))}
            </ScrollView>
          )}

          {calanderData.length === 0 ||
          calanderData.every(
            (staff) => staff.staffAppointments.length === 0
          ) ? (
            // Empty State
            <View style={CalanderScreenStyles.emptyStateContainer}>
              <Calendar size={80} color={colors.gray[300]} strokeWidth={1.5} />
              <Text style={CalanderScreenStyles.emptyStateTitle}>
                No Appointments Today
              </Text>
              <Text style={CalanderScreenStyles.emptyStateSubtitle}>
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={CalanderScreenStyles.emptyStateDescription}>
                There are no scheduled appointments for this date.
              </Text>
              <TouchableOpacity
                style={CalanderScreenStyles.emptyStateButton}
                onPress={() => {
                  navigation.navigate("CreateAppointment");
                }}
              >
                <Plus size={20} color={colors.white} />
                <Text style={CalanderScreenStyles.emptyStateButtonText}>
                  Create Appointment
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              ref={verticalScrollRef}
              bounces={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={scrollEnabled}
            >
              <ScrollView
                ref={horizontalScrollRef}
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                scrollEventThrottle={16}
                directionalLockEnabled={true}
                contentContainerStyle={{
                  flexDirection: "row",
                }}
              >
                {calanderData.map((item, index) => (
                  <Fragment key={index}>
                    <DraggableCalendarColumn
                      staffName={item.staffName}
                      staffId={item.staffId}
                      columnIndex={index}
                      allStaffIds={calanderData.map((staff) => staff.staffId)}
                      appointments={item.staffAppointments}
                      onAppointmentUpdate={(
                        appointmentServiceId,
                        newStartTime,
                        newEndTime,
                        newStaffId
                      ) => {
                        // Fire and forget - UI is already updated optimistically
                        // Backend sync happens in background
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
                        // Return immediately to not block UI
                        return Promise.resolve();
                      }}
                      showHours={index === 0}
                      columnWidth={
                        index === 0
                          ? getWidthEquivalent(168)
                          : index === 1 || index === 2
                          ? getWidthEquivalent(108)
                          : getWidthEquivalent(125)
                      }
                      hourHeight={getHeightEquivalent(80)}
                      minHour={8}
                      maxHour={23}
                      onScrollEnable={setScrollEnabled}
                    />
                    {index < calanderData.length - 1 && (
                      <View
                        style={{
                          width: 1,
                          height: "100%",
                          backgroundColor: "rgba(0, 0, 0, 0.1)", // Semi-transparent vertical line
                          position: "relative",
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Fragment>
                ))}
              </ScrollView>
            </ScrollView>
          )}
        </View>
      </ScrollView>
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
  );
};

export default CalanderScreen;
