import { supabase } from "../Utils/supabase";
import { graphqlClient } from "../Utils/graphqlClient";
import { gql } from "graphql-request";
import { AppointmentBO, SalesReportBO } from "../BOs/reportsBO";

export interface Service {
  name: string;
}

export interface Appointment {
  appointment_date: string;
}

export interface AppointmentServiceRecord {
  id: string;
  service: Service;
  appointment: Appointment;
}
export interface AppointmentCalanderBO {
  id: string;
  appointment_id: string;
  service_id: string;
  staff_id: string;
  start_time: string; // e.g. "12:30:00"
  end_time: string; // e.g. "13:55:00"
  price: number;
  created_at: string;
  voucher_discount: number | null;
  original_staff_id: string | null;

  appointment: {
    id: string;
    notes: string | null;
    client: {
      id: string;
      dob: string | null;
      email: string | null;
      notes: string | null;
      phone: string | null;
      last_name: string;
      created_at: string;
      first_name: string;
      updated_at: string;
      location_id: string;
    };
    status: string; // e.g. "scheduled"
    client_id: string;
    created_at: string;
    updated_at: string;
    location_id: string;
    appointment_date: string; // e.g. "2025-09-18"
  };

  service: {
    id: string;
    sku: string | null;
    tax: string | null;
    use: string | null;
    name: string;
    price: number;
    category: string | null;
    resource: string | null;
    created_at: string;
    extra_time: number | null;
    service_id: string;
    updated_at: string;
    commissions: string | null;
    description: string | null;
    available_for: string | null;
    voucher_sales: string | null;
    online_booking: string | null;
    treatment_type: string | null;
    duration_minutes: number;
  };

  staff: {
    id: string;
    email: string;
    notes: string;
    order: number;
    isAdmin: boolean | null;
    image_url: string | null;
    is_active: boolean;
    last_name: string;
    created_at: string;
    first_name: string;
    updated_at: string;
    location_id: string;
    phone_number: string | null;
    calendar_color: string | null;
    team_member_id: string;
    visible_to_clients: boolean;
  };

  original_staff: string | null;
}
export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  staff_id: string;
  start_time: string | null;
  end_time: string | null;
  price: number;
  created_at: string;
  voucher_discount: number | null;
  original_staff_id: string | null;
  appointment?: {
    appointment_date: string;
  };
  staff?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface GroupedAppointments {
  previousMonth: AppointmentServiceRecord[];
  currentMonth: AppointmentServiceRecord[];
}
interface CommissionRow {
  id: string;
  team_member_id: string;
  service_id: string | null;
  sale_item_id: string | null;
  sale_id: number;
  commission_amount: number;
  commission_rate: number;
  commission_type: string | null;
  tier_applied: number | null;
  sales_amount: number;
  calculation_date: string;
  sales_period_start: string;
  sales_period_end: string;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
}

interface CommissionResponse {
  data: CommissionRow[];
  summary: {
    total_team_members: number;
    total_commission: number;
    total_sales: number;
    period: string;
  };
}
interface appointmentFilter {
  startDate: string; // YYYY-MM-DD
  endDate?: string; // optional
}

interface FetchStaffAppointmentServicesParams {
  startDate: string; // e.g. "2025-09-01"
  endDate: string; // e.g. "2025-09-16"
  staffName?: string; // optional filter by staff first_name
}
type FetchAppointmentServicesParams = {
  startDate?: string; // e.g. "2025-09-01"
  endDate?: string; // e.g. "2025-09-30"
  isVoided?: boolean; // default: undefined (no filter)
  saleType?: "services" | "products" | string; // default: undefined
  staffNotNull?: boolean; // default: false
};
import axios from "axios";
import {
  AppointmentActivityBO,
  AppointmentSalesBO,
  ComissionBO,
  ComissionSummary,
} from "../BOs/appointmentBOs";
import { useAuthStore } from "../Store/useAuthStore";

