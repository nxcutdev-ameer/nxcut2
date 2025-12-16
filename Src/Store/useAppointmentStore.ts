import { create } from "zustand";
import {
  AppointmentActivityBO,
  AppointmentSalesBO,
  ComissionBO,
  ComissionSummary,
} from "../BOs/appointmentBOs";
import {
  appointmentsRepository,
  GroupedAppointments,
  AppointmentService,
  AppointmentCalanderBO,
} from "../Repository/appointmentsRepository";
import { paymentRepository } from "../Repository/paymentsRepository";
type FetchOptions = {
  force?: boolean;
  useCache?: boolean;
};

type Timestamped<T> = {
  data: T;
  fetchedAt: number;
};

type CacheRecord<T> = Record<string, Timestamped<T>>;

type StaffPerformanceRPCRecord = Record<string, any>;

interface appointmentFilter {
  startDate: string;
  endDate: string;
  staffNameFilter?: string;
}
type BarGraphRange = 7 | 30;

interface AppointmentStore {
  calanderAppointmentsData: AppointmentCalanderBO[];
  topServicesData: GroupedAppointments;
  appointmentsWithSalesData: AppointmentSalesBO[];
  appointmentsActivityData: AppointmentActivityBO[];
  barGraphData: AppointmentActivityBO[];
  comissionCaluculationData: ComissionBO;
  comissionSummary: ComissionSummary[];
  staffPerformanceData: {
    currentMonth: StaffPerformanceRPCRecord[];
    previousMonth: StaffPerformanceRPCRecord[];
  };
  cacheConfig: {
    enabled: boolean;
    ttl: {
      topServices: number;
      appointmentsActivity: number;
      appointmentsWithSales: number;
      barGraph: number;
      staffPerformance: number;
    };
  };
  topServicesCache: CacheRecord<GroupedAppointments>;
  appointmentsActivityCache: CacheRecord<AppointmentActivityBO[]>;
  appointmentsWithSalesCache: CacheRecord<AppointmentSalesBO[]>;
  barGraphCache: CacheRecord<AppointmentActivityBO[]>;
  staffPerformanceCache: CacheRecord<{
    currentMonth: StaffPerformanceRPCRecord[];
    previousMonth: StaffPerformanceRPCRecord[];
  }>;
  fetchCalanderAppointmentsData: (date: string, locationIds?: string[]) => Promise<void>;
  setComissionSummary: (data: ComissionSummary[]) => void;
  setComissionCaluculationData: (data: ComissionBO) => void;
  fetchApppointmentsActivityData: (filter: appointmentFilter, options?: FetchOptions, limitRecords?: number) => Promise<void>;
  fetchAppointmentsWithSalesData: (filter: appointmentFilter, options?: FetchOptions) => Promise<void>;
  fetchAppointmentsBarGraphData: (value: 7 | 30, options?: FetchOptions) => Promise<void>;
  fetchTopServices: (filter: appointmentFilter, options?: FetchOptions) => Promise<void>;
  fetchStaffPerformanceData: (filter: appointmentFilter, options?: FetchOptions) => Promise<void>;
  fetchComission: (
    month: string | number,
    year: string | number
  ) => Promise<void>;
  setAppointmentsCacheEnabled: (enabled: boolean) => void;
  setAppointmentsCacheTTL: (
    section: keyof AppointmentStore["cacheConfig"]["ttl"],
    ttlMs: number
  ) => void;
  clearAppointmentCaches: () => void;
  // clearCalanderData removed - using overlay-wrapped refresh instead
  // clearCalanderData: () => void;
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  calanderAppointmentsData: [],
  topServicesData: {} as GroupedAppointments,
  appointmentsWithSalesData: [],
  appointmentsActivityData: [],
  barGraphData: [],
  comissionCaluculationData: {} as ComissionBO,
  comissionSummary: [] as ComissionSummary[],
  staffPerformanceData: {
    currentMonth: [],
    previousMonth: [],
  },
  cacheConfig: {
    enabled: true,
    ttl: {
      topServices: 2 * 60 * 1000,
      appointmentsActivity: 2 * 60 * 1000,
      appointmentsWithSales: 2 * 60 * 1000,
      barGraph: 2 * 60 * 1000,
      staffPerformance: 2 * 60 * 1000,
    },
  },
  topServicesCache: {},
  appointmentsActivityCache: {},
  appointmentsWithSalesCache: {},
  barGraphCache: {},
  staffPerformanceCache: {},
  setComissionSummary: (data: ComissionSummary[]) => {
    set({ comissionSummary: data });
  },
  setComissionCaluculationData: (data: ComissionBO) => {
    set({ comissionCaluculationData: data });
  },
  setAppointmentsCacheEnabled: (enabled: boolean) =>
    set((state) => ({
      cacheConfig: {
        ...state.cacheConfig,
        enabled,
      },
    })),
  setAppointmentsCacheTTL: (section, ttlMs) =>
    set((state) => ({
      cacheConfig: {
        ...state.cacheConfig,
        ttl: {
          ...state.cacheConfig.ttl,
          [section]: ttlMs,
        },
      },
    })),
  clearAppointmentCaches: () =>
    set({
      topServicesCache: {},
      appointmentsActivityCache: {},
      appointmentsWithSalesCache: {},
      barGraphCache: {},
      staffPerformanceCache: {},
    }),
  fetchCalanderAppointmentsData: async (date: string, locationIds?: string[]) => {
    try {
      let responce = await appointmentsRepository.getAppointmentCalanderData(
        date,
        locationIds
      );
      if (responce) {
        set({ calanderAppointmentsData: responce});
      }
    } catch (err) {
      console.error("[STORE-FETCH-CALANDER]", err);
    }
  },
  fetchApppointmentsActivityData: async (filter: appointmentFilter, options?: FetchOptions, limitRecords?: number) => {
    const { cacheConfig, appointmentsActivityCache } = get();
    const { force = false, useCache } = options ?? {};
    const shouldUseCache = (useCache ?? cacheConfig.enabled) && cacheConfig.enabled && !force;
    const cacheKey = JSON.stringify({
      startDate: filter.startDate,
      endDate: filter.endDate,
      limit: limitRecords,
    });

    if (shouldUseCache) {
      const cached = appointmentsActivityCache[cacheKey];
      const isValid =
        cached && Date.now() - cached.fetchedAt <= cacheConfig.ttl.appointmentsActivity;
      if (isValid) {
        set({ appointmentsActivityData: cached.data });
        return;
      }
    }

    try {
      let responce = await appointmentsRepository.getAppointmentsActivity(
        filter,
        limitRecords
      );
      if (responce) {
        const reversed = responce.reverse();
        set((state) => ({
          appointmentsActivityData: reversed,
          appointmentsActivityCache:
            cacheConfig.enabled && (useCache ?? cacheConfig.enabled) && !force
              ? {
                  ...state.appointmentsActivityCache,
                  [cacheKey]: {
                    data: reversed,
                    fetchedAt: Date.now(),
                  },
                }
              : state.appointmentsActivityCache,
        }));
      }
    } catch (err) {
      console.error("[STORE-FETCH-APPOINTMENTS-Activity]", err);
      if (cacheConfig.enabled) {
        const fallback = appointmentsActivityCache[cacheKey];
        if (fallback) {
          set({ appointmentsActivityData: fallback.data });
        }
      }
    }
  },
  fetchAppointmentsWithSalesData: async (filter: appointmentFilter, options?: FetchOptions) => {
    const { cacheConfig, appointmentsWithSalesCache } = get();
    const { force = false, useCache } = options ?? {};
    const shouldUseCache = (useCache ?? cacheConfig.enabled) && cacheConfig.enabled && !force;
    const cacheKey = JSON.stringify({
      startDate: filter.startDate,
      endDate: filter.endDate,
    });

    if (shouldUseCache) {
      const cached = appointmentsWithSalesCache[cacheKey];
      const isValid =
        cached && Date.now() - cached.fetchedAt <= cacheConfig.ttl.appointmentsWithSales;
      if (isValid) {
        set({ appointmentsWithSalesData: cached.data });
        return;
      }
    }

    try {
      let responce = await appointmentsRepository.fetchAppointmentsWithSaleData({
        startDate: filter.startDate,
        endDate: filter.endDate,
      });

      if (responce) {
        set((state) => ({
          appointmentsWithSalesData: responce,
          appointmentsWithSalesCache:
            cacheConfig.enabled && (useCache ?? cacheConfig.enabled) && !force
              ? {
                  ...state.appointmentsWithSalesCache,
                  [cacheKey]: {
                    data: responce,
                    fetchedAt: Date.now(),
                  },
                }
              : state.appointmentsWithSalesCache,
        }));
      }
    } catch (err) {
      console.error("[STORE-FETCH-SALE-SALE]", err);
      if (cacheConfig.enabled) {
        const fallback = appointmentsWithSalesCache[cacheKey];
        if (fallback) {
          set({ appointmentsWithSalesData: fallback.data });
        }
      }
    }
  },
  fetchComission: async (month: string | number, year: string | number) => {
    try {
      await appointmentsRepository.fetchCommissionCalculations(month as number, year as number);
    } catch (err) {}
  },

