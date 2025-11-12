export interface AppointmentBO {
  id: string;
  client_id: string;
  appointment_date: string; // ISO string from Postgres date
  status: string; // matches your appointment_status enum
  notes: string | null;
  created_at: string;
  updated_at: string;
  location_id: string;
}
export interface SalesReportBO {
  date: string;
  appt_date: string | null;
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

export interface SaleBO {
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

  appointment_id: string | null;
  appointment?: {
    id: string;
    appointment_services: Array<{
      id: string;
      price: number;
      start_time: string;
      end_time: string;
      staff: {
        first_name: string;
        last_name: string;
      };
      service: {
        id: string;
        name: string;
        category: string;
        price: number;
        duration_minutes: number;
      };
    }>;
  };
}
