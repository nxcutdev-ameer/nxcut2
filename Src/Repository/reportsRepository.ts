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
  payment_method_count?: number;
  other_amount: number;
  total_sales_all_methods?: number;
  redeem_amount?: number;
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

      const parsed = new Date(
        value.includes("T") ? value : `${value}T00:00:00`
      );
      if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid start_date provided: ${value}`);
      }
      parsed.setHours(0, 0, 0, 0);
      return parsed.toISOString();
    };

    const normalizeEndDate = (value?: string, startFallback?: string) => {
      const source = value ?? startFallback;
      if (!source) {
        throw new Error("end_date requires a value when start_date is missing");
      }

      const parsed = new Date(
        source.includes("T") ? source : `${source}T00:00:00`
      );

      if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid end_date provided: ${source}`);
      }

      parsed.setHours(0, 0, 0, 0);
      return parsed.toISOString();
    };

    const normalizedStart = normalizeStartDate(start_date);
    const normalizedEnd = normalizeEndDate(end_date, start_date);

    const normalizedLocationIds =
      location_ids && location_ids.length > 0 ? [...location_ids].sort() : null;

    const rpcPayload: Record<string, any> = {
      p_start: normalizedStart,
      p_end: normalizedEnd,
      p_location_ids: normalizedLocationIds,
    };
    try {
      const { data, error } = await supabase.rpc(
        "get_total_sales_per_location",
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
        const paymentMethodCountRaw =
          row.payment_method_count !== undefined
            ? Number(row.payment_method_count)
            : undefined;
        const paymentMethodCount =
          paymentMethodCountRaw !== undefined && !Number.isNaN(paymentMethodCountRaw)
            ? paymentMethodCountRaw
            : Number(row.transaction_count) || 0;
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
          payment_method_count: paymentMethodCount,
          other_amount: derivedOther,
          total_sales_all_methods:
            row.total_sales_all_methods !== undefined &&
            row.total_sales_all_methods !== null
              ? Number(row.total_sales_all_methods) || 0
              : undefined,
          redeem_amount:
            row.redeem_amount !== undefined && row.redeem_amount !== null
              ? Number(row.redeem_amount) || 0
              : undefined,
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
