import { create } from "zustand";
import {
  ClientBO,
  ClientFilter,
  ClientResponse,
  clientRepository,
} from "../Repository/clientRepository";

interface ClientStore {
  // Data
  clientsData: ClientBO[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;

  // Filters
  filters: ClientFilter;

  // Actions
  fetchClients: (filters?: ClientFilter, reset?: boolean) => Promise<void>;
  loadMoreClients: () => Promise<void>;
  searchClients: (searchTerm: string) => Promise<void>;
  updateFilters: (newFilters: Partial<ClientFilter>) => void;
  resetClients: () => void;
}

export const useClientStore = create<ClientStore>((set, get) => ({
  // Initial state
  clientsData: [],
  total: 0,
  currentPage: 1,
  totalPages: 0,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  filters: {
    page: 1,
    limit: 30,
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
  },

  // Fetch clients with filters
  fetchClients: async (newFilters?: ClientFilter, reset = true) => {
    const state = get();

    if (reset) {
      set({ isLoading: true, clientsData: [] });
    } else {
      set({ isLoadingMore: true });
    }

    try {
      const filters = newFilters
        ? { ...state.filters, ...newFilters }
        : state.filters;
      const response: ClientResponse = await clientRepository.getClients(
        filters
      );

      set({
        clientsData: reset
          ? response.data
          : [...state.clientsData, ...response.data],
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        hasMore: response.hasMore,
        filters,
        isLoading: false,
        isLoadingMore: false,
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      set({
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  // Load more clients (pagination)
  loadMoreClients: async () => {
    const state = get();

    if (!state.hasMore || state.isLoadingMore || state.isLoading) {
      return;
    }

    const nextPage = state.currentPage + 1;
    await state.fetchClients({ ...state.filters, page: nextPage }, false);
  },

  // Search clients
  searchClients: async (searchTerm: string) => {
    const state = get();
    const searchFilters = {
      ...state.filters,
      search: searchTerm.trim(),
      page: 1,
    };

    await state.fetchClients(searchFilters, true);
  },

  // Update filters
  updateFilters: (newFilters: Partial<ClientFilter>) => {
    const state = get();
    const updatedFilters = { ...state.filters, ...newFilters, page: 1 };

    set({ filters: updatedFilters });
    state.fetchClients(updatedFilters, true);
  },

  // Reset clients data
  resetClients: () => {
    set({
      clientsData: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
      filters: {
        page: 1,
        limit: 30,
        search: "",
        sortBy: "created_at",
        sortOrder: "desc",
      },
    });
  },
}));