interface comissionRepoBO {
  data: ComissionBO[];
  summary: ComissionSummary;
}
const currentLocation = useAuthStore.getState().currentLocation;
export const appointmentsRepository = {
  // async getCommissionCalculations(
  //   month: number | string,
  //   year: number | string
  // ): Promise<comissionRepoBO> {
  //   if (!month || !year) {
  //     throw new Error("Month and year are required parameters.");
  //   }

  //   try {
  //     let url = `${process.env.BASE_URL}/api/commission/calculations?month=${month}&year=${year}`;
  //     const response = await axios.get(url, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         // Add authorization header here if your API requires it, e.g.:
  //         //Authorization: `Bearer ${}`,
  //       },
  //     });
  //     //console.log("[REPO]Commission calculations response:", response.data);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error("Error fetching commission calculations:", error);
  //     throw error;
  //   }
  // },
  ////----------------------------------------------------------getAppointmentsActivity----------------------------------------------------------
  async getAppointmentsActivity(
    filter: appointmentFilter
  ): Promise<AppointmentActivityBO[]> {
    try {
      // Function to fetch data with pagination
      const fetchAllAppointments = async (): Promise<any[]> => {
        let allData: any[] = [];
        let from = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          let query = supabase
            .from("appointments")
            .select(
              `
                id,
                appointment_date,
                status,
                created_at,
                client:clients(first_name,last_name),
                appointment_services(
                  start_time,
                  service:services(name),
                  staff_id,
                  staff:team_members!staff_id(first_name,last_name)
                )
              `,
              { count: "exact" }
            )
            .range(from, from + limit - 1);

          if (filter.endDate) {
            // ✅ Between startDate and endDate
            query = query
              .gte("appointment_date", filter.startDate)
              .lte("appointment_date", filter.endDate)
              .eq("location_id", currentLocation);
          } else {
            // ✅ From startDate onwards
            query = query.gte("appointment_date", filter.startDate);
          }

          query = query.order("appointment_date", { ascending: true });

          const { data, error, count } = await query;
          if (error) throw error;

          if (data && data.length > 0) {
            allData = allData.concat(data);
            console.log(
              `[getAppointmentsActivity] Fetched ${data.length} records, total: ${allData.length}`
            );
          }

          // Check if we've reached the end
          hasMore =
            data && data.length === limit && allData.length < (count || 0);
          from += limit;

          // Safety break to prevent infinite loops
          if (from > 50000) {
            console.warn(
              "[getAppointmentsActivity] Reached maximum fetch limit of 50,000 records"
            );
            break;
          }
        }
        return allData;
      };

      const data = await fetchAllAppointments();
      console.log(
        `[getAppointmentsActivity] Total records fetched: ${data.length}`
      );

      // Sort services in each appointment by start_time descending
      const sortedData = data?.map((appointment: any) => ({
        ...appointment,
        appointment_services: appointment.appointment_services.sort(
          (a: any, b: any) => b.start_time.localeCompare(a.start_time)
        ),
      }));

      return sortedData;
    } catch (err) {
      console.error("Error fetching appointments:", err);
      throw err;
    }
  },

  async fetchAppointmentsWithSaleData(
    params: FetchAppointmentServicesParams = {}
  ): Promise<AppointmentSalesBO[]> {
    const { startDate, endDate, isVoided, saleType, staffNotNull } = params;

    // Function to fetch data with pagination
    const fetchAllData = async (): Promise<any[]> => {
      let allData: any[] = [];
      let from = 0;
      const limit = 1000; // Supabase's default limit
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from("appointment_services")
          .select(
            `
              id,
              price,
              staff_id,
              staff:team_members!staff_id(id,first_name,last_name,email),
              appointment:appointments!inner(
                id,
                appointment_date,
                location_id,
                sales!inner(id,total_amount,is_voided,sale_type)
              )
            `,
            { count: "exact" }
          )
          .range(from, from + limit - 1);

        // Apply filters only if provided
        if (startDate)
          query = query.gte("appointment.appointment_date", startDate);
        if (endDate) query = query.lte("appointment.appointment_date", endDate);
        if (isVoided !== undefined)
          query = query.eq("appointment.sales.is_voided", isVoided);
        if (saleType) query = query.eq("appointment.sales.sale_type", saleType);
        if (staffNotNull) query = query.not("staff_id", "is", null);

        const { data, error, count } = await query;

        if (error) {
          console.error("❌ Error fetching appointment services:", error);
          throw error;
        }

        if (data && data.length > 0) {
          allData = allData.concat(data);
          console.log(
            `[fetchAppointmentsWithSaleData] Fetched ${data.length} records, total: ${allData.length}`
          );
        }

        // Check if we've reached the end
        hasMore =
          data && data.length === limit && allData.length < (count || 0);
        from += limit;

        // Safety break to prevent infinite loops
        if (from > 50000) {
          // Maximum 50,000 records
          console.warn(
            "[fetchAppointmentsWithSaleData] Reached maximum fetch limit of 50,000 records"
          );
          break;
        }
      }

      return allData;
    };

    const data = await fetchAllData();
    console.log(
      `[fetchAppointmentsWithSaleData] Total records fetched: ${data.length}`
    );

    return data.map((appointmentService: any) => ({
      id: appointmentService.id,
      price: appointmentService.price,
      staff_id: appointmentService.staff_id,
      staff: appointmentService.staff
        ? {
            id: appointmentService.staff.id,
            first_name: appointmentService.staff.first_name,
            last_name: appointmentService.staff.last_name,
            email: appointmentService.staff.email,
          }
        : null,
      appointment: appointmentService.appointment,
    }));
  },

  async fetchCommissionCalculations(
    month: number,
    year: number
  ): Promise<CommissionResponse | any> {
    try {
      // 1. Build date range for the entire month
      const startDate = new Date(year, month - 1, 1); // JS month is 0-based
      const endDate = new Date(year, month, 0); // last day of month

      const startStr = startDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const endStr = endDate.toISOString().split("T")[0];

      // 2. Query Supabase
      const { data, error } = await supabase
        .from("commission_calculations")
        .select("*")
        .gte("calculation_date", startStr)
        .lte("calculation_date", endStr);
      console.log("[fetchCommissionCalculations] Data:", data);

      return data;
      if (error) throw error;

      const rows: CommissionRow[] = data || [];

      // 3. Process summary
      const total_commission = rows.reduce(
        (sum, r) => sum + (Number(r.commission_amount) || 0),
        0
      );
      const total_sales = rows.reduce(
        (sum, r) => sum + (Number(r.sales_amount) || 0),
        0
      );
      const team_member_ids = Array.from(
        new Set(rows.map((r) => r.team_member_id))
      );

      const summary = {
        total_team_members: team_member_ids.length,
        total_commission,
        total_sales,
        period: `${startStr} to ${endStr}`,
      };

      return {
        data: rows,
        summary,
      };
    } catch (err) {
      console.error("[fetchCommissionCalculations] Error:", err);
      throw err;
    }
  },

  async getAppointmentServicesWithPrevMonth(
    startDate: string,
    endDate: string
  ): Promise<GroupedAppointments> {
    try {
      const start = new Date(startDate);
      const prevMonthEnd = new Date(start.getFullYear(), start.getMonth(), 0);
      const prevMonthStart = new Date(
        start.getFullYear(),
        start.getMonth() - 1,
        1
      );

      const prevStartStr = prevMonthStart.toISOString().split("T")[0];
      const prevEndStr = prevMonthEnd.toISOString().split("T")[0];

      // Function to fetch data with pagination
      const fetchPaginatedData = async (
        startDateStr: string,
        endDateStr: string
      ): Promise<any[]> => {
        let allData: any[] = [];
        let from = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error, count } = await supabase
            .from("appointment_services")
            .select(
              `
              id,
              service:services!inner(name),
              appointment:appointments!inner(appointment_date)
            `,
              { count: "exact" }
            )
            .range(from, from + limit - 1)
            .gte("appointment.appointment_date", startDateStr)
            .lte("appointment.appointment_date", endDateStr);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = allData.concat(data);
            console.log(
              `[getAppointmentServicesWithPrevMonth] Fetched ${data.length} records for ${startDateStr} to ${endDateStr}, total: ${allData.length}`
            );
          }

          // Check if we've reached the end
          hasMore =
            data && data.length === limit && allData.length < (count || 0);
          from += limit;

          // Safety break to prevent infinite loops
          if (from > 50000) {
            console.warn(
              `[getAppointmentServicesWithPrevMonth] Reached maximum fetch limit of 50,000 records for ${startDateStr} to ${endDateStr}`
            );
            break;
          }
        }

        return allData;
      };

      // Query previous month and current month with pagination
      const [prevData, currData] = await Promise.all([
        fetchPaginatedData(prevStartStr, prevEndStr),
        fetchPaginatedData(startDate, endDate),
      ]);

      console.log(
        `[getAppointmentServicesWithPrevMonth] Total previous month records: ${prevData.length}`
      );
      console.log(
        `[getAppointmentServicesWithPrevMonth] Total current month records: ${currData.length}`
      );

      return {
        previousMonth: (prevData as AppointmentServiceRecord[]) ?? [],
        currentMonth: (currData as AppointmentServiceRecord[]) ?? [],
      };
    } catch (err) {
      console.error("[getAppointmentServicesWithPrevMonth] Error:", err);
      return { previousMonth: [], currentMonth: [] };
    }
  },

  async fetchAppointmentServices({
    startDate,
    endDate,
    staffName,
  }: FetchStaffAppointmentServicesParams): Promise<AppointmentService[]> {
    try {
      console.log("[REPO] fetchAppointmentServices called with:", {
        startDate,
        endDate,
        staffName,
      });

      // Function to fetch data with pagination
      const fetchAllAppointmentServices = async (): Promise<any[]> => {
        let allData: any[] = [];
        let from = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          let query = supabase
            .from("appointment_services")
            .select(
              `
              *,
              appointments!inner ( appointment_date ),
              team_members!staff_id ( id, email, first_name, last_name )
            `,
              { count: "exact" }
            )
            .range(from, from + limit - 1)
            .gte("appointments.appointment_date", startDate)
            .lte("appointments.appointment_date", endDate);

          if (staffName) {
            query = query.ilike("team_members.first_name", `%${staffName}%`);
          }

          const { data, error, count } = await query;

          if (error) {
            console.error("Error fetching appointment services:", error);
            throw error;
          }

          if (data && data.length > 0) {
            allData = allData.concat(data);
            console.log(
              `[fetchAppointmentServices] Fetched ${data.length} records, total: ${allData.length}`
            );
          }

          // Check if we've reached the end
          hasMore =
            data && data.length === limit && allData.length < (count || 0);
          from += limit;

          // Safety break to prevent infinite loops
          if (from > 50000) {
            console.warn(
              "[fetchAppointmentServices] Reached maximum fetch limit of 50,000 records"
            );
            break;
          }
        }

        return allData;
      };

      const data = await fetchAllAppointmentServices();

      console.log("[REPO] Query result:", {
        dataLength: data?.length || 0,
        sampleDates:
          data
            ?.slice(0, 10)
            .map((item) => item.appointments?.appointment_date) || [],
        dateRange: {
          requested: `${startDate} to ${endDate}`,
          firstDate: data?.[0]?.appointments?.appointment_date || "none",
          lastDate:
            data?.[data.length - 1]?.appointments?.appointment_date || "none",
        },
      });

      return (data || []).map((item: any) => ({
        ...item,
        appointment: item.appointments,
        staff: item.team_members,
      })) as AppointmentService[];
    } catch (err) {
      console.error("[fetchAppointmentServices] Error:", err);
      throw err;
    }
  },

  getAppointmentCalanderData: async (
    date: string,
    locationIds?: string[]
  ): Promise<AppointmentCalanderBO[]> => {
    const currentLocation = useAuthStore.getState().currentLocation;
    const { allLocations } = useAuthStore.getState();

    // If locationIds are provided, use them. Otherwise, use current location or all locations
    const locationsToFilter =
      locationIds && locationIds.length > 0
        ? locationIds
        : allLocations.length > 0
        ? allLocations.map((loc) => loc.id)
        : [currentLocation];

    const { data, error } = await supabase
      .from("appointment_services")
      .select(
        `
        *,
        service:service_id(*),
        staff:team_members!staff_id(*),
        original_staff:original_staff_id(*),
        appointment:appointment_id(*, client:client_id(*))
      `
      )
      .eq("appointment.appointment_date", date)
      .in("appointment.location_id", locationsToFilter)
      .in("appointment.status", ["scheduled", "completed", "paid", "void"])
      .not("appointment", "is", null);
    
    if (error) {
      console.error("Error fetching appointment services:", error);
      return [];
    }

    return data as AppointmentCalanderBO[];
  },

  /**
   * Update appointment service time (for drag & drop / resize)
   */
  async updateAppointmentServiceTime(
    appointmentServiceId: string,
    startTime: string, // Format: "HH:MM:SS"
    endTime: string,     // Format: "HH:MM:SS"
    newStaffId?: string  // Optional: for cross-staff dragging
  ): Promise<boolean> {
    try {
      const updateData: any = {
        start_time: startTime,
        end_time: endTime,
      };

      // If staff changed, update staff_id
      if (newStaffId) {
        updateData.staff_id = newStaffId;
      }

      const { error } = await supabase
        .from("appointment_services")
        .update(updateData)
        .eq("id", appointmentServiceId);

      if (error) {
        console.error("Error updating appointment service time:", error);
        return false;
      }

      console.log(`[appointmentsRepository] Updated appointment service ${appointmentServiceId} to ${startTime} - ${endTime}${newStaffId ? ` (staff: ${newStaffId})` : ''}`);
      return true;
    } catch (error) {
      console.error("Error updating appointment service time:", error);
      return false;
    }
  },

  async createAppointment(appointmentData: any) {
    try {
      console.log('[appointmentsRepository] Creating appointment with data:', appointmentData);
      
      // First create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: appointmentData.client_id,
          appointment_date: appointmentData.date,
          status: appointmentData.status || 'scheduled',
          notes: appointmentData.notes || '',
          location_id: appointmentData.location_id,
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('[appointmentsRepository] Error creating appointment:', appointmentError);
        throw appointmentError;
      }

      console.log('[appointmentsRepository] Appointment created:', appointment);

      // Then create appointment services with calculated times
      if (appointment && appointmentData.services && appointmentData.services.length > 0) {
        let currentStartTime = appointmentData.start_time;
        
        const appointmentServices = appointmentData.services.map((service: any, index: number) => {
          const serviceDuration = service.duration || 30;
          
          // Calculate end time for this service
          const [hours, minutes, seconds] = currentStartTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + serviceDuration;
          const endHours = Math.floor(totalMinutes / 60) % 24;
          const endMinutes = totalMinutes % 60;
          const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          const serviceData = {
            appointment_id: appointment.id,
            service_id: service.service_id,
            staff_id: appointmentData.staff_id,
            start_time: currentStartTime,
            end_time: endTime,
            price: service.price || 0,
          };
          
          // Update start time for next service
          currentStartTime = endTime;
          
          return serviceData;
        });

        console.log('[appointmentsRepository] Creating appointment services:', appointmentServices);

        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(appointmentServices);

        if (servicesError) {
          console.error('[appointmentsRepository] Error creating appointment services:', servicesError);
          throw servicesError;
        }

        console.log('[appointmentsRepository] Appointment services created successfully');
      }

      return appointment;
    } catch (error) {
      console.error("[appointmentsRepository] Error creating appointment:", error);
      return null;
    }
  },
};

