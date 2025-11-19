import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  financeRepository,
  FinanceSalesBO,
  SalePaymentMethod,
  ClientVoucher,
} from "../../../Repository/financeRepository";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";
interface SalesSection {
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  taxes: number;
  totalSales: number;
  giftCardSales: number;
  serviceCharges: number;
  tips: number;
  netOtherSales: number;
  taxOnOtherSales: number;
  totalOtherSales: number;
  totalSalesPlusOther: number;
  salesPaid: number;
  unpaidSales: number;
  // Payment method breakdowns
  cardPayments: number;
  onlinePayments: number;
  cashPayments: number;
  courtesyPayments: number;
  voucherPayments: number;
  totalPayments: number;
  paymentsForSalesInPeriod: number;
  paymentsForSalesInPreviousPeriods: number;
  upfrontPayments: number;
  upfrontPaymentRedemption: number;
  giftCardRedemption: number;
  totalRedemptions: number;
  redemptionsForSalesInPeriod: number;
  redemptionsForSalesInPreviousPeriods: number;
}
const useFinanceSummaryScreenVM = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [financeSalesData, setFinanceSalesData] = useState<FinanceSalesBO[]>([]);
  const [paymentData, setPaymentData] = useState<SalePaymentMethod[]>([]);
  const [voucherData, setVoucherData] = useState<ClientVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showMonthFilter, setShowMonthFilter] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Month");
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState<string>("Month to date");
  const [showDailyBreakdown, setShowDailyBreakdown] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<{
    fromDate: string;
    toDate: string;
  }>(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    return {
      fromDate: startOfMonth.toISOString(),
      toDate: endOfToday.toISOString(),
    };
  });

  const syncMonthToDate = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    setDateFilter({
      fromDate: startOfMonth.toISOString(),
      toDate: endOfToday.toISOString(),
    });

    setSelectedPeriod("Month");
    setSelectedPeriodLabel("Month to date");
    setShowDailyBreakdown(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncMonthToDate();
    }, [syncMonthToDate])
  );

  useEffect(() => {
    if (dateFilter.fromDate && dateFilter.toDate) {
      fetchAllFinanceData(dateFilter.fromDate, dateFilter.toDate);
    }
  }, [dateFilter]);

  const fetchAllFinanceData = async (fromDate: string, toDate: string) => {
    try {
      setLoading(true);

      // Convert to YYYY-MM-DD format for consistency
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startDate = formatDate(fromDate);
      const endDate = formatDate(toDate);

      // Fetch all finance data in parallel
      const [salesResponse, paymentResponse, voucherResponse] = await Promise.all([
        financeRepository.getFinanceSalesData(startDate, endDate),
        financeRepository.getFinanceDiscountData(startDate, endDate),
        financeRepository.getFinanceVoucherData(startDate, endDate)
      ]);

      // Update sales data
      if (salesResponse === null) {
        setFinanceSalesData([]);
      } else {
        setFinanceSalesData(salesResponse);
      }

      // Update payment data
      if (paymentResponse === null) {
        setPaymentData([]);
      } else {
        setPaymentData(paymentResponse);
      }

      // Update voucher data
      if (voucherResponse === null) {
        setVoucherData([]);
      } else {
        setVoucherData(voucherResponse);
      }

      console.log("Finance Sales Data:", salesResponse?.length || 0);
      console.log("Payment Data:", paymentResponse?.length || 0);
      console.log("Voucher Data:", voucherResponse?.length || 0);
    } catch (err) {
      console.log("FINANCEVM-ERROR", err);
      setFinanceSalesData([]);
      setPaymentData([]);
      setVoucherData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinanceSalesData = async (fromDate: string, toDate: string) => {
    // Keep this method for backward compatibility if needed elsewhere
    await fetchAllFinanceData(fromDate, toDate);
  };

  const updateDateFilter = useCallback((filter: { fromDate: string; toDate: string }) => {
    setDateFilter(filter);
  }, []);

  const generateDateRange = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handlePeriodSelection = useCallback((period: string) => {
    setSelectedPeriod(period);
    setSelectedPeriodLabel(period === "Month" ? "Month to date" : period);
    setShowPeriodPicker(false);
    setShowDailyBreakdown(true);

    // Only Quarter and Year modes are allowed to change the date range
    // Day, Week, Month modes only change the visualization/columns
    if (period === "Quarter") {
      // For Quarter mode: get entire current year data (Jan 1 - Dec 31)
      const now = new Date();
      const fromDate = new Date(now.getFullYear(), 0, 1);
      const toDate = new Date(now.getFullYear(), 11, 31);

      setDateFilter({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });
    } else if (period === "Year") {
      // For Year mode: get last 3 years data (current + 2 previous years)
      const now = new Date();
      const startYear = now.getFullYear() - 2;
      const fromDate = new Date(startYear, 0, 1);
      const toDate = new Date(now.getFullYear(), 11, 31);

      setDateFilter({
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      });
    }
    // For Day, Week, Month modes: do not change dateFilter
    // They will render columns based on the existing date range
  }, []);
  useEffect(() => {
    console.table(Object.entries(salesSection));
  }, []);
  function calculateSalesSection(salesData: FinanceSalesBO[], voucherData: ClientVoucher[], paymentData: SalePaymentMethod[]): SalesSection {
    const grossSales = salesData.reduce((sum, s) => sum + s.subtotal, 0);
    const discounts = salesData.reduce(
      (sum, s) =>
        sum +
        (s.discount_amount +
          s.voucher_discount +
          s.membership_discount +
          s.manual_discount),
      0
    );
    const refunds = salesData
      .filter((s) => s.is_voided)
      .reduce((sum, s) => sum + s.total_amount, 0);

    const netSales = grossSales - discounts - refunds;
    const taxes = salesData.reduce((sum, s) => sum + s.tax_amount, 0);
    const totalSales = netSales + taxes;

    const giftCardSales = voucherData.reduce(
      (sum, v) => sum + v.original_value,
      0
    );

    const serviceCharges = salesData.reduce(
      (sum, s) => sum + ((s as any)["service_charge"] || 0),
      0
    );

    const tips = salesData.reduce((sum, s) => sum + s.tip_amount, 0);
    const netOtherSales = giftCardSales + tips;
    const taxOnOtherSales = 0; // assuming not tracked
    const totalOtherSales = netOtherSales + taxOnOtherSales;
    const totalSalesPlusOther = totalSales + totalOtherSales;

    const salesPaid = salesData
      .filter((s) => s.total_amount > 0)
      .reduce((sum, s) => sum + s.total_amount, 0);

    const unpaidSales = salesData
      .filter((s) => s.total_amount === 0)
      .reduce((sum, s) => sum + s.total_amount, 0);

    // Payment method calculations
    const cardPayments = paymentData
      .filter((p) => p.payment_method.toLowerCase().includes('card'))
      .reduce((sum, p) => sum + p.amount, 0);

    const onlinePayments = paymentData
      .filter((p) => p.payment_method.toLowerCase().includes('online'))
      .reduce((sum, p) => sum + p.amount, 0);

    const cashPayments = paymentData
      .filter((p) => p.payment_method.toLowerCase().includes('cash'))
      .reduce((sum, p) => sum + p.amount, 0);

    const courtesyPayments = paymentData
      .filter((p) => p.payment_method.toLowerCase().includes('courtesy'))
      .reduce((sum, p) => sum + p.amount, 0);

    const voucherPayments = paymentData
      .filter((p) => p.payment_method.toLowerCase().includes('voucher'))
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPayments = paymentData.reduce((sum, p) => sum + p.amount, 0);

    // For now, set these to the total payments (can be refined based on business logic)
    const paymentsForSalesInPeriod = totalPayments;
    const paymentsForSalesInPreviousPeriods = 0;
    const upfrontPayments = 0;
    const upfrontPaymentRedemption = 0;
    const giftCardRedemption = voucherData.reduce((sum, v) => sum + v.original_value, 0);
    const totalRedemptions = giftCardRedemption;
    const redemptionsForSalesInPeriod = giftCardRedemption;
    const redemptionsForSalesInPreviousPeriods = 0;

    return {
      grossSales,
      discounts,
      refunds,
      netSales,
      taxes,
      totalSales,
      giftCardSales,
      serviceCharges,
      tips,
      netOtherSales,
      taxOnOtherSales,
      totalOtherSales,
      totalSalesPlusOther,
      salesPaid,
      unpaidSales,
      cardPayments,
      onlinePayments,
      cashPayments,
      courtesyPayments,
      voucherPayments,
      totalPayments,
      paymentsForSalesInPeriod,
      paymentsForSalesInPreviousPeriods,
      upfrontPayments,
      upfrontPaymentRedemption,
      giftCardRedemption,
      totalRedemptions,
      redemptionsForSalesInPeriod,
      redemptionsForSalesInPreviousPeriods,
    };
  }

  const salesSection = useMemo<SalesSection>(
    () => calculateSalesSection(financeSalesData || [], voucherData || [], paymentData || []),
    [financeSalesData, voucherData, paymentData]
  );

  // Helper function to check if date range matches mode requirements
  const isDateRangeValidForMode = useCallback((mode: string) => {
    switch (mode.toLowerCase()) {
      case 'month':
      case 'quarter':
      case 'year':
      default:
        // All modes now allow any date range
        return true;
    }
  }, []);

  // Generate dynamic columns based on mode and date range
  const generateDynamicColumns = useCallback(() => {
    if (!dateFilter.fromDate || !dateFilter.toDate) {
      console.log('generateDynamicColumns: No date filter');
      return [];
    }

    const startDate = new Date(dateFilter.fromDate);
    const endDate = new Date(dateFilter.toDate);
    const mode = selectedPeriod.toLowerCase();

    console.log('generateDynamicColumns:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      mode,
      selectedPeriod
    });

    // Check if date range is valid for the selected mode
    const isValid = isDateRangeValidForMode(mode);
    console.log('generateDynamicColumns - isDateRangeValid:', isValid);

    if (!isValid) {
      console.log('generateDynamicColumns: Date range not valid for mode, returning empty array');
      return []; // Only show Fields and Total columns
    }

    const columns: Array<{ key: string; title: string; startDate: Date; endDate: Date }> = [];

    switch (mode) {
      case 'day': {
        // Generate columns for each day
        const dateRange = generateDateRange(startDate, endDate);
        dateRange.forEach(dateStr => {
          const date = new Date(dateStr);
          columns.push({
            key: dateStr,
            title: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            startDate: date,
            endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1)
          });
        });
        break;
      }
      case 'week': {
        // Split date range into weeks
        let currentWeekStart = new Date(startDate);
        while (currentWeekStart <= endDate) {
          let currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

          // Don't go beyond end date
          if (currentWeekEnd > endDate) {
            currentWeekEnd = new Date(endDate);
          }

          const weekTitle = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${currentWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          columns.push({
            key: `week-${currentWeekStart.toISOString().split('T')[0]}`,
            title: weekTitle,
            startDate: new Date(currentWeekStart),
            endDate: new Date(currentWeekEnd.getTime() + 24 * 60 * 60 * 1000 - 1)
          });

          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        break;
      }
      case 'month': {
        // Generate columns for each month in the range, handling partial months
        const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const finalMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

        while (currentMonth <= finalMonth) {
          let monthStart: Date;
          let monthEnd: Date;

          // For the first month, start from the actual start date
          if (currentMonth.getTime() === new Date(startDate.getFullYear(), startDate.getMonth(), 1).getTime()) {
            monthStart = new Date(startDate);
          } else {
            monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          }

          // For the last month, end at the actual end date
          if (currentMonth.getTime() === new Date(endDate.getFullYear(), endDate.getMonth(), 1).getTime()) {
            monthEnd = new Date(endDate);
          } else {
            monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          }

          columns.push({
            key: `month-${currentMonth.getFullYear()}-${currentMonth.getMonth()}`,
            title: currentMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            startDate: monthStart,
            endDate: new Date(monthEnd.getTime() + 24 * 60 * 60 * 1000 - 1)
          });

          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }
        break;
      }
      case 'quarter': {
        // Four quarter columns for the entire year: Q1, Q2, Q3, Q4
        const currentYear = new Date().getFullYear();
        const quarters = [
          { key: 'Q1', title: 'Q1', start: 0, end: 2 },    // Jan-Mar
          { key: 'Q2', title: 'Q2', start: 3, end: 5 },    // Apr-Jun
          { key: 'Q3', title: 'Q3', start: 6, end: 8 },    // Jul-Sep
          { key: 'Q4', title: 'Q4', start: 9, end: 11 }    // Oct-Dec
        ];

        quarters.forEach(quarter => {
          const quarterStart = new Date(currentYear, quarter.start, 1);
          const quarterEnd = new Date(currentYear, quarter.end + 1, 0);

          columns.push({
            key: `quarter-${quarter.key}`,
            title: quarter.title,
            startDate: quarterStart,
            endDate: new Date(quarterEnd.getTime() + 24 * 60 * 60 * 1000 - 1)
          });
        });
        break;
      }
      case 'year': {
        // Three year columns: current year and 2 previous years
        const currentYear = new Date().getFullYear();
        for (let i = 2; i >= 0; i--) {
          const year = currentYear - i;
          const yearStart = new Date(year, 0, 1);
          const yearEnd = new Date(year, 11, 31);

          columns.push({
            key: `year-${year}`,
            title: year.toString(),
            startDate: yearStart,
            endDate: new Date(yearEnd.getTime() + 24 * 60 * 60 * 1000 - 1)
          });
        }
        break;
      }
    }

    console.log('generateDynamicColumns - Generated columns:', columns);
    return columns;
  }, [dateFilter, selectedPeriod, isDateRangeValidForMode]);

  const dynamicColumns = useMemo(() => generateDynamicColumns(), [generateDynamicColumns]);

  // Check if date range selection should be disabled
  const isDateRangeSelectionDisabled = useCallback(() => {
    return selectedPeriod === "Quarter" || selectedPeriod === "Year";
  }, [selectedPeriod]);

  // Handle disabled date range button press
  const handleDisabledDateRangePress = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return {
      showToast: true,
      message: "Change page mode to select date range",
      type: "warning" as const
    };
  }, []);

  // Format date range for display
  const getDateRangeText = useCallback(() => {
    if (!dateFilter.fromDate || !dateFilter.toDate) {
      return "Select Date Range";
    }

    const startDate = new Date(dateFilter.fromDate);
    const endDate = new Date(dateFilter.toDate);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: startDate.getFullYear() !== endDate.getFullYear() ? "numeric" : undefined
      });
    };

    // Check if it's the same day
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(startDate);
    }

    // Check if it's the same month and year
    if (startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleDateString("en-US", { month: "short" })}`;
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }, [dateFilter]);

  const dailyBreakdown = useMemo(() => {
    if (!showDailyBreakdown || !dateFilter.fromDate || !dateFilter.toDate || dynamicColumns.length === 0) return {};

    const breakdown: { [columnKey: string]: SalesSection } = {};

    dynamicColumns.forEach(column => {
      const columnSalesData = financeSalesData.filter(sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= column.startDate && saleDate <= column.endDate;
      });

      const columnPaymentData = paymentData.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= column.startDate && paymentDate <= column.endDate;
      });

      const columnVoucherData = voucherData.filter(voucher => {
        const voucherDate = new Date(voucher.purchase_date);
        return voucherDate >= column.startDate && voucherDate <= column.endDate;
      });

      breakdown[column.key] = calculateSalesSection(columnSalesData, columnVoucherData, columnPaymentData);
    });

    return breakdown;
  }, [financeSalesData, voucherData, paymentData, dynamicColumns, showDailyBreakdown]);

  // Export functionality similar to PaymentTransactionsScreen
  const formatDataForExport = () => {
    return Object.entries(salesSection).map(([key, value]) => ({
      "Metric": key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      "Amount": typeof value === 'number' ? `$${value.toFixed(2)}` : value
    }));
  };

  const generateCSV = (data: any[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => `"${String(row[header]).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    return csvContent;
  };

  const generateHTML = (data: any[]) => {
    if (data.length === 0) return "<html><body><p>No data available</p></body></html>";
    const headers = Object.keys(data[0]);
    const tableRows = data
      .map(
        (row) =>
          `<tr>${headers.map(header => `<td>${row[header]}</td>`).join("")}</tr>`
      )
      .join("");

    return `
      <html>
        <head>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Finance Summary Report</h2>
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;
  };

  const handleExport = async (type: "CSV" | "Excel" | "PDF") => {
    try {
      const formattedData = formatDataForExport();
      const timestamp = new Date().toISOString().split("T")[0];
      let fileContent = "";
      let fileName = "";
      let mimeType = "";

      switch (type) {
        case "CSV":
          fileContent = generateCSV(formattedData);
          fileName = `finance_summary_${timestamp}.csv`;
          mimeType = "text/csv";
          break;
        case "Excel":
          fileContent = generateCSV(formattedData);
          fileName = `finance_summary_${timestamp}.xls`;
          mimeType = "application/vnd.ms-excel";
          break;
        case "PDF":
          const htmlContent = generateHTML(formattedData);
          const { uri: pdfUri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
          });
          fileName = `finance_summary_${timestamp}.pdf`;

          const finalPdfUri = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.copyAsync({
            from: pdfUri,
            to: finalPdfUri,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(finalPdfUri, {
              mimeType: "application/pdf",
              dialogTitle: `Export Finance Summary as PDF`,
            });
          } else {
            Alert.alert("Success", `PDF saved as ${fileName}`);
          }

          setShowExportModal(false);
          return;
        default:
          Alert.alert("Error", "Unsupported export format");
          return;
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export Finance Summary as ${type}`,
        });
      } else {
        Alert.alert("Success", `File saved as ${fileName}`);
      }

      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    }
  };

  return {
    navigation,
    salesSection,
    dailyBreakdown,
    dynamicColumns,
    showDailyBreakdown,
    paymentData,
    voucherData,
    loading,
    showMonthFilter,
    setShowMonthFilter,
    showExportModal,
    setShowExportModal,
    showPeriodPicker,
    setShowPeriodPicker,
    selectedPeriod,
    dateFilter,
    updateDateFilter,
    handlePeriodSelection,
    handleExport,
    fetchFinanceSalesData,
    isDateRangeSelectionDisabled,
    handleDisabledDateRangePress,
    getDateRangeText,
    selectedPeriodLabel
  };
};

export default useFinanceSummaryScreenVM;
