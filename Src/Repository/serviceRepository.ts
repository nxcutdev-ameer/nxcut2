import { supabase } from "../Utils/supabase";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  location_id?: string;
}

export interface ServiceFilter {
  page?: number;
  limit?: number;
  search?: string;
  location_id?: string;
  category?: string;
  is_active?: boolean;
  sortBy?: "name" | "price" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export interface ServiceResponse {
  data: Service[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export const serviceRepository = {
  async getServices(filters: ServiceFilter = {}): Promise<ServiceResponse> {
    try {
      const {
        page = 1,
        limit = 50,
        search = "",
        location_id,
        category,
        is_active = true,
        sortBy = "name",
        sortOrder = "asc",
      } = filters;

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from("services").select("*", { count: "exact" });

      // Apply search filter
      if (search.trim()) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Apply location filter
      if (location_id) {
        query = query.eq("location_id", location_id);
      }

      // Apply category filter
      if (category) {
        query = query.eq("category", category);
      }

      // Apply active filter only if the column exists
      // Comment out for now as column might not exist in database
      // query = query.eq("is_active", is_active);

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      return {
        data: data || [],
        total,
        page,
        totalPages,
        hasMore,
      };
    } catch (e) {
      console.log("Error fetching services:", e);
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
  async getAllServices(): Promise<Service[]> {
    try {
      const response = await this.getServices({ limit: 1000 });
      return response.data;
    } catch (e) {
      console.log("Error fetching all services:", e);
      return [];
    }
  },

  async getServiceById(id: string): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (e) {
      console.log("Error fetching service by id:", e);
      return null;
    }
  },

  async createService(service: Omit<Service, "id" | "created_at" | "updated_at">): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([service])
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (e) {
      console.log("Error creating service:", e);
      return null;
    }
  },

  async updateService(id: string, updates: Partial<Omit<Service, "id" | "created_at" | "updated_at">>): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (e) {
      console.log("Error updating service:", e);
      return null;
    }
  },

  async deleteService(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw new Error(error.message);

      return true;
    } catch (e) {
      console.log("Error deleting service:", e);
      return false;
    }
  },

  async getServiceCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("category")
        .not("category", "is", null)
        .eq("is_active", true);

      if (error) throw new Error(error.message);

      // Get unique categories
      const categories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])];
      return categories;
    } catch (e) {
      console.log("Error fetching service categories:", e);
      return [];
    }
  },
};
