import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaymentSummaryScreenStyles } from "./PaymentSummaryScreenStyles";
import usePaymentSummaryScreenVM from "./PaymentSummaryScreenVM";
import { useAuthStore } from "../../../Store/useAuthStore";
import SelectPeriodModal from "../../../Components/SelectPeriodModal";
import PaymentSummaryTable from "../../../Components/PaymentSummaryTable";
import ExportBottomSheet from "../../../Components/ExportBottomSheet";
import LocationFilterModal from "../../../Components/LocationFilterModal";
import {
  SlidersVertical,
  EllipsisVertical,
  ChevronLeft,
  Sliders,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import React, { useState } from "react";


const PaymentSummaryScreen = () => {
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);
  const [exportSheetOpen, setExportSheetOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);

  const { allLocations, allTeamMembers } = useAuthStore();

  const {
    navigation,
    fetchPaymentSummary,
    paymentSummaryData,
    loading,
    startDate,
    endDate,
    updateDateRange,
    getDateRangeDisplay,
    exportAsCSV,
    exportAsPDF,
    exportAsExcel,
  } = usePaymentSummaryScreenVM();

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={PaymentSummaryScreenStyles.mainContainer}
    >
      {/* Fixed Header */}
      <View style={PaymentSummaryScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={PaymentSummaryScreenStyles.backArrow}
        >
          <ChevronLeft size={24} />
          {/* <ArrowLeft size={20} color={colors.colors.black} />
          <Text style={PaymentSummaryScreenStyles.backArrowText}>Back</Text> */}
        </TouchableOpacity>
        <View style={PaymentSummaryScreenStyles.titleContainer}>
          <TouchableOpacity
            style={PaymentSummaryScreenStyles.headerButton}
            onPress={() => setExportSheetOpen(true)}
          >
            <EllipsisVertical strokeWidth={1.7} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilterPanel(true)}
            style={PaymentSummaryScreenStyles.headerButton}
          >
            <Sliders size={22} color={colors.colors.black} strokeWidth={1.7} />
          </TouchableOpacity>
          {/* <TouchableOpacity
          onPress={fetchPaymentSummary}
          style={PaymentSummaryScreenStyles.addButton}
        >
          <Plus size={16} color={colors.colors.white} />
          <Text style={PaymentSummaryScreenStyles.addButtonText}>Add</Text>
        </TouchableOpacity> */}
        </View>
      </View>

      {/* Fixed Title Section */}
      <View style={PaymentSummaryScreenStyles.titleSection}>
        <Text style={PaymentSummaryScreenStyles.bodyTitle}>
          Payments Summary
        </Text>
        <Text style={PaymentSummaryScreenStyles.bodySubtitle}>
          View, filter and export payment methods and transaction summary for
          the day.
        </Text>

        <View style={PaymentSummaryScreenStyles.dateNavigationContainer}>
          {/* Date Range Filter Button */}
          <TouchableOpacity
            style={PaymentSummaryScreenStyles.filterButton}
            onPress={() => {
              console.log("Opening period filter...");
              setShowPeriodFilter(true);
            }}
          >
            <SlidersVertical
              size={18}
              color={colors.colors.text}
              strokeWidth={1.7}
            />
            <Text style={PaymentSummaryScreenStyles.filterButtonText}>
              {getDateRangeDisplay()}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={PaymentSummaryScreenStyles.secondaryFilterButton}
            onPress={() => {
              console.log("Opening advanced filters...");
              setShowAdvancedFilter(true);
            }}
          >
            <SlidersVertical size={18} color={colors.colors.text} />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={PaymentSummaryScreenStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={PaymentSummaryScreenStyles.scrollContent}
      >
        {/* <Text style={PaymentSummaryScreenStyles.sectionTitle}>
          Payment Methods Summary
        </Text> */}

        <PaymentSummaryTable data={paymentSummaryData} loading={loading} />
      </ScrollView>

      {/* Period Filter Modal */}
      {showPeriodFilter && (
        <SelectPeriodModal
          visible={showPeriodFilter}
          onClose={() => setShowPeriodFilter(false)}
          onDateRangeSelect={(fromDate, toDate) => {
            updateDateRange(fromDate, toDate);
          }}
          initialFromDate={startDate ? startDate.toISOString() : undefined}
          initialToDate={endDate ? endDate.toISOString() : undefined}
        />
      )}

      {/* Export Bottom Sheet */}
      <ExportBottomSheet
        visible={exportSheetOpen}
        onClose={() => setExportSheetOpen(false)}
        onExportCSV={exportAsCSV}
        onExportPDF={exportAsPDF}
        onExportExcel={exportAsExcel}
      />

      <LocationFilterModal
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onClear={() => {
          setSelectedLocationIds([]);
        }}
        onApply={() => {
          setShowFilterPanel(false);
          // Call fetchPaymentSummary with selected location IDs
          const locationIds = selectedLocationIds.length > 0 
            ? selectedLocationIds 
            : allLocations.map(loc => loc.id);
          fetchPaymentSummary(locationIds);
        }}
        allLocations={allLocations}
        pageFilter={{ location_ids: selectedLocationIds }}
        toggleLocationFilter={(locationId: string) => {
          setSelectedLocationIds(prev => {
            const isSelected = prev.includes(locationId);
            return isSelected
              ? prev.filter(id => id !== locationId)
              : [...prev, locationId];
          });
        }}
        title="Filter Payment Summary"
      />
    </SafeAreaView>
  );
};

export default PaymentSummaryScreen;
