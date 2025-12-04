import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  clientRepository,
  ClientVoucher,
  VoucherUsage,
} from "../../../Repository/clientRepository";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useAuthStore } from "../../../Store/useAuthStore";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Alert, Animated } from "react-native";

interface pageFilter {
  start_date: string;
  end_date: string;
  location_id: string[];
  client_name: string;
  voucher_name: string;
  voucher_code: string;
}

const useSalesVoucherScreenVM = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const { allLocations } = useAuthStore();
  const [voucherData, setVoucherData] = useState<ClientVoucher[]>([]);
  const [voucherUsageData, setVoucherUsageData] = useState<VoucherUsage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Bottom sheet ref and state
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [pageFilter, setPageFilter] = useState({
    start_date: "2025-10-01T00:00:00",
    end_date: "2025-10-04T23:59:59",
    location_ids: [] as string[],
    client_name: "",
    voucher_name: "",
    voucher_code: "",
  });
  
  // Location filter modal state
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

  // Filter vouchers based on search query only (location filtering done on backend)
  const filteredVoucherData = useMemo(() => {
    let filtered = voucherData;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((voucher) => {
        const clientName =
          `${voucher.client_first_name} ${voucher.client_last_name}`.toLowerCase();
        const voucherName = voucher.voucher_name.toLowerCase();
        const voucherCode = voucher.voucher_code.toLowerCase();

        return (
          clientName.includes(query) ||
          voucherName.includes(query) ||
          voucherCode.includes(query)
        );
      });
    }

    return filtered;
  }, [voucherData, searchQuery]);

  useEffect(() => {
    // Initialize location_ids with all locations
    const locationIds = allLocations?.map((location) => location.id) || [];
    setPageFilter((prev) => ({ ...prev, location_ids: locationIds }));
    init();
  }, []); // Empty dependency array to run only once on mount

  const init = async (customFilter?: typeof pageFilter) => {
    try {
      setLoading(true);

      // Use provided filter or current pageFilter
      const filterToUse = customFilter || pageFilter;

      // Get location IDs to filter by
      const locationIds = filterToUse.location_ids && filterToUse.location_ids.length > 0
        ? filterToUse.location_ids
        : allLocations?.map((location) => location.id);

      // Fetch voucher data with location filter
      let voucherResponse = await clientRepository.getClientVouchers(
        filterToUse.start_date,
        filterToUse.end_date,
        locationIds
      );

      if (voucherResponse && voucherResponse.length > 0) {
        setVoucherData(voucherResponse);

        // Extract voucher IDs for usage data
        const voucherIds = voucherResponse.map((voucher) => voucher.id);

        // Fetch voucher usage data
        try {
          const usageResponse = await clientRepository.getVoucherUsage(
            voucherIds
          );
          setVoucherUsageData(usageResponse);
          console.log("[VOUCHER-USAGE-VM]", usageResponse);
        } catch (usageError) {
          console.log("Error fetching voucher usage:", usageError);
          setVoucherUsageData([]);
        }
      } else {
        setVoucherData([]);
        setVoucherUsageData([]);
      }

      console.log("[VOUCHER-VM]", voucherResponse);
    } catch (e) {
      console.log("voucherScreenVM", e);
      setVoucherData([]);
      setVoucherUsageData([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to update date filter and refetch data
  const updateDateFilter = async (filter: {
    fromDate: string;
    toDate: string;
  }) => {
    const updatedFilter = {
      ...pageFilter,
      start_date: filter.fromDate,
      end_date: filter.toDate,
    };
    setPageFilter(updatedFilter);
    setShowDateFilter(false);

    // Refetch data with new date range
    await init(updatedFilter);
  };

  // Function to format date range for display
  const getDateRangeText = () => {
    const startDate = new Date(pageFilter.start_date);
    const endDate = new Date(pageFilter.end_date);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Location filter functions
  const openFilterPanel = () => {
    setShowFilterPanel(true);
  };

  const closeFilterPanel = () => {
    setShowFilterPanel(false);
  };

  const toggleLocationFilter = (locationId: string) => {
    setPageFilter((prev) => {
      const currentIds = prev.location_ids || [];
      const isSelected = currentIds.includes(locationId);
      
      return {
        ...prev,
        location_ids: isSelected
          ? currentIds.filter((id) => id !== locationId)
          : [...currentIds, locationId],
      };
    });
  };

  const clearAllFilters = () => {
    setPageFilter((prev) => ({
      ...prev,
      location_ids: [],
    }));
  };

  const applyFilters = async () => {
    setShowFilterPanel(false);
    // Refetch data with new location filters
    await init();
  };

  // Bottom sheet handlers
  const handleSheetChanges = useCallback((index: number) => {
    console.log("Bottom sheet index:", index);
    // Only handle closing state when bottom sheet is fully closed
    if (index === -1) {
      setIsBottomSheetOpen(false);
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [backdropOpacity]);

  const openExportBottomSheet = useCallback(() => {
    setIsBottomSheetOpen(true);
    // Start backdrop fade in immediately when opening
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    bottomSheetRef.current?.snapToIndex(0);
  }, [backdropOpacity]);

  const closeExportBottomSheet = useCallback(() => {
    // Start backdrop fade out immediately when closing
    Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsBottomSheetOpen(false);
    });
    bottomSheetRef.current?.close();
  }, [backdropOpacity]);

  // Export functionality
  const formatDataForExport = () => {
    return filteredVoucherData.map((voucher) => {
      const usage = voucherUsageData.find(
        (usage) => usage.client_voucher_id === voucher.id
      );
      const usedAmount = usage?.amount_used || 0;
      const remainingBalance = voucher.original_value - usedAmount;
      const usagePercentage = voucher.original_value > 0
        ? ((usedAmount / voucher.original_value) * 100).toFixed(1)
        : "0";

      return {
        "Purchase Date": new Date(voucher.purchase_date).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        "Client Name": `${voucher.client_first_name} ${voucher.client_last_name}`,
        "Voucher Name": voucher.voucher_name,
        "Voucher Code": voucher.voucher_code,
        "Remaining Balance": `AED ${remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        "Usage (used, Original Value)": `${usedAmount.toFixed(2)}, ${voucher.original_value.toFixed(2)}`,
        "Original Value": `AED ${voucher.original_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        "Discount %": voucher.discount_percentage || "0",
        "Status": voucher.status || "Active",
      };
    });
  };

  const generateCSV = (data: any[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");
    return csvContent;
  };

  const generateHTML = (data: any[]) => {
    if (data.length === 0) return "<p>No data available</p>";

    const headers = Object.keys(data[0]);
    const tableRows = data
      .map(
        (row) =>
          `<tr>${headers
            .map((header) => `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${row[header] || ""}</td>`)
            .join("")}</tr>`
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Voucher Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th { background-color: #f2f2f2; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; }
            td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .header { text-align: center; margin-bottom: 20px; }
            .date-range { color: #666; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Voucher Report</h1>
            <div class="date-range">Date Range: ${getDateRangeText()}</div>
            <div class="date-range">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const handleExport = async (type: "CSV" | "Excel" | "PDF") => {
    try {
      if (filteredVoucherData.length === 0) {
        Alert.alert("No Data", "There are no vouchers to export.");
        return;
      }

      const formattedData = formatDataForExport();
      const timestamp = new Date().toISOString().split("T")[0];
      let fileContent = "";
      let fileName = "";
      let mimeType = "";

      switch (type) {
        case "CSV":
          fileContent = generateCSV(formattedData);
          fileName = `voucher_report_${timestamp}.csv`;
          mimeType = "text/csv";
          break;
        case "Excel":
          // For Excel, we'll use CSV format but with .xls extension
          fileContent = generateCSV(formattedData);
          fileName = `voucher_report_${timestamp}.xls`;
          mimeType = "application/vnd.ms-excel";
          break;
        case "PDF":
          // Generate actual PDF using expo-print
          const htmlContent = generateHTML(formattedData);
          const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
          });

          fileName = `voucher_report_${timestamp}.pdf`;

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: "application/pdf",
              dialogTitle: `Export Voucher Report as PDF`,
            });
          } else {
            Alert.alert("Success", `PDF generated successfully`);
          }
          closeExportBottomSheet();
          return; // Return early for PDF case
        default:
          Alert.alert("Error", "Unsupported export format");
          return;
      }

      // Create file using FileSystem API for CSV and Excel
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export Voucher Report as ${type}`,
        });
      } else {
        Alert.alert("Success", `File saved as ${fileName}`);
      }
      closeExportBottomSheet();
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    }
  };

  return {
    navigation,
    voucherData,
    voucherUsageData,
    loading,
    showDateFilter,
    setShowDateFilter,
    pageFilter,
    updateDateFilter,
    getDateRangeText,
    allLocations,
    setPageFilter,
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
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    toggleLocationFilter,
    clearAllFilters,
    applyFilters,
  };
};

export default useSalesVoucherScreenVM;
