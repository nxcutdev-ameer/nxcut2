import { Alert } from "react-native";
import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { useAppointmentStore } from "../../../Store/useAppointmentStore";
import { useReportStore } from "../../../Store/useReportsStore";
import { useAuthStore } from "../../../Store/useAuthStore";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  AppointmentServiceRecord,
  appointmentsRepository,
  AppointmentService,
} from "../../../Repository/appointmentsRepository";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { AppointmentSalesBO } from "../../../BOs/appointmentBOs";
import { paymentRepository } from "../../../Repository/paymentsRepository";
export interface ServiceStats {
  serviceName: string;
  thisMonthCount: number;
  lastMonthCount: number;
}

export interface StaffPerformance {
  staffName: string;
  staffId: string;
  thisMonthAmount: number;
  lastMonthAmount: number;
}
const useDashBoardScreenVM = (dateRange?: { startDate: Date; endDate: Date }) => {
  const {
    comissionCaluculationData,
    comissionSummary,
    barGraphData,
    appointmentsWithSalesData,
    fetchComission,
    fetchAppointmentsBarGraphData,
    fetchApppointmentsActivityData,
    fetchAppointmentsWithSalesData,
    appointmentsActivityData,
    topServicesData,
    fetchTopServices,
    staffPerformanceData,
    fetchStaffPerformanceData,
  } = useAppointmentStore();
  const {
    salesByLocationSummary,
    salesByLocationLoading,
    fetchSalesByLocationSummary,
  } = useReportStore();
  const { isFromLogin, setIsFromLogin } = useAuthStore();
  const navigation: NavigationProp<any> = useNavigation();

  const [filter, setFilter] = React.useState(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      startDate: monthStart.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  });

  // Separate filters for different sections
  const [lineGraphFilter, setLineGraphFilter] = React.useState<7 | 30>(7);
  const [barGraphFilter, setBarGraphFilter] = React.useState<7 | 30>(7);
  const [staffPerformanceFilter, setStaffPerformanceFilter] = React.useState<
    7 | 30
  >(7);

  // Staff performance advanced filters
  const [staffSearchText, setStaffSearchText] = React.useState("");
  const [debouncedStaffSearchText, setDebouncedStaffSearchText] = React.useState("");
  const [selectedMonth, setSelectedMonth] = React.useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = React.useState(
    new Date().getFullYear()
  );
  
  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Bottom sheet state
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [activeFilterType, setActiveFilterType] = React.useState<
    "line" | "bar" | "staff" | null
  >(null);

  // Helper function to check if data is available and loaded
  const hasData = React.useMemo(() => {
    const result = {
      lineGraph: appointmentsWithSalesData !== undefined,
      barGraph: barGraphData !== undefined,
      activity: appointmentsActivityData !== undefined,
      topServices:
        topServicesData !== undefined && Object.keys(topServicesData).length > 0,
      staffPerformance:
        staffPerformanceData !== undefined &&
        (staffPerformanceData.currentMonth !== undefined ||
          staffPerformanceData.previousMonth !== undefined),
      pieChart:
        !salesByLocationLoading &&
        Array.isArray(salesByLocationSummary) &&
        salesByLocationSummary.length > 0,
    };
    return result;
  }, [
    appointmentsWithSalesData,
    barGraphData,
    appointmentsActivityData,
    topServicesData,
    staffPerformanceData,
    salesByLocationSummary,
    salesByLocationLoading,
  ]);

  const [loadingStates, setLoadingStates] = React.useState(() => {
    // If coming from login, check if data is actually available
    if (isFromLogin) {
      return {
        lineGraph: !hasData.lineGraph,
        barGraph: !hasData.barGraph,
        activity: !hasData.activity,
        topServices: !hasData.topServices,
        staffPerformance: !hasData.staffPerformance,
        pieChart: !hasData.pieChart,
      };
    }
    return {
      lineGraph: true,
      barGraph: true,
      activity: true,
      topServices: true,
      staffPerformance: true,
      pieChart: true,
    };
  });

  // Natural data loading completion detection
  useEffect(() => {
    setLoadingStates(prev => ({
      lineGraph: prev.lineGraph && !hasData.lineGraph,
      barGraph: prev.barGraph && !hasData.barGraph,
      activity: prev.activity && !hasData.activity,
      topServices: prev.topServices && !hasData.topServices,
      staffPerformance: prev.staffPerformance && !hasData.staffPerformance,
      pieChart: prev.pieChart && !hasData.pieChart,
    }));
  }, [hasData]);

  useEffect(() => {
    setLoadingStates(prev => ({
      ...prev,
      pieChart: salesByLocationLoading || !hasData.pieChart,
    }));
  }, [salesByLocationLoading, hasData.pieChart]);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Check if we're coming from login flow with preloaded data
      if (isFromLogin) {
        setIsFromLogin(false); // Reset flag after first load

        // Only set loading to false for sections that have data
        setLoadingStates({
          lineGraph: !hasData.lineGraph,
          barGraph: !hasData.barGraph,
          activity: !hasData.activity,
          topServices: !hasData.topServices,
          staffPerformance: !hasData.staffPerformance,
          pieChart: !hasData.pieChart,
        });
        return;
      }

      setLoadingStates(prev => ({ ...prev, topServices: true, barGraph: true, activity: true, lineGraph: true, staffPerformance: true, pieChart: true }));
      try {
        await Promise.all([
          fetchTopServices(filter),
          fetchAppointmentsBarGraphData(barGraphFilter),
          fetchApppointmentsActivityData(filter),
          fetchAppointmentsWithSalesData(filter),
          fetchSalesByLocationSummary({
            startDate: filter.startDate,
            endDate: filter.endDate,
            locationIds: undefined,
          }),
        ]);
      } catch (error) {
        console.error("[DASHBOARD-VM] Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []); // Remove filter dependency since we handle it differently for fresh vs login loads

  // Update data when filters change (skip if coming from login with preloaded data)
  useEffect(() => {
    if (isFromLogin) {
      return;
    }
    setLoadingStates(prev => ({ ...prev, barGraph: true }));
    fetchAppointmentsBarGraphData(barGraphFilter);
  }, [barGraphFilter, isFromLogin]);

  // Debounce staff search text
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setDebouncedStaffSearchText(staffSearchText);
    }, 500); // 500ms delay
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [staffSearchText]);

  // Removed lineGraphFilter useEffect - now controlled by date picker in component
  // The date picker in DashBoardScreen.tsx will call fetchAppointmentsWithSalesData directly

  useEffect(() => {
    // Skip if coming from login with preloaded data for current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const isCurrentMonthYear = selectedMonth === currentMonth && selectedYear === currentYear;

    if (isFromLogin && isCurrentMonthYear && !debouncedStaffSearchText) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, staffPerformance: true }));

    // Fix timezone issues by using UTC dates
    const currentMonthStart = new Date(
      Date.UTC(selectedYear, selectedMonth - 1, 1)
    );
    const currentMonthEnd = new Date(Date.UTC(selectedYear, selectedMonth, 0));

    const staffFilter = {
      startDate: currentMonthStart.toISOString().split("T")[0],
      endDate: currentMonthEnd.toISOString().split("T")[0],
      staffNameFilter: debouncedStaffSearchText.trim() || undefined,
    };

    fetchStaffPerformanceData(staffFilter);
  }, [selectedMonth, selectedYear, debouncedStaffSearchText, isFromLogin, fetchStaffPerformanceData]);

  // Debug logging for data changes
  const getServiceStats = (
    previousMonth: AppointmentServiceRecord[],
    currentMonth: AppointmentServiceRecord[]
  ): ServiceStats[] => {
    const counts: Record<string, { thisMonth: number; lastMonth: number }> = {};

    // Count previous month
    previousMonth.forEach((record) => {
      const name = record.service.name;
      if (!counts[name]) {
        counts[name] = { thisMonth: 0, lastMonth: 0 };
      }
      counts[name].lastMonth += 1;
    });

    // Count current month
    currentMonth.forEach((record) => {
      const name = record.service.name;
      if (!counts[name]) {
        counts[name] = { thisMonth: 0, lastMonth: 0 };
      }
      counts[name].thisMonth += 1;
    });

    // Convert to array and sort by thisMonthCount (desc)
    return Object.entries(counts)
      .map(([serviceName, { thisMonth, lastMonth }]) => ({
        serviceName,
        thisMonthCount: thisMonth,
        lastMonthCount: lastMonth,
      }))
      .sort((a, b) => b.thisMonthCount - a.thisMonthCount);
  };
  const topServices = useMemo(() => {
    if (
      !topServicesData ||
      !topServicesData.currentMonth ||
      !topServicesData.previousMonth
    ) {
      return [];
    }
    return getServiceStats(
      topServicesData.previousMonth,
      topServicesData.currentMonth
    );
  }, [topServicesData]);

  const staffPerformance = useMemo(() => {
    if (
      !staffPerformanceData?.currentMonth ||
      !staffPerformanceData?.previousMonth
    ) {
      return [];
    }

    const firstCurrentItem = staffPerformanceData.currentMonth[0];
    const hasRPCStructure = firstCurrentItem && (
      firstCurrentItem.team_member_name !== undefined ||
      firstCurrentItem.team_member !== undefined ||
      firstCurrentItem.staff_name !== undefined
    );

    if (hasRPCStructure) {
      const extractName = (item: any) => {
        const direct =
          item.team_member_name ??
          item.team_member ??
          item.staff_name ??
          item.name ??
          item.teamMemberName ??
          item.staffName ??
          item.member_name;
        if (direct) return direct;
        const key = Object.keys(item).find((k) =>
          k.toLowerCase().includes("name") ||
          k.toLowerCase().includes("member") ||
          k.toLowerCase().includes("staff")
        );
        return key ? item[key] : undefined;
      };

      const extractId = (item: any) =>
        item.team_member_id ??
        item.staff_id ??
        item.id ??
        item.teamMemberId ??
        item.staffId ??
        item.member_id ??
        "";

      const extractAmount = (item: any) => {
        const direct =
          item.total_sales ??
          item.total_amount ??
          item.sales ??
          item.amount ??
          item.totalSales ??
          item.totalAmount ??
          item.net_sales ??
          item.netSales;
        if (direct !== undefined && direct !== null) {
          const num = typeof direct === "number" ? direct : parseFloat(direct);
          if (Number.isFinite(num)) return num;
        }
        const key = Object.keys(item).find((k) =>
          k.toLowerCase().includes("total") ||
          k.toLowerCase().includes("sales") ||
          k.toLowerCase().includes("amount")
        );
        if (key) {
          const value = item[key];
          const num = typeof value === "number" ? value : parseFloat(value);
          if (Number.isFinite(num)) return num;
        }
        return 0;
      };

      const statsMap = new Map<string, StaffPerformance>();

      staffPerformanceData.currentMonth.forEach((item: any) => {
        const name = extractName(item);
        if (!name) return;
        const existing = statsMap.get(name) || {
          staffName: name,
          staffId: extractId(item),
          thisMonthAmount: 0,
          lastMonthAmount: 0,
        };
        existing.thisMonthAmount = extractAmount(item);
        statsMap.set(name, existing);
      });

      staffPerformanceData.previousMonth.forEach((item: any) => {
        const name = extractName(item);
        if (!name) return;
        const existing = statsMap.get(name) || {
          staffName: name,
          staffId: extractId(item),
          thisMonthAmount: 0,
          lastMonthAmount: 0,
        };
        existing.lastMonthAmount = extractAmount(item);
        statsMap.set(name, existing);
      });

      return Array.from(statsMap.values()).sort(
        (a, b) => b.thisMonthAmount - a.thisMonthAmount
      );
    }

    return [];
  }, [staffPerformanceData]);
  function formatCustomDate(
    dateStr: string,
    type: "mainDate" | "subDate"
  ): string {
    const date = new Date(dateStr);
    const optionsMain: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
    };
    const optionsSub: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };

    if (type === "mainDate") {
      // e.g., "16 Sep"
      return date.toLocaleDateString("en-GB", optionsMain);
    } else if (type === "subDate") {
      // e.g., "Tue 16 Sep 2025"
      return date.toLocaleDateString("en-GB", optionsSub);
    } else {
      throw new Error("Invalid type. Use 'mainDate' or 'subDate'.");
    }
  }

  const getInclusiveDayCount = (start: Date, end: Date) => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const startUTC = Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const endUTC = Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );
    const diff = Math.floor((endUTC - startUTC) / MS_PER_DAY);
    return diff >= 0 ? diff + 1 : 0;
  };
  //   const debug = async () => {
  //     let responce = await appointmentsRepository.getAppointmentsActivity();
  //     console.log("[SCREENVM]", responce);
  //   };

  const processedBarGraphData = useMemo(() => {
    if (!barGraphData || barGraphData.length === 0) return [];

    // 1. Find range (minDate → maxDate)
    const dates = barGraphData.map((item) => new Date(item.appointment_date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    maxDate.setDate(maxDate.getDate() + 1);
    // 2. Group by date
    const grouped: Record<string, number> = {};
    barGraphData.forEach((item) => {
      const key = new Date(item.appointment_date).toISOString().split("T")[0]; // YYYY-MM-DD
      grouped[key] = (grouped[key] || 0) + 1;
    });

    // 3. Walk from minDate → maxDate, filling missing with 0
    const result: { date: string; count: number }[] = [];
    let current = new Date(minDate);
    while (current <= maxDate) {
      const key = current.toISOString().split("T")[0];
      result.push({
        date: key,
        count: grouped[key] || 0,
      });
      current.setDate(current.getDate() + 1);
    }
    console.log("[SCREENVM-processedBarGraphData]", result);
    return result;
  }, [barGraphData]);

  type LinePoint = {
    value: number;
    // dataPointText: string;
    label: string;
  };

  const appointmentsLineData = useMemo<LinePoint[]>(() => {
    let appointments = appointmentsWithSalesData;
      if (!appointments || appointments.length === 0) {
        return [];
      }

      // Group by date - Count UNIQUE APPOINTMENTS (not appointment services)
      const grouped: Record<string, Set<string>> = {};
      appointments.forEach((item) => {
        if (item?.appointment?.appointment_date) {
          const key = new Date(item.appointment.appointment_date)
            .toISOString()
            .split("T")[0];

          if (!grouped[key]) {
            grouped[key] = new Set();
          }
          // Add unique appointment ID to avoid counting same appointment multiple times
          grouped[key].add(item.appointment.id);
        }
      });

      // Create date range based on dateRange prop or fallback to lineGraphFilter
      const result: LinePoint[] = [];
      
      if (dateRange) {
        // Use custom date range from date picker
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        const totalDays = getInclusiveDayCount(start, end);

        for (let i = 0; i < totalDays; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const key = date.toISOString().split("T")[0];
          const count = grouped[key] ? grouped[key].size : 0;

          result.push({
            value: count,
            label: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });
        }
      } else {
        // Fallback to lineGraphFilter for initial load
        const endDate = new Date();
        for (let i = lineGraphFilter - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(endDate.getDate() - i);
          const key = date.toISOString().split("T")[0];
          const count = grouped[key] ? grouped[key].size : 0;

          result.push({
            value: count,
            label: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });
        }
      }

      console.log("[APPOINTMENTS-DEBUG] Final appointments result:", result);
      return result;
  }, [appointmentsWithSalesData, lineGraphFilter, dateRange]);

  const salesLineData = useMemo<LinePoint[]>(() => {
    let appointments = appointmentsWithSalesData;
      if (!appointments || appointments.length === 0) {
        return [];
      }

      const grouped: Record<string, number> = {};
      appointments.forEach((item) => {
        if (item?.appointment?.appointment_date && item?.appointment?.sales) {
          const key = new Date(item.appointment.appointment_date)
            .toISOString()
            .split("T")[0];

          // Count the NUMBER OF SALES (not the total amount)
          // Filter for valid service sales and count them
          const salesCount = item.appointment.sales.filter(
            (s) => !s.is_voided && s.sale_type === "services"
          ).length;

          grouped[key] = (grouped[key] || 0) + salesCount;
        }
      });

      // Create date range based on dateRange prop or fallback to lineGraphFilter
      const result: LinePoint[] = [];
      
      if (dateRange) {
        // Use custom date range from date picker
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        const totalDays = getInclusiveDayCount(start, end);

        for (let i = 0; i < totalDays; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const key = date.toISOString().split("T")[0];
          const salesCount = grouped[key] || 0;

          result.push({
            value: salesCount,
            label: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });
        }
      } else {
        // Fallback to lineGraphFilter for initial load
        const endDate = new Date();
        for (let i = lineGraphFilter - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(endDate.getDate() - i);
          const key = date.toISOString().split("T")[0];
          const salesCount = grouped[key] || 0;

          result.push({
            value: salesCount,
            label: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });
        }
      }

      console.log("[SALES-DEBUG] Final sales result:", result);
      return result;
  }, [appointmentsWithSalesData, lineGraphFilter, dateRange]);
  //----------------------------------------------------------------Totals th slae with the conditions    ---------------------------------------------------------------
  // const totalSalesAmount = useMemo(() => {
  //   if (!appointmentsWithSalesData || appointmentsWithSalesData.length === 0) {
  //     return 0;
  //   }

  //   let total = 0;
  //   appointmentsWithSalesData.forEach((item) => {
  //     if (item?.appointment?.sales) {
  //       item.appointment.sales.forEach((sale) => {
  //         if (!sale.is_voided && sale.sale_type === "services") {
  //           total += sale.total_amount || 0;
  //         }
  //       });
  //     }
  //   });

  //   return total;
  // }, [appointmentsWithSalesData]);

  // ONLY TOTLA THE SALE WITHOUT CONDITION ---------------------------------------------------------------
  const totalSalesAmount = useMemo(() => {
    if (!appointmentsWithSalesData || appointmentsWithSalesData.length === 0) {
      return 0;
    }

    let total = 0;
    appointmentsWithSalesData.forEach((item) => {
      if (item?.appointment?.sales) {
        item.appointment.sales.forEach((sale) => {
          total += sale.total_amount || 0;
        });
      }
    });

    return total;
  }, [appointmentsWithSalesData]);
  const totalAppointmentPrice = useMemo(() => {
    if (!appointmentsWithSalesData || appointmentsWithSalesData.length === 0) {
      return 0;
    }

    return appointmentsWithSalesData.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  }, [appointmentsWithSalesData]);

  // Helper functions for file generation
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

  const generateHTML = (data: any[], title: string, dateRange: string) => {
    if (data.length === 0)
      return "<html><body><p>No data available</p></body></html>";

    const headers = Object.keys(data[0]);

    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .date-range { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .amount { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p class="date-range">${dateRange}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(header => `
                    <td class="${header.includes('Month') ? 'amount' : ''}">${row[header]}</td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  };

  const downloadTopTeamMembersReport = async (type: "CSV" | "Excel" | "PDF") => {
    try {
      const monthName = getMonthName(selectedMonth);
      const fileName = `${monthName}_${selectedYear}_Top_team_member_report`;
      const dateRange = `Report Period: ${monthName} ${selectedYear} (Current) vs Previous Month`;

      // Format data for export
      const formattedData = staffPerformance.map((staff, index) => ({
        "Rank": index + 1,
        "Team Member": staff.staffName,
        "This Month (AED)": staff.thisMonthAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        "Last Month (AED)": staff.lastMonthAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        "Difference (AED)": (staff.thisMonthAmount - staff.lastMonthAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }));

      if (formattedData.length === 0) {
        Alert.alert("No Data", "No team member data available for the selected period.");
        return;
      }

      let fileContent = "";
      let finalFileName = "";
      let mimeType = "";

      switch (type) {
        case "CSV":
          fileContent = `Top Team Members Report\n${dateRange}\n\n${generateCSV(formattedData)}`;
          finalFileName = `${fileName}.csv`;
          mimeType = "text/csv";
          break;
        case "Excel":
          fileContent = `Top Team Members Report\n${dateRange}\n\n${generateCSV(formattedData)}`;
          finalFileName = `${fileName}.xls`;
          mimeType = "application/vnd.ms-excel";
          break;
        case "PDF":
          const htmlContent = generateHTML(formattedData, "Top Team Members Report", dateRange);
          const { uri: pdfUri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
          });
          finalFileName = `${fileName}.pdf`;

          const finalPdfUri = `${FileSystem.documentDirectory}${finalFileName}`;
          await FileSystem.copyAsync({
            from: pdfUri,
            to: finalPdfUri,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(finalPdfUri, {
              mimeType: "application/pdf",
              dialogTitle: `Export Top Team Members Report as PDF`,
            });
          } else {
            Alert.alert("Success", `PDF saved as ${finalFileName}`);
          }
          return;
        default:
          Alert.alert("Error", "Unsupported export format");
          return;
      }

      // Create file for CSV/Excel
      const fileUri = `${FileSystem.documentDirectory}${finalFileName}`;
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export Top Team Members Report as ${type}`,
        });
      } else {
        Alert.alert("Success", `File saved as ${finalFileName}`);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export report. Please try again.");
    }
  };

  // Function to trigger loading state when date filter changes
  const triggerDateFilterLoading = () => {
    setLoadingStates({
      lineGraph: true,
      barGraph: true,
      activity: true,
      topServices: true,
      staffPerformance: true,
      pieChart: true,
    });
  };

  // Function to refetch all data with new date range
  const refetchAllDataWithDateRange = async (filterObj: { startDate: string; endDate: string }) => {
    triggerDateFilterLoading();
    setFilter({
      startDate: filterObj.startDate,
      endDate: filterObj.endDate,
    });
    try {
      // Calculate staff performance filter based on selected month/year
      const currentMonthStart = new Date(
        Date.UTC(selectedYear, selectedMonth - 1, 1)
      );
      const currentMonthEnd = new Date(Date.UTC(selectedYear, selectedMonth, 0));
      const staffFilter = {
        startDate: currentMonthStart.toISOString().split("T")[0],
        endDate: currentMonthEnd.toISOString().split("T")[0],
        staffNameFilter: debouncedStaffSearchText.trim() || undefined,
      };

      await Promise.all([
        fetchTopServices(filterObj),
        fetchApppointmentsActivityData(filterObj),
        fetchAppointmentsWithSalesData(filterObj),
        fetchStaffPerformanceData(staffFilter),
        fetchSalesByLocationSummary({
          startDate: filterObj.startDate,
          endDate: filterObj.endDate,
          locationIds: undefined,
        }),
      ]);
    } catch (error) {
      console.error("[DASHBOARD-VM] Error refetching data with date range:", error);
    }
  };

  // Test function to verify RPC is working
  const testStaffPerformanceRPC = async () => {
    console.log("\n🧪 [DASHBOARD-VM] Starting RPC test from dashboard...");
    try {
      const result = await paymentRepository.testTeamMemberMonthlySales();
      if (result) {
        Alert.alert("Test Success", "RPC function is working correctly! Check console for details.");
      } else {
        Alert.alert("Test Failed", "RPC function failed. Check console for error details.");
      }
    } catch (error) {
      console.error("[DASHBOARD-VM] Test error:", error);
      Alert.alert("Test Error", "An error occurred during testing. Check console for details.");
    }
  };

  return {
    navigation,
    comissionCaluculationData,
    comissionSummary,
    appointmentsActivityData,
    appointmentsWithSalesData,
    formatCustomDate,
    salesLineData,
    appointmentsLineData,
    barGraphData,
    processedBarGraphData,
    topServices,
    totalSalesAmount,
    staffPerformance,
    // Filter states and handlers
    lineGraphFilter,
    barGraphFilter,
    staffPerformanceFilter,
    showFilterModal,
    activeFilterType,
    setShowFilterModal,
    setActiveFilterType,
    // Staff performance advanced filters
    staffSearchText,
    selectedMonth,
    selectedYear,
    totalAppointmentPrice,
    setStaffSearchText,
    setSelectedMonth,
    setSelectedYear,
    downloadTopTeamMembersReport,
    // Loading states
    loadingStates,
    triggerDateFilterLoading,
    salesByLocationSummary,
    salesByLocationLoading,
    // Data fetching functions
    fetchAppointmentsWithSalesData,
    refetchAllDataWithDateRange,
    fetchTopServices,
    fetchApppointmentsActivityData,
    // Test function
    testStaffPerformanceRPC,
    handleFilterChange: (type: "line" | "bar" | "staff", value: 7 | 30) => {
      switch (type) {
        case "line":
          setLineGraphFilter(value);
          break;
        case "bar":
          setBarGraphFilter(value);
          break;
        case "staff":
          setStaffPerformanceFilter(value);
          break;
      }
      setShowFilterModal(false);
      setActiveFilterType(null);
    },
    openFilterModal: (type: "line" | "bar" | "staff") => {
      setActiveFilterType(type);
      setShowFilterModal(true);
    },
  };
};

export default useDashBoardScreenVM;