  fetchAppointmentsBarGraphData: async (value: BarGraphRange, options?: FetchOptions) => {
    const { cacheConfig, barGraphCache } = get();
    const { force = false, useCache } = options ?? {};
    const shouldUseCache = (useCache ?? cacheConfig.enabled) && cacheConfig.enabled && !force;
    const cacheKey = JSON.stringify({ range: value });

    if (shouldUseCache) {
      const cached = barGraphCache[cacheKey];
      const isValid = cached && Date.now() - cached.fetchedAt <= cacheConfig.ttl.barGraph;
      if (isValid) {
        set({ barGraphData: cached.data });
        return;
      }
    }

    try {
      const today = new Date();
      const startDate = today.toISOString().split("T")[0]; // YYYY-MM-DD

      // Add (value - 1) days to today
      const endDateObj = new Date();
      endDateObj.setDate(today.getDate() + value - 1);
      const endDate = endDateObj.toISOString().split("T")[0];

      // Call repo function with next N days
      const response = await appointmentsRepository.getAppointmentsActivity({
        startDate,
        endDate,
      });
      if (response) {
        set((state) => ({
          barGraphData: response,
          barGraphCache:
            cacheConfig.enabled && (useCache ?? cacheConfig.enabled) && !force
              ? {
                  ...state.barGraphCache,
                  [cacheKey]: {
                    data: response,
                    fetchedAt: Date.now(),
                  },
                }
              : state.barGraphCache,
        }));
      }
    } catch (err) {
      console.error("Error fetching bar graph data:", err);
      if (cacheConfig.enabled) {
        const fallback = barGraphCache[cacheKey];
        if (fallback) {
          set({ barGraphData: fallback.data });
        }
      }
    }
  },

