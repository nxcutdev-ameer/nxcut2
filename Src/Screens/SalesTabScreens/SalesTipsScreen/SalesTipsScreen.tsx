import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Animated,
  ScrollView,
} from "react-native";
import React from "react";
import useSalesTipsScreenVM from "./SalesTipsScreenVM";
import { SafeAreaView } from "react-native-safe-area-context";
import SalesTipsScreenStyles from "./SalesTipsScreenStyles";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Search,
  FileText,
  Download,
  FileSpreadsheet,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import TipsTable from "../../../Components/TipsTable";
import { SelectPeriodModal } from "../SalesVoucherScreen/SelectPeriodModal";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const SalesTipsScreen = () => {
  const {
    navigation,
    salesTips,
    loading,
    showDateFilter,
    setShowDateFilter,
    pageFilter,
    updateDateFilter,
    getDateRangeText,
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
  } = useSalesTipsScreenVM();

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={SalesTipsScreenStyles.mainContainer}
    >
      {/* Fixed Header */}
      <View style={SalesTipsScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={SalesTipsScreenStyles.backArrow}
        >
          <ArrowLeft size={20} color={colors.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openExportBottomSheet}
          style={SalesTipsScreenStyles.addButton}
        >
          <Text style={SalesTipsScreenStyles.addButtonText}>Export</Text>
        </TouchableOpacity>
      </View>
      <View style={SalesTipsScreenStyles.titleSection}>
        <View style={SalesTipsScreenStyles.titleRow}>
          <Text style={SalesTipsScreenStyles.title}>Sales Tips</Text>
          <View style={SalesTipsScreenStyles.countBadge}>
            <Text style={SalesTipsScreenStyles.countText}>
              {filteredTipsData.length}
            </Text>
          </View>
        </View>
        <Text style={SalesTipsScreenStyles.subtitle}>
          View and filter tips received by your staff members. Learn more
        </Text>

        {/* Search Bar */}
        <View style={SalesTipsScreenStyles.searchContainer}>
          <Search size={18} color={colors.colors.textSecondary} />
          <TextInput
            style={SalesTipsScreenStyles.searchInput}
            placeholder="Search by staff name, tip ID, or payment method..."
            placeholderTextColor={colors.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Date Range Filter Button */}
        <TouchableOpacity
          onPress={() => setShowDateFilter(true)}
          style={SalesTipsScreenStyles.dateRangeButton}
        >
          <Calendar size={18} color={colors.colors.black} />
          <Text style={SalesTipsScreenStyles.dateRangeText}>
           {" "} {getDateRangeText()}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={SalesTipsScreenStyles.tableContainer}>
        {loading ? (
          <View style={SalesTipsScreenStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.colors.primary} />
            <Text style={SalesTipsScreenStyles.loadingText}>
              Loading tips...
            </Text>
          </View>
        ) : filteredTipsData.length > 0 ? (
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={true}
            style={SalesTipsScreenStyles.horizontalScroll}
          >
            <TipsTable tips={filteredTipsData} />
          </ScrollView>
        ) : (
          <View style={SalesTipsScreenStyles.emptyState}>
            <DollarSign size={64} color={colors.colors.textSecondary} />
            <Text style={SalesTipsScreenStyles.emptyTitle}>
              {searchQuery.trim()
                ? "No tips match your search"
                : "No tips found"}
            </Text>
            <Text style={SalesTipsScreenStyles.emptySubtitle}>
              {searchQuery.trim()
                ? "Try adjusting your search terms or date range"
                : "Tips received by staff members will appear here"}
            </Text>
          </View>
        )}
      </View>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateFilter}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SelectPeriodModal
          onClose={() => setShowDateFilter(false)}
          onApply={updateDateFilter}
          currentFromDate={pageFilter.start_date}
          currentToDate={pageFilter.end_date}
        />
      </Modal>

      {/* Backdrop overlay when bottom sheet is open */}
      {isBottomSheetOpen && (
        <TouchableWithoutFeedback onPress={closeExportBottomSheet}>
          <Animated.View
            style={[
              SalesTipsScreenStyles.backdrop,
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
        <BottomSheetView style={SalesTipsScreenStyles.bottomSheetContainer}>
          <Text style={SalesTipsScreenStyles.bottomSheetTitle}>
            Export Tips Report
          </Text>
          <Text style={SalesTipsScreenStyles.bottomSheetSubtitle}>
            Choose your preferred format to download the tips data
          </Text>

          <View style={SalesTipsScreenStyles.exportOptionsContainer}>
            {/* PDF Option */}
            <TouchableOpacity
              style={SalesTipsScreenStyles.exportOption}
              onPress={() => handleExport("PDF")}
            >
              <View
                style={[
                  SalesTipsScreenStyles.exportIconContainer,
                  { backgroundColor: "#FEF2F2" },
                ]}
              >
                <FileText size={24} color="#EF4444" />
              </View>
              <View style={SalesTipsScreenStyles.exportOptionText}>
                <Text style={SalesTipsScreenStyles.exportOptionTitle}>PDF</Text>
                <Text style={SalesTipsScreenStyles.exportOptionDescription}>
                  Formatted document ready for print
                </Text>
              </View>
            </TouchableOpacity>

            {/* CSV Option */}
            <TouchableOpacity
              style={SalesTipsScreenStyles.exportOption}
              onPress={() => handleExport("CSV")}
            >
              <View
                style={[
                  SalesTipsScreenStyles.exportIconContainer,
                  { backgroundColor: "#EFF6FF" },
                ]}
              >
                <FileSpreadsheet size={24} color="#3B82F6" />
              </View>
              <View style={SalesTipsScreenStyles.exportOptionText}>
                <Text style={SalesTipsScreenStyles.exportOptionTitle}>CSV</Text>
                <Text style={SalesTipsScreenStyles.exportOptionDescription}>
                  Comma-separated values for analysis
                </Text>
              </View>
            </TouchableOpacity>

            {/* Excel Option */}
            <TouchableOpacity
              style={SalesTipsScreenStyles.exportOption}
              onPress={() => handleExport("Excel")}
            >
              <View
                style={[
                  SalesTipsScreenStyles.exportIconContainer,
                  { backgroundColor: "#F0FDF4" },
                ]}
              >
                <Download size={24} color="#22C55E" />
              </View>
              <View style={SalesTipsScreenStyles.exportOptionText}>
                <Text style={SalesTipsScreenStyles.exportOptionTitle}>
                  Excel
                </Text>
                <Text style={SalesTipsScreenStyles.exportOptionDescription}>
                  Spreadsheet format for calculations
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default SalesTipsScreen;
