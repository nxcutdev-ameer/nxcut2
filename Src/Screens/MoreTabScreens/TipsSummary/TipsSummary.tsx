import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
} from "react-native";
import React from "react";
import useTipsSummaryScreenVM from "./TipsSummaryVM";
import { SafeAreaView } from "react-native-safe-area-context";
import TipSummaryScreenStyles from "./TipsSummaryStyles";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Search,
  FileText,
  Download,
  FileSpreadsheet,
  Sliders,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import TipsSummaryTable from "../../../Components/TipsSummaryTable";
import SelectPeriodModal from "../../../Components/SelectPeriodModal";
import LocationFilterModal from "../../../Components/LocationFilterModal";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const SalesTipsScreen = () => {
  const {
    navigation,
    loading,
    showDateFilter,
    setShowDateFilter,
    pageFilter,
    updateDateFilter,
    getDateRangeText,
    allLocations,
    searchQuery,
    setSearchQuery,
    filteredTipsData,
    bottomSheetRef,
    handleSheetChanges,
    openExportBottomSheet,
    closeExportBottomSheet,
    handleExport,
    isBottomSheetOpen,
    backdropOpacity,
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    toggleLocationFilter,
    clearAllFilters,
    applyFilters,
  } = useTipsSummaryScreenVM();

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={TipSummaryScreenStyles.mainContainer}
    >
      {/* Fixed Header */}
      <View style={TipSummaryScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={TipSummaryScreenStyles.backArrow}
        >
          <ArrowLeft size={20} color={colors.colors.text} />
        </TouchableOpacity>
        <View style={TipSummaryScreenStyles.headerButtons}>
          <TouchableOpacity
            onPress={openExportBottomSheet}
            style={TipSummaryScreenStyles.addButton}
          >
            <Text style={TipSummaryScreenStyles.addButtonText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openFilterPanel}
            style={TipSummaryScreenStyles.filter}
          >
            <Sliders size={22} color={colors.colors.black} strokeWidth={1.7} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={TipSummaryScreenStyles.titleSection}>
        <View style={TipSummaryScreenStyles.titleRow}>
          <Text style={TipSummaryScreenStyles.title}>Tips Summary</Text>
          <View style={TipSummaryScreenStyles.countBadge}>
            <Text style={TipSummaryScreenStyles.countText}>
              {filteredTipsData.length}
            </Text>
          </View>
        </View>
        <Text style={TipSummaryScreenStyles.subtitle}>
          Analysis of gratuity income.
        </Text>

        {/* Search Bar */}
        <View style={TipSummaryScreenStyles.searchContainer}>
          <Search size={18} color={colors.colors.textSecondary} />
          <TextInput
            style={TipSummaryScreenStyles.searchInput}
            placeholder="Search by staff name, tips collected..."
            placeholderTextColor={colors.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Date Range Filter Button */}
        <TouchableOpacity
          onPress={() => setShowDateFilter(true)}
          style={TipSummaryScreenStyles.dateRangeButton}
        >
          <Calendar size={18} color={colors.colors.black} />
          <Text style={TipSummaryScreenStyles.dateRangeText}>
            {" "}
            {getDateRangeText()}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={TipSummaryScreenStyles.tableContainer}>
        {loading ? (
          <View style={TipSummaryScreenStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.colors.primary} />
            <Text style={TipSummaryScreenStyles.loadingText}>
              Loading tips...
            </Text>
          </View>
        ) : filteredTipsData.length > 0 ? (
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={true}
            style={TipSummaryScreenStyles.horizontalScroll}
          >
             <View style={TipSummaryScreenStyles.TableContainer}>
            <TipsSummaryTable tips={filteredTipsData} />
            </View>
          </ScrollView>
        ) : (
          <View style={TipSummaryScreenStyles.emptyState}>
            <DollarSign size={64} color={colors.colors.textSecondary} />
            <Text style={TipSummaryScreenStyles.emptyTitle}>
              {searchQuery.trim()
                ? "No tips match your search"
                : "No tips found"}
            </Text>
            <Text style={TipSummaryScreenStyles.emptySubtitle}>
              {searchQuery.trim()
                ? "Try adjusting your search terms or date range"
                : "Tips received by staff members will appear here"}
            </Text>
          </View>
        )}
      </View>

      {/* Date Filter Modal */}
      <SelectPeriodModal
        visible={showDateFilter}
        onClose={() => setShowDateFilter(false)}
        onApply={updateDateFilter}
        initialFromDate={pageFilter.start_date}
        initialToDate={pageFilter.end_date}
      />

      {/* Backdrop overlay when bottom sheet is open */}
      {isBottomSheetOpen && (
        <TouchableWithoutFeedback onPress={closeExportBottomSheet}>
          <Animated.View
            style={[
              TipSummaryScreenStyles.backdrop,
              { opacity: backdropOpacity },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Export Bottom Sheet */}
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["65%"]}
        enablePanDownToClose={true}
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
        <BottomSheetView style={TipSummaryScreenStyles.bottomSheetContainer}>
          <Text style={TipSummaryScreenStyles.bottomSheetTitle}>
            Export Tips Report
          </Text>
          <Text style={TipSummaryScreenStyles.bottomSheetSubtitle}>
            Choose your preferred format to download the tips data
          </Text>

          <View style={TipSummaryScreenStyles.exportOptionsContainer}>
            {/* PDF Option */}
            <TouchableOpacity
              style={TipSummaryScreenStyles.exportOption}
              onPress={() => handleExport("PDF")}
            >
              <View
                style={[
                  TipSummaryScreenStyles.exportIconContainer,
                  { backgroundColor: "#FEF2F2" },
                ]}
              >
                <FileText size={24} color="#EF4444" />
              </View>
              <View style={TipSummaryScreenStyles.exportOptionText}>
                <Text style={TipSummaryScreenStyles.exportOptionTitle}>
                  PDF
                </Text>
                <Text style={TipSummaryScreenStyles.exportOptionDescription}>
                  Formatted document ready for print
                </Text>
              </View>
            </TouchableOpacity>

            {/* CSV Option */}
            <TouchableOpacity
              style={TipSummaryScreenStyles.exportOption}
              onPress={() => handleExport("CSV")}
            >
              <View
                style={[
                  TipSummaryScreenStyles.exportIconContainer,
                  { backgroundColor: "#EFF6FF" },
                ]}
              >
                <FileSpreadsheet size={24} color="#3B82F6" />
              </View>
              <View style={TipSummaryScreenStyles.exportOptionText}>
                <Text style={TipSummaryScreenStyles.exportOptionTitle}>
                  CSV
                </Text>
                <Text style={TipSummaryScreenStyles.exportOptionDescription}>
                  Comma-separated values for analysis
                </Text>
              </View>
            </TouchableOpacity>

            {/* Excel Option */}
            <TouchableOpacity
              style={TipSummaryScreenStyles.exportOption}
              onPress={() => handleExport("Excel")}
            >
              <View
                style={[
                  TipSummaryScreenStyles.exportIconContainer,
                  { backgroundColor: "#F0FDF4" },
                ]}
              >
                <Download size={24} color="#22C55E" />
              </View>
              <View style={TipSummaryScreenStyles.exportOptionText}>
                <Text style={TipSummaryScreenStyles.exportOptionTitle}>
                  Excel
                </Text>
                <Text style={TipSummaryScreenStyles.exportOptionDescription}>
                  Spreadsheet format for calculations
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Location Filter Modal */}
      <LocationFilterModal
        visible={showFilterPanel}
        onClose={closeFilterPanel}
        onClear={clearAllFilters}
        onApply={applyFilters}
        allLocations={allLocations}
        pageFilter={pageFilter}
        toggleLocationFilter={toggleLocationFilter}
        title="Filter Tips Summary"
      />
    </SafeAreaView>
  );
};

export default SalesTipsScreen;
