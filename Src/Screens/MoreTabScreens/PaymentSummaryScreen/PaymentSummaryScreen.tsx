import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaymentSummaryScreenStyles } from "./PaymentSummaryScreenStyles";
import usePaymentSummaryScreenVM from "./PaymentSummaryScreenVM";
import SelectPeriodModal from "../../../Components/SelectPeriodModal";
import PaymentSummaryTable from "../../../Components/PaymentSummaryTable";
import ExportBottomSheet from "../../../Components/ExportBottomSheet";
import FilterPanelModal from "../../../Components/FilterPanelModal";
import {
  ArrowLeft,
  SlidersVertical,
  EllipsisVertical,
  Plus,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import React, { useMemo, useState } from "react";

type PageFilterState = {
  location_ids: string[];
  staff_ids: string[];
};

const PaymentSummaryScreen = () => {
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);
  const [exportSheetOpen, setExportSheetOpen] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [pageFilter, setPageFilter] = useState<PageFilterState>({
    location_ids: [],
    staff_ids: [],
  });

  const allLocations = useMemo<any[]>(() => [], []);
  const allTeamMembers = useMemo<any[]>(() => [], []);

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
          <ArrowLeft size={28} color={colors.colors.text} />
          <Text style={PaymentSummaryScreenStyles.backArrowText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={PaymentSummaryScreenStyles.elipseBox}
          onPress={() => setExportSheetOpen(true)}
        >
          <EllipsisVertical size={20} color={colors.colors.text} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={fetchPaymentSummary}
          style={PaymentSummaryScreenStyles.addButton}
        >
          <Plus size={16} color={colors.colors.white} />
          <Text style={PaymentSummaryScreenStyles.addButtonText}>Add</Text>
        </TouchableOpacity> */}
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
            <SlidersVertical size={18} color={colors.colors.text} />
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

      <FilterPanelModal
        visible={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onClear={() => {
          setPageFilter({ location_ids: [], staff_ids: [] });
          setExpandedFilter(null);
        }}
        onApply={() => {
          setShowAdvancedFilter(false);
          fetchPaymentSummary();
        }}
        expandedFilter={expandedFilter}
        toggleFilterAccordion={(filterType: string) => {
          setExpandedFilter((prev) => (prev === filterType ? null : filterType));
        }}
        allLocations={allLocations}
        allTeamMembers={allTeamMembers}
        pageFilter={pageFilter}
        allowedFilters={["location"]}
        toggleLocationFilter={(locationId: string) => {
          setPageFilter((prev) => {
            const exists = prev.location_ids.includes(locationId);
            const location_ids = exists
              ? prev.location_ids.filter((id) => id !== locationId)
              : [...prev.location_ids, locationId];
            return { ...prev, location_ids };
          });
        }}
        toggleTeamMemberFilter={(staffId: string) => {
          setPageFilter((prev) => {
            const exists = prev.staff_ids.includes(staffId);
            const staff_ids = exists
              ? prev.staff_ids.filter((id) => id !== staffId)
              : [...prev.staff_ids, staffId];
            return { ...prev, staff_ids };
          });
        }}
      />
    </SafeAreaView>
  );
};

export default PaymentSummaryScreen;
