import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useMemo } from "react";
import { ClientScreenStyles } from "./ClientScreenStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, X } from "lucide-react-native";
import { colors } from "../../../Constants/colors";
import useClientScreenVM from "./ClientScreenVM";
import { ClientBO } from "../../../Repository/clientRepository";
import { getHeightEquivalent, formatCurrency } from "../../../Utils/helpers";

const ClientScreen = () => {
  const {
    // Navigation
    navigateToClientDetail,
    navigateToAddClient,

    // Data
    clients,
    total,
    hasMore,

    // Loading states
    isLoading,
    isLoadingMore,
    isRefreshing,

    // Search
    searchTerm,
    setSearchTerm,
    clearSearch,

    // Actions
    handleLoadMore,
    handleRefresh,

    // Computed values
    hasClients,
    showEmptyState,
    showLoadMoreButton,
  } = useClientScreenVM();

  const isWalkInCustomer = (client: ClientBO) => {
    const firstName = client.first_name?.trim().toLowerCase() ?? "";
    const lastName = client.last_name?.trim().toLowerCase() ?? "";
    const fullName = `${client.first_name ?? ""} ${client.last_name ?? ""}`
      .trim()
      .toLowerCase();

    if (fullName === "walk-in customer") {
      return true;
    }

    if (firstName === "walk-in" && (!lastName || lastName === "customer")) {
      return true;
    }

    if (!firstName && lastName === "walk-in customer") {
      return true;
    }

    return false;
  };

  const filteredClients = useMemo(
    () => clients.filter((client) => !isWalkInCustomer(client)),
    [clients]
  );

  const excludedClientCount = clients.length - filteredClients.length;
  const adjustedTotal = Math.max(total - excludedClientCount, 0);
  const shouldShowEmptyState =
    showEmptyState || (!isLoading && filteredClients.length === 0);

  const renderClientCard = ({ item }: { item: ClientBO }) => (
    <TouchableOpacity
      style={ClientScreenStyles.clientCardContainer}
      onPress={() => navigateToClientDetail(item)}
    >
      <View style={ClientScreenStyles.clientImageContainer}>
        <Text style={ClientScreenStyles.clientInitials}>
          {(item.first_name.charAt(0) + item.last_name.charAt(0)).toUpperCase()}
        </Text>
      </View>
      <View style={ClientScreenStyles.clientDetailsContainer}>
        <View style={ClientScreenStyles.clientInfo}>
          <Text style={ClientScreenStyles.clientName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={ClientScreenStyles.clientPhone}>{item.phone}</Text>
        </View>
        <View style={ClientScreenStyles.clientSalesBadge}>
          <Text style={ClientScreenStyles.clientSales}>
            AED {formatCurrency(item.total_sales ?? 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadMoreButton = () => {
    if (!showLoadMoreButton) return null;

    return (
      <TouchableOpacity
        style={ClientScreenStyles.loadMoreButton}
        onPress={handleLoadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={ClientScreenStyles.loadMoreText}>Load More</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={ClientScreenStyles.emptyStateContainer}>
      <Text style={ClientScreenStyles.emptyStateTitle}>No clients found</Text>
      <Text style={ClientScreenStyles.emptyStateSubtitle}>
        {searchTerm
          ? `No clients match "${searchTerm}"`
          : "Start by adding your first client"}
      </Text>
      {!searchTerm && (
        <TouchableOpacity
          style={ClientScreenStyles.addFirstClientButton}
          onPress={() => {
            navigateToAddClient();
          }}
        >
          <Text style={ClientScreenStyles.addFirstClientText}>Add Client</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={ClientScreenStyles.mainContainer}
    >
      <View style={ClientScreenStyles.header}>
        <Text style={ClientScreenStyles.headerText}>
          Clients ({adjustedTotal.toLocaleString()})
        </Text>
        <View style={ClientScreenStyles.actionContainer}>
          {/* <TouchableOpacity
            style={ClientScreenStyles.elipseContainer}
            onPress={showComingSoon}
          >
            <EllipsisVertical size={20} />
          </TouchableOpacity> */}

          <TouchableOpacity
            style={ClientScreenStyles.actionButton}
            onPress={() => {
              navigateToAddClient();
            }}
          >
            <Text style={ClientScreenStyles.actionButtonText}>Add</Text>
            <Plus size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={ClientScreenStyles.bodyContainer}>
        <View style={ClientScreenStyles.titleContentContainer}>
          {/* <Text style={ClientScreenStyles.title}>Clients List</Text> */}
          <Text style={ClientScreenStyles.subTitle}>
            View, add, edit and delete client's details
          </Text>
          {/*  <Text style={ClientScreenStyles.learnMore}>Learn More</Text> */}
        </View>

        <View style={ClientScreenStyles.searchFilterContainer}>
          <View style={ClientScreenStyles.searchContainer}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Name, email or phone"
              placeholderTextColor={colors.textSecondary}
              style={ClientScreenStyles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={ClientScreenStyles.clearButton}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          {/* <TouchableOpacity
            style={ClientScreenStyles.filterContainer}
            onPress={()=>{}}
          >
            <SlidersVertical size={20} color={"black"} />
          </TouchableOpacity> */}
        </View>

        {shouldShowEmptyState ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredClients}
            renderItem={renderClientCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderLoadMoreButton}
            contentContainerStyle={{
              paddingBottom: 20,
              paddingTop: getHeightEquivalent(10),
            }}
          />
        )}

        {isLoading && clients.length === 0 && (
          <View style={ClientScreenStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={ClientScreenStyles.loadingText}>
              Loading clients...
            </Text>
          </View>
        )}
      </View>

      {/* <CustomToast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={hideToast}
      /> */}
    </SafeAreaView>
  );
};

export default ClientScreen;
