import { View, Text } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Navigation } from "lucide-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  reportsRepository,
  SalesPerformanceDailyPivotParams,
  SalesPerformanceDailyPivotRow,
} from "../../../Repository/reportsRepository";
import { useAuthStore } from "../../../Store/useAuthStore";

const usePerformanceDashboardScreenVM = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const [pageFilter, setPageFilter] =
    useState<SalesPerformanceDailyPivotParams>(() => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      return {
        start_date: thirtyDaysAgo.toISOString().split("T")[0],
        end_date: today.toISOString().split("T")[0],
        sale_types: [],
        payment_methods: [],
        staff_ids: [],
        location_ids: [],
      };
    });
  const [dateRange, setDateRange] = useState<{
    start_date: string;
    end_date: string;
  }>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      start_date: thirtyDaysAgo.toISOString().split("T")[0],
      end_date: today.toISOString().split("T")[0],
    };
  });
  const [performanceData, setPerformanceData] = useState<
    SalesPerformanceDailyPivotRow[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { allLocations, allTeamMembers } = useAuthStore();
  const goBack = () => {
    navigation.goBack();
  };

  const fetchPerformanceData = async () => {
    await fetchPerformanceDataWithFilter(pageFilter);
  };

  useEffect(() => {
    // On initial load, fetch data for all locations (don't pass location filter)
    fetchPerformanceData();
    console.log("PERFORMANCE_DATA", performanceData);
  }, [dateRange]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return {
        totalTransactions: 0,
        averageSaleValue: 0,
        onlineSales: 0,
        appointments: 0,
        occupancyRate: 0,
        returningClientRate: 0,
      };
    }

    const totalSales = performanceData.reduce(
      (sum, item) => sum + item.total_sales,
      0
    );
    const totalTransactions = performanceData.reduce(
      (sum, item) => sum + item.total_appointments,
      0
    );
    const averageSaleValue =
      totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Online sales should be same as total sales
    const onlineSales = totalSales;

    // Appointments should be same as total transactions
    const appointments = totalTransactions;

    // Mock occupancy rate and returning client rate for now
    // These would need additional data/calculations in a real scenario
    const occupancyRate = 75.0; // Mock value
    const returningClientRate = 0; // Mock value

    return {
      totalTransactions,
      averageSaleValue,
      onlineSales,
      appointments,
      occupancyRate,
      returningClientRate,
    };
  }, [performanceData]);

  // Calculate sales by channel breakdown
  const salesByChannelData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return [];
    }

    const totalServices = performanceData.reduce(
      (sum, item) => sum + item.services,
      0
    );
    const totalMembershipServices = performanceData.reduce(
      (sum, item) => sum + item.membership_services,
      0
    );
    const totalProducts = performanceData.reduce(
      (sum, item) => sum + item.products,
      0
    );
    const totalPeriodSales =
      totalServices + totalMembershipServices + totalProducts;
    const daysInPeriod = performanceData.length;

    const channels = [
      {
        type: "services",
        totalSales: totalServices,
        percentage:
          totalPeriodSales > 0 ? (totalServices / totalPeriodSales) * 100 : 0,
        dailyAverage: daysInPeriod > 0 ? totalServices / daysInPeriod : 0,
      },
      {
        type: "membership services",
        totalSales: totalMembershipServices,
        percentage:
          totalPeriodSales > 0
            ? (totalMembershipServices / totalPeriodSales) * 100
            : 0,
        dailyAverage:
          daysInPeriod > 0 ? totalMembershipServices / daysInPeriod : 0,
      },
      {
        type: "products",
        totalSales: totalProducts,
        percentage:
          totalPeriodSales > 0 ? (totalProducts / totalPeriodSales) * 100 : 0,
        dailyAverage: daysInPeriod > 0 ? totalProducts / daysInPeriod : 0,
      },
    ];

    const totalRow = {
      type: "Total Period",
      totalSales: totalPeriodSales,
      percentage: 100.0,
      dailyAverage: daysInPeriod > 0 ? totalPeriodSales / daysInPeriod : 0,
    };

    return [...channels, totalRow];
  }, [performanceData]);

  const formatBarGraphData = () => {
    return;
  };
  const formatLineGraphData = () => {
    console.log(
      "[LineGraph] Formatting data, performanceData length:",
      performanceData?.length || 0
    );

    if (!performanceData || performanceData.length === 0) {
      console.log("[LineGraph] No data available, returning empty state");
      return {
        servicesData: [],
        productsData: [],
        membershipsData: [],
        vouchersData: [],
        maxValue: 100,
        xAxisLabels: [],
      };
    }

    try {
      // Sort data by date to ensure proper chronological order
      const sortedData = [...performanceData].sort((a, b) => {
        const dateA = new Date(a.sale_date).getTime();
        const dateB = new Date(b.sale_date).getTime();
        return dateA - dateB;
      });

      console.log("[LineGraph] Sorted data length:", sortedData.length);
      console.log("[LineGraph] First item date:", sortedData[0]?.sale_date);
      console.log(
        "[LineGraph] Last item date:",
        sortedData[sortedData.length - 1]?.sale_date
      );

      // Process data for each category with conditional labels (only every 4th item gets a label)
      const servicesData = sortedData.map((item, index) => {
        const value = Math.max(0, item.services || 0); // Ensure non-negative
        const shouldShowLabel = index % 4 === 0;
        const label = shouldShowLabel
          ? new Date(item.sale_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "";

        return {
          value,
          dataPointText: `$${value.toLocaleString()}`,
          label,
        };
      });

      const productsData = sortedData.map((item, index) => {
        const value = Math.max(0, item.products || 0);
        const shouldShowLabel = index % 4 === 0;
        const label = shouldShowLabel
          ? new Date(item.sale_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "";

        return {
          value,
          dataPointText: `$${value.toLocaleString()}`,
          label,
        };
      });

      const membershipsData = sortedData.map((item, index) => {
        const value = Math.max(0, item.membership_services || 0);
        const shouldShowLabel = index % 4 === 0;
        const label = shouldShowLabel
          ? new Date(item.sale_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "";

        return {
          value,
          dataPointText: `$${value.toLocaleString()}`,
          label,
        };
      });

      // For vouchers, we'll use a calculated field (10% of products)
      const vouchersData = sortedData.map((item, index) => {
        const value = Math.max(0, Math.floor((item.products || 0) * 0.1));
        const shouldShowLabel = index % 4 === 0;
        const label = shouldShowLabel
          ? new Date(item.sale_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "";

        return {
          value,
          dataPointText: `$${value.toLocaleString()}`,
          label,
        };
      });

      // Find maximum value across all categories for Y-axis scaling
      const allValues = [
        ...servicesData.map((d) => d.value),
        ...productsData.map((d) => d.value),
        ...membershipsData.map((d) => d.value),
        ...vouchersData.map((d) => d.value),
      ].filter((v) => !isNaN(v) && isFinite(v));

      const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
      const finalMaxValue = Math.ceil(maxValue * 1.2); // Add 20% padding

      console.log("[LineGraph] Data processed successfully");
      console.log("[LineGraph] Max value:", finalMaxValue);
      console.log("[LineGraph] Services data points:", servicesData.length);

      return {
        servicesData,
        productsData,
        membershipsData,
        vouchersData,
        maxValue: finalMaxValue,
        xAxisLabels: servicesData.filter((d) => d.label).map((d) => d.label),
      };
    } catch (error) {
      console.error("[LineGraph] Error formatting data:", error);
      return {
        servicesData: [],
        productsData: [],
        membershipsData: [],
        vouchersData: [],
        maxValue: 100,
        xAxisLabels: [],
      };
    }
  };

  const barGraphData = useMemo(() => {
    formatBarGraphData();
  }, [performanceData]);

  const lineGraphData = useMemo(() => {
    return formatLineGraphData();
  }, [performanceData]);
  const updateDateFilter = (newDateRange: {
    start_date: string;
    end_date: string;
  }) => {
    setDateRange(newDateRange);
    setPageFilter((prev) => ({
      ...prev,
      start_date: newDateRange.start_date,
      end_date: newDateRange.end_date,
    }));
    setShowMonthFilter(false);
  };

  const openFilterPanel = () => {
    setShowFilterPanel(true);
  };

  const closeFilterPanel = () => {
    setShowFilterPanel(false);
  };

  const toggleFilterAccordion = (filterType: string) => {
    setExpandedFilter(expandedFilter === filterType ? null : filterType);
  };

  const toggleLocationFilter = (locationId: string) => {
    setPageFilter((prev) => {
      const currentLocationIds = prev.location_ids || [];
      const isSelected = currentLocationIds.includes(locationId);

      if (isSelected) {
        // Remove location ID
        return {
          ...prev,
          location_ids: currentLocationIds.filter((id) => id !== locationId),
        };
      } else {
        // Add location ID
        return {
          ...prev,
          location_ids: [...currentLocationIds, locationId],
        };
      }
    });
  };

  const toggleTeamMemberFilter = (staffId: string) => {
    setPageFilter((prev) => {
      const currentStaffIds = prev.staff_ids || [];
      const isSelected = currentStaffIds.includes(staffId);

      if (isSelected) {
        // Remove staff ID
        return {
          ...prev,
          staff_ids: currentStaffIds.filter((id) => id !== staffId),
        };
      } else {
        // Add staff ID
        return {
          ...prev,
          staff_ids: [...currentStaffIds, staffId],
        };
      }
    });
  };

  const clearFilters = () => {
    setPageFilter({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      sale_types: [],
      payment_methods: [],
      staff_ids: [],
      location_ids: [],
    });
    console.log("Filters cleared");
  };

  const applyFilters = async () => {
    // Update the pageFilter with current date range
    const updatedFilter = {
      ...pageFilter,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
    };
    setPageFilter(updatedFilter);
    console.log("Filters applied:", updatedFilter);
    setShowFilterPanel(false);

    // Trigger data refetch with updated filters
    await fetchPerformanceDataWithFilter(updatedFilter);
  };

  const fetchPerformanceDataWithFilter = async (
    filterToUse: SalesPerformanceDailyPivotParams
  ) => {
    try {
      console.log("=== PERFORMANCE DATA FETCH DEBUG ===");
      console.log("Filter being used:", filterToUse);
      console.log(
        "Current user location:",
        useAuthStore.getState().currentLocation
      );
      console.log("Available locations:", allLocations.length);
      setLoading(true);

      // Only include filter parameters that have actual values
      const apiFilter: Partial<SalesPerformanceDailyPivotParams> = {
        start_date: filterToUse.start_date,
        end_date: filterToUse.end_date,
      };

      // Only add arrays if they have values
      if (filterToUse.sale_types && filterToUse.sale_types.length > 0) {
        apiFilter.sale_types = filterToUse.sale_types;
        console.log("Including sale_types filter:", apiFilter.sale_types);
      }
      if (
        filterToUse.payment_methods &&
        filterToUse.payment_methods.length > 0
      ) {
        apiFilter.payment_methods = filterToUse.payment_methods;
        console.log(
          "Including payment_methods filter:",
          apiFilter.payment_methods
        );
      }
      if (filterToUse.staff_ids && filterToUse.staff_ids.length > 0) {
        apiFilter.staff_ids = filterToUse.staff_ids;
        console.log("Including staff_ids filter:", apiFilter.staff_ids);
      }
      if (filterToUse.location_ids && filterToUse.location_ids.length > 0) {
        apiFilter.location_ids = filterToUse.location_ids;
        console.log("Including location_ids filter:", apiFilter.location_ids);
      } else {
        console.log("NO location filter - should fetch ALL locations data");
      }

      console.log("Final API Filter being sent:", apiFilter);
      console.log("=== END DEBUG ===");

      const data = await reportsRepository.getSalesPerformanceDailyPivot(
        apiFilter as SalesPerformanceDailyPivotParams
      );
      setPerformanceData(data);
      console.log("PERFORMANCE_DATA received:", data.length, "records");
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    goBack,
    barGraphData,
    lineGraphData,
    showMonthFilter,
    setShowMonthFilter,
    dateRange,
    setDateRange,
    updateDateFilter,
    performanceData,
    loading,
    fetchPerformanceData,
    performanceMetrics,
    salesByChannelData,
    expandedFilter,
    toggleFilterAccordion,
    toggleLocationFilter,
    toggleTeamMemberFilter,
    pageFilter,
    allLocations,
    allTeamMembers,
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    clearFilters,
    applyFilters,
  };
};

export default usePerformanceDashboardScreenVM;
