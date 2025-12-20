import { SaleBO } from "../BOs/reportsBO";
import { useAuthStore } from "../Store/useAuthStore";
import { supabase } from "../Utils/supabase";
function formatDateForRPC(date: string | Date): string {
  const d = new Date(date);
  // convert to YYYY-MM-DD
  return d.toISOString().split("T")[0];
}
export interface SalesLogBO {
  date: string;
  appt_date: string;
  sale_no: string;
  location: string;
  type: string;
  item: string;
  category: string;
  client: string;
  team_member: string;
  channel: string;
  service_price: number;
  discount_percent: number;
  gross_sales: number;
  item_discounts: number;
  cart_discounts: number;
  total_discounts: number;
  refunds: number;
  net_sales: number;
  tax: number;
  total_sales: number;
}

// Define the input parameters type
interface SalesFetchParams {
  p_start_date: string;
  p_end_date: string;
  p_location_ids?: string[]; // optional
  p_payment_methods?: string[]; // optional
  p_sale_types?: string[]; // optional
  p_staff_ids?: string[]; // optional
}
export interface Sale {
  is_voided: boolean;
  created_at: string; // ISO timestamp
}

export interface SalePaymentMethodRange {
  id: string;
  sale_id: number;
  payment_method: string;
  amount: number;
  is_voided: boolean;
  created_at: string; // ISO timestamp
  payment_method_id: string | null;
  sale: Sale;
}

export type SaleItem = {
  item_type: string;
  total_price: number;
  sales: {
    id: number;
    location_id: string;
    created_at: string;
  };
};
type SalePaymentMethod = {
  payment_method: string;
  payment_method_id: string | null;
  amount: number;
  payment_methods?: {
    id: string;
    name: string;
  } | null;
  sales: {
    id: number;
    location_id: string;
    created_at: string;
    tip_amount: number | null;
    is_voided: boolean;
    client_id: string;
    location?: {
      id: string;
      name: string;
    };
    client?: {
      id: string;
      first_name: string;
      last_name: string;
    };
  };
};

