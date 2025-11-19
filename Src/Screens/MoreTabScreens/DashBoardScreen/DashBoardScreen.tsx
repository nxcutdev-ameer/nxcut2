import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { appointmentsRepository } from "../../../Repository/appointmentsRepository";
import { DashBoardScreenStyles } from "./DashBoardScreenStyles";
import {
  ChevronLeft,
  Dot,
  Ellipsis,
  FileCode2,
  FileInput,
  FileText,
  Calendar,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import useDashBoardScreenVM from "./DashBoardScreenVM";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import FilterBottomSheet from "../../../Components/FilterBottomSheet";
import StaffPerformanceFilter from "../../../Components/StaffPerformanceFilter";
import FilterScreen from "./FilterScreen";
import {
  LineGraphSkeleton,
  BarGraphSkeleton,
  ActivitySkeleton,
  TableSkeleton,
  PieChartSkeleton,
} from "../../../Components/SkeletonLoader";

const DashBoardScreen = () => {
  // Date filter state - defined first so it can be passed to VM
  // Default to "Month to date" to match filter screen default
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showFilterScreen, setShowFilterScreen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Month to date");
  const [refreshing, setRefreshing] = useState(false);

  const {
    navigation,
    comissionCaluculationData,
    comissionSummary,
    appointmentsActivityData,
    appointmentsWithSalesData,
    salesByLocationSummary,
    salesByLocationLoading,
    barGraphData,
    processedBarGraphData,
    salesLineData,
    appointmentsLineData,
    formatCustomDate,
    topServices,
    totalSalesAmount,
    totalAppointmentsCount,
    staffPerformance,
    // Filter states and handlers
    lineGraphFilter,
    barGraphFilter,
    staffPerformanceFilter,
    showFilterModal,
    activeFilterType,
    setShowFilterModal,
    handleFilterChange,
    openFilterModal,
    // Staff performance advanced filters
    staffSearchText,
    selectedMonth,
    selectedYear,
    setStaffSearchText,
    setSelectedMonth,
    setSelectedYear,
    totalAppointmentPrice,
    downloadTopTeamMembersReport,
    loadingStates,
    fetchAppointmentsWithSalesData,
    refetchAllDataWithDateRange,
  } = useDashBoardScreenVM({ startDate, endDate });

  const defaultPaymentMethodColors = {
    card: "#3B82F6",
    cash: "#10B981",
    online: "#F59E0B",
    other: "#8B5CF6",
  } as const;

  type PaymentMethodKey = keyof typeof defaultPaymentMethodColors;

  const locationMethodPalettes: Record<
    PaymentMethodKey,
    string
  >[] = [
    {
      card: "#6366F1",
      cash: "#8B5CF6",
      online: "#C084FC",
      other: "#A855F7",
    },
    {
      card: "#0EA5E9",
      cash: "#38BDF8",
      online: "#67E8F9",
      other: "#0369A1",
    },
    {
      card: "#22C55E",
      cash: "#4ADE80",
      online: "#86EFAC",
      other: "#15803D",
    },
    {
      card: "#F97316",
      cash: "#FB923C",
      online: "#FDBA74",
      other: "#EA580C",
    },
    {
      card: "#EC4899",
      cash: "#F472B6",
      online: "#FBCFE8",
      other: "#BE185D",
    },
  ];

  type PaymentSlice = {
    value: number;
    color: string;
    text: string;
    textPosition: "center";
    textColor: string;
    textSize: number;
    fontWeight: "bold";
    label: string;
    amount: number;
    textBackgroundRadius: number;
    textBackgroundColor: string;
    textBackgroundPadding: number;
    locationLabel: string;
    methodLabel: string;
    locationTotal: number;
  };

  const formatAmountText = (amount: number) =>
    amount >= 1000
      ? `${(amount / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : `${Math.round(amount)}`;

  const formatCurrency = (amount: number) =>
    `AED ${Math.round(amount).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const pieChartData = useMemo<PaymentSlice[]>(() => {
    if (!Array.isArray(salesByLocationSummary) || salesByLocationSummary.length === 0) {
      return [];
    }

    const sortedLocations = [...salesByLocationSummary].sort(
      (a, b) => (b.total_sales_amount || 0) - (a.total_sales_amount || 0)
    );

    return sortedLocations.slice(0, 5).flatMap((location, index) => {
      const slices: PaymentSlice[] = [];
      const locationLabel = location.location_name || "Unknown";
      const locationTotal =
        (location.card_amount || 0) +
        (location.cash_amount || 0) +
        (location.online_amount || 0) +
        (location.other_amount || 0);

      const palette =
        locationMethodPalettes[index % locationMethodPalettes.length] ||
        defaultPaymentMethodColors;

      const addSlice = (
        amount: number | undefined,
        methodLabel: string,
        colorKey: PaymentMethodKey
      ) => {
        const value = amount ?? 0;
        if (value <= 0) {
          return;
        }

        const color = palette[colorKey] ?? defaultPaymentMethodColors[colorKey];

        slices.push({
          value,
          color,
          text: formatAmountText(value),
          textPosition: "center",
          textColor: colors.colors.white,
          textSize: fontEq(10),
          fontWeight: "bold",
          label: `${locationLabel} • ${methodLabel}`,
          amount: value,
          textBackgroundRadius: 15,
          textBackgroundColor: "rgba(0,0,0,0.3)",
          textBackgroundPadding: 2,
          locationLabel,
          methodLabel,
          locationTotal,
        });
      };

      addSlice(location.card_amount, "Card", "card");
      addSlice(location.cash_amount, "Cash", "cash");
      addSlice(location.online_amount, "Online", "online");
      addSlice(location.other_amount, "Other", "other");

      return slices;
    });
  }, [salesByLocationSummary]);

  const pieChartLegendGroups = useMemo(
    () =>
      Object.entries(
        pieChartData.reduce(
          (acc, slice) => {
            if (!acc[slice.locationLabel]) {
              acc[slice.locationLabel] = {
                total: 0,
                slices: [] as PaymentSlice[],
              };
            }

            acc[slice.locationLabel].total += slice.value;
            acc[slice.locationLabel].slices.push(slice);
            return acc;
          },
          {} as Record<string, { total: number; slices: PaymentSlice[] }>
        )
      ).sort(([, a], [, b]) => b.total - a.total),
    [pieChartData]
  );

  const totalPieChartValue = useMemo(
    () => pieChartData.reduce((sum: number, item) => sum + item.value, 0),
    [pieChartData]
  );

  const showPieChartSkeleton = salesByLocationLoading && pieChartData.length === 0;

  // Filter handlers
  const handleFilterApply = (start: Date, end: Date, period: string) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedPeriod(period);
  };

  const onRefresh = async () => {
    setRefreshing(true);

    const toLocalISODate = (date: Date) => {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    try {
      await refetchAllDataWithDateRange({
        startDate: toLocalISODate(startDate),
        endDate: toLocalISODate(endDate),
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter data based on date range
  useEffect(() => {
    const toLocalISODate = (date: Date) => {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const startDateStr = toLocalISODate(startDate);
    const endDateStr = toLocalISODate(endDate);

    // Fetch all data with new date range and show skeleton loaders
    refetchAllDataWithDateRange({
      startDate: startDateStr,
      endDate: endDateStr,
    });
  }, [startDate, endDate]);

  return (
    <View style={DashBoardScreenStyles.mainContainer}>
      <View style={DashBoardScreenStyles.Header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={DashBoardScreenStyles.backButton}
        >
          <ChevronLeft size={24} color={colors.colors.text} />
          <Text style={DashBoardScreenStyles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={DashBoardScreenStyles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={DashBoardScreenStyles.title}>DashBoard</Text>
        {/* ///-----------------------------------LINE-GRAPH-SECTION------------------------------------------- */}

        <View style={DashBoardScreenStyles.sectionContainer}>
          <Text style={DashBoardScreenStyles.sectionTitle}>Recent Sales</Text>

          <Text
            style={[
              DashBoardScreenStyles.activityTitle,
              {
                marginTop: getHeightEquivalent(6),
                marginLeft: getWidthEquivalent(10),
              },
            ]}
          >
            All Locations,{" "}
            {startDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {endDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text style={DashBoardScreenStyles.lineGraphTitle}>
            AED{" "}
            {totalSalesAmount.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={DashBoardScreenStyles.barGraphSubTitle}>
            Appointments{" "}
            <Text style={{ fontWeight: "bold", color: colors.colors.text }}>
              {totalAppointmentsCount}
            </Text>
          </Text>
          <Text style={DashBoardScreenStyles.barGraphSubTitle}>
            Appointments value{" "}
            <Text style={{ fontWeight: "bold", color: colors.colors.text }}>
              AED{" "}
              {totalAppointmentPrice.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Text>

          {/* Date Picker Filter */}
          <View style={DashBoardScreenStyles.datePickerContainer}>
            <TouchableOpacity
              style={DashBoardScreenStyles.dateRangeButton}
              onPress={() => setShowFilterScreen(true)}
            >
              <Calendar size={18} color={colors.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={DashBoardScreenStyles.dateRangeLabel}>
                  {selectedPeriod}
                </Text>
                <Text style={DashBoardScreenStyles.dateRangeText}>
                  {startDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {endDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pie Chart - Sales Distribution */}
          {showPieChartSkeleton ? (
            <PieChartSkeleton />
          ) : pieChartData.length > 0 ? (
            <View style={DashBoardScreenStyles.pieChartSection}>
              <Text style={DashBoardScreenStyles.pieChartTitle}>
                Sales Distribution by Location
              </Text>

              {/* Pie Chart Centered */}
              <View style={DashBoardScreenStyles.pieChartCenterContainer}>
                <PieChart
                  data={pieChartData}
                  donut
                  radius={getWidthEquivalent(90)}
                  innerRadius={getWidthEquivalent(45)}
                  sectionAutoFocus
                  isAnimated
                  animationDuration={400}
                  strokeWidth={3}
                  strokeColor={colors.colors.white}
                  edgesRadius={5}
                  centerLabelComponent={() => (
                    <View style={DashBoardScreenStyles.pieChartCenter}>
                      <Text style={DashBoardScreenStyles.pieChartCenterValue}>
                        {Math.round(totalPieChartValue).toLocaleString()}
                      </Text>
                      <Text style={DashBoardScreenStyles.pieChartCenterLabel}>
                        AED
                      </Text>
                    </View>
                  )}
                  focusOnPress
                  showText
                  textColor={colors.colors.white}
                  textSize={fontEq(10)}
                  fontWeight="bold"
                  textBackgroundRadius={15}
                  textBackgroundColor="rgba(0,0,0,0.3)"
                />
              </View>

              {/* Legend - Location with Payment Breakdown */}
              <View style={DashBoardScreenStyles.pieChartLegendContainer}>
                {pieChartLegendGroups.length > 0 ? (
                  pieChartLegendGroups.map(([locationLabel, group]) => (
                    <View
                      key={locationLabel}
                      style={DashBoardScreenStyles.pieChartLegendGroup}
                    >
                      <View
                        style={DashBoardScreenStyles.pieChartLegendGroupHeader}
                      >
                        <Text
                          style={DashBoardScreenStyles.pieChartLegendGroupTitle}
                        >
                          {locationLabel}
                        </Text>
                        <Text
                          style={DashBoardScreenStyles.pieChartLegendGroupTotal}
                        >
                          {formatCurrency(group.total)}
                        </Text>
                      </View>
                      <View style={DashBoardScreenStyles.pieChartLegendGroupBody}>
                        {group.slices
                          .slice()
                          .sort((a, b) => b.value - a.value)
                          .map((slice) => (
                            <View
                              key={`${locationLabel}-${slice.methodLabel}`}
                              style={DashBoardScreenStyles.pieChartLegendRow}
                            >
                              <View
                                style={DashBoardScreenStyles.pieChartLegendRowLeft}
                              >
                                <View
                                  style={[
                                    DashBoardScreenStyles.pieChartLegendColor,
                                    { backgroundColor: slice.color },
                                  ]}
                                />
                                <Text
                                  style={DashBoardScreenStyles.pieChartLegendLabel}
                                >
                                  {slice.methodLabel}
                                </Text>
                              </View>
                              <View
                                style={DashBoardScreenStyles.pieChartLegendRowRight}
                              >
                                <Text
                                  style={DashBoardScreenStyles.pieChartLegendValue}
                                >
                                  {formatCurrency(slice.amount)}
                                </Text>
                                <Text
                                  style={DashBoardScreenStyles.pieChartLegendPercent}
                                >
                                  {group.total > 0
                                    ? `${((slice.amount / group.total) * 100).toFixed(1)}%`
                                    : "0%"}
                                </Text>
                              </View>
                            </View>
                          ))}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={DashBoardScreenStyles.pieChartLegendEmpty}>
                    No payment data available
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={DashBoardScreenStyles.pieChartEmptyContainer}>
              <Text style={DashBoardScreenStyles.pieChartEmptyTitle}>
                No sales distribution data found
              </Text>
              <Text style={DashBoardScreenStyles.pieChartEmptySubtitle}>
                Try choosing a different date range.
              </Text>
            </View>
          )}

          <View style={DashBoardScreenStyles.lineGraphContainer}>
            {loadingStates.lineGraph ? (
              <LineGraphSkeleton />
            ) : (
              (() => {
                const appointmentsData = appointmentsLineData;
                const salesData = salesLineData;
                const hasData =
                  appointmentsData.length > 0 || salesData.length > 0;

                return hasData ? (
                  <LineChart
                    key={`line-${lineGraphFilter}-${appointmentsData.length}-${salesData.length}`}
                    data={appointmentsData}
                    data2={salesData}
                    width={getWidthEquivalent(330)}
                    height={getHeightEquivalent(200)}
                    hideRules
                    hideYAxisText
                    isAnimated={true}
                    animationDuration={2000}
                    animateTogether={false}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    initialSpacing={getWidthEquivalent(15)}
                    spacing={getWidthEquivalent(35)}
                    thickness1={2}
                    thickness2={2}
                    curved={true}
                    dataPointsHeight={14}
                    dataPointsWidth={14}
                    color1={colors.colors.success} // line color for appointmentsData
                    color2={colors.colors.primary}
                    dataPointsColor1={colors.colors.successDark}
                    dataPointsColor2={colors.colors.primary}
                    textShiftY={0}
                    textShiftX={0}
                    textFontSize1={fontEq(14)}
                    textFontSize={fontEq(14)}
                    xAxisLabelTextStyle={{
                      color: colors.colors.textSecondary,
                      fontSize: fontEq(8),
                    }}
                    backgroundColor="transparent"
                    showValuesAsDataPointsText={false}
                    showDataPointLabelOnFocus={false}
                    onDataChangeAnimationDuration={1000}
                    maxValue={
                      Math.max(
                        ...[...appointmentsData, ...salesData].map(
                          (item) => item.value
                        )
                      ) + 20
                    }
                    stepValue={5}
                    bounces={true}
                  />
                ) : (
                  <Text
                    style={{
                      color: colors.colors.textSecondary,
                      fontSize: fontEq(14),
                    }}
                  >
                    No data available {/*for the last {lineGraphFilter} days*/}
                  </Text>
                );
              })()
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              position: "absolute",
              bottom: 0,
            }}
          >
            <Dot size={60} color={colors.colors.primary} />
            <Text>Sales Count</Text>
            <Dot size={60} color={colors.colors.success} />
            <Text>Appointments</Text>
          </View>
        </View>
        {/* ///-----------------------------------BAR-GRAPH-SECTION------------------------------------------- */}
        <View style={[DashBoardScreenStyles.sectionContainer]}>
          <Text style={DashBoardScreenStyles.sectionTitle}>
            Upcoming Appointments
          </Text>
          <TouchableOpacity
            style={DashBoardScreenStyles.barGraphFilter}
            onPress={() => openFilterModal("bar")}
          >
            <Ellipsis size={24} color={colors.colors.text} />
          </TouchableOpacity>
          <Text
            style={[
              DashBoardScreenStyles.activityTitle,
              {
                marginTop: getHeightEquivalent(6),
                marginLeft: getWidthEquivalent(10),
              },
            ]}
          >
            All Locations, Next {barGraphFilter} days
          </Text>
          <Text style={DashBoardScreenStyles.barGraphTitle}>
            {barGraphData.length} booked
          </Text>
          <Text style={DashBoardScreenStyles.barGraphSubTitle}>
            Confirmed appointments{" "}
            {/* {
              barGraphData.filter(
                (item) => item.status.toLowerCase() === "paid"
              ).length
            } */}
            {barGraphData.length}
          </Text>
          <Text style={DashBoardScreenStyles.barGraphSubTitle}>
            Cancelled appointments{" "}
            {
              barGraphData.filter(
                (item) => item.status.toLowerCase() === "canceled"
              ).length
            }
          </Text>

          <View style={DashBoardScreenStyles.barGraphContainer}>
            {loadingStates.barGraph ? (
              <BarGraphSkeleton />
            ) : (
              <BarChart
                key={`bar-${barGraphFilter}-${processedBarGraphData.length}`}
                barStyle={{
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.colors.primary,
                  backgroundColor: colors.colors.primary,
                }}
                barWidth={22}
                barBorderRadius={6}
                frontColor={colors.colors.primary}
                data={processedBarGraphData.map((item) => ({
                  value: item.count,
                  label: new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }), // e.g. "Sep 16"
                  labelTextStyle: {
                    color: colors.colors.textSecondary,
                    fontSize: fontEq(12),
                  },
                }))}
                scrollRef={null}
                hideYAxisText
                hideRules
                scrollAnimation
                height={getHeightEquivalent(170)}
                width={getWidthEquivalent(360)}
                spacing={getWidthEquivalent(20)}
                backgroundColor="white"
                yAxisThickness={0}
                xAxisThickness={0}
                xAxisLabelTextStyle={{
                  color: colors.colors.textSecondary,
                }}
                isAnimated={true}
                animationDuration={1000}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              position: "absolute",
              bottom: 0,
            }}
          >
            <Dot size={60} color={colors.colors.primary} />
            <Text>Confirmed</Text>
            <Dot size={60} color={colors.colors.dangerDark} />
            <Text>Cancelled</Text>
          </View>
        </View>
        {/* ///-----------------------------------ACTIVITY-SECTION------------------------------------------- */}
        <View style={DashBoardScreenStyles.sectionContainer}>
          <Text style={DashBoardScreenStyles.sectionTitle}>
            Appointments Activity
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={DashBoardScreenStyles.sectionScroll}
          >
            {loadingStates.activity ? (
              <ActivitySkeleton />
            ) : appointmentsActivityData.length > 0 ? (
              appointmentsActivityData.map((item, index) => (
                <View
                  style={[
                    DashBoardScreenStyles.activityCard,
                    index === appointmentsActivityData.length - 1 &&
                      DashBoardScreenStyles.lastActivityCard,
                  ]}
                  key={index}
                >
                  <View style={DashBoardScreenStyles.activityDateContainer}>
                    <Text style={DashBoardScreenStyles.activityDate}>
                      {formatCustomDate(
                        item.appointment_date,
                        "mainDate"
                      ).slice(0, 3)}
                    </Text>
                    <Text style={DashBoardScreenStyles.activityDate2}>
                      {formatCustomDate(
                        item.appointment_date,
                        "mainDate"
                      ).slice(3)}
                    </Text>
                  </View>
                  <View style={DashBoardScreenStyles.activityContentContainer}>
                    <Text style={DashBoardScreenStyles.activityTitle}>
                      {formatCustomDate(item.appointment_date, "subDate")}
                    </Text>
                    <Text style={DashBoardScreenStyles.activityTime}>
                      {item.appointment_services[0].start_time}
                    </Text>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={DashBoardScreenStyles.activityService}
                    >
                      {item.appointment_services[0].service?.name}
                    </Text>
                    <Text style={DashBoardScreenStyles.activityClient}>
                      {item.client?.first_name}, 1h with{" "}
                      {item.appointment_services[0].staff?.first_name}
                    </Text>

                    <View style={DashBoardScreenStyles.statusContainer}>
                      <View
                        style={[
                          DashBoardScreenStyles.statusBar,
                          item.status === "paid"
                            ? { backgroundColor: colors.colors.successDark }
                            : { backgroundColor: colors.colors.primary },
                        ]}
                      >
                        <Text style={DashBoardScreenStyles.statusText}>
                          {item.status}
                        </Text>
                      </View>
                      <TouchableOpacity>
                        <Ellipsis size={24} color={colors.colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={DashBoardScreenStyles.noDataText}>
                No appointments activity available
              </Text>
            )}
          </ScrollView>
        </View>
        {/* ///-----------------------------------NEXT-APPOINTMENTS-SECTION------------------------------------------- */}
        <View style={DashBoardScreenStyles.sectionContainer}>
          <Text style={DashBoardScreenStyles.sectionTitle}>
            Today's Next Appointments
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={DashBoardScreenStyles.sectionScroll}
          >
            {appointmentsActivityData
              .filter((item) => {
                const today = new Date();
                const appointmentDate = new Date(item.appointment_date);
                const currentTime = today.getHours() * 60 + today.getMinutes();

                // Check if appointment is today
                const isToday =
                  appointmentDate.toDateString() === today.toDateString();

                if (!isToday) return false;

                // Parse appointment time (assuming format like "10:30 AM")
                const timeStr = item.appointment_services[0].start_time;
                const [time, period] = timeStr.split(" ");
                const [hours, minutes] = time.split(":").map(Number);
                let appointmentHours = hours;

                if (period === "PM" && hours !== 12) {
                  appointmentHours += 12;
                } else if (period === "AM" && hours === 12) {
                  appointmentHours = 0;
                }

                const appointmentTime = appointmentHours * 60 + minutes;

                // Only show appointments that are after current time
                return appointmentTime > currentTime;
              })
              .map((item, index, filteredArray) => (
                <View
                  style={[
                    DashBoardScreenStyles.activityCard,
                    index === filteredArray.length - 1 &&
                      DashBoardScreenStyles.lastActivityCard,
                  ]}
                  key={index}
                >
                  <View style={DashBoardScreenStyles.activityDateContainer}>
                    <Text style={DashBoardScreenStyles.activityDate}>
                      {formatCustomDate(
                        item.appointment_date,
                        "mainDate"
                      ).slice(0, 3)}
                    </Text>
                    <Text style={DashBoardScreenStyles.activityDate2}>
                      {formatCustomDate(
                        item.appointment_date,
                        "mainDate"
                      ).slice(3)}
                    </Text>
                  </View>
                  <View style={DashBoardScreenStyles.activityContentContainer}>
                    {/* <Text style={DashBoardScreenStyles.activityTitle}>
                      {formatCustomDate(item.appointment_date, "subDate")}
                    </Text> */}
                    <Text
                      style={[
                        DashBoardScreenStyles.activityTime,
                        {
                          color: colors.colors.text,
                          fontWeight: "700",
                          fontSize: fontEq(16),
                        },
                      ]}
                    >
                      {(() => {
                        const timeStr = item.appointment_services[0].start_time;
                        // If it's already in 12-hour format (contains AM/PM), return as is
                        if (timeStr.includes("AM") || timeStr.includes("PM")) {
                          return timeStr;
                        }

                        // Convert 24-hour format to 12-hour format
                        const [hours, minutes] = timeStr.split(":").map(Number);
                        const period = hours >= 12 ? "PM" : "AM";
                        const displayHours =
                          hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                        return `${displayHours}:${minutes
                          .toString()
                          .padStart(2, "0")}${period}`;
                      })()}
                    </Text>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={DashBoardScreenStyles.activityService}
                    >
                      {item.appointment_services[0].service?.name}
                    </Text>
                    <Text style={DashBoardScreenStyles.activityClient}>
                      {item.client?.first_name}, 1h with{" "}
                      {item.appointment_services[0].staff?.first_name}
                    </Text>

                    <View style={DashBoardScreenStyles.statusContainer}>
                      <View style={DashBoardScreenStyles.statusBar}>
                        <Text style={DashBoardScreenStyles.statusText}>
                          {item.status}
                        </Text>
                      </View>
                      <TouchableOpacity>
                        <Ellipsis size={24} color={colors.colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
        {/* ///-----------------------------------TOP-SERVICES-SECTION------------------------------------------- */}
        <View style={DashBoardScreenStyles.sectionContainer}>
          <Text style={DashBoardScreenStyles.sectionTitle}>Top Services</Text>

          {/* Table Headers */}
          <View style={DashBoardScreenStyles.tableHeaderContainer}>
            <Text style={[DashBoardScreenStyles.tableHeaderText, { flex: 2 }]}>
              Services
            </Text>
            <Text
              style={[
                DashBoardScreenStyles.tableHeaderText,
                { flex: 1.5, textAlign: "center" },
              ]}
            >
              This Month
            </Text>
            <Text
              style={[
                DashBoardScreenStyles.tableHeaderText,
                { flex: 1.5, textAlign: "center" },
              ]}
            >
              Last Month
            </Text>
          </View>

          {/* Table Data */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={DashBoardScreenStyles.tableScrollView}
          >
            {loadingStates.topServices ? (
              <TableSkeleton />
            ) : topServices.length > 0 ? (
              topServices.map((service, index) => (
                <View
                  key={index}
                  style={[
                    DashBoardScreenStyles.tableRow,
                    index === topServices.length - 1 &&
                      DashBoardScreenStyles.lastTableRow,
                  ]}
                >
                  <Text
                    style={[
                      DashBoardScreenStyles.tableServiceName,
                      { flex: 2 },
                    ]}
                  >
                    {service.serviceName}
                  </Text>
                  <Text
                    style={[
                      DashBoardScreenStyles.tableCount,
                      { flex: 1.5, textAlign: "center" },
                    ]}
                  >
                    {service.thisMonthCount}
                  </Text>
                  <Text
                    style={[
                      DashBoardScreenStyles.tableCount,
                      { flex: 1.5, textAlign: "center" },
                    ]}
                  >
                    {service.lastMonthCount}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={DashBoardScreenStyles.noDataText}>
                No top services this month
              </Text>
            )}
          </ScrollView>
        </View>

        {/* ///-----------------------------------STAFF-PERFORMANCE-SECTION------------------------------------------- */}
        <View style={DashBoardScreenStyles.sectionContainer}>
          <Text style={DashBoardScreenStyles.sectionTitle}>
            Top Team Members
          </Text>

          <View style={DashBoardScreenStyles.downloadButtonContainer}>
            <TouchableOpacity
              style={DashBoardScreenStyles.downloadButton}
              onPress={() => downloadTopTeamMembersReport("CSV")}
            >
              <FileCode2 size={16} color={colors.colors.text} />
              <Text style={DashBoardScreenStyles.downloadButtonText}>CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={DashBoardScreenStyles.downloadButton}
              onPress={() => downloadTopTeamMembersReport("Excel")}
            >
              <FileText size={16} color={colors.colors.text} />
              <Text style={DashBoardScreenStyles.downloadButtonText}>
                Excel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={DashBoardScreenStyles.downloadButton}
              onPress={() => downloadTopTeamMembersReport("PDF")}
            >
              <FileInput size={16} color={colors.colors.text} />
              <Text style={DashBoardScreenStyles.downloadButtonText}>PDF</Text>
            </TouchableOpacity>
          </View>
          {/* Advanced Filters */}
          <StaffPerformanceFilter
            searchText={staffSearchText}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSearchChange={setStaffSearchText}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />

          {/* Table Headers */}
          <View style={DashBoardScreenStyles.tableHeaderContainer}>
            <Text style={[DashBoardScreenStyles.tableHeaderText, { flex: 2 }]}>
              Team member
            </Text>
            <Text
              style={[
                DashBoardScreenStyles.tableHeaderText,
                { flex: 1.5, textAlign: "center" },
              ]}
            >
              This Month
            </Text>
            <Text
              style={[
                DashBoardScreenStyles.tableHeaderText,
                { flex: 1.5, textAlign: "center" },
              ]}
            >
              Last Month
            </Text>
          </View>

          {/* Table Data */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={DashBoardScreenStyles.tableScrollView}
          >
            {loadingStates.staffPerformance ? (
              <TableSkeleton />
            ) : staffPerformance.length > 0 ? (
              staffPerformance.map((staff, index) => (
                <View
                  key={staff.staffId}
                  style={[
                    DashBoardScreenStyles.tableRow,
                    index === staffPerformance.length - 1 &&
                      DashBoardScreenStyles.lastTableRow,
                  ]}
                >
                  <Text
                    style={[
                      DashBoardScreenStyles.tableServiceName,
                      { flex: 2 },
                    ]}
                  >
                    {staff.staffName}
                  </Text>
                  <Text
                    style={[
                      DashBoardScreenStyles.tableAmount,
                      { flex: 1.5, textAlign: "center" },
                    ]}
                  >
                    AED{" "}
                    {staff.thisMonthAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text
                    style={[
                      DashBoardScreenStyles.tableAmount,
                      { flex: 1.5, textAlign: "center" },
                    ]}
                  >
                    AED{" "}
                    {staff.lastMonthAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={DashBoardScreenStyles.noDataText}>
                No team member data available for this month
              </Text>
            )}
          </ScrollView>
        </View>

        <View style={{ height: 70 }}></View>
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        activeFilter={
          activeFilterType === "line"
            ? lineGraphFilter
            : activeFilterType === "bar"
            ? barGraphFilter
            : staffPerformanceFilter
        }
        onFilterSelect={(value) => {
          if (activeFilterType) {
            handleFilterChange(activeFilterType, value);
          }
        }}
        title={
          activeFilterType === "line"
            ? "Line Graph"
            : activeFilterType === "bar"
            ? "Bar Graph"
            : "Staff Performance"
        }
      />

      {/* Filter Screen */}
      <FilterScreen
        visible={showFilterScreen}
        onClose={() => setShowFilterScreen(false)}
        onApply={handleFilterApply}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialPeriod={selectedPeriod}
      />
    </View>
  );
};

export default DashBoardScreen;
