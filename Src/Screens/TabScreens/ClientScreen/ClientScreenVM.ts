import { useEffect, useState, useCallback } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useClientStore } from "../../../Store/useClientsStore";
import { ClientBO, ClientFilter } from "../../../Repository/clientRepository";

const useClientScreenVM = () => {
  const navigation: NavigationProp<any> = useNavigation();

  // Client store
  const {
    clientsData,
    total,
    currentPage,
    totalPages,
    hasMore,
    isLoading,
    isLoadingMore,
    filters,
    fetchClients,
    loadMoreClients,
    searchClients,
    updateFilters,
  } = useClientStore();

  // Local state for search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Initialize data on component mount
  useEffect(() => {
    init();

    // Cleanup on unmount
    return () => {
      // Optionally reset clients when leaving screen
      // resetClients();
    };
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const init = async () => {
    try {
      await fetchClients();
    } catch (error) {
      console.error("[ClientsVM] Error initializing:", error);
    }
  };

  const handleSearch = async (term: string) => {
    try {
      await searchClients(term);
    } catch (error) {
      console.error("[ClientsVM] Error searching:", error);
    }
  };

  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore && !isLoading) {
      try {
        await loadMoreClients();
      } catch (error) {
        console.error("[ClientsVM] Error loading more:", error);
      }
    }
  }, [hasMore, isLoadingMore, isLoading, loadMoreClients]);

  const handleRefresh = async () => {
    try {
      await fetchClients(filters, true);
    } catch (error) {
      console.error("[ClientsVM] Error refreshing:", error);
    }
  };

  const handleSortChange = (
    sortBy: ClientFilter["sortBy"],
    sortOrder: ClientFilter["sortOrder"] = "desc"
  ) => {
    updateFilters({ sortBy, sortOrder });
  };

  const handleFilterChange = (newFilters: Partial<ClientFilter>) => {
    updateFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    if (filters.search) {
      searchClients("");
    }
  };

  // Navigation helpers
  const navigateToClientDetail = (client: ClientBO) => {
    navigation.navigate("ClientDetail", { item: client });
  };

  const navigateToAddClient = () => {
    navigation.navigate("AddClientScreen", { onClientAdded: handleRefresh });
  };

  return {
    // Navigation
    navigation,
    navigateToClientDetail,
    navigateToAddClient,

    // Data
    clients: clientsData,
    total,
    currentPage,
    totalPages,
    hasMore,

    // Loading states
    isLoading,
    isLoadingMore,
    isRefreshing: isLoading && currentPage === 1,

    // Search
    searchTerm,
    setSearchTerm,
    clearSearch,

    // Filters
    filters,
    handleSortChange,
    handleFilterChange,

    // Actions
    handleLoadMore,
    handleRefresh,

    // Computed values
    hasClients: clientsData.length > 0,
    showEmptyState: !isLoading && clientsData.length === 0,
    showLoadMoreButton: hasMore && !isLoadingMore,
  };
};

export default useClientScreenVM;