export const paymentRepository = {
  async getPayments(filters: {
    fromDate: string;
    toDate: string;
    isVoided?: boolean;
    locationId?: string | string[];
    teamMemberId?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
  }) {
    const currentLocation = useAuthStore.getState().currentLocation;
    
    // Determine location IDs to use
    const locationIds = filters.locationId 
      ? (Array.isArray(filters.locationId) ? filters.locationId : [filters.locationId])
      : [currentLocation];
    
    let query = supabase
      .from("sale_payment_methods")
      .select(
        `
        id,
        sale_id,
        payment_method,
        amount,
        is_voided,
        created_at,
        sale:sales!inner(
          id,
          subtotal,
          tax_amount,
          tip_amount,
          total_amount,
          discount_amount,
          payment_method,
          receptionist_name,
          location_id,
          client:clients(first_name,last_name),
          location:locations(name),
          appointment:appointments(
            id,
            appointment_services(
              staff:team_members!appointment_services_staff_id_fkey(first_name,last_name)
            )
          )
        )
      `
      )
      .gte("created_at", filters.fromDate) // start date
      .lte("created_at", filters.toDate) // end date
      .order("created_at", { ascending: false });

    // Apply optional filters
    if (filters.isVoided !== undefined) {
      query = query.eq("is_voided", filters.isVoided);
    } else {
      query = query.eq("is_voided", false); // default
    }

    if (filters.teamMemberId) {
      query = query.eq(
        "sale.appointment.appointment_services.staff.id",
        filters.teamMemberId
      );
    }

    if (filters.paymentMethod) {
      query = query.eq("payment_method", filters.paymentMethod);
    }

    if (filters.minAmount) {
      query = query.gte("amount", filters.minAmount);
    }

    if (filters.maxAmount) {
      query = query.lte("amount", filters.maxAmount);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Fetch payments error:", error);
      throw error;
    }

    // Filter by location IDs client-side (since we can't filter on nested fields in Supabase)
    const filteredData = (data || []).filter((payment: any) => 
      payment.sale?.location_id && locationIds.includes(payment.sale.location_id)
    );

    console.log("Filtered payments by location:", {
      locationIds,
      totalPayments: data?.length || 0,
      filteredPayments: filteredData.length
    });

    return filteredData;
  },
  async getSaleById(saleId: number): Promise<SaleBO> {
    const { data, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        client:clients(first_name, last_name),
        location:locations(name),
        appointment:appointments(
          id,
          appointment_services(
            staff:team_members!appointment_services_staff_id_fkey(first_name,last_name),
            service:service_id(*)
          )
        )
      `
      )
      .eq("id", saleId)
      .single(); // ensures one row only

    if (error) {
      console.error("❌ Fetch sale by ID error:", error);
      throw error;
    }

    return data;
  },

  async getSalePaymentsByDate(
    date: string, // format: "YYYY-MM-DD"
    locationIds?: string[] // optional array of location IDs
  ): Promise<SalePaymentMethod[]> {
    console.log("📈 Fetching payments for date:", date);

    // Get current location from auth store if no locations provided
    const currentLocation = useAuthStore.getState().currentLocation;
    const locations =
      locationIds && locationIds.length > 0 ? locationIds : [currentLocation];

    if (!locations || locations.length === 0 || !locations[0]) {
      console.warn("⚠️ No current location set in auth store");
      return [];
    }

    console.log("📍 Using locations:", locations);

    // build start and end of day
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    let query = supabase
      .from("sale_payment_methods")
      .select(
        `
        payment_method,
        payment_method_id,
        amount,
        sales!inner(
          id,
          location_id,
          created_at,
          tip_amount,
          is_voided,
          client_id,
          location:locations(id, name),
          client:clients(id, first_name, last_name),
          appointment:appointments(
            id,
            appointment_services(
              staff:team_members!appointment_services_staff_id_fkey(id, first_name, last_name)
            )
          )
        ),
        payment_methods(
          id,
          name
        )
      `
      )
      .gte("sales.created_at", startOfDay.toISOString())
      .lt("sales.created_at", endOfDay.toISOString())
      .eq("is_voided", false)
      .eq("sales.is_voided", false);

    // Add location filter - use 'in' for multiple locations or 'eq' for single location
    if (locations.length === 1) {
      query = query.eq("sales.location_id", locations[0]);
    } else {
      query = query.in("sales.location_id", locations);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return [];
    }

    // Transform the data to match our type structure
    const transformedData: SalePaymentMethod[] = (data || []).map((item: any) => {
      const sales = Array.isArray(item.sales) ? item.sales[0] : item.sales;
      const paymentMethods = Array.isArray(item.payment_methods) ? item.payment_methods[0] : item.payment_methods;
      
      return {
        payment_method: item.payment_method,
        payment_method_id: item.payment_method_id,
        amount: item.amount,
        payment_methods: paymentMethods,
        sales: {
          id: sales.id,
          location_id: sales.location_id,
          created_at: sales.created_at,
          tip_amount: sales.tip_amount,
          is_voided: sales.is_voided,
          client_id: sales.client_id,
          location: Array.isArray(sales.location) ? sales.location[0] : sales.location,
          client: Array.isArray(sales.client) ? sales.client[0] : sales.client,
          appointment: Array.isArray(sales.appointment)
            ? sales.appointment[0]
            : sales.appointment,
        },
      };
    });

    return transformedData;
  },

  async getSaleItemsByDate(
    date: string, // format: "YYYY-MM-DD"
    locationIds?: string[] // optional array of location IDs
  ): Promise<SaleItem[]> {
    console.log("📦 Fetching sale items for date:", date);

    // Get current location from auth store if no locations provided
    const currentLocation = useAuthStore.getState().currentLocation;
    const locations =
      locationIds && locationIds.length > 0 ? locationIds : [currentLocation];

    if (!locations || locations.length === 0 || !locations[0]) {
      console.warn("⚠️ No current location set in auth store");
      return [];
    }

    console.log("📍 Using locations for sale items:", locations);

    // build start and end of day
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    let query = supabase
      .from("sale_items") // 👈 adjust table name if needed
      .select(
        `
        item_type,
        total_price,
        sales!inner(
          id,
          location_id,
          created_at
        )
      `
      )
      .gte("sales.created_at", startOfDay.toISOString())
      .lt("sales.created_at", endOfDay.toISOString())
      .eq("is_voided", false)
      .eq("sales.is_voided", false);

    // Add location filter - use 'in' for multiple locations or 'eq' for single location
    if (locations.length === 1) {
      query = query.eq("sales.location_id", locations[0]);
    } else {
      query = query.in("sales.location_id", locations);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return [];
    }

    // Transform the data to match our type structure
    const transformedData: SaleItem[] = (data || []).map((item) => ({
      item_type: item.item_type,
      total_price: item.total_price,
      sales: Array.isArray(item.sales) ? item.sales[0] : item.sales,
    }));

    console.log(
      "[SALE-ITEMS-DATA]---------------3202-2-2020-2-------------------",
      transformedData
    );
    return transformedData;
  },
  async getSalesPaymentsByDateRange(
    startDate: string,
    endDate: string,
    locationIds?: string[]
  ): Promise<SalePaymentMethodRange[]> {
    const currentLocation = useAuthStore.getState().currentLocation;
    
    // Use provided locationIds or fallback to currentLocation
    const locationsToFilter = locationIds && locationIds.length > 0 
      ? locationIds 
      : [currentLocation];
    
    if (!locationsToFilter || locationsToFilter.length === 0) return [];

    // Convert start and end dates to full-day ranges
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    let allData: SalePaymentMethodRange[] = [];
    let rangeStart = 0;
    const batchSize = 1000;
    let hasMoreData = true;

    while (hasMoreData) {
      let query = supabase
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
          sale:sales!inner (
            is_voided,
            created_at,
            location_id
          )
        `
        )
        .eq("sale.is_voided", false)
        .gte("sale.created_at", startOfDay.toISOString())
        .lte("sale.created_at", endOfDay.toISOString())
        .order("created_at", { ascending: true })
        .range(rangeStart, rangeStart + batchSize - 1);
      
      // Apply location filter using .in() for multiple locations
      if (locationsToFilter.length > 0) {
        query = query.in("sale.location_id", locationsToFilter);
      }
      
      const { data, error } = await query;

      if (error) throw new Error(error.message);

      if (data && data.length > 0) {
        const transformedData: SalePaymentMethodRange[] = data.map(
          (item: any) => ({
            ...item,
            sale: Array.isArray(item.sale) ? item.sale[0] : item.sale,
          })
        );

        allData = [...allData, ...transformedData];
        if (data.length < batchSize) hasMoreData = false;
        else rangeStart += batchSize;
      } else {
        hasMoreData = false;
      }
    }
    return allData;
  },
  // async getFilteredSalesDynamic(
  //   params: SalesFetchParams
  // ): Promise<SalesLogBO[]> {
  //   const currentLocation = useAuthStore.getState().currentLocation;
  //   const pageSize = 1000;
  //   let offset = 0;
  //   let allData: SalesLogBO[] = [];
  //   let hasMore = true;

  //   const locations =
  //     params.p_location_ids && params.p_location_ids.length > 0
  //       ? params.p_location_ids
  //       : [currentLocation];

  //   const paymentMethods = params.p_payment_methods ?? null;
  //   const saleTypes = params.p_sale_types ?? null;
  //   const staffIds = params.p_staff_ids ?? null;

  //   while (hasMore) {
  //     const { data, error } = await supabase.rpc<
  //       SalesLogBO[],
  //       SalesFetchParams
  //     >("get_filtered_sales_dynamic", {
  //       p_start_date: formatDateForRPC(params.p_start_date),
  //       p_end_date: formatDateForRPC(params.p_end_date),
  //       p_limit: pageSize,
  //       p_offset: offset,
  //       p_location_ids: locations,
  //       p_payment_methods: paymentMethods,
  //       p_sale_types: saleTypes,
  //       p_staff_ids: staffIds,
  //     });

  //     if (error) {
  //       console.error("❌ RPC Error:", error);
  //       return [];
  //     }

  //     if (data && data.length > 0) {
  //       allData.push(...data);
  //       offset += pageSize;
  //     } else {
  //       hasMore = false;
  //     }
  //   }

  //   console.log("✅ Total rows fetched:", allData.length);
  //   return allData as SalesLogBO[];
  // },
  
  async getTeamMemberMonthlySales(params: {
    p_month: number;
    p_year: number;
    p_team_member_name?: string;
  }) {
    try {
      console.log("📤 Calling RPC with params:", {
        p_month: params.p_month,
        p_year: params.p_year,
        p_team_member_name: params.p_team_member_name || null
      });
      
      // Call RPC with the correct parameters (no p_location_id)
      const { data: teamMemberSales, error: rpcError } = await (supabase as any).rpc(
        'get_team_member_monthly_sales',
        {
          p_month: params.p_month,
          p_year: params.p_year,
          p_team_member_name: params.p_team_member_name || null // Use null instead of undefined for RPC
        }
      );

      if (rpcError) {
        console.error("❌ RPC Error (get_team_member_monthly_sales):", rpcError);
        throw rpcError;
      }

      console.log("✅ Team member sales fetched:", teamMemberSales?.length || 0);
      
      if (teamMemberSales && teamMemberSales.length > 0) {
        console.log("📊 First record RAW:", JSON.stringify(teamMemberSales[0], null, 2));
        console.log("📊 All field names in first record:", Object.keys(teamMemberSales[0]));
        
        // Log each record with its values
        teamMemberSales.forEach((record: any, idx: number) => {
          console.log(`Record ${idx}:`, {
            raw: record,
            name: record.team_member_name || record.name || record.staff_name,
            sales: record.total_sales || record.amount || record.total_amount,
            allKeys: Object.keys(record)
          });
        });
      } else {
        console.log("⚠️ No data returned from RPC!");
      }
      
      // Return the data, ensuring it's an array
      return teamMemberSales || [];
    } catch (error) {
      console.error("Error fetching team member monthly sales:", error);
      throw error;
    }
  },
  
  // Test function to verify RPC is working
  async testTeamMemberMonthlySales() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    console.log("===========================================");
    console.log("🧪 TESTING TEAM MEMBER MONTHLY SALES RPC");
    console.log("===========================================");
    console.log(`Testing with current month: ${currentMonth}/${currentYear}`);
    
    try {
      // Test without filter
      console.log("\n📋 Test 1: Fetching ALL team members...");
      const dataNoFilter = await this.getTeamMemberMonthlySales({
        p_month: currentMonth,
        p_year: currentYear
      });
      
      console.log("✅ Test 1 (No filter) - Success!");
      console.log("Data count:", dataNoFilter?.length || 0);
      if (dataNoFilter && dataNoFilter.length > 0) {
        console.log("First record structure:", JSON.stringify(dataNoFilter[0], null, 2));
        console.log("\nAll records:");
        dataNoFilter.forEach((record: any, idx: number) => {
          console.log(`  ${idx + 1}. ${record.team_member_name || record.name}: ${record.total_sales || record.amount}`);
        });
      } else {
        console.log("⚠️ No data returned!");
      }
      
      // Test with a filter (if we have data)
      if (dataNoFilter && dataNoFilter.length > 0) {
        const firstRecord = dataNoFilter[0];
        const testName = firstRecord.team_member_name || firstRecord.team_member || firstRecord.staff_name || firstRecord.name;
        
        if (testName) {
          console.log(`\n📋 Test 2: Fetching with filter "${testName}"...`);
          const dataWithFilter = await this.getTeamMemberMonthlySales({
            p_month: currentMonth,
            p_year: currentYear,
            p_team_member_name: testName
          });
          
          console.log(`✅ Test 2 (Filter: ${testName}) - Success!`);
          console.log("Filtered data count:", dataWithFilter?.length || 0);
          if (dataWithFilter && dataWithFilter.length > 0) {
            console.log("Filtered records:");
            dataWithFilter.forEach((record: any, idx: number) => {
              console.log(`  ${idx + 1}. ${record.team_member_name || record.name}: ${record.total_sales || record.amount}`);
            });
          }
        }
      }
      
      console.log("\n===========================================");
      console.log("✅ ALL TESTS PASSED!");
      console.log("===========================================\n");
      return true;
    } catch (error) {
      console.log("\n===========================================");
      console.error("❌ TEST FAILED:", error);
      console.log("===========================================\n");
      return false;
    }
  },

  // Get cash movement summary using RPC function
  getCashMovementSummary: async (
    locationIds: string[],
    startDate: string,
    endDate: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('cash_movement_summary', {
        p_location_ids: locationIds, // Parameter name is plural: p_location_ids
        p_start: startDate,
        p_end: endDate,
      });

      if (error) {
        console.error("Error fetching cash movement summary:", error);
        return [];
      }

      // Filter out records where payment_collected = 0
      const filteredData = (data || []).filter(
        (item: any) => item.payment_collected && item.payment_collected > 0
      );

      return filteredData;
    } catch (error) {
      console.error("Unexpected error in getCashMovementSummary:", error);
      return [];
    }
  },
};
