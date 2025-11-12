import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import React from "react";
import useSalesVoucherScreenVM from "./SalesVoucherScreenVM";
import { SafeAreaView } from "react-native-safe-area-context";
import SalesVoucherScreenStyles from "./SalesVoucherScreenStyles";
import {
  ArrowLeft,
  Gift,
  Calendar,
  Search,
  FileText,
  Download,
  FileSpreadsheet,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import {
  ClientVoucher,
  VoucherUsage,
} from "../../../Repository/clientRepository";
import VoucherCard from "../../../Components/VoucherCard";
import { SelectPeriodModal } from "./SelectPeriodModal";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const SalesVoucherScreen = () => {
  const {
    navigation,
    voucherData,
    voucherUsageData,
    loading,
    showDateFilter,
    setShowDateFilter,
    pageFilter,
    updateDateFilter,
    getDateRangeText,
    searchQuery,
    setSearchQuery,
    filteredVoucherData,
    bottomSheetRef,
    handleSheetChanges,
    openExportBottomSheet,
    closeExportBottomSheet,
    handleExport,
    isBottomSheetOpen,
    backdropOpacity,
  } = useSalesVoucherScreenVM();

  // Helper function to get usage data for a specific voucher
  const getVoucherUsage = (voucherId: string): VoucherUsage | undefined => {
    return voucherUsageData.find(
      (usage) => usage.client_voucher_id === voucherId
    );
  };
  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={SalesVoucherScreenStyles.mainContainer}
    >
      {/* Fixed Header */}
      <View style={SalesVoucherScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={SalesVoucherScreenStyles.backArrow}
        >
          <ArrowLeft size={28} color={colors.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openExportBottomSheet}
          style={SalesVoucherScreenStyles.addButton}
        >
          <Text style={SalesVoucherScreenStyles.addButtonText}>Export</Text>
        </TouchableOpacity>
      </View>
      <View style={SalesVoucherScreenStyles.titleSection}>
        <View style={SalesVoucherScreenStyles.titleRow}>
          <Text style={SalesVoucherScreenStyles.title}>Vouchers sold</Text>
          <View style={SalesVoucherScreenStyles.countBadge}>
            <Text style={SalesVoucherScreenStyles.countText}>
              {filteredVoucherData.length}
            </Text>
          </View>
        </View>
        <Text style={SalesVoucherScreenStyles.subtitle}>
          View and filter vouchers purchased by your clients. Learn more
        </Text>

        {/* Search Bar */}
        <View style={SalesVoucherScreenStyles.searchContainer}>
          <Search size={18} color={colors.colors.textSecondary} />
          <TextInput
            style={SalesVoucherScreenStyles.searchInput}
            placeholder="Search by client name, voucher name, or code..."
            placeholderTextColor={colors.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Date Range Filter Button */}
        <TouchableOpacity
          onPress={() => setShowDateFilter(true)}
          style={SalesVoucherScreenStyles.dateRangeButton}
        >
          <Calendar size={18} color={colors.colors.primary} />
          <Text style={SalesVoucherScreenStyles.dateRangeText}>
            {getDateRangeText()}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={SalesVoucherScreenStyles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={SalesVoucherScreenStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.colors.primary} />
            <Text style={SalesVoucherScreenStyles.loadingText}>
              Loading vouchers...
            </Text>
          </View>
        ) : filteredVoucherData.length > 0 ? (
          filteredVoucherData.map((voucher: ClientVoucher, index: any) => (
            <VoucherCard
              key={voucher.id || index}
              voucher={voucher}
              voucherUsage={getVoucherUsage(voucher.id)}
            />
          ))
        ) : (
          <View style={SalesVoucherScreenStyles.emptyState}>
            <Gift size={64} color={colors.colors.textSecondary} />
            <Text style={SalesVoucherScreenStyles.emptyTitle}>
              {searchQuery.trim()
                ? "No vouchers match your search"
                : "No vouchers found"}
            </Text>
            <Text style={SalesVoucherScreenStyles.emptySubtitle}>
              {searchQuery.trim()
                ? "Try adjusting your search terms or date range"
                : "Vouchers purchased by clients will appear here"}
            </Text>
          </View>
        )}
      </ScrollView>

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
              SalesVoucherScreenStyles.backdrop,
              { opacity: backdropOpacity }
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
        <BottomSheetView style={SalesVoucherScreenStyles.bottomSheetContainer}>
          <Text style={SalesVoucherScreenStyles.bottomSheetTitle}>
            Export Voucher Report
          </Text>
          <Text style={SalesVoucherScreenStyles.bottomSheetSubtitle}>
            Choose your preferred format to download the voucher data
          </Text>

          <View style={SalesVoucherScreenStyles.exportOptionsContainer}>
            {/* PDF Option */}
            <TouchableOpacity
              style={SalesVoucherScreenStyles.exportOption}
              onPress={() => handleExport("PDF")}
            >
              <View
                style={[
                  SalesVoucherScreenStyles.exportIconContainer,
                  { backgroundColor: "#FEF2F2" },
                ]}
              >
                <FileText size={24} color="#EF4444" />
              </View>
              <View style={SalesVoucherScreenStyles.exportOptionText}>
                <Text style={SalesVoucherScreenStyles.exportOptionTitle}>
                  PDF
                </Text>
                <Text style={SalesVoucherScreenStyles.exportOptionDescription}>
                  Formatted document ready for print
                </Text>
              </View>
            </TouchableOpacity>

            {/* CSV Option */}
            <TouchableOpacity
              style={SalesVoucherScreenStyles.exportOption}
              onPress={() => handleExport("CSV")}
            >
              <View
                style={[
                  SalesVoucherScreenStyles.exportIconContainer,
                  { backgroundColor: "#EFF6FF" },
                ]}
              >
                <FileSpreadsheet size={24} color="#3B82F6" />
              </View>
              <View style={SalesVoucherScreenStyles.exportOptionText}>
                <Text style={SalesVoucherScreenStyles.exportOptionTitle}>
                  CSV
                </Text>
                <Text style={SalesVoucherScreenStyles.exportOptionDescription}>
                  Comma-separated values for analysis
                </Text>
              </View>
            </TouchableOpacity>

            {/* Excel Option */}
            <TouchableOpacity
              style={SalesVoucherScreenStyles.exportOption}
              onPress={() => handleExport("Excel")}
            >
              <View
                style={[
                  SalesVoucherScreenStyles.exportIconContainer,
                  { backgroundColor: "#F0FDF4" },
                ]}
              >
                <Download size={24} color="#22C55E" />
              </View>
              <View style={SalesVoucherScreenStyles.exportOptionText}>
                <Text style={SalesVoucherScreenStyles.exportOptionTitle}>
                  Excel
                </Text>
                <Text style={SalesVoucherScreenStyles.exportOptionDescription}>
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

export default SalesVoucherScreen;
