import { useAuthStore } from "../Store/useAuthStore";
import { supabase } from "../Utils/supabase";

export interface FinanceSalesBO {
  id: number;
  sale_type: string;
  subtotal: number;
  tax_amount: number;
  tip_amount: number;
  total_amount: number;
  discount_amount: number;
  manual_discount: number;
  membership_discount: number;
  voucher_discount: number;
  voucher_code: string | null;
  payment_method: string;
  payment_method_id: string | null;
  receptionist_id: string;
  receptionist_name: string;
  notes: string | null;
  is_voided: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp

  client_id: string;
  client: {
    first_name: string;
    last_name: string;
  };

  location_id: string;
  location: {
    name: string;
  };

  appointment_id: string;
  appointment: {
    id: string;
    notes: string | null;
    status: string;
    client_id: string;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
    location_id: string;
    appointment_date: string; // YYYY-MM-DD
  };
}
export interface Sale {
  id: number;
  created_at: string;
  is_voided: boolean;
  location_id: string;
}
export interface ClientVoucher {
  id: string;
  client_id: string;
  voucher_id: string;
  purchase_date: string;
  original_value: number;
  created_at: string;
  updated_at: string;
  voucher_code: string;
  purchase_sale_id: number;
  discount_percentage: number | null;
  status: string | null;
  location_id: string;
}
export interface SalePaymentMethod {
  id: string;
  sale_id: number;
  payment_method: string;
  amount: number;
  is_voided: boolean;
  created_at: string;
  payment_method_id: string | null;
  sale: Sale;
}
export const financeRepository = {
  async getFinanceSalesData(
    startDate: string, // "YYYY-MM-DD"
    endDate: string, // "YYYY-MM-DD"
    locationIds?: string[]
  ): Promise<FinanceSalesBO[]> {
    try {
      const currentLocation = useAuthStore.getState().currentLocation;
      
      // Use provided locationIds or fallback to currentLocation
      const locationsToFilter = locationIds && locationIds.length > 0 
        ? locationIds 
        : [currentLocation];
      
      // If startDate === endDate, fetch entire day 24h
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (startDate === endDate) {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }
      
      let query = supabase
        .from("sales")
        .select(
          `
              *,
              client:clients(first_name,last_name),
              location:locations(name),
              appointment:appointments(*)
            `
        )
        .eq("is_voided", false)
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());
      
      // Apply location filter
      if (locationsToFilter.length > 0) {
        query = query.in("location_id", locationsToFilter);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Supabase fetch error:", error.message);
        return [];
      }
      console.log("getFinanceSalesData", data.length);
      return data as FinanceSalesBO[];
    } catch (err) {
      console.error("getFinanceSalesData error:", err);
      return [];
    }
  },
  async getFinanceDiscountData(
    startDate: string,
    endDate: string,
    locationIds?: string[]
  ): Promise<SalePaymentMethod[]> {
    const currentLocation = useAuthStore.getState().currentLocation;
    
    // Use provided locationIds or fallback to currentLocation
    const locationsToFilter = locationIds && locationIds.length > 0 
      ? locationIds 
      : [currentLocation];
    
    const { data, error } = await supabase
      .from("sale_payment_methods")
      .select(
        `
          id,
          sale_id,
          payment_method,
          amount,
          is_voided,
          created_at,
          payment_method_id,
          sale:sales!inner(
            id,
            created_at,
            is_voided,
            location_id
          )
        `
      )
      .eq("is_voided", false)
      .eq("sale.is_voided", false)
      .in("sale.location_id", locationsToFilter)
      .gte("sale.created_at", startDate)
      .lte("sale.created_at", endDate);

    if (error) {
      console.error("❌ Error fetching sale payments:", error.message);
      return [];
    }
    console.log("getFinanceDiscountData", data.length);
    return (data ?? []) as SalePaymentMethod[] | [];
  },

  async getFinanceVoucherData(
    startDate: string,
    endDate: string,
    locationIds?: string[]
  ): Promise<ClientVoucher[]> {
    // Use string dates directly for Supabase queries
    let queryStartDate = startDate;
    let queryEndDate = endDate;
    const currentLocation = useAuthStore.getState().currentLocation;
    
    // Use provided locationIds or fallback to currentLocation
    const locationsToFilter = locationIds && locationIds.length > 0 
      ? locationIds 
      : [currentLocation];
    
    // If same date, expand to full day
    if (startDate === endDate) {
      queryStartDate = `${startDate} 00:00:00`;
      queryEndDate = `${endDate} 23:59:59`;
    }

    let query = supabase
      .from("client_vouchers")
      .select("*, sales:purchase_sale_id(location_id)")
      .gte("purchase_date", queryStartDate)
      .lte("purchase_date", queryEndDate);
    
    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching finance vouchers:", error.message);
      return [];
    }
    
    // Filter by location IDs client-side (filtering on joined table)
    let filteredData = data ?? [];
    if (locationIds && locationIds.length > 0) {
      filteredData = (data ?? []).filter((voucher: any) => 
        voucher.sales?.location_id && locationsToFilter.includes(voucher.sales.location_id)
      );
      console.log("Filtered vouchers by location:", {
        locationIds: locationsToFilter,
        totalVouchers: data?.length || 0,
        filteredVouchers: filteredData.length
      });
    }
    
    console.log("getFinanceVoucherData", filteredData.length);
    return filteredData as ClientVoucher[];
  },
};
