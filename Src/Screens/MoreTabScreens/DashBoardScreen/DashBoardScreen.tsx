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
import { supabase } from "../../../Utils/supabase";
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
  const [upcomingAppointments, setUpcomingAppointments] = useState<{day_label: string, appointment_count: number}[]>([]);
  const [upcomingAppointmentsLoading, setUpcomingAppointmentsLoading] = useState(true);

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

  const locationColors = [
    "#6366F1",
    "#0EA5E9",
    "#22C55E",
    "#F97316",
    "#EC4899",
  ];

  const darkenColor = (hex: string, factor = 0.8) => {
    const sanitized = hex.replace(/^#/, "");
    if (sanitized.length !== 6) {
      return hex;
    }

    const toDarkChannel = (start: number) => {
      const channel = parseInt(sanitized.slice(start, start + 2), 16);
      const darkened = Math.max(0, Math.min(255, Math.round(channel * factor)));
      return darkened.toString(16).padStart(2, "0");
    };

    return `#${toDarkChannel(0)}${toDarkChannel(2)}${toDarkChannel(4)}`;
  };

  type LocationSlice = {
    value: number;
    color: string;
    text: string;
    textPosition: "center";
    textColor: string;
    textSize: number;
    fontWeight: "bold";
    shiftTextX?: number;
    shiftTextY?: number;
    label: string;
    amount: number;
    textBackgroundRadius: number;
    textBackgroundColor: string;
    textBackgroundPadding: number;
    locationLabel: string;
    sliceType: "total" | "redeem";
  };

  type PaymentLegendItem = {
    methodLabel: string;
    amount: number;
    percentage: number;
  };

  type PaymentLegendGroup = {
    locationLabel: string;
    totalAmount: number;
    redeemAmount: number;
    totalWithRedeem: number;
    methods: PaymentLegendItem[];
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

  const topFiveLocations = useMemo(() => {
    if (
      !Array.isArray(salesByLocationSummary) ||
      salesByLocationSummary.length === 0
    ) {
      return [] as typeof salesByLocationSummary;
    }

    return [...salesByLocationSummary]
      .sort((a, b) => (b.total_sales_amount || 0) - (a.total_sales_amount || 0))
      .slice(0, 5);
  }, [salesByLocationSummary]);

  const pieChartLegendGroups = useMemo<PaymentLegendGroup[]>(() => {
    if (topFiveLocations.length === 0) {
      return [];
    }

    return topFiveLocations.map((location) => {
      const locationLabel = location.location_name || "Unknown";
      const cardAmount = location.card_amount || 0;
      const cashAmount = location.cash_amount || 0;
      const onlineAmount = location.online_amount || 0;
      const otherAmount = location.other_amount || 0;

      const methodTotal = cardAmount + cashAmount + onlineAmount + otherAmount;
      const totalAmount = location.total_sales_amount || 0;
      const redeemAmount = location.redeem_amount ?? 0;
      const totalWithRedeem = totalAmount + redeemAmount;
      const denominator = methodTotal > 0 ? methodTotal : totalAmount;

      const methods: PaymentLegendItem[] = [
        { methodLabel: "Card", amount: cardAmount, percentage: 0 },
        { methodLabel: "Cash", amount: cashAmount, percentage: 0 },
        { methodLabel: "Online", amount: onlineAmount, percentage: 0 },
        { methodLabel: "Other", amount: otherAmount, percentage: 0 },
      ]
        .filter((item) => item.amount > 0)
        .map((item) => ({
          ...item,
          percentage:
            denominator > 0
              ? parseFloat(((item.amount / denominator) * 100).toFixed(1))
              : 0,
        }));

      return {
        locationLabel,
        totalAmount,
        redeemAmount,
        totalWithRedeem,
        methods,
      };
    });
  }, [topFiveLocations]);

  const pieChartData = useMemo<LocationSlice[]>(() => {
    if (topFiveLocations.length === 0) {
      return [];
    }

    return topFiveLocations
      .flatMap((location, index) => {
        const locationLabel = location.location_name || "Unknown";
        const locationTotal = location.total_sales_amount || 0;

        const value = locationTotal;
        const redeemAmount = location.redeem_amount || 0;
        const slices: LocationSlice[] = [];

        if (value > 0) {
          const color = locationColors[index % locationColors.length];

          slices.push({
            value,
            color,
            text: formatAmountText(value),
            textPosition: "center",
            textColor: colors.colors.white,
            textSize: fontEq(10),
            fontWeight: "bold",
            shiftTextX: -getWidthEquivalent(7),
            shiftTextY: getHeightEquivalent(7),
            label: locationLabel,
            amount: value,
            textBackgroundRadius: 18,
            textBackgroundColor: "rgba(0,0,0,0.35)",
            textBackgroundPadding: 4,
            locationLabel,
            sliceType: "total",
          });
        }

        if (redeemAmount > 0) {
          const baseColor = locationColors[index % locationColors.length];
          const redeemColor = darkenColor(baseColor, 0.85);
          slices.push({
            value: redeemAmount,
            color: redeemColor,
            text: `${formatAmountText(redeemAmount)}`,
            textPosition: "center",
            textColor: colors.colors.white,
            textSize: fontEq(9),
            fontWeight: "bold",
            shiftTextX: -getWidthEquivalent(6),
            shiftTextY: getHeightEquivalent(6),
            label: `${locationLabel} Redeem`,
            amount: redeemAmount,
            textBackgroundRadius: 16,
            textBackgroundColor: "rgba(0,0,0,0.35)",
            textBackgroundPadding: 4,
            locationLabel,
            sliceType: "redeem",
          });
        }

        return slices;
      })
      .filter((item): item is LocationSlice => item !== undefined);
  }, [topFiveLocations]);

  const showPieChartSkeleton =
    salesByLocationLoading && pieChartData.length === 0;

  // Prepare bar chart data for upcoming appointments
  const upcomingAppointmentsBarData = useMemo(() => {
    const barData = upcomingAppointments.map((item) => ({
      value: item.appointment_count,
      label: item.day_label,
      frontColor: colors.colors.primaryLight,
      spacing: getWidthEquivalent(1),
      labelWidth: getWidthEquivalent(150),
      labelTextStyle: {
        color: colors.colors.text,
        fontSize: fontEq(8),
        fontWeight: '500',
        marginLeft: getWidthEquivalent(-60),
        bottom: getHeightEquivalent(-30),
      },
    }));
    
    console.log('[DashBoardScreen] 📊 Bar chart data prepared:', barData);
    console.log('[DashBoardScreen] 🏷️ Labels:', barData.map(d => d.label).join(', '));
    console.log('[DashBoardScreen] 📈 Values:', barData.map(d => d.value).join(', '));
    
    return barData;
  }, [upcomingAppointments]);

  // Fetch upcoming appointments for next 7 days
  const fetchUpcomingAppointments = async () => {
    setUpcomingAppointmentsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_appointments_next_7_days');
      
      if (error) {
        console.error('[DashBoardScreen] Error fetching upcoming appointments:', error);
        setUpcomingAppointments([]);
      } else {
        console.log('[DashBoardScreen] ✅ Upcoming appointments data:', data);
        console.log('[DashBoardScreen] 📊 Number of days:', data?.length);
        if (data && Array.isArray(data)) {
          data.forEach((item: {day_label: string; appointment_count: number}, index: number) => {
            console.log(`  Day ${index + 1}: ${item.day_label} - ${item.appointment_count} appointments`);
          });
        }
        setUpcomingAppointments(data || []);
      }
    } catch (error) {
      console.error('[DashBoardScreen] Exception fetching upcoming appointments:', error);
      setUpcomingAppointments([]);
    } finally {
      setUpcomingAppointmentsLoading(false);
    }
  };

  // Filter handlers
  const handleFilterApply = (start: Date, end: Date, period: string) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedPeriod(period);
    // Close the filter screen after applying - it will show loading in the background
    setShowFilterScreen(false);
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
      await Promise.all([
        refetchAllDataWithDateRange({
          startDate: toLocalISODate(startDate),
          endDate: toLocalISODate(endDate),
        }),
        fetchUpcomingAppointments(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Removed auto-close FilterScreen effect - user should manually close it

  // Fetch upcoming appointments on mount
  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

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
          <ChevronLeft size={20} color={colors.colors.black} />
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
              <Calendar size={18} color={colors.colors.black} />
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
                      {/* <Text style={DashBoardScreenStyles.pieChartCenterValue}>
                        AED
                      </Text> */}
                      <Text style={DashBoardScreenStyles.pieChartCenterLabel}>
                        AED {Math.round(totalSalesAmount).toLocaleString()}
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
                  pieChartLegendGroups.map((group) => (
                    <View
                      key={group.locationLabel}
                      style={DashBoardScreenStyles.pieChartLegendGroup}
                    >
                      <View
                        style={DashBoardScreenStyles.pieChartLegendGroupHeader}
                      >
                        <Text
                          style={DashBoardScreenStyles.pieChartLegendGroupTitle}
                        >
                          {group.locationLabel}
                        </Text>
                        <Text
                          style={DashBoardScreenStyles.pieChartLegendGroupTotal}
                        >
                          {formatCurrency(group.totalAmount)}
                        </Text>
                      </View>
                      <View
                        style={DashBoardScreenStyles.pieChartLegendGroupBody}
                      >
                        {group.methods.map((method) => (
                          <View
                            key={`${group.locationLabel}-${method.methodLabel}`}
                            style={DashBoardScreenStyles.pieChartLegendRow}
                          >
                            <View
                              style={
                                DashBoardScreenStyles.pieChartLegendRowLeft
                              }
                            >
                              <Text
                                style={
                                  DashBoardScreenStyles.pieChartLegendLabel
                                }
                              >
                                {method.methodLabel}
                              </Text>
                            </View>
                            <View
                              style={
                                DashBoardScreenStyles.pieChartLegendRowRight
                              }
                            >
                              <Text
                                style={
                                  DashBoardScreenStyles.pieChartLegendValue
                                }
                              >
                                {formatCurrency(method.amount)}
                              </Text>
                              {/* <Text style={DashBoardScreenStyles.pieChartLegendPercent}>
                                {`${method.percentage.toFixed(1)}%`}
                              </Text> */}
                            </View>
                          </View>
                        ))}

                        {group.redeemAmount > 0 && (
                          <View style={DashBoardScreenStyles.pieChartLegendRow}>
                            <View
                              style={
                                DashBoardScreenStyles.pieChartLegendRowLeft
                              }
                            >
                              <Text
                                style={
                                  DashBoardScreenStyles.pieChartLegendLabel
                                }
                              >
                                Redemption 
                              </Text>
                            </View>
                            <View
                              style={
                                DashBoardScreenStyles.pieChartLegendRowRight
                              }
                            >
                              <Text
                                style={
                                  DashBoardScreenStyles.pieChartLegendValue
                                }
                              >
                                +{formatCurrency(group.redeemAmount)}
                              </Text>
                              {/* <Text style={DashBoardScreenStyles.pieChartLegendPercent}>
                                {group.totalWithRedeem > 0
                                  ? `${((group.redeemAmount / group.totalWithRedeem) * 100).toFixed(1)}%`
                                  : "0%"}
                              </Text> */}
                            </View>
                          </View>
                        )}
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
          <Text
            style={[
              DashBoardScreenStyles.activityTitle,
              {
                marginTop: getHeightEquivalent(6),
                marginLeft: getWidthEquivalent(10),
              },
            ]}
          >
            All Locations, Next 7 days
          </Text>
          <Text style={DashBoardScreenStyles.barGraphTitle}>
            {upcomingAppointments.reduce((sum, item) => sum + item.appointment_count, 0)} booked
          </Text>

          <View style={DashBoardScreenStyles.barGraphContainer}>
            {upcomingAppointmentsLoading ? (
              <BarGraphSkeleton />
            ) : upcomingAppointmentsBarData.length > 0 ? (
              <View style={{ paddingBottom: getHeightEquivalent(30) }}>
                <BarChart
                  data={upcomingAppointmentsBarData as any}
                  barWidth={getWidthEquivalent(35)}
                  spacing={getWidthEquivalent(20)}
                  barBorderTopLeftRadius={5}
                  barBorderTopRightRadius={5}
                  hideRules
                  xAxisThickness={1}
                  yAxisThickness={1}
                  yAxisTextStyle={{
                    color: colors.colors.textSecondary,
                    fontSize: fontEq(10),
                  }}
                  xAxisLabelTextStyle={{
                    color: colors.colors.text,
                    fontSize: fontEq(10),
                    fontWeight: '500',
                  }}
                  rotateLabel
                  xAxisLabelsVerticalShift={getHeightEquivalent(5)}
                  labelsExtraHeight={getHeightEquivalent(20)}
                  xAxisColor={colors.colors.gray[300]}
                  yAxisColor={colors.colors.gray[300]}
                  noOfSections={4}
                  maxValue={Math.max(...upcomingAppointmentsBarData.map(d => d.value), 10)}
                  barBorderWidth={1}
                  barBorderColor={colors.colors.primary}
                  isAnimated
                  animationDuration={800}
                  height={getHeightEquivalent(200)}
                  showXAxisIndices={false}
                  showYAxisIndices={false}
                />
              </View>
            ) : (
              <Text style={DashBoardScreenStyles.activityTitle}>
                No upcoming appointments
              </Text>
            )}
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
                        <Ellipsis size={20} color={colors.colors.black} />
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
                      // maximumFractionDigits: 2,
                      maximumFractionDigits: 1,
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
                     // maximumFractionDigits: 2,
                      maximumFractionDigits: 1,
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
        isLoading={loadingStates.topServices || loadingStates.pieChart || loadingStates.activity}
        onApply={handleFilterApply}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialPeriod={selectedPeriod}
      />
    </View>
  );
};

export default DashBoardScreen;
