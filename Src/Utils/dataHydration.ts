import { useAppointmentStore } from "../Store/useAppointmentStore";
import { useAuthStore } from "../Store/useAuthStore";

export interface HydrationProgress {
  dashboardComplete: boolean;
  calendarComplete: boolean;
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
}

export class DataHydrationService {
  private static instance: DataHydrationService | null = null;
  private hydrationPromise: Promise<void> | null = null;

  static getInstance(): DataHydrationService {
    if (!DataHydrationService.instance) {
      DataHydrationService.instance = new DataHydrationService();
    }
    return DataHydrationService.instance;
  }

  private constructor() {}

  public async hydrateInitialData(
    onProgress?: (progress: HydrationProgress) => void
  ): Promise<void> {
    if (this.hydrationPromise) {
      return this.hydrationPromise;
    }

    this.hydrationPromise = this.performHydration(onProgress);
    return this.hydrationPromise;
  }

  private async performHydration(
    onProgress?: (progress: HydrationProgress) => void
  ): Promise<void> {
    const store = useAppointmentStore.getState();
    const totalSteps = 8;
    let completedSteps = 0;

    const updateProgress = (
      step: string,
      dashboardComplete = false,
      calendarComplete = false
    ) => {
      const progress: HydrationProgress = {
        dashboardComplete,
        calendarComplete,
        totalSteps,
        completedSteps,
        currentStep: step,
      };
      onProgress?.(progress);
    };

    try {
      // Dashboard Data Hydration
      console.log("[HYDRATION] Starting dashboard data hydration...");

      // Step 1: Fetch all locations and team members data
      updateProgress("Loading locations data...");
      const authStore = useAuthStore.getState();
      await authStore.fetchAllLocations();
      completedSteps++;

      // Step 2: Fetch all team members data
      updateProgress("Loading team members data...");
      await authStore.fetchAllTeamMembers();
      completedSteps++;

      // Step 3: Fetch dashboard filter data (last 7 days for initial load)
      updateProgress("Loading dashboard activity data...");
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      const filter = {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      };

      // Step 4: Fetch top services data
      completedSteps++;
      updateProgress("Loading top services data...");
      await store.fetchTopServices(filter);

      // Step 5: Fetch bar graph data (next 7 days)
      completedSteps++;
      updateProgress("Loading upcoming appointments...");
      await store.fetchAppointmentsBarGraphData(7);

      // Step 6: Fetch appointments activity data
      completedSteps++;
      updateProgress("Loading appointments activity...");
      await store.fetchApppointmentsActivityData(filter);

      // Step 7: Fetch appointments with sales data for line graph
      completedSteps++;
      updateProgress("Loading sales data...");
      await store.fetchAppointmentsWithSalesData(filter);

      console.log("[HYDRATION] Dashboard data hydration completed");

      // Step 8: Fetch staff performance data (current month)
      completedSteps++;
      updateProgress("Loading staff performance data...", true, false);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentMonthStart = new Date(
        Date.UTC(currentYear, currentMonth - 1, 1)
      );
      const currentMonthEnd = new Date(Date.UTC(currentYear, currentMonth, 0));
      const staffFilter = {
        startDate: currentMonthStart.toISOString().split("T")[0],
        endDate: currentMonthEnd.toISOString().split("T")[0],
      };
      await store.fetchStaffPerformanceData(staffFilter);

      // Calendar Data Hydration
      console.log("[HYDRATION] Starting calendar data hydration...");

      // Step 9: Fetch calendar data for today
      completedSteps++;
      updateProgress("Loading calendar appointments...", true, false);
      const today = new Date().toISOString();
      await store.fetchCalanderAppointmentsData(today);

      completedSteps++;
      updateProgress("Hydration complete", true, true);

      console.log("[HYDRATION] All data hydration completed successfully");
    } catch (error) {
      console.error("[HYDRATION] Error during data hydration:", error);
      // Continue with app load even if hydration fails partially
      updateProgress("Hydration completed with some errors", true, true);
    } finally {
      // Reset hydration promise so it can run again if needed
      this.hydrationPromise = null;
    }
  }

  public async hydrateOnLogin(
    onProgress?: (progress: HydrationProgress) => void
  ): Promise<void> {
    console.log("[HYDRATION] Starting post-login data hydration...");
    return this.hydrateInitialData(onProgress);
  }

  public resetHydration(): void {
    this.hydrationPromise = null;
    console.log("[HYDRATION] Hydration state reset");
  }

  public isHydrating(): boolean {
    return this.hydrationPromise !== null;
  }
}

export const dataHydrationService = DataHydrationService.getInstance();