//   async getAppointments(): Promise<AppointmentBO[]> {
//     const { data, error } = await supabase
//       .from("appointments")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) throw new Error(error.message);
//     return data as AppointmentBO[];
//   },

//   async getAppointmentsByLocation(
//     location_id: string
//   ): Promise<AppointmentBO[]> {
//     const { data, error } = await supabase
//       .from("appointments")
//       .select("*")
//       .eq("location_id", location_id)
//       .order("appointment_date", { ascending: true });

//     if (error) throw new Error(error.message);
//     return data as AppointmentBO[];
//   },

//   async getAppointmentsCountByDay(start: string, end: string) {
//     const { data, error } = await supabase
//       .from("appointments")
//       .select("appointment_date")
//       .gte("appointment_date", start)
//       .lte("appointment_date", end);

//     if (error) throw new Error(error.message);

//     const counts: Record<string, number> = {};
//     data.forEach((appt) => {
//       counts[appt.appointment_date] = (counts[appt.appointment_date] || 0) + 1;
//     });

//     return Object.entries(counts).map(([date, total]) => ({
//       appointment_date: date,
//       total,
//     }));
//   },

//   // ---------------------------
//   // 2. GRAPHQL QUERIES (nested relational data)
//   // ---------------------------
//   async getUpcomingAppointments() {
//     const today = new Date().toISOString().split("T")[0];
//     const query = gql`
//       query {
//         appointments(
//           where: { status: { _eq: "scheduled" }, appointment_date: { _gte: "${today}" } }
//           order_by: { appointment_date: asc }
//         ) {
//           id
//           appointment_date
//           status
//           client { first_name last_name }
//           location { name }
//         }
//       }
//     `;
//     return graphqlClient.request(query);
//   },

