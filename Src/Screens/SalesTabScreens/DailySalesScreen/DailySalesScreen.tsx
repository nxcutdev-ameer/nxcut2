import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DailySalesScreenStyles } from "./DailySalesScreenStyles";
import { useDailySalesScreenVM } from "./DailySalesScreenVM";
import PerformanceDashboardScreenStyles from "../../MoreTabScreens/PerformanceDashboardScreen/PerformanceDashboardScreenStyles";
import { DatePickerModal } from "react-native-paper-dates";
import SalesTable from "../../../Components/SalesTable";
import SaleItemSummary from "../../../Components/SaleItemSummary";
import DailySalesSummary from "../../../Components/DailySalesSummary";
import CashMovementSummary from "../../../Components/CashMovementSummary";
import Modal from "react-native-modal";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import {
  ArrowLeft,
  Calendar,
  EllipsisVertical,
  ChevronLeft,
  ChevronRight,
  Sliders,
  X,
  Check,
  FileText,
  Download,
  Grid3X3,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import React, { useState } from "react";

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
      style={PerformanceDashboardScreenStyles.filterPanelModal}
    >
      <SafeAreaView
        edges={["top", "right", "bottom"]}
        style={PerformanceDashboardScreenStyles.filterPanel}
      >
        {/* Header */}
        <View style={PerformanceDashboardScreenStyles.filterPanelHeader}>
          <Text style={PerformanceDashboardScreenStyles.filterPanelTitle}>
            Filter Daily Sales
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={PerformanceDashboardScreenStyles.filterCloseButton}
          >
            <X size={20} color={colors.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={PerformanceDashboardScreenStyles.filterPanelContent}>
          {/* Location Filter */}
          <View style={PerformanceDashboardScreenStyles.filterOption}>
            <Text style={PerformanceDashboardScreenStyles.filterOptionText}>
              Locations
            </Text>
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
                    borderColor: isSelected ? colors.colors.primary : colors.colors.border,
                    backgroundColor: isSelected ? colors.colors.primary : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {isSelected && (
                    <Check size={16} color={colors.colors.white} strokeWidth={3} />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.colors.text,
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
        <View style={PerformanceDashboardScreenStyles.filterPanelButtons}>
          <TouchableOpacity
            style={PerformanceDashboardScreenStyles.filterClearButton}
            onPress={onClear}
          >
            <Text style={PerformanceDashboardScreenStyles.filterClearButtonText}>
              Clear All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={PerformanceDashboardScreenStyles.filterApplyButton}
            onPress={onApply}
          >
            <Text style={PerformanceDashboardScreenStyles.filterApplyButtonText}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const DailySalesScreen = () => {
  const [open, setOpen] = useState(false);

  const {
    navigation,
    processedPayments,
    saleItems,
    loading,
    selectedDate,
    updateSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    isToday,
    exportAsCSV,
    exportAsPDF,
    exportAsExcel,
    summaryData,
    // Filter related
    pageFilter,
    toggleLocationFilter,
    clearAllFilters,
    applyFilters,
    allLocations,
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    // Bottom sheet related
    bottomSheetRef,
    handleSheetChanges,
    openExportBottomSheet,
    closeExportBottomSheet,
    isBottomSheetOpen,
  } = useDailySalesScreenVM();

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={DailySalesScreenStyles.mainContainer}
    >
      {/* Fixed Header */}
      <View style={DailySalesScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={DailySalesScreenStyles.backArrow}
        >
          <ArrowLeft size={28} color={colors.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={DailySalesScreenStyles.elipseBox}
          onPress={openExportBottomSheet}
        >
          <EllipsisVertical size={20} color={colors.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openFilterPanel}
          style={DailySalesScreenStyles.filter}
        >
          <Sliders size={22} color={colors.colors.black} />
          {/* <Text style={DailySalesScreenStyles.addButtonText}>Add</Text> */}
        </TouchableOpacity>
      </View>

      {/* Fixed Title Section */}
      <View style={DailySalesScreenStyles.titleSection}>
        <Text style={DailySalesScreenStyles.bodyTitle}>Daily Sales</Text>
        <Text style={DailySalesScreenStyles.bodySubtitle}>
          View,Filter and export the transactions and cash movement for the day.
        </Text>

        <View style={DailySalesScreenStyles.dateNavigationContainer}>
          {/* Today Button */}
          <TouchableOpacity
            style={[
              DailySalesScreenStyles.todayButton,
              isToday() && DailySalesScreenStyles.todayButtonDisabled,
            ]}
            onPress={goToToday}
            disabled={isToday()}
          >
            <Text
              style={[
                DailySalesScreenStyles.todayButtonText,
                isToday() && DailySalesScreenStyles.todayButtonTextDisabled,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          {/* Previous Day Button */}
          <TouchableOpacity
            style={DailySalesScreenStyles.chevronButton}
            onPress={goToPreviousDay}
          >
            <ChevronLeft size={20} color={colors.colors.text} />
          </TouchableOpacity>

          {/* Date Picker Button */}
          <TouchableOpacity
            style={DailySalesScreenStyles.filterButton}
            onPress={() => {
              console.log("Opening date picker...");
              setOpen(true);
            }}
          >
            <Text style={DailySalesScreenStyles.filterButtonText}>
              {selectedDate.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Calendar size={18} color={colors.colors.text} />
          </TouchableOpacity>

          {/* Next Day Button */}
          <TouchableOpacity
            style={DailySalesScreenStyles.chevronButton}
            onPress={goToNextDay}
          >
            <ChevronRight size={20} color={colors.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={DailySalesScreenStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={DailySalesScreenStyles.scrollContent}
      >

        <Text style={DailySalesScreenStyles.sectionTitle}>Summary</Text>

        <DailySalesSummary
          totalSales={summaryData.totalSales}
          totalTransactions={summaryData.totalTransactions}
          totalClients={summaryData.totalClients}
          paymentMethods={summaryData.paymentMethods}
          loading={loading}
        />

        <Text style={DailySalesScreenStyles.sectionTitle}>
          Cash Movement Summary
        </Text>

        <CashMovementSummary data={processedPayments} />

        <Text style={DailySalesScreenStyles.sectionTitle}>
          Sale Item Summary
        </Text>

        <SaleItemSummary data={saleItems} loading={loading} />

        <Text style={DailySalesScreenStyles.transactionSummary}>
          Transaction Summary
        </Text>

        <SalesTable data={processedPayments} loading={loading} />
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={() => setOpen(false)}
        date={selectedDate}
        onConfirm={(params) => {
          setOpen(false);
          if (params.date) {
            updateSelectedDate(params.date);
          }
        }}
      />

      {/* Export Bottom Sheet */}
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["50%"]}
        enablePanDownToClose={true}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.5}
            pressBehavior="close"
          />
        )}
        handleIndicatorStyle={{
          backgroundColor: colors.colors.textSecondary,
          width: 40,
          height: 5,
          borderRadius: 3,
        }}
        backgroundStyle={{ backgroundColor: colors.colors.white }}
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <BottomSheetView style={DailySalesScreenStyles.bottomSheetContainer}>
          <Text style={DailySalesScreenStyles.bottomSheetTitle}>
            Export Sales Report
          </Text>
          <Text style={DailySalesScreenStyles.bottomSheetSubtitle}>
            Choose your preferred format to download the sales data
          </Text>

          <View style={DailySalesScreenStyles.exportOptionsContainer}>
            {/* PDF Option */}
            <TouchableOpacity
              style={DailySalesScreenStyles.exportOption}
              onPress={exportAsPDF}
            >
              <View
                style={[
                  DailySalesScreenStyles.exportIconContainer,
                  { backgroundColor: "#FEF2F2" },
                ]}
              >
                <FileText size={24} color="#EF4444" />
              </View>
              <View style={DailySalesScreenStyles.exportOptionText}>
                <Text style={DailySalesScreenStyles.exportOptionTitle}>
                  PDF
                </Text>
                <Text style={DailySalesScreenStyles.exportOptionDescription}>
                  Formatted document ready for print
                </Text>
              </View>
            </TouchableOpacity>

            {/* CSV Option */}
            <TouchableOpacity
              style={DailySalesScreenStyles.exportOption}
              onPress={exportAsCSV}
            >
              <View
                style={[
                  DailySalesScreenStyles.exportIconContainer,
                  { backgroundColor: "#EFF6FF" },
                ]}
              >
                <FileText size={24} color="#3B82F6" />
              </View>
              <View style={DailySalesScreenStyles.exportOptionText}>
                <Text style={DailySalesScreenStyles.exportOptionTitle}>
                  CSV
                </Text>
                <Text style={DailySalesScreenStyles.exportOptionDescription}>
                  Comma-separated values for analysis
                </Text>
              </View>
            </TouchableOpacity>

            {/* Excel Option */}
            <TouchableOpacity
              style={DailySalesScreenStyles.exportOption}
              onPress={exportAsExcel}
            >
              <View
                style={[
                  DailySalesScreenStyles.exportIconContainer,
                  { backgroundColor: "#F0FDF4" },
                ]}
              >
                <Grid3X3 size={24} color="#22C55E" />
              </View>
              <View style={DailySalesScreenStyles.exportOptionText}>
                <Text style={DailySalesScreenStyles.exportOptionTitle}>
                  Excel
                </Text>
                <Text style={DailySalesScreenStyles.exportOptionDescription}>
                  Spreadsheet format for calculations
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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

export default DailySalesScreen;
