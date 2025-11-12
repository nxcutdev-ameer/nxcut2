import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import Modal from "react-native-modal";
import React, { useEffect, useState } from "react";
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
import { FilterScreenStyles } from "./FilterScreenStyles";

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
  const [pieChartLoaded, setPieChartLoaded] = useState(false);
  const [pieChartFetchActive, setPieChartFetchActive] = useState(false);

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

  // Prepare pie chart data using aggregated summary
  const chartColors = ["#6B46C1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  const pieChartData = (salesByLocationSummary || [])
    .sort((a, b) => b.total_sales_amount - a.total_sales_amount)
    .slice(0, 5)
    .map((location, index) => ({
      value: location.total_sales_amount,
      color: chartColors[index % chartColors.length],
      text: `${location.transaction_count}`,
      textPosition: "center" as const,
      textColor: colors.colors.white,
      textSize: fontEq(10),
      fontWeight: "bold" as const,
      label: location.location_name || "Unknown",
      amount: location.total_sales_amount,
      textBackgroundRadius: 15,
      textBackgroundColor: "rgba(0,0,0,0.3)",
      textBackgroundPadding: 2,
      cardAmount: location.card_amount,
      cashAmount: location.cash_amount,
      onlineAmount: location.online_amount,
      otherAmount: location.other_amount,
      average: location.avg_transaction_value,
    }));

  const totalPieChartValue = pieChartData.reduce(
    (sum: number, item) => sum + item.value,
    0
  );

  const showPieChartSkeleton = loadingStates.pieChart || salesByLocationLoading;

  useEffect(() => {
    if (salesByLocationLoading) {
      setPieChartFetchActive(true);
      setPieChartLoaded(false);
      return;
    }

    if (pieChartFetchActive) {
      setPieChartLoaded(true);
      setPieChartFetchActive(false);
    }
  }, [salesByLocationLoading, pieChartFetchActive]);

  const shouldShowPieChartSkeleton =
    !pieChartLoaded || showPieChartSkeleton;

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

  useEffect(() => {
    testFunction();
  }, []);

  const testFunction = async () => {
    let responce = await appointmentsRepository.fetchCommissionCalculations(
      8,
      2025
    );

  };
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
              {appointmentsWithSalesData.length}
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
          {shouldShowPieChartSkeleton ? (
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
                  animationDuration={800}
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

              {/* Legend - Horizontal */}
              <View style={DashBoardScreenStyles.pieChartLegendHorizontal}>
                {pieChartData.map((item, index) => (
                  <View
                    key={index}
                    style={DashBoardScreenStyles.legendItemHorizontal}
                  >
                    <View
                      style={[
                        DashBoardScreenStyles.legendColor,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text
                      style={DashBoardScreenStyles.legendTextHorizontal}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={DashBoardScreenStyles.legendValueHorizontal}>
                        {Math.round(item.amount).toLocaleString()} AED
                      </Text>
                      <Text style={DashBoardScreenStyles.legendSubValue}>
                        Avg: {Math.round(item.average).toLocaleString()} AED
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={DashBoardScreenStyles.lineGraphTitle}>
              No sales distribution data for the selected range.
            </Text>
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
