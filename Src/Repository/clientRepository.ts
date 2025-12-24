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
  /** Optional fields used by client-facing voucher UI */
  remaining_balance?: number | null;
  total_used?: number | null;
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

export interface ClientMembership {
  id: string;
  client_id: string;
  membership_id: string;
  used_sessions?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  membership?: {
    id: string;
    name?: string | null;
    description?: string | null;
    total_sessions?: number | null;
    price?: number | null;
    used_sessions?: number | null;
    service?: { name?: string | null } | null;
  } | null;
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
  /** e.g. "products", "services", "vouchers" */
  item_type?: string | null;
  /** product/service/membership name captured at time of sale */
  item_name?: string | null;
  name?: string | null;
  quantity?: number | null;
  price?: number | null;
  total_price?: number | null;
  unit_price?: number | null;
  description?: string | null;
  appointment_service_id?: string | null;
  sale_item_staff?: ClientSaleItemStaff[] | null;
  membership_usage?: ClientSaleItemMembershipUsage[] | null;

  // Some queries (e.g. client sales list) include a direct join to team_members as `staff`.
  staff?: ClientSaleStaff | null;
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
  id: number;
  payment_method?: string | null;
  amount?: number;
  subtotal?: number;
  total_amount?: number;
  discount_amount?: number | null;
  voucher_discount?: number | null;
  tax_amount?: number | null;
  status?: string | null;
  sale_type?: string | null;
  is_voided?: boolean | null;
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
  async hasClientVouchers(clientId: string): Promise<boolean> {
    if (!clientId) return false;
    const { data, error } = await supabase
      .from("client_vouchers")
      .select("id")
      .eq("client_id", clientId)
      .limit(1);

    if (error) {
      console.error("[clientRepository] hasClientVouchers error", error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  },

  async hasClientMemberships(clientId: string): Promise<boolean> {
    if (!clientId) return false;
    const { data, error } = await supabase
      .from("client_memberships")
      .select("id")
      .eq("client_id", clientId)
      .limit(1);

    if (error) {
      console.error("[clientRepository] hasClientMemberships error", error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  },


  /**
   * Void a sale by marking `sales.is_voided = true`.
   * Note: this does NOT delete the linked appointment.
   */
  async voidSaleById(saleId: string | number): Promise<boolean> {
    if (saleId === null || saleId === undefined || saleId === "") {
      throw new Error("Sale ID is required to void sale");
    }

    // `sales.id` is int8 in Supabase. Ensure we compare using a numeric value.
    const numericSaleId =
      typeof saleId === "number" ? saleId : Number(String(saleId).trim());

    if (!Number.isFinite(numericSaleId)) {
      throw new Error(`Invalid sale id: ${saleId}`);
    }

    try {
      const { error } = await supabase
        .from("sales")
        .update({ is_voided: true })
        .eq("id", numericSaleId);

      if (error) {
        console.error("[voidSaleById] Error:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("[voidSaleById] Unexpected error:", err);
      return false;
    }
  },


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

  /**
   * Fetch vouchers for a specific client id.
   * Returns ClientVoucher rows with voucher name and computed total_used/remaining_balance.
   */
  async getClientVouchersByClientId(params: {
    clientId: string;
    includeZeroBalance?: boolean;
  }): Promise<ClientVoucher[]> {
    const { clientId, includeZeroBalance = true } = params;

    if (!clientId) {
      return [];
    }

    try {
      // Join to clients so we can filter by client id safely.
      const { data, error } = await supabase
        .from("client_vouchers")
        .select(
          `
            *,
            clients:client_id(id, first_name, last_name),
            vouchers:voucher_id(name)
          `
        )
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("[clientRepository] getClientVouchersByClientId error", error);
        throw new Error(error.message);
      }

      const base =
        (data ?? []).map((item: any) => ({
          id: String(item.id),
          client_id: String(item.client_id),
          client_first_name: item.clients?.first_name ?? "",
          client_last_name: item.clients?.last_name ?? "",
          voucher_id: String(item.voucher_id),
          voucher_name: item.vouchers?.name ?? "",
          purchase_date: item.purchase_date ?? "",
          original_value: Number(item.original_value ?? 0),
          created_at: item.created_at ?? "",
          updated_at: item.updated_at ?? "",
          voucher_code: item.voucher_code ?? "",
          purchase_sale_id: item.purchase_sale_id ?? 0,
          discount_percentage: item.discount_percentage ?? null,
          status: item.status ?? null,
          location_id: item.location_id ?? null,
        })) as ClientVoucher[];

      if (base.length === 0) {
        return [];
      }

      // Compute usage totals
      const usageRows = await this.getVoucherUsage(base.map((v) => v.id));
      const usedByVoucher = new Map<string, number>();
      for (const usage of usageRows) {
        const prev = usedByVoucher.get(usage.client_voucher_id) ?? 0;
        usedByVoucher.set(
          usage.client_voucher_id,
          prev + Number(usage.amount_used ?? 0)
        );
      }

      const withBalances = base.map((v) => {
        const totalUsed = usedByVoucher.get(v.id) ?? 0;
        const remaining = Math.max(Number(v.original_value ?? 0) - totalUsed, 0);
        return {
          ...v,
          total_used: totalUsed,
          remaining_balance: remaining,
        };
      });

      return includeZeroBalance
        ? withBalances
        : withBalances.filter((v) => Number(v.remaining_balance ?? 0) > 0);
    } catch (err) {
      console.error(
        "[clientRepository] Unexpected error in getClientVouchersByClientId",
        err
      );
      throw err;
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


  async getSalesByClientId(params: { clientId: string; limitRecords?: number }) {
    const { clientId, limitRecords = 200 } = params;

    if (!clientId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
            id,
            created_at,
            total_amount,
            is_voided,
            sale_type,
            appointment:appointments!appointment_id(
              id,
              status,
              appointment_services(
                id,
                price,
                staff:team_members!staff_id(first_name,last_name),
                service:service_id(name, price)
              )
            ),
            sale_items(
              id,
              item_type,
              item_id,
              item_name,
              quantity,
              unit_price,
              discount_amount,
              total_price,
              staff_id,
              appointment_service_id,
              is_voided,
              staff:team_members!staff_id(first_name,last_name)
            )
          `
        )
        .eq("client_id", clientId)
       .eq("is_voided", false)
        .order("created_at", { ascending: false })
        .limit(limitRecords);

      if (error) {
        console.error("[clientRepository] getSalesByClientId error", error);
        throw new Error(error.message);
      }

      return (data ?? []) as any[];
    } catch (err) {
      console.error("[clientRepository] Unexpected error in getSalesByClientId", err);
      throw err;
    }
  },

  /**
   * Product purchases for a client (sale_items of type "products") joined with the owning sale and location.
   * Used by Client Details -> Products tab.
   */
  async getProductPurchasesByClientId(params: {
    clientId: string;
    limitRecords?: number;
  }): Promise<
    Array<{
      id: string;
      item_name: string | null;
      quantity: number | null;
      created_at: string | null;
      sales: {
        sale_id: string;
        total_amount: number | null;
        location?: { name?: string | null } | null;
      } | null;
    }>
  > {

    const { clientId, limitRecords = 200 } = params;

    if (!clientId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("sale_items")
        .select(
          `
          id,
          item_name,
          item_type,
          quantity,
          appointment_service_id,
          created_at,
          sales!inner(
            id,
            client_id,
            total_amount,
            sale_type,
            is_voided,
            location:locations(name)
          )
        `
        )
        .eq("sales.client_id", clientId)
        .eq("item_type", "product")
        .eq("is_voided", false)
        .eq("sales.is_voided", false)
        .order("created_at", { ascending: false })
        .limit(limitRecords);

      if (error) {
        console.error("[clientRepository] getProductPurchasesByClientId error", error);
        throw new Error(error.message);
      }

      const rows = (data ?? []) as any[];

      return rows.map((row: any) => {
        const sale = Array.isArray(row.sales) ? row.sales[0] : row.sales;
        return {
          id: String(row.id),
          item_name: row.item_name ?? null,
          quantity: row.quantity ?? null,
          created_at: row.created_at ?? null,
          sales: sale
            ? {
                sale_id: String(sale.id),
                total_amount: sale.total_amount ?? null,
                location: sale.location ?? null,
              }
            : null,
        };
      });
    } catch (err) {
      console.error(
        "[clientRepository] Unexpected error in getProductPurchasesByClientId",
        err
      );
      throw err;
    }
  },

  /**
   * Memberships for a client (used in Client Details -> Memberships tab).
   */
  async getClientMembershipsByClientId(params: {
    clientId: string;
  }): Promise<ClientMembership[]> {
    const { clientId } = params;

    if (!clientId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("client_memberships")
        .select(
          `
            id,
            client_id,
            membership_id,
            created_at,
            updated_at,
            membership:membership_id(
              id,
              name,
              description,
              total_sessions,
              price,
              service:service_id(name)
            )
          `
        )
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "[clientRepository] getClientMembershipsByClientId error",
          error
        );
        throw new Error(error.message);
      }

      const base = (data ?? []).map((row: any) => ({
        id: String(row.id),
        client_id: String(row.client_id),
        membership_id: String(row.membership_id),
        used_sessions: null,
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null,
        membership: row.membership
          ? {
              id: String(row.membership.id),
              name: row.membership.name ?? null,
              description: row.membership.description ?? null,
              total_sessions: row.membership.total_sessions ?? null,
              price: row.membership.price ?? null,
              service: row.membership.service ?? null,
            }
          : null,
      })) as ClientMembership[];

      if (base.length === 0) return [];

      // Compute used sessions from membership_usage table (more reliable than relying on a column that may not exist).
      const membershipIds = base.map((m) => m.id);
      const { data: usageRows, error: usageError } = await supabase
        .from("membership_usage")
        .select("client_membership_id")
        .in("client_membership_id", membershipIds)
        .eq("is_voided", false);

      if (usageError) {
        // If membership_usage isn't available in an environment, fall back gracefully.
        console.warn(
          "[clientRepository] getClientMembershipsByClientId membership_usage query failed",
          usageError
        );
        return base;
      }

      const usedCountByMembership = new Map<string, number>();
      for (const row of usageRows ?? []) {
        const id = String((row as any).client_membership_id);
        usedCountByMembership.set(id, (usedCountByMembership.get(id) ?? 0) + 1);
      }

      return base.map((m) => ({
        ...m,
        used_sessions: usedCountByMembership.get(m.id) ?? 0,
      })) as ClientMembership[];

    } catch (err) {
      console.error(
        "[clientRepository] Unexpected error in getClientMembershipsByClientId",
        err
      );
      throw err;
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
        appointment:appointments!appointment_id(
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