//   async getAppointmentActivity(date: string) {
//     const query = gql`
//       query {
//         appointments(
//           where: { appointment_date: { _eq: "${date}" } }
//           order_by: { appointment_date: asc }
//         ) {
//           id
//           appointment_date
//           status
//           client { first_name last_name }
//           appointment_services {
//             start_time
//             staff { first_name last_name }
//             service { name }
//           }
//         }
//       }
//     `;
//     return graphqlClient.request(query);
//   },

//   async getTodaysNextAppointment() {
//     const today = new Date().toISOString().split("T")[0];
//     const query = gql`
//       query {
//         appointments(
//           where: { appointment_date: { _eq: "${today}" }, status: { _eq: "scheduled" } }
//           order_by: { appointment_services_aggregate: { min: { start_time: asc } } }
//           limit: 1
//         ) {
//           id
//           status
//           client { first_name last_name }
//           appointment_services {
//             start_time
//             service { name }
//             staff { first_name last_name }
//           }
//         }
//       }
//     `;
//     return graphqlClient.request(query);
//   },

//   async getTopServicesThisMonth() {
//     const startOfMonth = new Date(
//       new Date().getFullYear(),
//       new Date().getMonth(),
//       1
//     )
//       .toISOString()
//       .split("T")[0];
//     const query = gql`
//       query {
//         appointment_services(
//           where: { appointment: { appointment_date: { _gte: "${startOfMonth}" } } }
//         ) {
//           service { name }
//           appointment { appointment_date }
//         }
//       }
//     `;
//     return graphqlClient.request(query);
//   },

//   async getTopTeamMembersThisMonth() {
//     const startOfMonth = new Date(
//       new Date().getFullYear(),
//       new Date().getMonth(),
//       1
//     )
//       .toISOString()
//       .split("T")[0];
//     const query = gql`
//       query {
//         appointment_services(
//           where: { appointment: { appointment_date: { _gte: "${startOfMonth}" } } }
//         ) {
//           price
//           staff { id first_name last_name email }
//           appointment { appointment_date }
//         }
//       }
//     `;
//     return graphqlClient.request(query);
//   },
// };
