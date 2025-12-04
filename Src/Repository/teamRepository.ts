import { useAuthStore } from "../Store/useAuthStore";
import { supabase } from "../Utils/supabase";
export interface TeamMemberBO {
  id: string;
  phone_number: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  calendar_color: string;
  team_member_id: string;
  notes: string;
  visible_to_clients: boolean;
  image_url: string | null;
  location_id: string;
  order: number;
  isAdmin: boolean | null;
}

export interface SalePaymentMethodBO {
  id: string;
  amount: number;
  sale_id: number;
  is_voided: boolean;
  created_at: string;
  payment_method: string;
  payment_method_id: string | null;
}

export interface SalesBO {
  id: number;
  notes: string | null;
  subtotal: number;
  client_id: string;
  is_voided: boolean;
  sale_type: string;
  created_at: string;
  tax_amount: number;
  tip_amount: number;
  updated_at: string;
  location_id: string;
  total_amount: number;
  voucher_code: string | null;
  appointment_id: string;
  payment_method: string;
  discount_amount: number;
  manual_discount: number;
  receptionist_id: string;
  voucher_discount: number;
  payment_method_id: string | null;
  receptionist_name: string;
  membership_discount: number;
  sale_payment_methods: SalePaymentMethodBO[];
}

export interface SaleTipBO {
  id: string;
  staff_id: string;
  amount: number;
  created_at: string;
  sale_id: number;
  payment_method_tip: string;
  is_voided: boolean;
  payment_method_id: string | null;
  payment_methods?: {
    id: string;
    name: string;
  } | null;
  sales: SalesBO;
  team_members: TeamMemberBO;
}
export const teamRepository = {
  async getTeamMembersByLocation(
    locationIds?: string[]
  ): Promise<TeamMemberBO[]> {
    try {
      let query = supabase.from("team_members").select("*");

      if (locationIds && locationIds.length > 0) {
        query = query.in("location_id", locationIds);
      }
      // else → no filter, fetch all team members

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching team members:", error.message);
        return [];
      }

      return (data as TeamMemberBO[]) || [];
    } catch (err) {
      console.error("Unexpected error in getTeamMembersByLocation:", err);
      return [];
    }
  },

  async getSalesTips(
    startDate: string,
    endDate: string,
    locationIds?: string[]
  ): Promise<SaleTipBO[]> {
    try {
      const query = supabase
        .from("sale_tips")
        .select(`
          *,
          team_members(*),
          sales(*,sale_payment_methods(*)),
          payment_methods(id, name)
        `)
        .eq("is_voided", false)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching sales tips:", error.message);
        return [];
      }

      // Apply location filter after fetching (filtering on nested relationship)
      if (locationIds && locationIds.length > 0) {
        const filteredData = (data as SaleTipBO[])?.filter((tip) => 
          locationIds.includes(tip.sales?.location_id)
        );
        console.log("Filtered sales tips by location:", {
          locationIds,
          totalTips: data?.length || 0,
          filteredTips: filteredData?.length || 0
        });
        return filteredData || [];
      }

      return (data as SaleTipBO[]) || [];
    } catch (err) {
      console.error("Unexpected error in getSalesTips:", err);
      return [];
    }
  },
};
