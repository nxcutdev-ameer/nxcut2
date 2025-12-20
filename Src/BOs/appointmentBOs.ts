export interface CommissionTier {
  id: string;
  range_to: number | null;
  tier_name: string;
  created_at: string;
  range_from: number;
  updated_at: string;
  tier_number: number;
  commission_rate: number;
  team_member_commission_id: string;
}

export interface CommissionSettings {
  commission_type: "tiered" | "flat" | string;
  rate_type: "percentage" | "fixed" | string;
  default_rate: number;
  tiers: CommissionTier[];
}

export interface SaleDetail {
  sale_id: number;
  sale_date: string;
  item_name: string;
  amount: number;
}

export interface TeamMemberInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ComissionBO {
  team_member_id: string;
  team_member_name: string;
  team_member: TeamMemberInfo;
  total_sales: number;
  sale_count: number;
  commission_settings: CommissionSettings;
  commission_amount: number;
  sales_details: SaleDetail[];
  period: string;
}

export interface ComissionSummary {
  total_team_members: number;
  total_commission: number;
  total_sales: number;
  period: string; // e.g., "2025-09-01 to 2025-09-30"
}

/////-------------------------------------  ----------------------------

interface AppointmentServiceBO {
  start_time: string; // e.g., "15:15:00"
  service: {
    name: string; // e.g., "Classic Manicure"
  };
  staff_id: string; // e.g., "f1cf4854-2846-40f7-857d-750a027c5cc3"
  staff: {
    first_name: string; // e.g., "Angelica"
    last_name: string; // e.g., ""
  };
}

interface ClientBO {
  first_name: string; // e.g., "Hanna"
  last_name: string; // e.g., ""
}

export interface AppointmentActivityBO {
  id: string; // appointment id
  appointment_date: string; // e.g., "2025-09-15"
  status: string; // e.g., "paid"
  created_at: string; // e.g., "2025-09-15T11:45:07.65963+00:00"
  client: ClientBO;
  sales?: Array<{ id: number; sale_type?: string; is_voided?: boolean }>;
  appointment_services: AppointmentServiceBO[]; // sorted by start_time descending
}

////-----------------------------------------------------------------

export interface AppointmentSale {
  id: number;
  total_amount: number;
  is_voided: boolean;
  sale_type: string;
}

export interface Appointment {
  id: string;
  appointment_date: string; // ISO date string: "2025-09-06"
  location_id: string;
  sales: AppointmentSale[];
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AppointmentSalesBO {
  id: string;
  price: number;
  staff_id: string;
  staff: Staff | null; // can be null if no staff assigned
  appointment: Appointment; // always present because of !inner join
}