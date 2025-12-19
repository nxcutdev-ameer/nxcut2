import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import usePerformanceDashboardScreenVM from "./PerformanceDashboardScreenVM";
import {
  ChevronLeft,
  Star,
  EllipsisVertical,
  Sliders,
} from "lucide-react-native";
import { LineChart } from "react-native-gifted-charts";
import PerformanceDashboardScreenStyles from "../PerformanceDashboardScreen/PerformanceDashboardScreenStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../Constants/colors";
import SelectPeriodModal from "../../../Components/SelectPeriodModal";
import {
  fontEq,
  formatCurrency,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import FilterPanelModal from "../../../Components/FilterPanelModal";

const PerfromanceDashboardScreen = () => {
  const {
    goBack,
    showMonthFilter,
    setShowMonthFilter,
    updateDateFilter,
    dateRange,
    performanceData,
    loading,
    performanceMetrics,
    salesByChannelData,
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    clearFilters,
    applyFilters,
    expandedFilter,
    toggleFilterAccordion,
    allLocations,
    allTeamMembers,
    pageFilter,
    toggleLocationFilter,
    toggleTeamMemberFilter,
    lineGraphData,
  } = usePerformanceDashboardScreenVM();

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={PerformanceDashboardScreenStyles.mainContainer}
    >
      {/* -----------------------------------HEADER---------------------------------------- */}
      <View style={PerformanceDashboardScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => goBack()}
          style={PerformanceDashboardScreenStyles.backButton}
        >
          <ChevronLeft size={24} />
          {/* <Text style={PerformanceDashboardScreenStyles.backButtonText}>
            Back
          </Text> */}
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={PerformanceDashboardScreenStyles.starContainer}
        >
          <Star color={"#fbbf24"} fill={"#fbbf24"} size={26} />
        </TouchableOpacity> */}


        {/* <TouchableOpacity style={PerformanceDashboardScreenStyles.optionButton}>
          <EllipsisVertical size={26} />
        </TouchableOpacity> */}
      </View>
      {/* -----------------------------------TITLECONTAINER---------------------------------------- */}
      <View style={PerformanceDashboardScreenStyles.titleContainer}>
        <Text style={PerformanceDashboardScreenStyles.title}>
          Performance Dashboard
        </Text>
        <Text style={PerformanceDashboardScreenStyles.description}>
          Dashboard of your business performance.
        </Text>
        <View style={PerformanceDashboardScreenStyles.filterContainer}>
          <TouchableOpacity
            style={PerformanceDashboardScreenStyles.filterButton}
            onPress={openFilterPanel}
          >
            <Sliders size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowMonthFilter(true)}
            style={PerformanceDashboardScreenStyles.dateButton}
          >
            <Text style={PerformanceDashboardScreenStyles.DateFilter}>
              {new Date(dateRange.start_date).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
              })}{" "}
              -{" "}
              {new Date(dateRange.end_date).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* -----------------------------------CONTENTCONTAINER---------------------------------------- */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: getHeightEquivalent(50) }}
        showsVerticalScrollIndicator={false}
        style={PerformanceDashboardScreenStyles.contentContainer}
      >
        <View style={PerformanceDashboardScreenStyles.metricsGrid}>
          {/* Total Sales */}
          <View style={PerformanceDashboardScreenStyles.sectionContainer}>
            <Text style={PerformanceDashboardScreenStyles.sectionTitle}>
              Total sales
            </Text>
            <Text style={PerformanceDashboardScreenStyles.sectionAmount}>
              {loading
                ? "Loading..."
                : formatCurrency(
                    performanceData.reduce(
                      (sum, item) => sum + item.total_sales,
                      0
                    )
                  )}
            </Text>
            {/* <View style={PerformanceDashboardScreenStyles.compareContainer}>
              <ChartLine color={colors.success} size={16} />
              <Text style={PerformanceDashboardScreenStyles.compareText}>
                vs previous period
              </Text>
            </View> */}
          </View>

          {/* Total Transactions */}
          <View style={PerformanceDashboardScreenStyles.sectionContainer}>
            <Text style={PerformanceDashboardScreenStyles.sectionTitle}>
              Total transactions
            </Text>
            <Text style={PerformanceDashboardScreenStyles.sectionAmount}>
              {loading
                ? "Loading..."
                : performanceMetrics.totalTransactions.toLocaleString()}
            </Text>
            {/* <View style={PerformanceDashboardScreenStyles.compareContainer}>
              <ChartLine color={colors.success} size={16} />
              <Text style={PerformanceDashboardScreenStyles.compareText}>
                vs previous period
              </Text>
            </View> */}
          </View>

          {/* Average Sale Value */}
          <View style={PerformanceDashboardScreenStyles.sectionContainer}>
            <Text style={PerformanceDashboardScreenStyles.sectionTitle}>
              Average sale value
            </Text>
            <Text style={PerformanceDashboardScreenStyles.sectionAmount}>
              {loading
                ? "Loading..."
                : formatCurrency(performanceMetrics.averageSaleValue)}
            </Text>
            {/* <View style={PerformanceDashboardScreenStyles.compareContainer}>
              <ChartLine color={colors.success} size={16} />
              <Text style={PerformanceDashboardScreenStyles.compareText}>
                vs previous period
              </Text>
            </View> */}
          </View>

          {/* Online Sales */}
          <View style={PerformanceDashboardScreenStyles.sectionContainer}>
            <Text style={PerformanceDashboardScreenStyles.sectionTitle}>
              Online sales
            </Text>
            <Text style={PerformanceDashboardScreenStyles.sectionAmount}>
              {loading
                ? "Loading..."
                : formatCurrency(performanceMetrics.onlineSales)}
            </Text>
            {/* <View style={PerformanceDashboardScreenStyles.compareContainer}>
              <ChartLine color={colors.success} size={16} />
              <Text style={PerformanceDashboardScreenStyles.compareText}>
                vs previous period
              </Text>
            </View> */}
          </View>

          {/* Appointments */}
          <View style={PerformanceDashboardScreenStyles.sectionContainer}>
            <Text style={PerformanceDashboardScreenStyles.sectionTitle}>
              Appointments
            </Text>
            <Text style={PerformanceDashboardScreenStyles.sectionAmount}>
              {loading
                ? "Loading..."
                : performanceMetrics.appointments.toLocaleString()}
            </Text>
            {/* <View style={PerformanceDashboardScreenStyles.compareContainer}>
              <ChartLine color={colors.success} size={16} />
              <Text style={PerformanceDashboardScreenStyles.compareText}>
                vs previous period
              </Text>
            </View> */}
          </View>

          {/* Occupancy Rate */}
          <View style={PerformanceDashboardScreenStyles.sectionContainer}>
            <Text style={PerformanceDashboardScreenStyles.sectionTitle}>
              Occupancy rate
            </Text>
            <Text style={PerformanceDashboardScreenStyles.sectionAmount}>
              {loading ? "Loading..." : `${performanceMetrics.occupancyRate}%`}
            </Text>
            {/* <View style={PerformanceDashboardScreenStyles.compareContainer}>
              <ChartLine color={colors.success} size={16} />
              <Text style={PerformanceDashboardScreenStyles.compareText}>
                vs previous period
              </Text>
            </View> */}
          </View>

          {/* Returning Client Rate */}
          <View style={PerformanceDashboardScreenStyles.sectionContainer}>
            <Text style={PerformanceDashboardScreenStyles.sectionTitle}>
              Returning client rate
            </Text>
            <Text style={PerformanceDashboardScreenStyles.sectionAmount}>
              {loading
                ? "Loading..."
                : `${performanceMetrics.returningClientRate}%`}
            </Text>
            {/* {/* <View style={PerformanceDashboardScreenStyles.compareContainer}>
              <ChartLine color={colors.success} size={16} />
              <Text style={PerformanceDashboardScreenStyles.compareText}>
                vs previous period
              </Text>
            </View> */}
          </View>
        </View>

        {/* Sales by Channel Table Section */}
        <View style={PerformanceDashboardScreenStyles.tableSection}>
          <Text style={PerformanceDashboardScreenStyles.tableSectionTitle}>
            Sales by Channel
          </Text>
          <Text style={PerformanceDashboardScreenStyles.tableSectionSubtitle}>
            Breakdown for Last 30 days - All locations
          </Text>

          {/* Table Header */}
          <View style={PerformanceDashboardScreenStyles.tableHeader}>
            <View style={PerformanceDashboardScreenStyles.tableCellType}>
              <Text style={PerformanceDashboardScreenStyles.tableHeaderText}>
                Type
              </Text>
            </View>
            <View style={PerformanceDashboardScreenStyles.tableCellSales}>
              <Text style={PerformanceDashboardScreenStyles.tableHeaderText}>
                Total Sales
              </Text>
            </View>
            <View style={PerformanceDashboardScreenStyles.tableCellPercentage}>
              <Text style={PerformanceDashboardScreenStyles.tableHeaderText}>
                Percentage
              </Text>
            </View>
            <View style={PerformanceDashboardScreenStyles.tableCellAverage}>
              <Text style={PerformanceDashboardScreenStyles.tableHeaderText}>
                Daily Average
              </Text>
            </View>
          </View>

          {/* Table Rows */}
          {loading ? (
            <View style={PerformanceDashboardScreenStyles.tableRow}>
              <Text style={PerformanceDashboardScreenStyles.tableCellText}>
                Loading...
              </Text>
            </View>
          ) : (
            salesByChannelData.map((item, index) => (
              <View
                key={index}
                style={[
                  PerformanceDashboardScreenStyles.tableRow,
                  item.type === "Total Period" &&
                    PerformanceDashboardScreenStyles.tableRowTotal,
                ]}
              >
                <View style={PerformanceDashboardScreenStyles.tableCellType}>
                  <Text
                    style={[
                      item.type === "Total Period"
                        ? PerformanceDashboardScreenStyles.tableCellTextTotal
                        : PerformanceDashboardScreenStyles.tableCellText,
                    ]}
                  >
                    {item.type}
                  </Text>
                </View>
                <View style={PerformanceDashboardScreenStyles.tableCellSales}>
                  <Text
                    style={[
                      item.type === "Total Period"
                        ? PerformanceDashboardScreenStyles.tableCellTextTotal
                        : PerformanceDashboardScreenStyles.tableCellText,
                    ]}
                  >
                    {formatCurrency(item.totalSales)}
                  </Text>
                </View>
                <View
                  style={PerformanceDashboardScreenStyles.tableCellPercentage}
                >
                  <Text
                    style={[
                      item.type === "Total Period"
                        ? PerformanceDashboardScreenStyles.tableCellTextTotal
                        : PerformanceDashboardScreenStyles.tableCellText,
                    ]}
                  >
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
                <View style={PerformanceDashboardScreenStyles.tableCellAverage}>
                  <Text
                    style={[
                      item.type === "Total Period"
                        ? PerformanceDashboardScreenStyles.tableCellTextTotal
                        : PerformanceDashboardScreenStyles.tableCellText,
                    ]}
                  >
                    {formatCurrency(item.dailyAverage)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
        {/* ---------------------------------------LINE GRAPH SECTION----------------------------------------- */}
        <View style={PerformanceDashboardScreenStyles.lineGraphSection}>
          <Text style={PerformanceDashboardScreenStyles.tableSectionTitle}>
            Sales over time
          </Text>
          <Text style={PerformanceDashboardScreenStyles.lineAmount}>
            {formatCurrency(
              performanceData.reduce((sum, item) => sum + item.total_sales, 0)
            )}
          </Text>
          <View
            style={PerformanceDashboardScreenStyles.lineGraphDetailsContainer}
          >
            <View style={PerformanceDashboardScreenStyles.lineGraphDetails}>
              <View
                style={{
                  height: getHeightEquivalent(12),
                  width: getHeightEquivalent(12),
                  borderRadius: 20,
                  backgroundColor: "blue",
                  //marginRight: getWidthEquivalent(5),
                }}
              ></View>
              <Text style={PerformanceDashboardScreenStyles.lineGraphText}>
                Services
              </Text>
            </View>
            <View style={PerformanceDashboardScreenStyles.lineGraphDetails}>
              <View
                style={{
                  height: getHeightEquivalent(12),
                  width: getHeightEquivalent(12),
                  borderRadius: 20,
                  backgroundColor: colors.success,
                  marginRight: getWidthEquivalent(5),
                }}
              ></View>
              <Text style={PerformanceDashboardScreenStyles.lineGraphText}>
                Products
              </Text>
            </View>
            <View style={PerformanceDashboardScreenStyles.lineGraphDetails}>
              <View
                style={{
                  height: getHeightEquivalent(12),
                  width: getHeightEquivalent(12),
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  marginRight: getWidthEquivalent(5),
                }}
              ></View>
              <Text style={PerformanceDashboardScreenStyles.lineGraphText}>
                Memberships
              </Text>
            </View>
            <View style={PerformanceDashboardScreenStyles.lineGraphDetails}>
              <View
                style={{
                  height: getHeightEquivalent(12),
                  width: getHeightEquivalent(12),
                  borderRadius: 20,
                  backgroundColor: "orange",
                  marginRight: getWidthEquivalent(5),
                }}
              ></View>
              <Text style={PerformanceDashboardScreenStyles.lineGraphText}>
                Vouchers
              </Text>
            </View>
          </View>
          <View style={PerformanceDashboardScreenStyles.lineGraphWrapContainer}>
            {loading ? (
              <View
                style={{
                  width: getWidthEquivalent(300),
                  height: getHeightEquivalent(200),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>Loading chart data...</Text>
              </View>
            ) : lineGraphData.servicesData.length > 0 ? (
              <ScrollView
                horizontal
                //scrollEnabled={false}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  // borderWidth: 1,
                  flex: 1,
                  height: getHeightEquivalent(280),
                  width: getWidthEquivalent(100),
                }}
              >
                <LineChart
                  data={lineGraphData.servicesData}
                  data2={lineGraphData.productsData}
                  data3={lineGraphData.membershipsData}
                  data4={lineGraphData.vouchersData}
                  height={getHeightEquivalent(220)}
                  width={Math.max(
                    getWidthEquivalent(320)
                    // lineGraphData.servicesData.length * 15 + 120
                  )}
                  initialSpacing={20}
                  spacing={28}
                  thickness1={2}
                  thickness2={2}
                  thickness3={2}
                  thickness4={2}
                  color1="blue"
                  color2={colors.success}
                  color3={colors.primary}
                  color4="orange"
                  dataPointsColor1="blue"
                  dataPointsColor2={colors.success}
                  dataPointsColor3={colors.primary}
                  dataPointsColor4="orange"
                  dataPointsRadius={3}
                  showValuesAsDataPointsText={true}
                  textShiftY={18}
                  curved={false}
                  isAnimated={true}
                  animationDuration={800}
                  yAxisColor="#E0E0E0"
                  xAxisColor="#E0E0E0"
                  yAxisThickness={1}
                  xAxisThickness={1}
                  rulesColor="#F0F0F0"
                  rulesType="dashed"
                  yAxisLabelTexts={(() => {
                    const max = lineGraphData.maxValue;
                    if (max === 0) return ["0"];
                    const step = Math.ceil(max / 5);
                    return [
                      "0",
                      `${step}`,
                      `${step * 2}`,
                      `${step * 3}`,
                      `${step * 4}`,
                      `${max}`,
                    ];
                  })()}
                  yAxisLabelWidth={40}
                  yAxisTextStyle={{
                    color: colors.text,
                   fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
                   fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
                  }}
                  hideDataPoints={false}
                  showVerticalLines={true}
                  verticalLinesColor="#F0F0F0"
                  verticalLinesThickness={0.5}
                  noOfSections={5}
                  maxValue={lineGraphData.maxValue || 100}
                  stepHeight={getHeightEquivalent(44)}
                  xAxisLabelTextStyle={{
                    color: colors.text,
                    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
                    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
                    textAlign: "center",
                    fontWeight: "600",
                    width: getWidthEquivalent(45),
                  }}
                  rotateLabel={false}
                  xAxisLabelsVerticalShift={8}
                  showXAxisIndices={false}
                  endSpacing={50}
                />
              </ScrollView>
            ) : (
              <View
                style={{
                  width: getWidthEquivalent(300),
                  height: getHeightEquivalent(200),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>No data available</Text>
              </View>
            )}
          </View>
        </View>
        {/* ---------------------------------------------BarGraph Section-------------------------------------- */}
        <View style={PerformanceDashboardScreenStyles.barGraphContainer}>
          <Text style={PerformanceDashboardScreenStyles.tableSectionTitle}>
            Sales by type
          </Text>
          <Text style={PerformanceDashboardScreenStyles.lineAmount}>
            {formatCurrency(
              performanceData.reduce((sum, item) => sum + item.total_sales, 0)
            )}
          </Text>
          <Text style={PerformanceDashboardScreenStyles.compareText}>
            Total for selected period
          </Text>
          {salesByChannelData
            .filter((item) => item.type !== "Total Period")
            .map((item, index) => {
              const colors_array = ["blue", colors.success, colors.primary];
              const color = colors_array[index] || "gray";

              return (
                <View
                  key={item.type}
                  style={
                    PerformanceDashboardScreenStyles.barGraphDetailsContainer
                  }
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        height: getHeightEquivalent(12),
                        width: getHeightEquivalent(12),
                        borderRadius: 20,
                        backgroundColor: color,
                        marginRight: getWidthEquivalent(8),
                      }}
                    />
                    <Text
                      style={PerformanceDashboardScreenStyles.lineGraphText}
                    >
                      {item.type}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        PerformanceDashboardScreenStyles.lineGraphText,
                        { fontWeight: "700", color: colors.text },
                      ]}
                    >
                      {formatCurrency(item.totalSales)}
                    </Text>
                    <Text
                      style={[
                        PerformanceDashboardScreenStyles.lineGraphText,
                        {   fontSize:Platform.OS === 'android' ?fontEq(8): fontEq(10),
                            fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined, color: colors.textSecondary },
                      ]}
                    >
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          <View style={PerformanceDashboardScreenStyles.barGraphWrapper}>
            {(() => {
              // Filter out "Total Period" and get the data
              const barData = salesByChannelData.filter(
                (item) => item.type !== "Total Period"
              );

              if (barData.length === 0) {
                return (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      No data available
                    </Text>
                  </View>
                );
              }

              // Find the maximum value for scaling
              const maxValue = Math.max(
                ...barData.map((item) => item.totalSales)
              );
              const maxHeight = getHeightEquivalent(180);

              // Color array matching the legend
              const colors_array = ["blue", colors.success, colors.primary];

              return barData.map((item, index) => {
                // Calculate the height based on proportion to max value
                const barHeight =
                  maxValue > 0
                    ? Math.max(
                        (item.totalSales / maxValue) * maxHeight,
                        //getHeightEquivalent(10)
                      )
                    : getHeightEquivalent(5); // Minimum height for visibility

                const color = colors_array[index] || "gray";

                return (
                  <View
                    key={item.type}
                    style={{
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    {/* Bar amount label on top */}
                    <Text
                      style={{
                        fontSize:Platform.OS === 'android' ?fontEq(8): fontEq(10),
                        fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
                        fontWeight: "600",
                        color: colors.text,
                        marginBottom: 5,
                        textAlign: "center",
                      }}
                    >
                      {formatCurrency(item.totalSales)}
                    </Text>

                    {/* The actual bar */}
                    <View
                      style={{
                        height: barHeight,
                        width: getWidthEquivalent(60),
                        backgroundColor: color,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        marginHorizontal: getWidthEquivalent(10),
                      }}
                    />

                    {/* Bar category label at bottom */}
                    <Text
                      style={{
                        fontSize:Platform.OS === 'android' ?fontEq(7): fontEq(9),
                        fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
                        fontWeight: "500",
                        color: colors.textSecondary,
                        marginTop: 8,
                        textAlign: "center",
                        width: getWidthEquivalent(80),
                      }}
                    >
                      {item.type === "membership services"
                        ? "Memberships"
                        : item.type.charAt(0).toUpperCase() +
                          item.type.slice(1)}
                    </Text>
                  </View>
                );
              });
            })()}
          </View>
        </View>
      </ScrollView>

      <SelectPeriodModal
        visible={showMonthFilter}
        onClose={() => setShowMonthFilter(false)}
        onApply={({ fromDate, toDate }) => {
          const toLocalISODate = (isoString: string) => {
            const date = new Date(isoString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          updateDateFilter({
            start_date: toLocalISODate(fromDate),
            end_date: toLocalISODate(toDate),
          });
          setShowMonthFilter(false);
        }}
      />
      <FilterPanelModal
        visible={showFilterPanel}
        onClose={closeFilterPanel}
        onClear={clearFilters}
        onApply={applyFilters}
        expandedFilter={expandedFilter}
        toggleFilterAccordion={toggleFilterAccordion}
        allLocations={allLocations}
        allTeamMembers={allTeamMembers}
        pageFilter={pageFilter}
        toggleLocationFilter={toggleLocationFilter}
        toggleTeamMemberFilter={toggleTeamMemberFilter}
      />
    </SafeAreaView>
  );
};

export default PerfromanceDashboardScreen;
