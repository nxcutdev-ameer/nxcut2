import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState, useRef, useCallback } from "react";
import { Alert } from "react-native";
import { paymentRepository } from "../../../Repository/paymentsRepository";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { useAuthStore } from "../../../Store/useAuthStore";
import BottomSheet from "@gorhom/bottom-sheet";

export const useDailySalesScreenVM = () => {
  const navigation: NavigationProp<any> = useNavigation();
  const [payments, setPayments] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Page filter state for location filtering
  // const [pageFilter, setPageFilter] = useState({
  //   location_ids: [] as string[],
  // });

  // Filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Bottom sheet ref and state
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);

  // Auth store access
  const { allLocations } = useAuthStore();
  const [pageFilter, setPageFilter] = useState({
    location_ids: allLocations.map((location) => location.id),
  });
  useEffect(() => {
    fetchDataForDate(selectedDate);
  }, []);

  useEffect(() => {
    fetchDataForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchDataForDate(selectedDate);
  }, [pageFilter]);

  const fetchDataForDate = async (date: Date) => {
    try {
      setLoading(true);
      const dateString = date.toISOString().split("T")[0];

      // Get location IDs from pageFilter, or use empty array to get all locations
      const locationIds =
        pageFilter.location_ids.length > 0
          ? pageFilter.location_ids
          : undefined;

      // Fetch both payments and sale items with location filtering
      const [paymentsData, saleItemsData] = await Promise.all([
        paymentRepository.getSalePaymentsByDate(dateString, locationIds),
        paymentRepository.getSaleItemsByDate(dateString, locationIds),
      ]);

      setPayments(paymentsData || []);
      setSaleItems(saleItemsData || []);
      console.log("[SALES-DATA]", paymentsData);
      console.log("[SALE-ITEMS-DATA]", saleItemsData);
    } catch (error) {
      console.error("[SALES-VM] Error fetching data:", error);
      setPayments([]);
      setSaleItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    await fetchDataForDate(selectedDate);
  };

  const updateSelectedDate = (date: Date) => {
    setSelectedDate(date);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatDateForFilename = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const generateSaleItemsSummary = () => {
    const itemSummary: { [key: string]: { quantity: number; total: number } } =
      {};

    // Sort sale items by time before processing
    const sortedSaleItems = [...saleItems].sort(
      (a, b) =>
        new Date(a.sales.created_at).getTime() -
        new Date(b.sales.created_at).getTime()
    );

    sortedSaleItems.forEach((item) => {
      const itemType = item.item_type;
      if (itemSummary[itemType]) {
        itemSummary[itemType].quantity += 1;
        itemSummary[itemType].total += item.total_price;
      } else {
        itemSummary[itemType] = {
          quantity: 1,
          total: item.total_price,
        };
      }
    });

    return itemSummary;
  };

  // Helper function to handle duplicate sales and tips
  const processPaymentsForTips = () => {
    const seenSaleIds = new Set();
    const tipsProcessed: { [saleId: string]: boolean } = {};
    const tipTransactions: any[] = [];

    return payments.map((payment) => {
      const saleId = payment.sales.id;
      const tipAmount = payment.sales.tip_amount || 0;

      // Check if this is a tip transaction (amount matches tip_amount)
      const isTipTransaction =
        Math.abs(payment.amount - tipAmount) < 0.01 && tipAmount > 0;

      if (isTipTransaction) {
        // This is a separate tip transaction
        tipTransactions.push({
          ...payment,
          isTipTransaction: true,
        });
        return {
          ...payment,
          adjustedTipAmount: 0, // Don't double count tip
          isTipTransaction: true,
        };
      }

      // For regular transactions, only add tip once per sale ID
      if (!tipsProcessed[saleId] && tipAmount > 0) {
        tipsProcessed[saleId] = true;
        return {
          ...payment,
          adjustedTipAmount: tipAmount,
          isTipTransaction: false,
        };
      }

      return {
        ...payment,
        adjustedTipAmount: 0, // No tip for duplicate sale IDs
        isTipTransaction: false,
      };
    });
  };

  const generateCashMovementSummary = () => {
    const paymentTypes: { [key: string]: number } = {};
    const processedPayments = processPaymentsForTips();

    processedPayments.forEach((item) => {
      const paymentMethod = item.payment_method;
      const totalAmount = item.amount + (item.adjustedTipAmount || 0);

      if (paymentTypes[paymentMethod]) {
        paymentTypes[paymentMethod] += totalAmount;
      } else {
        paymentTypes[paymentMethod] = totalAmount;
      }
    });

    return paymentTypes;
  };

  const exportAsCSV = async () => {
    try {
      console.log("[EXPORT-CSV] Starting CSV export...");
      console.log("[EXPORT-CSV] Payments count:", payments.length);
      console.log("[EXPORT-CSV] Sale items count:", saleItems.length);

      // Check if there's any data to export
      if (payments.length === 0 && saleItems.length === 0) {
        Alert.alert(
          "No Data Available",
          "There are no sales transactions for the selected date. Please choose a different date or check your filters.",
          [{ text: "OK" }]
        );
        return;
      }

      const dateStr = formatDateForFilename(selectedDate);
      const saleItemsSummary = generateSaleItemsSummary();
      const cashMovementSummary = generateCashMovementSummary();
      const processedPayments = processPaymentsForTips();

      console.log("[EXPORT-CSV] Sale items summary:", Object.keys(saleItemsSummary).length, "types");
      console.log("[EXPORT-CSV] Cash movement summary:", Object.keys(cashMovementSummary).length, "payment types");
      console.log("[EXPORT-CSV] Processed payments:", processedPayments.length);

      // Sort processed payments by time (oldest to newest)
      const sortedPayments = [...processedPayments].sort(
        (a, b) =>
          new Date(a.sales.created_at).getTime() -
          new Date(b.sales.created_at).getTime()
      );

      // Create CSV content
      let csvContent = `Sales Report - ${selectedDate.toLocaleDateString()}\n\n`;

      // Sale Items Summary Section
      csvContent += "Sale Item Summary\n";
      csvContent += "Item Type,Sales Qty,Gross Total\n";

      Object.entries(saleItemsSummary).forEach(([itemType, data]) => {
        csvContent += `${itemType},${data.quantity},${formatCurrency(
          data.total
        )}\n`;
      });

      const totalSaleItems = saleItems.length;
      const totalSaleItemsValue = saleItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      );
      csvContent += `\nTotal Items Sold,${totalSaleItems},${formatCurrency(
        totalSaleItemsValue
      )}\n\n`;

      // Transaction Summary Section
      csvContent += "Transaction Summary\n";
      csvContent += "Time,Payment Method,Amount,Tip,Total\n";

      sortedPayments.forEach((payment) => {
        const time = new Date(payment.sales.created_at).toLocaleTimeString();
        const tipAmount = payment.adjustedTipAmount || 0;
        const total = payment.amount + tipAmount;
        const displayType = payment.isTipTransaction
          ? `${payment.payment_method} (Tip)`
          : payment.payment_method;
        csvContent += `${time},${displayType},${formatCurrency(
          payment.amount
        )},${formatCurrency(tipAmount)},${formatCurrency(total)}\n`;
      });

      const totalPayments = processedPayments.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const totalTips = processedPayments.reduce(
        (sum, item) => sum + (item.adjustedTipAmount || 0),
        0
      );
      const grandTotal = totalPayments + totalTips;
      csvContent += `\nTransactions Count,${payments.length},,${formatCurrency(
        totalTips
      )},${formatCurrency(grandTotal)}\n\n`;

      // Cash Movement Summary Section
      csvContent += "Cash Movement Summary\n";
      csvContent += "Payment Type,Payment Collected\n";

      Object.entries(cashMovementSummary).forEach(([paymentType, amount]) => {
        csvContent += `${paymentType},${formatCurrency(amount)}\n`;
      });

      csvContent += `\nOverall Payments Collected,${formatCurrency(
        grandTotal
      )}\n`;
      csvContent += `Of which Tips,${formatCurrency(totalTips)}\n`;

      // Save and share CSV file
      const filename = `SalesReport_${dateStr}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      console.log("[EXPORT-CSV] Writing file to:", fileUri);
      console.log("[EXPORT-CSV] CSV Content length:", csvContent.length);

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("[EXPORT-CSV] File written successfully");

      if (await Sharing.isAvailableAsync()) {
        console.log("[EXPORT-CSV] Sharing file...");
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: `Export Sales Report as CSV`,
        });
        console.log("[EXPORT-CSV] File shared successfully");
      } else {
        Alert.alert(
          "Export Unavailable",
          "Sharing is not available on this device.",
          [{ text: "OK" }]
        );
      }
      closeExportBottomSheet();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      Alert.alert(
        "Export Failed",
        "An error occurred while exporting the sales report. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const exportAsPDF = async () => {
    try {
      console.log("[EXPORT-PDF] Starting PDF export...");
      console.log("[EXPORT-PDF] Payments count:", payments.length);
      console.log("[EXPORT-PDF] Sale items count:", saleItems.length);

      // Check if there's any data to export
      if (payments.length === 0 && saleItems.length === 0) {
        Alert.alert(
          "No Data Available",
          "There are no sales transactions for the selected date. Please choose a different date or check your filters.",
          [{ text: "OK" }]
        );
        return;
      }

      const dateStr = formatDateForFilename(selectedDate);
      const saleItemsSummary = generateSaleItemsSummary();
      const cashMovementSummary = generateCashMovementSummary();
      const processedPayments = processPaymentsForTips();

      console.log("[EXPORT-PDF] Sale items summary:", Object.keys(saleItemsSummary).length, "types");
      console.log("[EXPORT-PDF] Cash movement summary:", Object.keys(cashMovementSummary).length, "payment types");
      console.log("[EXPORT-PDF] Processed payments:", processedPayments.length);

      // Sort processed payments by time (oldest to newest)
      const sortedPayments = [...processedPayments].sort(
        (a, b) =>
          new Date(a.sales.created_at).getTime() -
          new Date(b.sales.created_at).getTime()
      );

      // Create HTML content for PDF
      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              h2 { color: #666; margin-top: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .summary { background-color: #f9f9f9; font-weight: bold; }
              .total { background-color: #e8f5e8; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Sales Report - ${selectedDate.toLocaleDateString()}</h1>

            <h2>Sale Item Summary</h2>
            <table>
              <tr><th>Item Type</th><th>Sales Qty</th><th>Gross Total</th></tr>
      `;

      Object.entries(saleItemsSummary).forEach(([itemType, data]) => {
        htmlContent += `<tr><td>${itemType}</td><td>${
          data.quantity
        }</td><td>${formatCurrency(data.total)}</td></tr>`;
      });

      const totalSaleItems = saleItems.length;
      const totalSaleItemsValue = saleItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      );
      htmlContent += `<tr class="total"><td>Total Items Sold</td><td>${totalSaleItems}</td><td>${formatCurrency(
        totalSaleItemsValue
      )}</td></tr>`;
      htmlContent += `</table>`;

      // Transaction Summary
      htmlContent += `
            <h2>Transaction Summary</h2>
            <table>
              <tr><th>Time</th><th>Payment Method</th><th>Amount</th><th>Tip</th><th>Total</th></tr>
      `;

      sortedPayments.forEach((payment) => {
        const time = new Date(payment.sales.created_at).toLocaleTimeString();
        const tipAmount = payment.adjustedTipAmount || 0;
        const total = payment.amount + tipAmount;
        const displayType = payment.isTipTransaction
          ? `${payment.payment_method} (Tip)`
          : payment.payment_method;
        htmlContent += `<tr><td>${time}</td><td>${displayType}</td><td>${formatCurrency(
          payment.amount
        )}</td><td>${formatCurrency(tipAmount)}</td><td>${formatCurrency(
          total
        )}</td></tr>`;
      });

      const totalPayments = processedPayments.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const totalTips = processedPayments.reduce(
        (sum, item) => sum + (item.adjustedTipAmount || 0),
        0
      );
      const grandTotal = totalPayments + totalTips;
      htmlContent += `<tr class="total"><td>Total Transactions: ${
        payments.length
      }</td><td></td><td>${formatCurrency(
        totalPayments
      )}</td><td>${formatCurrency(totalTips)}</td><td>${formatCurrency(
        grandTotal
      )}</td></tr>`;
      htmlContent += `</table>`;

      // Cash Movement Summary
      htmlContent += `
            <h2>Cash Movement Summary</h2>
            <table>
              <tr><th>Payment Type</th><th>Payment Collected</th></tr>
      `;

      Object.entries(cashMovementSummary).forEach(([paymentType, amount]) => {
        htmlContent += `<tr><td>${paymentType}</td><td>${formatCurrency(
          amount
        )}</td></tr>`;
      });

      htmlContent += `
              <tr class="total"><td>Overall Payments Collected</td><td>${formatCurrency(
                grandTotal
              )}</td></tr>
              <tr class="summary"><td>Of which Tips</td><td>${formatCurrency(
                totalTips
              )}</td></tr>
            </table>
          </body>
        </html>
      `;

      console.log("[EXPORT-PDF] Generating PDF...");
      console.log("[EXPORT-PDF] HTML Content length:", htmlContent.length);

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const filename = `SalesReport_${dateStr}.pdf`;
      const finalPdfUri = `${FileSystem.documentDirectory}${filename}`;
      
      console.log("[EXPORT-PDF] Copying PDF to:", finalPdfUri);
      await FileSystem.copyAsync({
        from: uri,
        to: finalPdfUri,
      });

      console.log("[EXPORT-PDF] PDF file created successfully");

      if (await Sharing.isAvailableAsync()) {
        console.log("[EXPORT-PDF] Sharing file...");
        await Sharing.shareAsync(finalPdfUri, {
          mimeType: "application/pdf",
          dialogTitle: `Export Sales Report as PDF`,
        });
        console.log("[EXPORT-PDF] File shared successfully");
      } else {
        Alert.alert(
          "Export Unavailable",
          "Sharing is not available on this device.",
          [{ text: "OK" }]
        );
      }
      closeExportBottomSheet();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Alert.alert(
        "Export Failed",
        "An error occurred while exporting the sales report. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const exportAsExcel = async () => {
    try {
      console.log("[EXPORT-EXCEL] Starting Excel export...");
      console.log("[EXPORT-EXCEL] Payments count:", payments.length);
      console.log("[EXPORT-EXCEL] Sale items count:", saleItems.length);

      // Check if there's any data to export
      if (payments.length === 0 && saleItems.length === 0) {
        Alert.alert(
          "No Data Available",
          "There are no sales transactions for the selected date. Please choose a different date or check your filters.",
          [{ text: "OK" }]
        );
        return;
      }

      // For Excel export, we'll create a CSV with Excel-specific formatting
      // In a real app, you might want to use a library like xlsx
      const dateStr = formatDateForFilename(selectedDate);
      const saleItemsSummary = generateSaleItemsSummary();
      const cashMovementSummary = generateCashMovementSummary();
      const processedPayments = processPaymentsForTips();

      console.log("[EXPORT-EXCEL] Sale items summary:", Object.keys(saleItemsSummary).length, "types");
      console.log("[EXPORT-EXCEL] Cash movement summary:", Object.keys(cashMovementSummary).length, "payment types");
      console.log("[EXPORT-EXCEL] Processed payments:", processedPayments.length);

      // Sort processed payments by time (oldest to newest)
      const sortedPayments = [...processedPayments].sort(
        (a, b) =>
          new Date(a.sales.created_at).getTime() -
          new Date(b.sales.created_at).getTime()
      );

      let excelContent = `Sales Report - ${selectedDate.toLocaleDateString()}\n\n`;

      // Sale Items Summary Section
      excelContent += "Sale Item Summary\n";
      excelContent += "Item Type\tSales Qty\tGross Total\n";

      Object.entries(saleItemsSummary).forEach(([itemType, data]) => {
        excelContent += `${itemType}\t${data.quantity}\t${formatCurrency(
          data.total
        )}\n`;
      });

      const totalSaleItems = saleItems.length;
      const totalSaleItemsValue = saleItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      );
      excelContent += `\nTotal Items Sold\t${totalSaleItems}\t${formatCurrency(
        totalSaleItemsValue
      )}\n\n`;

      // Transaction Summary Section
      excelContent += "Transaction Summary\n";
      excelContent += "Time\tPayment Method\tAmount\tTip\tTotal\n";

      sortedPayments.forEach((payment) => {
        const time = new Date(payment.sales.created_at).toLocaleTimeString();
        const tipAmount = payment.adjustedTipAmount || 0;
        const total = payment.amount + tipAmount;
        const displayType = payment.isTipTransaction
          ? `${payment.payment_method} (Tip)`
          : payment.payment_method;
        excelContent += `${time}\t${displayType}\t${formatCurrency(
          payment.amount
        )}\t${formatCurrency(tipAmount)}\t${formatCurrency(total)}\n`;
      });

      const totalPayments = processedPayments.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const totalTips = processedPayments.reduce(
        (sum, item) => sum + (item.adjustedTipAmount || 0),
        0
      );
      const grandTotal = totalPayments + totalTips;
      excelContent += `\nTransactions Count\t${
        payments.length
      }\t\t${formatCurrency(totalTips)}\t${formatCurrency(grandTotal)}\n\n`;

      // Cash Movement Summary Section
      excelContent += "Cash Movement Summary\n";
      excelContent += "Payment Type\tPayment Collected\n";

      Object.entries(cashMovementSummary).forEach(([paymentType, amount]) => {
        excelContent += `${paymentType}\t${formatCurrency(amount)}\n`;
      });

      excelContent += `\nOverall Payments Collected\t${formatCurrency(
        grandTotal
      )}\n`;
      excelContent += `Of which Tips\t${formatCurrency(totalTips)}\n`;

      // Save as Excel-compatible file
      const filename = `SalesReport_${dateStr}.xls`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      console.log("[EXPORT-EXCEL] Writing file to:", fileUri);
      console.log("[EXPORT-EXCEL] Excel Content length:", excelContent.length);

      await FileSystem.writeAsStringAsync(fileUri, excelContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("[EXPORT-EXCEL] File written successfully");

      if (await Sharing.isAvailableAsync()) {
        console.log("[EXPORT-EXCEL] Sharing file...");
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/vnd.ms-excel",
          dialogTitle: `Export Sales Report as Excel`,
        });
        console.log("[EXPORT-EXCEL] File shared successfully");
      } else {
        Alert.alert(
          "Export Unavailable",
          "Sharing is not available on this device.",
          [{ text: "OK" }]
        );
      }
      closeExportBottomSheet();
    } catch (error) {
      console.error("Error exporting Excel:", error);
      Alert.alert(
        "Export Failed",
        "An error occurred while exporting the sales report. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Summary calculations for the overview section
  const getSummaryData = () => {
    const processedPayments = processPaymentsForTips();

    // Total Sales (sum of all transaction amounts + properly calculated tips)
    const totalSales = processedPayments.reduce((sum, payment) => {
      return sum + payment.amount + (payment.adjustedTipAmount || 0);
    }, 0);

    // Total Transactions (count of payments)
    const totalTransactions = payments.length;

    // Total Clients (unique client IDs from sales)
    // A client can have multiple transactions, so we count unique client_ids
    const totalClients = new Set(
      payments
        .map((payment) => payment.sales?.client_id)
        .filter((clientId) => clientId !== null && clientId !== undefined)
    ).size;

    // Payment Methods (unique payment methods from cash movement)
    const paymentMethods = new Set(
      payments.map((payment) => payment.payment_method)
    ).size;

    return {
      totalSales,
      totalTransactions,
      totalClients,
      paymentMethods,
    };
  };

  // Filter toggle functions
  const toggleLocationFilter = (locationId: string) => {
    setPageFilter((prev) => {
      const newLocationIds = prev.location_ids.includes(locationId)
        ? prev.location_ids.filter((id) => id !== locationId)
        : [...prev.location_ids, locationId];

      return {
        ...prev,
        location_ids: newLocationIds,
      };
    });
  };

  const clearAllFilters = () => {
    setPageFilter({
      location_ids: [],
    });
  };

  // Filter panel functions
  const openFilterPanel = () => {
    setShowFilterPanel(true);
  };

  const closeFilterPanel = () => {
    setShowFilterPanel(false);
  };

  // Bottom sheet handlers
  const handleSheetChanges = useCallback((index: number) => {
    console.log("Bottom sheet index:", index);
    if (index === -1) {
      setIsBottomSheetOpen(false);
    } else if (index >= 0) {
      setIsBottomSheetOpen(true);
    }
  }, []);

  const openExportBottomSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const closeExportBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const applyFilters = () => {
    fetchDataForDate(selectedDate);
    setShowFilterPanel(false);
  };

  const summaryData = getSummaryData();
  const processedPayments = processPaymentsForTips();

  return {
    navigation,
    fetchPayments,
    payments,
    processedPayments, // Add processed payments for UI
    saleItems,
    loading,
    selectedDate,
    updateSelectedDate,
    fetchDataForDate,
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
    setPageFilter,
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
  };
};
