import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { teamRepository, SaleTipBO } from "../../../Repository/teamRepository";
import { useAuthStore } from "../../../Store/useAuthStore";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Alert, Animated } from "react-native";


const useSalesTipsScreenVM = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { allLocations } = useAuthStore();

  // State management
  const [salesTips, setSalesTips] = useState<SaleTipBO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Bottom sheet ref and state
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [pageFilter, setPageFilter] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    end_date: new Date().toISOString(),
    location_ids: [] as string[],
    staff_name: "",
    tip_amount: "",
    payment_method: "",
  });
  
  // Location filter modal state
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

  // Filter tips based on search query
  const filteredTipsData = useMemo(() => {
    if (!searchQuery.trim()) {
      return salesTips;
    }

    const query = searchQuery.toLowerCase().trim();
    return salesTips.filter((tip) => {
      const staffName = `${tip.team_members?.first_name || ''} ${tip.team_members?.last_name || ''}`.toLowerCase();
      const tipId = tip.sale_id?.toString().toLowerCase() || '';
      const paymentMethod = (tip.payment_method_tip || '').toLowerCase();
      const tipAmount = tip.amount?.toString().toLowerCase() || '';

      return (
        staffName.includes(query) ||
        tipId.includes(query) ||
        paymentMethod.includes(query) ||
        tipAmount.includes(query)
      );
    });
  }, [salesTips, searchQuery]);

  // Fetch sales tips data
  const fetchSalesTips = async (
    startDate?: string,
    endDate?: string,
    locationIds?: string[]
  ) => {
    try {
      setLoading(true);
      const start = startDate || pageFilter.start_date;
      const end = endDate || pageFilter.end_date;

      const data = await teamRepository.getSalesTips(start, end, locationIds);
      setSalesTips(data);
      console.log("Sales Tips Data:", data);
    } catch (error) {
      console.error("Error fetching sales tips:", error);
      setSalesTips([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const locationIds = allLocations?.map((location) => location.id);
    setPageFilter((prev) => ({ ...prev, location_ids: locationIds || [] }));
    fetchSalesTips(undefined, undefined, locationIds);
  }, [allLocations]);

  // Update date filter and refetch data
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

    // Refetch data with new date range and current location filters
    const locationIds = pageFilter.location_ids.length > 0 
      ? pageFilter.location_ids 
      : allLocations?.map((location) => location.id);
    await fetchSalesTips(filter.fromDate, filter.toDate, locationIds);
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
    const locationIds = pageFilter.location_ids.length > 0 
      ? pageFilter.location_ids 
      : allLocations?.map((location) => location.id);
    await fetchSalesTips(pageFilter.start_date, pageFilter.end_date, locationIds);
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

  // Bottom sheet handlers
  const handleSheetChanges = useCallback((index: number) => {
    console.log("Bottom sheet index:", index);
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
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    bottomSheetRef.current?.snapToIndex(0);
  }, [backdropOpacity]);

  const closeExportBottomSheet = useCallback(() => {
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
    return filteredTipsData.map((tip) => {
      return {
        "Tip Date": new Date(tip.created_at).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        "Tip ID": tip.sale_id,
        "Staff Name": `${tip.team_members.first_name} ${tip.team_members.last_name}`,
        "Tip Amount": `AED ${tip.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        "Payment Method": tip.payment_method_tip?.charAt(0).toUpperCase() + tip.payment_method_tip?.slice(1) || "N/A",
        "Sale Total": `AED ${tip.sales.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        "Location": tip.sales.location_id,
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
          <title>Sales Tips Report</title>
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
            <h1>Sales Tips Report</h1>
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
      if (filteredTipsData.length === 0) {
        Alert.alert("No Data", "There are no tips to export.");
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
          fileName = `sales_tips_report_${timestamp}.csv`;
          mimeType = "text/csv";
          break;
        case "Excel":
          fileContent = generateCSV(formattedData);
          fileName = `sales_tips_report_${timestamp}.xls`;
          mimeType = "application/vnd.ms-excel";
          break;
        case "PDF":
          const htmlContent = generateHTML(formattedData);
          const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
          });

          fileName = `sales_tips_report_${timestamp}.pdf`;

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: "application/pdf",
              dialogTitle: `Export Sales Tips Report as PDF`,
            });
          } else {
            Alert.alert("Success", `PDF generated successfully`);
          }
          closeExportBottomSheet();
          return;
        default:
          Alert.alert("Error", "Unsupported export format");
          return;
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: "utf8",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export Sales Tips Report as ${type}`,
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
    salesTips,
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
  };
};

export default useSalesTipsScreenVM;