  fetchTopServices: async (filter: appointmentFilter, options?: FetchOptions) => {
    const { cacheConfig, topServicesCache } = get();
    const { force = false, useCache } = options ?? {};
    const shouldUseCache = (useCache ?? cacheConfig.enabled) && cacheConfig.enabled && !force;
    const cacheKey = JSON.stringify({
      startDate: filter.startDate,
      endDate: filter.endDate,
    });

    if (shouldUseCache) {
      const cached = topServicesCache[cacheKey];
      const isValid = cached && Date.now() - cached.fetchedAt <= cacheConfig.ttl.topServices;
      if (isValid) {
        set({ topServicesData: cached.data });
        return;
      }
    }

    try {
      const response =
        await appointmentsRepository.getAppointmentServicesWithPrevMonth(
          filter.startDate,
          filter.endDate
        );
      // console.log("[store-top services]", response);
      if (response) {
        set((state) => ({
          topServicesData: response,
          topServicesCache:
            cacheConfig.enabled && (useCache ?? cacheConfig.enabled) && !force
              ? {
                  ...state.topServicesCache,
                  [cacheKey]: {
                    data: response,
                    fetchedAt: Date.now(),
                  },
                }
              : state.topServicesCache,
        }));
      }
    } catch (err) {
      console.error("Error fetching bar graph data:", err);
      if (cacheConfig.enabled) {
        const fallback = topServicesCache[cacheKey];
        if (fallback) {
          set({ topServicesData: fallback.data });
        }
      }
    }
  },

