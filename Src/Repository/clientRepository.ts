import { supabase } from "../Utils/supabase";
export interface ClientVoucher {
  id: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  voucher_id: string;
  voucher_name: string;
  purchase_date: string;
  original_value: number;
  created_at: string;
  updated_at: string;
  voucher_code: string;
  purchase_sale_id: number;
  discount_percentage: number | null;
  status: string | null;
  location_id?: string;
}
export interface ClientBO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string | null; // date of birth can be null
  notes: string;
  location_id: string | null; // can be null
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  total_sales?: number; // aggregated sales amount
}

export interface VoucherUsage {
  client_voucher_id: string;
  amount_used: number;
  discount_applied: number;
}

export interface ClientFilter {
  page?: number;
  limit?: number;
  search?: string;
  location_id?: string;
  gender?: string;
  sortBy?:
    | "first_name"
    | "last_name"
    | "created_at"
    | "updated_at"
    | "total_sales";
  sortOrder?: "asc" | "desc";
}

export interface ClientResponse {
  data: ClientBO[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ClientSaleStaff {
  id: string;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ClientSaleTip {
  id: string;
  amount: number;
  payment_method_id?: string | null;
  payment_methods?: {
    id: string;
    name: string;
  } | null;
  staff?: ClientSaleStaff | null;
}

export interface ClientSalePaymentMethod {
  id: string;
  payment_method: string;
  amount: number;
  created_at: string;
  is_voided?: boolean | null;
}

export interface ClientSaleItemStaff {
  id: string;
  team_members?: ClientSaleStaff | null;
}

export interface ClientSaleItemMembershipUsage {
  id: string;
  amount: number;
  client_membership?: {
    id: string;
    membership?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface ClientSaleItem {
  id: string;
  name?: string | null;
  quantity?: number | null;
  price?: number | null;
  total_price?: number | null;
  unit_price?: number | null;
  description?: string | null;
  appointment_service_id?: string | null;
  sale_item_staff?: ClientSaleItemStaff[] | null;
  membership_usage?: ClientSaleItemMembershipUsage[] | null;
}

export interface ClientSaleAppointmentService {
  id: string;
  start_time?: string | null;
  end_time?: string | null;
  scheduled_start?: string | null;
  appointment_start?: string | null;
  created_at?: string | null;
  price?: number | null;
  duration?: number | null;
  duration_minutes?: number | null;
  staff?: ClientSaleStaff | null;
  service?: {
    id: string;
    name: string;
    price: number;
    duration?: number | null;
    duration_minutes?: number | null;
  } | null;
}

export interface ClientSaleAppointment {
  id: string;
  appointment_date?: string | null;
  status?: string | null;
  notes?: string | null;
  appointment_services?: ClientSaleAppointmentService[];
  client?: ClientSaleClient | null;
}

export interface ClientSaleClient {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ClientSaleLocation {
  id: string;
  name: string;
}

export interface ClientSale {
  id: string;
  payment_method?: string | null;
  amount?: number;
  subtotal?: number;
  total_amount?: number;
  discount_amount?: number | null;
  voucher_discount?: number | null;
  tax_amount?: number | null;
  status?: string | null;
  sale_type?: string | null;
  created_at: string;
  tip_amount: number | null;
  is_tip_transaction?: boolean;
  adjusted_tip_amount?: number;
  sale_items?: ClientSaleItem[];
  sale_tips?: ClientSaleTip[];
  sale_payment_methods?: ClientSalePaymentMethod[];
  client?: ClientSaleClient | null;
  appointment?: ClientSaleAppointment | null;
  location?: ClientSaleLocation | null;
}

export const clientRepository = {
  async getClients(filters: ClientFilter = {}): Promise<ClientResponse> {
    try {
      const {
        page = 1,
        limit = 30,
        search = "",
        location_id,
        gender,
        sortBy = "total_sales",
        sortOrder = "desc",
      } = filters;

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("client_sales_summary")
        .select("*", { count: "exact" });

      // Apply search filter
      if (search.trim()) {
        query = query.or(
          [
            `first_name.ilike.%${search}%`,
            `last_name.ilike.%${search}%`,
            `email.ilike.%${search}%`,
            `phone.ilike.%${search}%`,
          ].join(",")
        );
      }

      // Apply sorting with safe fallback
      const sortableColumns: ClientFilter["sortBy"][] = [
        "first_name",
        "last_name",
        "total_sales",
      ];

      const orderColumn =
        sortBy && sortableColumns.includes(sortBy)
          ? sortBy
          : "total_sales";

      query = query.order(orderColumn, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      const formattedData = (data ?? []).map((row: any) => {
        const resolvedId =
          row.id ?? row.client_id ?? row.customer_id ?? row.uuid ?? null;

        return {
          id: resolvedId ? String(resolvedId) : "",
          first_name: row.first_name ?? "",
          last_name: row.last_name ?? "",
          email: row.email ?? "",
          phone: row.phone ?? "",
          dob: row.dob ?? null,
          notes: row.notes ?? "",
          location_id: row.location_id ?? null,
          created_at: row.created_at ?? "",
          updated_at: row.updated_at ?? "",
          total_sales: Number(row.total_sales ?? 0),
        } as ClientBO;
      });

      return {
        data: formattedData,
        total,
        page,
        totalPages,
        hasMore,
      };
    } catch (e) {
      console.log(e);
      return {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
      };
    }
  },

  // Legacy method for backward compatibility
  async getAllClients(): Promise<ClientBO[]> {
    try {
      const response = await this.getClients({ limit: 1000 });
      return response.data;
    } catch (e) {
      console.log(e);
      return [];
    }
  },

  async getClientVouchers(
    startDate: string,
    endDate: string,
    locationIds?: string[],
    client_name?: string,
    voucher_name?: string,
    voucher_code?: string
  ): Promise<ClientVoucher[]> {
    let query = supabase
      .from("client_vouchers")
      .select(
        `
        *,
        clients:client_id (id, first_name, last_name),
        vouchers:voucher_id (name),
        sales:purchase_sale_id (location_id)
      `
      )
      .gte("purchase_date", startDate)
      .lte("purchase_date", endDate)
      .order("purchase_date", { ascending: false });

    // Note: Cannot filter by sales.location_id directly in Supabase query
    // Will filter client-side after fetching
    if (client_name) {
      query = query.or(
        `clients.first_name.ilike.%${client_name}%,clients.last_name.ilike.%${client_name}%`
      );
    }
    if (voucher_name) {
      query = query.or(`vouchers.name.ilike.%${voucher_name}%`);
    }
    if (voucher_code) {
      query = query.or(`voucher_code.ilike.%${voucher_code}%`);
    }
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching client vouchers:", error);
      throw error;
    }

    // Flatten the nested structure and get location_id from sales
    let flattenedData =
      data?.map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        client_first_name: item.clients?.first_name ?? "",
        client_last_name: item.clients?.last_name ?? "",
        voucher_id: item.voucher_id,
        voucher_name: item.vouchers?.name ?? "",
        purchase_date: item.purchase_date,
        original_value: item.original_value,
        created_at: item.created_at,
        updated_at: item.updated_at,
        voucher_code: item.voucher_code,
        purchase_sale_id: item.purchase_sale_id,
        discount_percentage: item.discount_percentage,
        status: item.status,
        location_id: item.sales?.location_id ?? null,
      })) ?? [];

    // Apply location filter client-side ONLY if locationIds are explicitly provided
    // This prevents filtering when undefined is passed (which would filter out all results)
    if (locationIds && locationIds.length > 0) {
      flattenedData = flattenedData.filter((voucher) => {
        // Include vouchers with matching location_id OR vouchers without location_id
        // This ensures we don't lose data for vouchers without sales records
        if (!voucher.location_id) {
          return false; // Don't show vouchers without location
        }
        return locationIds.includes(voucher.location_id);
      });
      console.log("Filtered vouchers by location:", {
        locationIds,
        totalVouchers: data?.length || 0,
        filteredVouchers: flattenedData.length,
        vouchersWithoutLocation: (data?.length || 0) - flattenedData.length
      });
    }

    return flattenedData;
  },

  async getVoucherUsage(voucherIds: string[]): Promise<VoucherUsage[]> {
    try {
      if (!voucherIds || voucherIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("voucher_usage")
        .select("client_voucher_id, amount_used, discount_applied")
        .in("client_voucher_id", voucherIds)
        .eq("is_voided", false);

      if (error) {
        console.error("Error fetching voucher usage:", error);
        throw error;
      }

      return data || [];
    } catch (e) {
      console.log("Error in getVoucherUsage:", e);
      return [];
    }
  },

  async createClient(clientData: any): Promise<ClientBO | null> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            first_name: clientData.first_name,
            last_name: clientData.last_name,
            email: clientData.email,
            phone: clientData.phone,
            dob: clientData.date_of_birth,
            notes: clientData.notes,
            location_id: clientData.location_id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating client:", error);
        return null;
      }

      return data as ClientBO;
    } catch (e) {
      console.log("Error creating client:", e);
      return null;
    }
  },

  async getClientSummaryById(clientId: string): Promise<ClientBO | null> {
    try {
      if (!clientId) {
        return null;
      }

      const { data, error } = await supabase
        .from("client_sales_summary")
        .select("*")
        .eq("client_id", clientId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("[clientRepository] getClientSummaryById error", error);
        return null;
      }

      if (!data) {
        return null;
      }

      const resolvedId = data.client_id ?? clientId;

      return {
        id: String(resolvedId ?? ""),
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        dob: null,
        notes: data.notes ?? "",
        location_id: data.location_id ?? null,
        created_at: "",
        updated_at: "",
        total_sales: Number(data.total_sales ?? 0),
      };
    } catch (err) {
      console.error("[clientRepository] Unexpected error", err);
      return null;
    }
  },
  //fetchSaleById,
};

export async function fetchSaleById(
  saleId: string
): Promise<ClientSale | null> {
  if (!saleId) {
    throw new Error("Sale ID is required to fetch sale details");
  }

  const { data, error } = await supabase
    .from("sales")
    .select(
      `
        *,
        sale_items(
          *,
          sale_item_staff(
            *,
            team_members(*)
          ),
          membership_usage(
            *,
            client_membership:client_membership_id(
              *,
              membership:membership_id(*)
            )
          )
        ),
        sale_tips(
          *,
          staff:staff_id(*),
          payment_methods(id, name)
        ),
        sale_payment_methods(*),
        client:client_id(*),
        appointment:appointment_id(
          *,
          appointment_services(
            *,
            staff:team_members!staff_id(*),
            service:service_id(*)
          ),
          client:client_id(*)
        )
      `
    )
    .eq("id", saleId)
    .maybeSingle();

  console.log("[fetchSaleById] response:", { saleId, data, error });

  if (error) {
    console.error("[fetchSaleById] Error:", error);
    throw new Error(error.message);
  }

  return (data as ClientSale | null) ?? null;
}
