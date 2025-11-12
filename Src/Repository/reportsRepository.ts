import { AppointmentBO, SalesReportBO } from "../BOs/reportsBO";
import { supabase } from "../Utils/supabase";
import { useAuthStore } from "../Store/useAuthStore";
export interface SalesPerformanceDailyPivotParams {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  sale_types?: string[];
  payment_methods?: string[];
  staff_ids?: string[];
  location_ids?: string[]; // optional, fallback to currentLocation
}

export interface SalesPerformanceDailyPivotRow {
  sale_date: string; // date
  services: number; // non-membership services
  membership_services: number; // membership services (service_price)
  products: number; // non-voucher products
  total_sales: number; // total of the above
  total_appointments: number; // distinct appointments
}

export interface SalesByLocationRow {
  location_id: string;
  location_name: string;
  total_sales_amount: number;
  transaction_count: number;
  avg_transaction_value: number;
  card_amount: number;
  cash_amount: number;
  online_amount: number;
  other_amount: number;
}

//const EXCLUDED_PAYMENT_METHODS = new Set(["membership", "voucher", "courtesy"]);

export const reportsRepository = {
  async getAppointments() {
    try {
      const currentLocation = useAuthStore.getState().currentLocation;
      const { data, error } = await supabase
        .from("appointments")
        .select("*") // you can narrow down fields like "id, user_id, date, status"
        .eq("location_id", currentLocation)
        .order("created_at", { ascending: false }); // optional: latest first

      if (error) {
        console.error(
          "[reportsRepository] getAppointments error:",
          error.message
        );
        throw new Error(error.message);
      }
      console.log("[REPORTS-REPO]-APPOINTMENTS", data);
      return data; // raw appointments array
    } catch (err) {
      console.error("[reportsRepository] Unexpected error:", err);
      throw err;
    }
  },
  async getAppointmentsByLocation(
    location_id: string
  ): Promise<AppointmentBO[]> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*") // or list fields explicitly if you prefer
        .eq("location_id", location_id)
        .order("appointment_date", { ascending: true }); // upcoming first

      if (error) {
        console.error(
          "[reportsRepository] getAppointmentsByLocation error:",
          error.message
        );
        throw new Error(error.message);
      }

      return data as AppointmentBO[];
    } catch (err) {
      console.error("[reportsRepository] Unexpected error:", err);
      throw err;
    }
  },

  async getSalesPerformanceDailyPivot(
    params: SalesPerformanceDailyPivotParams
  ): Promise<SalesPerformanceDailyPivotRow[]> {
    const {
      start_date,
      end_date,
      sale_types = null,
      payment_methods = null,
      staff_ids = null,
      location_ids = params.location_ids || null, // Use passed location_ids or null for all locations
    } = params;

    const { data, error } = await supabase.rpc(
      "get_sales_performance_daily_pivot",
      {
        p_start_date: start_date,
        p_end_date: end_date,
        p_sale_types: sale_types,
        p_payment_methods: payment_methods,
        p_staff_ids: staff_ids,
        p_location_ids: location_ids,
      }
    );
    console.log("SALES_PERFORMANCE_DAILY_PIVOT", data);
    if (error) {
      console.error("Error fetching sales performance pivot:", error);
      throw error;
    }

    return (data ?? []) as SalesPerformanceDailyPivotRow[];
  },

  async getSalesByLocationSummary(params: {
    start_date: string;
    end_date?: string;
    location_ids?: string[] | null;
  }): Promise<SalesByLocationRow[]> {
    const { start_date, end_date, location_ids } = params;

    const normalizeStartDate = (value: string) => {
      if (!value) {
        throw new Error("start_date is required");
      }

      const parsed = new Date(value.includes("T") ? value : `${value}T00:00:00`);
      if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid start_date provided: ${value}`);
      }
      parsed.setHours(0, 0, 0, 0);
      return parsed.toISOString();
    };

    const normalizeEndDate = (value?: string) => {
      const now = new Date();

      if (!value) {
        return now.toISOString();
      }

      const parsed = new Date(value.includes("T") ? value : `${value}T00:00:00`);
      if (isNaN(parsed.getTime())) {
        return now.toISOString();
      }

      if (
        parsed.getFullYear() === now.getFullYear() &&
        parsed.getMonth() === now.getMonth() &&
        parsed.getDate() === now.getDate()
      ) {
        return now.toISOString();
      }

      parsed.setHours(23, 59, 59, 999);
      return parsed.toISOString();
    };

    const normalizedStart = normalizeStartDate(start_date);
    const normalizedEnd = normalizeEndDate(end_date);

    const rpcPayload: Record<string, any> = {
      p_start_date: normalizedStart,
      p_end_date: normalizedEnd,
    };

    if (location_ids && location_ids.length > 0) {
      rpcPayload.p_locations = location_ids;
    } else {
      rpcPayload.p_locations = null;
    }
    try {
      const { data, error } = await supabase.rpc(
        "get_location_sales_totals",
        rpcPayload
      );

      if (error) {
        throw error;
      }

      return (data ?? []).map((row: any) => {
        const total = Number(row.total_sales_amount) || 0;
        const card = Number(row.card_amount) || 0;
        const cash = Number(row.cash_amount) || 0;
        const online = Number(row.online_amount) || 0;
        const rpcOther =
          row.other_amount !== undefined && row.other_amount !== null
            ? Number(row.other_amount)
            : undefined;
        const derivedOther =
          rpcOther !== undefined
            ? rpcOther
            : Math.max(total - (card + cash + online), 0);

        return {
          location_id: row.location_id,
          location_name: row.location_name,
          total_sales_amount: total,
          transaction_count: Number(row.transaction_count) || 0,
          avg_transaction_value: Number(row.avg_transaction_value) || 0,
          card_amount: card,
          cash_amount: cash,
          online_amount: online,
          other_amount: derivedOther,
        } as SalesByLocationRow;
      });
    } catch (error) {
      console.warn(
        "[reportsRepository] Falling back to client-side aggregation for sales by location:",
        error
      );

      return [];
    }
  },
};