  fetchStaffPerformanceData: async (filter: appointmentFilter, options?: FetchOptions) => {
    const { cacheConfig, staffPerformanceCache } = get();
    const { force = false, useCache } = options ?? {};
    const shouldUseCache = (useCache ?? cacheConfig.enabled) && cacheConfig.enabled && !force;
    try {
      // Use the provided filter dates for current month
      const currentMonthStart = new Date(filter.startDate);
      const currentMonthEnd = new Date(filter.endDate);

      // Calculate previous month based on the selected month (not current date)
      const selectedYear = currentMonthStart.getUTCFullYear();
      const selectedMonth = currentMonthStart.getUTCMonth(); // 0-based (0=Jan, 1=Feb, etc.)

      // Calculate previous month properly using UTC
      let prevYear = selectedYear;
      let prevMonth = selectedMonth - 1;

      // Handle January case (previous month is December of previous year)
      if (prevMonth < 0) {
        prevMonth = 11; // December
        prevYear = selectedYear - 1;
      }

      const prevMonthStart = new Date(Date.UTC(prevYear, prevMonth, 1));
      const prevMonthEnd = new Date(Date.UTC(prevYear, prevMonth + 1, 0)); // Last day of previous month

      const currentStartStr = currentMonthStart.toISOString().split("T")[0];
      const currentEndStr = currentMonthEnd.toISOString().split("T")[0];
      const prevStartStr = prevMonthStart.toISOString().split("T")[0];
      const prevEndStr = prevMonthEnd.toISOString().split("T")[0];

      const cacheKey = JSON.stringify({
        current: { start: currentStartStr, end: currentEndStr },
        previous: { start: prevStartStr, end: prevEndStr },
        staffName: filter.staffNameFilter ?? null,
      });

      if (shouldUseCache) {
        const cached = staffPerformanceCache[cacheKey];
        const isValid =
          cached && Date.now() - cached.fetchedAt <= cacheConfig.ttl.staffPerformance;
        if (isValid) {
          set({ staffPerformanceData: cached.data });
          return;
        }
      }

      // Fetch data directly from Supabase RPC for both months
      const [currentMonthData, previousMonthData] = await Promise.all([
        paymentRepository.getTeamMemberMonthlySales({
          p_month: selectedMonth + 1,
          p_year: selectedYear,
          p_team_member_name: filter.staffNameFilter,
        }),
        paymentRepository.getTeamMemberMonthlySales({
          p_month: prevMonth + 1,
          p_year: prevYear,
          p_team_member_name: filter.staffNameFilter,
        }),
      ]);
      const data = {
        currentMonth: Array.isArray(currentMonthData) ? currentMonthData : [],
        previousMonth: Array.isArray(previousMonthData) ? previousMonthData : [],
      };

      set((state) => ({
        staffPerformanceData: data,
        staffPerformanceCache:
          cacheConfig.enabled && (useCache ?? cacheConfig.enabled) && !force
            ? {
                ...state.staffPerformanceCache,
                [cacheKey]: {
                  data,
                  fetchedAt: Date.now(),
                },
              }
            : state.staffPerformanceCache,
      }));
    } catch (err) {
      console.error("Error fetching staff performance data:", err);
      if (cacheConfig.enabled) {
        const currentMonthStart = new Date(filter.startDate);
        const currentMonthEnd = new Date(filter.endDate);
        const prevMonthStart = new Date(currentMonthStart);
        prevMonthStart.setUTCMonth(prevMonthStart.getUTCMonth() - 1);
        const prevMonthEnd = new Date(prevMonthStart);
        prevMonthEnd.setUTCDate(0);
        const fallbackKey = JSON.stringify({
          current: {
            start: currentMonthStart.toISOString().split("T")[0],
            end: currentMonthEnd.toISOString().split("T")[0],
          },
          previous: {
            start: prevMonthStart.toISOString().split("T")[0],
            end: prevMonthEnd.toISOString().split("T")[0],
          },
          staffName: filter.staffNameFilter ?? null,
        });
        const fallback = staffPerformanceCache[fallbackKey];
        if (fallback) {
          set({ staffPerformanceData: fallback.data });
        }
      }
    }
  },
}));
