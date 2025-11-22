import React, { FC, ReactElement, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { colors } from "../../../Constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWidthEquivalent } from "../../../Utils/helpers";
import {
  ChevronLeft,
  EllipsisVertical,
  FileArchive,
  FileSpreadsheet,
  FileText,
  DollarSign,
  X,
  SlidersVertical,
} from "lucide-react-native";
import SelectPeriodModal from "../../../Components/SelectPeriodModal";
import LottieView from "lottie-react-native";
import useFinanceSummaryScreenVM from "./FinanceSummaryScreenVM";
import { styles } from "./FinanceSummaryScreenStyles";
import { useToast } from "../../../Hooks/useToast";
import CustomToast from "../../../Components/CustomToast";

const FinanceSummaryScreen = () => {
  const { toast, hideToast, showToast } = useToast();
  const {
    navigation,
    salesSection,
    dailyBreakdown,
    dynamicColumns,
    showDailyBreakdown,
    loading,
    showMonthFilter,
    setShowMonthFilter,
    showExportModal,
    setShowExportModal,
    showPeriodPicker,
    setShowPeriodPicker,
    selectedPeriod,
    selectedPeriodLabel,
    dateFilter,
    updateDateFilter,
    handlePeriodSelection,
    handleExport,
    isDateRangeSelectionDisabled,
    handleDisabledDateRangePress,
    getDateRangeText,
  } = useFinanceSummaryScreenVM();

  // Handle month to date button press
  const handleMonthToDatePress = () => {
    if (isDateRangeSelectionDisabled()) {
      const result = handleDisabledDateRangePress();
      showToast(result.message, result.type);
    } else {
      setShowMonthFilter(true);
    }
  };

  if (showMonthFilter) {
    return (
      <SelectPeriodModal
        visible={showMonthFilter}
        onClose={() => setShowMonthFilter(false)}
        onApply={updateDateFilter}
        initialFromDate={dateFilter.fromDate}
        initialToDate={dateFilter.toDate}
      />
    );
  }

  // Table components
  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderText, styles.salesColumn]}>Fields</Text>
      <Text style={[styles.tableHeaderText, styles.totalColumn]}>Total</Text>
    </View>
  );

  const TableRow: FC<{
    label: string;
    amount: number;
    isLast?: boolean;
    isHighlighted?: boolean;
    isIndented?: boolean;
    textColor?: "blue" | "red";
  }> = ({
    label,
    amount,
    isLast = false,
    isHighlighted = false,
    isIndented = false,
    textColor,
  }) => {
    const getAmountTextStyle = () => {
      if (isHighlighted) return styles.tableCellTextHighlighted;
      if (textColor === "red") return styles.tableCellTextRed;
      // For blue text labels, keep amount black
      return styles.tableCellText;
    };

    return (
      <View
        style={[
          styles.tableRow,
          isLast && styles.tableRowLast,
          isHighlighted && styles.tableRowHighlighted,
        ]}
      >
        {/* <Text
          style={[
            getLabelTextStyle(),
            isIndented ? styles.salesColumnIndented : styles.salesColumn,
          ]}
        >
          {label}
        </Text> */}
        <Text style={[getAmountTextStyle(), styles.totalColumn]}>
          AED{" "}
          {amount.toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </Text>
      </View>
    );
  };

  // Dynamic Breakdown Table Components
  const DynamicBreakdownTable = () => {
    const fields = [
      {
        key: "grossSales",
        label: "Gross sales",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "discounts",
        label: "Discounts",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "refunds",
        label: "Refunds / Returns",
        isIndented: true,
        textColor: "blue" as const,
      },
      { key: "netSales", label: "Net sales", isHighlighted: true },
      {
        key: "taxes",
        label: "Taxes",
        isIndented: true,
        textColor: "blue" as const,
      },
      { key: "totalSales", label: "Total sales", isHighlighted: true },
      {
        key: "giftCardSales",
        label: "Gift card sales",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "serviceCharges",
        label: "Service charges",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "tips",
        label: "Tips",
        isIndented: true,
        textColor: "blue" as const,
      },
      { key: "netOtherSales", label: "Net other sales", isHighlighted: true },
      {
        key: "taxOnOtherSales",
        label: "Tax on other sales",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "totalOtherSales",
        label: "Total other sales",
        isHighlighted: true,
      },
      {
        key: "totalSalesPlusOther",
        label: "Total sales + other sales",
        isHighlighted: true,
      },
      {
        key: "salesPaid",
        label: "Sales paid in period",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "unpaidSales",
        label: "Unpaid sales in period",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "cardPayments",
        label: "Card",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "onlinePayments",
        label: "Online",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "cashPayments",
        label: "Cash",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "courtesyPayments",
        label: "Courtesy",
        isIndented: true,
        textColor: "blue" as const,
      },
      { key: "totalPayments", label: "Total payments", isHighlighted: true },
      {
        key: "paymentsForSalesInPeriod",
        label: "Payments for sales in period",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "paymentsForSalesInPreviousPeriods",
        label: "Payments for sales in previous periods",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "upfrontPayments",
        label: "Upfront payments",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "upfrontPaymentRedemption",
        label: "Upfront payment redemption",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "giftCardRedemption",
        label: "Gift card redemption",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "totalRedemptions",
        label: "Total redemptions",
        isHighlighted: true,
      },
      {
        key: "redemptionsForSalesInPeriod",
        label: "Redemptions for sales in period",
        isIndented: true,
        textColor: "blue" as const,
      },
      {
        key: "redemptionsForSalesInPreviousPeriods",
        label: "Redemptions for sales in previous periods",
        isIndented: true,
        textColor: "blue" as const,
      },
    ];

    // if (dynamicColumns.length === 0) {
    //   // Only show Fields and Total columns when no dynamic columns
    //   return (
    //     <View style={styles.tableContainer}>
    //       {/* <TableHeader /> */}
    //       {/* {fields.map((field, index) => (
    //         <TableRow
    //           key={field.key}
    //           label={field.label}
    //           amount={
    //             (salesSection[
    //               field.key as keyof typeof salesSection
    //             ] as number) || 0
    //           }
    //           isIndented={field.isIndented}
    //           textColor={field.textColor}
    //           isHighlighted={field.isHighlighted}
    //           isLast={index === fields.length - 1}
    //         />
    //       ))} */}
    //     </View>
    //   );
    // }

    // Calculate column widths
    const totalColumnWidth = getWidthEquivalent(125);
    const dynamicColumnWidth = getWidthEquivalent(125);
    const scrollableColumnsWidth =
      totalColumnWidth + dynamicColumns.length * dynamicColumnWidth;

    // Debug logging
    console.log(
      "DynamicBreakdownTable - dynamicColumns count:",
      dynamicColumns.length
    );
    console.log("DynamicBreakdownTable - dynamicColumns:", dynamicColumns);
    console.log("DynamicBreakdownTable - selectedPeriod:", selectedPeriod);
    console.log(
      "DynamicBreakdownTable - scrollableColumnsWidth:",
      scrollableColumnsWidth
    );

    return (
      <View style={styles.stickyTableContainer}>
        {/* Overall Vertical ScrollView */}
        <ScrollView
          style={styles.overallVerticalScroll}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.tableMainWrapper}>
            {/* First Container: Fixed Fields (No Horizontal Scroll) */}
            <View style={styles.fixedFieldsContainer}>
              {/* Fixed Fields Header */}
              <View style={styles.fieldHeaderCell}>
                <Text
                  style={[styles.tableHeaderText, styles.fieldCellTextLeft]}
                >
                  Fields
                </Text>
              </View>

              {/* Fixed Fields Rows */}
              {fields.map((field, fieldIndex) => (
                <View
                  key={field.key}
                  style={[
                    styles.fieldRowCell,
                    field.isHighlighted && styles.tableRowHighlighted,
                    fieldIndex === fields.length - 1 && styles.tableRowLast,
                  ]}
                >
                  <Text
                    style={[
                      field.isHighlighted
                        ? styles.tableCellTextHighlighted
                        : field.textColor === "blue"
                        ? styles.tableCellTextBlue
                        : field.textColor === "red"
                        ? styles.tableCellTextRed
                        : styles.tableCellText,
                      field.isIndented && styles.salesColumnIndented,
                      styles.fieldCellTextLeft,
                    ]}
                  >
                    {field.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Second Container: Non-Scrollable (Total + Dynamic Columns) */}
            <View style={styles.scrollableDataContainer}>
              <View style={styles.scrollableDataWrapper}>
                {/* Headers Container (Total + Dynamic Headers) */}
                <View style={styles.scrollableHeadersContainer}>
                  {/* Total Header */}
                  <View
                    style={[
                      styles.scrollableHeaderCell,
                      { width: totalColumnWidth },
                    ]}
                  >
                    <Text style={styles.tableHeaderText}>Total</Text>
                  </View>
                  {/* Dynamic Column Headers */}
                  {dynamicColumns.map((column) => (
                    <View
                      key={column.key}
                      style={[
                        styles.scrollableHeaderCell,
                        { width: dynamicColumnWidth },
                      ]}
                    >
                      <Text style={styles.tableHeaderText}>{column.title}</Text>
                    </View>
                  ))}
                </View>

                {/* Data Rows Container (Total + Dynamic Data) */}
                <View style={styles.scrollableDataRowsContainer}>
                  {fields.map((field, fieldIndex) => (
                    <View
                      key={field.key}
                      style={[
                        styles.scrollableDataRow,
                        field.isHighlighted && styles.tableRowHighlighted,
                        fieldIndex === fields.length - 1 && styles.tableRowLast,
                      ]}
                    >
                      {/* Total Column */}
                      <View
                        style={[
                          styles.scrollableDataCell,
                          { width: totalColumnWidth },
                        ]}
                      >
                        <Text
                          style={[
                            field.isHighlighted
                              ? styles.tableCellTextHighlighted
                              : styles.tableCellText,
                            styles.dailyAmountText,
                          ]}
                        >
                          AED{" "}
                          {(
                            (salesSection[
                              field.key as keyof typeof salesSection
                            ] as number) || 0
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}
                        </Text>
                      </View>
                      {/* Dynamic Columns */}
                      {dynamicColumns.map((column) => (
                        <View
                          key={`${field.key}-${column.key}`}
                          style={[
                            styles.scrollableDataCell,
                            { width: dynamicColumnWidth },
                          ]}
                        >
                          <Text
                            style={[
                              field.isHighlighted
                                ? styles.tableCellTextHighlighted
                                : styles.tableCellText,
                              styles.dailyAmountText,
                            ]}
                          >
                            AED{" "}
                            {(
                              (dailyBreakdown[column.key]?.[
                                field.key as keyof (typeof dailyBreakdown)[string]
                              ] as number) || 0
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      {/* Header Navigation */}
      <View style={styles.headNav}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={20}
          style={styles.back}
        >
          <ChevronLeft size={25} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log("EllipsisVertical pressed");
              setShowExportModal(true);
            }}
            hitSlop={10}
          >
            <EllipsisVertical style={styles.ellipsis as any} size={25} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Finance Summary</Text>
        <Text style={styles.subHeaderText}>
          Comprehensive financial overview and sales analytics.
        </Text>
        <View style={styles.headerActions}>
          {/* <TouchableOpacity
            onPress={showComingSoon}
            style={[styles.button, { width: getWidthEquivalent(60) }]}
          >
            <SlidersVertical size={20} />
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            onPress={() => {setShowPeriodPicker(true)}}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{selectedPeriodLabel}</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={handleMonthToDatePress}
            style={[
              styles.button,
              isDateRangeSelectionDisabled() && { opacity: 0.5 },
            ]}
          >
            <SlidersVertical size={18} color={colors.text} />
            <Text
              style={[
                styles.buttonText,
                isDateRangeSelectionDisabled() && {
                  color: colors.textSecondary,
                },
              ]}
            >
              {" "}
              {getDateRangeText()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <LottieView
              source={{
                uri: "https://lottie.host/92d6a904-9ded-41b4-96f0-4632d03e9932/M8v4CyMIGB.lottie",
              }}
              autoPlay
              loop
              style={styles.loadingLottie}
            />
            <Text style={styles.loadingText}>Loading financial data...</Text>
          </View>
        ) : showDailyBreakdown ? (
          <View style={styles.dailyBreakdownWrapper}>
            <DynamicBreakdownTable />
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <TableHeader />
            <View style={styles.tableBody}>
              <TableRow
                label="Gross sales"
                amount={salesSection.grossSales}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Discounts"
                amount={salesSection.discounts}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Refunds / Returns"
                amount={salesSection.refunds}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Sales paid in period"
                amount={salesSection.salesPaid}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Unpaid sales in period"
                amount={salesSection.unpaidSales}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Card"
                amount={salesSection.cardPayments}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Online"
                amount={salesSection.onlinePayments}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Cash"
                amount={salesSection.cashPayments}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Courtesy"
                amount={salesSection.courtesyPayments}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Total payments"
                amount={salesSection.totalPayments}
                isHighlighted={true}
              />
              <TableRow
                label="Payments for sales in period"
                amount={salesSection.paymentsForSalesInPeriod}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Payments for sales in previous periods"
                amount={salesSection.paymentsForSalesInPreviousPeriods}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Upfront payments"
                amount={salesSection.upfrontPayments}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Upfront payment redemption"
                amount={salesSection.upfrontPaymentRedemption}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Gift card redemption"
                amount={salesSection.giftCardRedemption}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Total redemptions"
                amount={salesSection.totalRedemptions}
                isHighlighted={true}
              />
              <TableRow
                label="Redemptions for sales in period"
                amount={salesSection.redemptionsForSalesInPeriod}
                isIndented={true}
                textColor="blue"
              />
              <TableRow
                label="Redemptions for sales in previous periods"
                amount={salesSection.redemptionsForSalesInPreviousPeriods}
                isIndented={true}
                textColor="blue"
                isLast={true}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExportModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Finance Summary</Text>
              <TouchableOpacity
                onPress={() => setShowExportModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Export Options */}
            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExport("CSV")}
              >
                <FileText size={32} color={colors.success} />
                <Text style={styles.exportOptionTitle}>CSV</Text>
                <Text style={styles.exportOptionDescription}>
                  Comma-separated values format
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExport("Excel")}
              >
                <FileSpreadsheet size={32} color={colors.primary} />
                <Text style={styles.exportOptionTitle}>Excel</Text>
                <Text style={styles.exportOptionDescription}>
                  Microsoft Excel format
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExport("PDF")}
              >
                <FileArchive size={32} color={colors.danger} />
                <Text style={styles.exportOptionTitle}>PDF</Text>
                <Text style={styles.exportOptionDescription}>
                  Portable Document Format
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Period Picker Modal */}
      <Modal
        visible={showPeriodPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPeriodPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Period</Text>
              <TouchableOpacity
                onPress={() => setShowPeriodPicker(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Period Options */}
            {/* <View style={styles.exportOptions}>
              {["Day", "Week", "Month", "Quarter", "Year"].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.exportOption,
                    selectedPeriod === period && {
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={() => handlePeriodSelection(period)}
                >
                  <Text
                    style={[
                      styles.exportOptionTitle,
                      selectedPeriod === period && { color: colors.primary },
                    ]}
                  >
                    {period}
                  </Text>
                  <Text style={styles.exportOptionDescription}>
                    {period === "Day" && "Current day"}
                    {period === "Week" && "Current week (Sunday to Saturday)"}
                    {period === "Month" && "Current month"}
                    {period === "Quarter" && "Current quarter"}
                    {period === "Year" && "Current year"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View> */}
          </View>
        </SafeAreaView>
      </Modal>
      {/* <CustomToast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={hideToast}
      /> */}
    </SafeAreaView>
  );
};

export default FinanceSummaryScreen;
