import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import React, { useState, useRef, useEffect, Fragment, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Edit2,
  Plus,
  Search,
  X,
  Check,
  User,
  RefreshCw,
} from "lucide-react-native";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import { CreateAppointmentStyles } from "./CreateAppointmentStyles";
import { colors } from "../../../Constants/colors";
import { getHeightEquivalent } from "../../../Utils/helpers";
import {
  serviceRepository,
  Service as ServiceBO,
} from "../../../Repository/serviceRepository";
import { appointmentsRepository } from "../../../Repository/appointmentsRepository";
import useClientScreenVM from "../ClientScreen/ClientScreenVM";
import { ClientBO } from "../../../Repository/clientRepository";
import DateModal from "../../../Components/DateModal";
import { useAuthStore } from "../../../Store/useAuthStore";
import {
  teamRepository,
  TeamMemberBO,
} from "../../../Repository/teamRepository";
import CustomToast from "../../../Components/CustomToast";
import { ChevronDown, MapPin, CalendarPlus } from "lucide-react-native";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  duration_minutes?: number;
  description?: string;
  category?: string;
  uniqueKey?: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface SelectedService extends Service {
  quantity: number;
  isSelected?: boolean;
}

const CreateAppointmentScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [serviceSearchText, setServiceSearchText] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [availableServices, setAvailableServices] = useState<ServiceBO[]>([]);
  const [allServices, setAllServices] = useState<ServiceBO[]>([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesPage, setServicesPage] = useState(1);
  const [hasMoreServices, setHasMoreServices] = useState(true);
  const [isLoadingMoreServices, setIsLoadingMoreServices] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [availableStaff, setAvailableStaff] = useState<TeamMemberBO[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const { currentLocation, allLocations, allTeamMembers } = useAuthStore();

  // Initialize location and fetch staff
  useEffect(() => {
    if (currentLocation && !selectedLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation]);

  // Fetch staff when location changes
  useEffect(() => {
    const fetchStaff = async () => {
      if (!selectedLocation) return;

      setLoadingStaff(true);
      try {
        const staff = await teamRepository.getTeamMembersByLocation([
          selectedLocation,
        ]);
        setAvailableStaff(staff);
        // Auto-select first staff member if available
        if (staff.length > 0 && !selectedStaff) {
          setSelectedStaff(staff[0].id);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        setAvailableStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [selectedLocation]);

  useEffect(() => {
    const fetchAllServices = async () => {
      setLoadingServices(true);
      try {
        // Load all services at once for search functionality
        const response = await serviceRepository.getServices({
          page: 1,
          limit: 1000, // Load all services for search
          is_active: true,
        });

        // Map services to include duration property that matches the interface
        const mappedServices = response.data.map(
          (service: any, index: number) => ({
            ...service,
            duration: service.duration_minutes || service.duration || 30,
            uniqueKey: `${service.id}_${index}`, // Ensure unique keys
          })
        );

        // Remove duplicates based on ID
        const uniqueServices = mappedServices.filter(
          (service, index, self) =>
            index === self.findIndex((s) => s.id === service.id)
        );

        setAllServices(uniqueServices);
        setAvailableServices(uniqueServices.slice(0, 20)); // Show first 20
        setHasMoreServices(uniqueServices.length > 20);
        setServicesPage(1);
      } catch (error) {
        console.error("Error fetching services:", error);
        setAllServices([]);
        setAvailableServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchAllServices();

    // Handle prefilled data from route params
    if (route.params?.prefilledData) {
      const { date, time } = route.params.prefilledData;
      if (date) setCurrentDate(new Date(date));
      if (time) setCurrentTime(time);
    } else {
      // Set current time
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }
  }, [route.params]);

  // Slide in animation for screen entrance
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const handleGoBack = () => {
    clearSearch();
    navigation.goBack();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };
  const filteredServices = allServices.filter((service) =>
    service.name.toLowerCase().includes(serviceSearchText.toLowerCase())
  );

  // Get current page of services for display
  const currentPageServices = filteredServices.slice(0, servicesPage * 20);

  const handleToggleService = (service: ServiceBO) => {
    const exists = selectedServices.find((s) => s.id === service.id);
    if (exists) {
      setSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
    } else {
      const serviceToAdd: SelectedService = {
        id: service.id,
        name: service.name,
        price: service.price,
        duration: (service as any).duration_minutes || service.duration || 30,
        duration_minutes: (service as any).duration_minutes,
        description: service.description,
        category: service.category,
        quantity: 1,
        isSelected: true,
      };
      setSelectedServices((prev) => [...prev, serviceToAdd]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.filter((service) => service.id !== serviceId)
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce(
      (total, service) => total + service.price * service.quantity,
      0
    );
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce(
      (total, service) => total + (service.duration || 0),
      0
    );
  };

  const calculateEndTime = (
    startTime: string,
    durationMinutes: number
  ): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}:00`;
  };

  const handleSave = async () => {
    if (
      !selectedClient ||
      selectedServices.length === 0 ||
      !selectedLocation ||
      !selectedStaff
    ) {
      setToastMessage("Please fill in all required fields");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setIsSaving(true);
    try {
      const totalDuration = calculateTotalDuration();
      const startTimeFormatted = `${currentTime}:00`;
      const endTime = calculateEndTime(currentTime, totalDuration);

      const appointmentData = {
        client_id: selectedClient.id,
        date: currentDate.toISOString().split("T")[0],
        time: startTimeFormatted,
        services: selectedServices.map((s) => ({
          service_id: s.id,
          quantity: s.quantity,
          price: s.price,
          duration: s.duration,
        })),
        total_amount: calculateTotal(),
        status: "scheduled" as const,
        notes: "",
        location_id: selectedLocation,
        staff_id: selectedStaff,
        start_time: startTimeFormatted,
        end_time: endTime,
      };

      console.log("Creating appointment with data:", appointmentData);

      const result = await appointmentsRepository.createAppointment(
        appointmentData
      );

      if (result) {
        setToastMessage("Appointment created successfully!");
        setToastType("success");
        setShowToast(true);

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        setToastMessage("Failed to create appointment. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      setToastMessage("An error occurred while saving the appointment.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

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

  const filteredClients = useMemo(
    () =>
      clients.filter((client) => {
        const fullName = `${client.first_name ?? ""} ${client.last_name ?? ""}`
          .trim()
          .toLowerCase();
        return fullName !== "walk-in customer";
      }),
    [clients]
  );

  const shouldShowEmptyState =
    showEmptyState || (!isLoading && filteredClients.length === 0);

  const renderEmptyState = () => (
    <View style={CreateAppointmentStyles.emptyStateContainer}>
      <Text style={CreateAppointmentStyles.emptyStateTitle}>
        No clients found
      </Text>
      <Text style={CreateAppointmentStyles.emptyStateSubtitle}>
        {searchTerm
          ? `No clients match "${searchTerm}"`
          : "Start by adding your first client"}
      </Text>
      {!searchTerm && (
        <TouchableOpacity
          style={CreateAppointmentStyles.addFirstClientButton}
          onPress={() => {}}
        >
          <Text style={CreateAppointmentStyles.addFirstClientText}>
            Add Client
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  const renderClientCard = ({ item }: { item: ClientBO }) => (
    <TouchableOpacity
      key={item.id}
      style={CreateAppointmentStyles.clientCardContainer}
      onPress={() => handleSelectClient(item)}
    >
      <View style={CreateAppointmentStyles.clientImageContainer}>
        <Text style={CreateAppointmentStyles.clientInitials}>
          {(item.first_name.charAt(0) + item.last_name.charAt(0)).toUpperCase()}
        </Text>
      </View>
      <View style={CreateAppointmentStyles.clientDetailsContainer}>
        <Text style={CreateAppointmentStyles.clientName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={CreateAppointmentStyles.clientEmail}>
          {item.first_name}
        </Text>
        <Text style={CreateAppointmentStyles.clientPhone}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );
  const renderLoadMoreButton = () => {
    if (!showLoadMoreButton) return null;

    return (
      <TouchableOpacity
        style={CreateAppointmentStyles.loadMoreButton}
        onPress={handleLoadMore}
        disabled={isLoadingMore}
      >
        {isLoadingMore ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={CreateAppointmentStyles.loadMoreText}>Load More</Text>
        )}
      </TouchableOpacity>
    );
  };
  const handleSelectClient = (client: ClientBO) => {
    setSelectedClient({
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
      phone: client.phone,
    });
  };

  const handleChangeClient = () => {
    setSelectedClient(null);
  };

  const navigateToAddClientScreen = () => {
    // Determine if search term is a number (phone) or text (name)
    const isPhoneNumber = /^\d+$/.test(searchTerm.trim());
    
    // @ts-ignore - Navigation typing issue
    navigation.navigate("AddClientScreen", {
      onClientAdded: handleRefresh,
      prefilledData: isPhoneNumber 
        ? { phone: searchTerm.trim() }
        : { name: searchTerm.trim() }
    });
  };

  const loadMoreServices = async () => {
    if (isLoadingMoreServices) return;

    setIsLoadingMoreServices(true);
    try {
      const nextPage = servicesPage + 1;
      const startIndex = nextPage * 20;

      // Show more services from the filtered results
      const moreServices = filteredServices.slice(0, startIndex);
      setAvailableServices(moreServices);
      setServicesPage(nextPage);
    } catch (error) {
      console.error("Error loading more services:", error);
    } finally {
      setIsLoadingMoreServices(false);
    }
  };
  return (
    <SafeAreaView style={CreateAppointmentStyles.container}>
      <Animated.View
        style={[
          CreateAppointmentStyles.content,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={CreateAppointmentStyles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={CreateAppointmentStyles.backButton}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={CreateAppointmentStyles.headerTitle}>
            New Appointment
          </Text>
          <TouchableOpacity
            onPress={() => setShowDateModal(true)}
            style={CreateAppointmentStyles.headerDateTimeContainer}
          >
            <View style={CreateAppointmentStyles.headerDateTimeContent}>
              <Text style={CreateAppointmentStyles.headerDateText}>
                {currentDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={CreateAppointmentStyles.headerTimeText}>
                {currentTime}
              </Text>
            </View>
            <Edit2 size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View style={CreateAppointmentStyles.scrollContent}>
            {/* Client Selection Card */}
            <View style={CreateAppointmentStyles.section}>
              {/* <Text style={CreateAppointmentStyles.sectionTitle}>
                {selectedClient ? "Selected Client" : "Client *"}
              </Text> */}

              {selectedClient ? (
                <>
                  {/* Selected Client Display */}
                  <View style={CreateAppointmentStyles.selectedClientCard}>
                    <View style={CreateAppointmentStyles.selectedClientContent}>
                      <View
                        style={CreateAppointmentStyles.selectedClientAvatar}
                      >
                        <Text
                          style={CreateAppointmentStyles.selectedClientInitials}
                        >
                          {selectedClient.first_name.charAt(0)}
                          {selectedClient.last_name.charAt(0)}
                        </Text>
                      </View>
                      <View style={CreateAppointmentStyles.selectedClientInfo}>
                        <Text
                          style={CreateAppointmentStyles.selectedClientName}
                        >
                          {selectedClient.first_name} {selectedClient.last_name}
                        </Text>
                        <Text
                          style={CreateAppointmentStyles.selectedClientPhone}
                        >
                          {selectedClient.phone}
                        </Text>
                        <Text
                          style={CreateAppointmentStyles.selectedClientEmail}
                        >
                          {selectedClient.email}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={CreateAppointmentStyles.viewProfileButton}
                      onPress={() => {
                        const client = clients.find(
                          (c) => c.id === selectedClient.id
                        );
                        if (client) navigateToClientDetail(client);
                      }}
                    >
                      <Text style={CreateAppointmentStyles.viewProfileText}>
                        <User size={18} color={colors.primary} /> View{" "}
                        {selectedClient.first_name} Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={handleChangeClient}
                    style={CreateAppointmentStyles.changeClientButton}
                  >
                    <RefreshCw
                      size={16}
                      color={colors.text}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={CreateAppointmentStyles.changeClientText}>
                      Change Client
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={CreateAppointmentStyles.clientSelectionCard}
                  onPress={() => setShowClientModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={CreateAppointmentStyles.clientPlaceholderAvatar}>
                    <User size={24} color={colors.textSecondary} />
                  </View>
                  <View style={CreateAppointmentStyles.clientCardInfo}>
                    <Text style={CreateAppointmentStyles.clientCardPlaceholder}>
                      Select a client
                    </Text>
                    <Text style={CreateAppointmentStyles.clientCardSubtext}>
                      Tap to choose a clients
                    </Text>
                  </View>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Services Section */}
            <View style={CreateAppointmentStyles.section}>
              <Text style={CreateAppointmentStyles.sectionTitle}>Services</Text>
              <View style={CreateAppointmentStyles.sectionCard}>
                {/* Selected Services */}
                {selectedServices.length > 0 ? (
                  <>
                    <View style={CreateAppointmentStyles.durationInfo}>
                      <Text style={CreateAppointmentStyles.durationLabel}>
                        Total Duration:
                      </Text>
                      <Text style={CreateAppointmentStyles.durationValue}>
                        {calculateTotalDuration()} minutes
                      </Text>
                    </View>
                    <ScrollView
                      style={CreateAppointmentStyles.selectedServicesContainer}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={false}
                    >
                      {selectedServices.map((service) => (
                        <View
                          key={service.id}
                          style={CreateAppointmentStyles.selectedServiceItem}
                        >
                          <View style={CreateAppointmentStyles.serviceInfo}>
                            <Text style={CreateAppointmentStyles.serviceName}>
                              {service.name}
                            </Text>
                            <Text style={CreateAppointmentStyles.servicePrice}>
                              AED {service.price}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveService(service.id)}
                            style={CreateAppointmentStyles.removeButton}
                          >
                            <X size={16} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                ) : (
                  <View style={CreateAppointmentStyles.noServicesContainer}>
                    <CalendarPlus size={32} color={colors.textSecondary} />
                    <Text style={CreateAppointmentStyles.noServicesText}>
                      No services selected
                    </Text>
                  </View>
                )}
                {/* Add Service Button */}
                <TouchableOpacity
                  style={CreateAppointmentStyles.addServiceButton}
                  onPress={() => setShowServiceModal(true)}
                >
                  <Plus size={20} color={colors.primary} />
                  <Text style={CreateAppointmentStyles.addServiceButtonText}>
                    Add service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Location Selection */}
            <View style={CreateAppointmentStyles.section}>
              {/* <Text style={CreateAppointmentStyles.sectionTitle}>
                Location
              </Text> */}
              <TouchableOpacity
                style={CreateAppointmentStyles.selectionButton}
                onPress={() => setShowLocationModal(true)}
              >
                <View style={CreateAppointmentStyles.selectionButtonContent}>
                  <MapPin size={20} color={colors.primary} />
                  <Text
                    style={[
                      CreateAppointmentStyles.selectionButtonText,
                      !selectedLocation &&
                        CreateAppointmentStyles.selectionButtonPlaceholder,
                    ]}
                  >
                    {selectedLocation
                      ? allLocations.find((l) => l.id === selectedLocation)
                          ?.name
                      : "Select Location"}
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Staff Selection */}
            <View style={CreateAppointmentStyles.section}>
              {/* <Text style={CreateAppointmentStyles.sectionTitle}>
                Staff Member
              </Text> */}
              {loadingStaff ? (
                <View style={CreateAppointmentStyles.selectionButton}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    CreateAppointmentStyles.selectionButton,
                    availableStaff.length === 0 &&
                      CreateAppointmentStyles.selectionButtonDisabled,
                  ]}
                  onPress={() =>
                    availableStaff.length > 0 && setShowStaffModal(true)
                  }
                  disabled={availableStaff.length === 0}
                >
                  <View style={CreateAppointmentStyles.selectionButtonContent}>
                    <User
                      size={20}
                      color={
                        availableStaff.length > 0
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        CreateAppointmentStyles.selectionButtonText,
                        !selectedStaff &&
                          CreateAppointmentStyles.selectionButtonPlaceholder,
                        availableStaff.length === 0 &&
                          CreateAppointmentStyles.selectionButtonDisabledText,
                      ]}
                    >
                      {selectedStaff
                        ? (() => {
                            const staff = availableStaff.find(
                              (s) => s.id === selectedStaff
                            );
                            return staff
                              ? `${staff.first_name} ${staff.last_name}`
                              : "Select Staff Member";
                          })()
                        : availableStaff.length === 0
                        ? "No staff available for this location"
                        : "Select Staff Member"}
                    </Text>
                  </View>
                  {availableStaff.length > 0 && (
                    <ChevronDown size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bottom Section */}
          <View style={CreateAppointmentStyles.bottomSection}>
            <View style={CreateAppointmentStyles.totalContainer}>
              <Text style={CreateAppointmentStyles.totalLabel}>Total</Text>
              <Text style={CreateAppointmentStyles.totalAmount}>
                AED {calculateTotal().toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                CreateAppointmentStyles.saveButton,
                (!selectedClient ||
                  selectedServices.length === 0 ||
                  !selectedLocation ||
                  !selectedStaff ||
                  isSaving) &&
                  CreateAppointmentStyles.disabledSaveButton,
              ]}
              onPress={handleSave}
              disabled={
                !selectedClient ||
                selectedServices.length === 0 ||
                !selectedLocation ||
                !selectedStaff ||
                isSaving
              }
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={CreateAppointmentStyles.saveButtonText}>
                  Save Appointment
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Date Selection Modal */}
      <DateModal
        isVisible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSelectDate={(date) => setCurrentDate(date)}
        selectedDate={currentDate}
        title="Select Appointment Date"
        minDate={new Date().toISOString().split("T")[0]}
      />

      {/* Service Selection Modal */}
      <Modal
        isVisible={showServiceModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => {
          setShowServiceModal(false);
          setServiceSearchText("");
          Keyboard.dismiss();
        }}
        onSwipeComplete={() => {
          setShowServiceModal(false);
          setServiceSearchText("");
          Keyboard.dismiss();
        }}
        swipeDirection={["down"]}
        style={CreateAppointmentStyles.serviceModal}
        avoidKeyboard={true}
        propagateSwipe={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={CreateAppointmentStyles.serviceModalContent}
        >
          {/* Modal Drag Indicator */}
          <View style={CreateAppointmentStyles.modalDragIndicator} />
          <Text style={CreateAppointmentStyles.serviceModalTitle}>
            Select Services
          </Text>

          {/* Service Search */}
          <View style={CreateAppointmentStyles.serviceSearchContainer}>
            <Search
              size={20}
              color={colors.textSecondary}
              style={CreateAppointmentStyles.searchIcon}
            />
            <TextInput
              style={CreateAppointmentStyles.serviceSearchInput}
              placeholder="Search services..."
              value={serviceSearchText}
              onChangeText={setServiceSearchText}
            />
          </View>

          {/* Services List */}
          <ScrollView
            style={CreateAppointmentStyles.serviceList}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {loadingServices ? (
              <View style={CreateAppointmentStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={CreateAppointmentStyles.loadingText}>
                  Loading services...
                </Text>
              </View>
            ) : filteredServices.length === 0 ? (
              <View style={CreateAppointmentStyles.emptyStateContainer}>
                <Text style={CreateAppointmentStyles.emptyStateTitle}>
                  No services found
                </Text>
                <Text style={CreateAppointmentStyles.emptyStateSubtitle}>
                  {serviceSearchText
                    ? `No services match "${serviceSearchText}"`
                    : "No services available"}
                </Text>
              </View>
            ) : (
              currentPageServices.map((item) => (
                <TouchableOpacity
                  key={(item as any).uniqueKey || `service_${item.id}`}
                  style={CreateAppointmentStyles.serviceItem}
                  onPress={() => handleToggleService(item)}
                >
                  <View style={CreateAppointmentStyles.checkboxContainer}>
                    <View
                      style={[
                        CreateAppointmentStyles.checkbox,
                        selectedServices.some((s) => s.id === item.id) &&
                          CreateAppointmentStyles.checkboxChecked,
                      ]}
                    >
                      {selectedServices.some((s) => s.id === item.id) && (
                        <Check size={16} color={colors.white} strokeWidth={3} />
                      )}
                    </View>
                  </View>
                  <View style={CreateAppointmentStyles.serviceInfo}>
                    <Text style={CreateAppointmentStyles.serviceName}>
                      {item.name}
                    </Text>
                    <Text style={CreateAppointmentStyles.servicePrice}>
                      AED {item.price}
                    </Text>
                  </View>
                  <Text style={CreateAppointmentStyles.serviceDuration}>
                    {item.duration}min
                  </Text>
                </TouchableOpacity>
              ))
            )}
            {filteredServices.length > currentPageServices.length &&
              !loadingServices && (
                <TouchableOpacity
                  style={CreateAppointmentStyles.servicesLoadMoreButton}
                  onPress={loadMoreServices}
                  disabled={isLoadingMoreServices}
                >
                  {isLoadingMoreServices ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={CreateAppointmentStyles.servicesLoadMoreText}>
                      Load More Services
                    </Text>
                  )}
                </TouchableOpacity>
              )}
          </ScrollView>

          {/* Done Button */}
          <TouchableOpacity
            style={[
              CreateAppointmentStyles.modalDoneButton,
              selectedServices.length === 0 &&
                CreateAppointmentStyles.modalDoneButtonDisabled,
            ]}
            onPress={() => {
              setShowServiceModal(false);
              setServiceSearchText("");
              Keyboard.dismiss();
            }}
            disabled={selectedServices.length === 0}
          >
            <Text style={CreateAppointmentStyles.modalDoneButtonText}>
              Done ({selectedServices.length} selected)
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Client Selection Modal */}
      <Modal
        isVisible={showClientModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => setShowClientModal(false)}
        onSwipeComplete={() => setShowClientModal(false)}
        swipeDirection={["down"]}
        style={CreateAppointmentStyles.clientModal}
      >
        <View style={CreateAppointmentStyles.clientModalContent}>
          <View style={CreateAppointmentStyles.modalDragIndicator} />

          {/* Modal Header */}
          <View style={CreateAppointmentStyles.clientModalHeader}>
            <Text style={CreateAppointmentStyles.clientModalTitle}>
              Select Client
            </Text>
            <TouchableOpacity
              onPress={() => setShowClientModal(false)}
              style={CreateAppointmentStyles.clientModalCloseButton}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Client Search Input */}
          <View style={CreateAppointmentStyles.searchContainer}>
            <Search
              size={20}
              color={colors.textSecondary}
              style={CreateAppointmentStyles.searchIcon}
            />
            <TextInput
              style={CreateAppointmentStyles.searchInput}
              placeholder="Search clients..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={CreateAppointmentStyles.clearButton}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Add New Client Button */}
          <TouchableOpacity
            onPress={() => {
              setShowClientModal(false);
              navigateToAddClientScreen();
            }}
            style={CreateAppointmentStyles.addButton}
          >
            <Plus size={20} color={colors.white} />
            <Text style={CreateAppointmentStyles.addButtonText}>
              Add new client
            </Text>
          </TouchableOpacity>

          {/* Client List */}
          <View style={CreateAppointmentStyles.clientModalList}>
            {isLoading ? (
              <View style={CreateAppointmentStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={CreateAppointmentStyles.loadingText}>
                  Loading clients...
                </Text>
              </View>
            ) : shouldShowEmptyState ? (
              renderEmptyState()
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                  />
                }
                contentContainerStyle={{
                  paddingBottom: 20,
                  paddingTop: getHeightEquivalent(10),
                }}
              >
                {filteredClients.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={CreateAppointmentStyles.clientCardContainer}
                    onPress={() => {
                      handleSelectClient(item);
                      setShowClientModal(false);
                    }}
                  >
                    <View style={CreateAppointmentStyles.clientImageContainer}>
                      <Text style={CreateAppointmentStyles.clientInitials}>
                        {(
                          item.first_name.charAt(0) + item.last_name.charAt(0)
                        ).toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={CreateAppointmentStyles.clientDetailsContainer}
                    >
                      <Text style={CreateAppointmentStyles.clientName}>
                        {item.first_name} {item.last_name}
                      </Text>
                      <Text style={CreateAppointmentStyles.clientEmail}>
                        {item.email || item.first_name}
                      </Text>
                      <Text style={CreateAppointmentStyles.clientPhone}>
                        {item.phone}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {renderLoadMoreButton()}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Location Selection Modal */}
      <Modal
        isVisible={showLocationModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => setShowLocationModal(false)}
        onSwipeComplete={() => setShowLocationModal(false)}
        swipeDirection={["down"]}
        style={CreateAppointmentStyles.serviceModal}
      >
        <View style={CreateAppointmentStyles.serviceModalContent}>
          <View style={CreateAppointmentStyles.modalDragIndicator} />
          <Text style={CreateAppointmentStyles.serviceModalTitle}>
            Select Location
          </Text>
          <ScrollView style={CreateAppointmentStyles.modalList}>
            {allLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  CreateAppointmentStyles.modalListItem,
                  selectedLocation === location.id &&
                    CreateAppointmentStyles.modalListItemSelected,
                ]}
                onPress={() => {
                  setSelectedLocation(location.id);
                  setSelectedStaff(""); // Reset staff when location changes
                  setShowLocationModal(false);
                }}
              >
                <MapPin
                  size={20}
                  color={
                    selectedLocation === location.id
                      ? colors.primary
                      : colors.text
                  }
                />
                <Text
                  style={[
                    CreateAppointmentStyles.modalListItemText,
                    selectedLocation === location.id &&
                      CreateAppointmentStyles.modalListItemTextSelected,
                  ]}
                >
                  {location.name}
                </Text>
                {selectedLocation === location.id && (
                  <Check size={20} color={colors.primary} strokeWidth={3} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Staff Selection Modal */}
      <Modal
        isVisible={showStaffModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => setShowStaffModal(false)}
        onSwipeComplete={() => setShowStaffModal(false)}
        swipeDirection={["down"]}
        style={CreateAppointmentStyles.serviceModal}
      >
        <View style={CreateAppointmentStyles.serviceModalContent}>
          <View style={CreateAppointmentStyles.modalDragIndicator} />
          <Text style={CreateAppointmentStyles.serviceModalTitle}>
            Select Staff Member
          </Text>
          <ScrollView style={CreateAppointmentStyles.modalList}>
            {availableStaff.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                style={[
                  CreateAppointmentStyles.modalListItem,
                  selectedStaff === staff.id &&
                    CreateAppointmentStyles.modalListItemSelected,
                ]}
                onPress={() => {
                  setSelectedStaff(staff.id);
                  setShowStaffModal(false);
                }}
              >
                <User
                  size={20}
                  color={
                    selectedStaff === staff.id ? colors.primary : colors.text
                  }
                />
                <Text
                  style={[
                    CreateAppointmentStyles.modalListItemText,
                    selectedStaff === staff.id &&
                      CreateAppointmentStyles.modalListItemTextSelected,
                  ]}
                >
                  {staff.first_name} {staff.last_name}
                </Text>
                {selectedStaff === staff.id && (
                  <Check size={20} color={colors.primary} strokeWidth={3} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Toast Notification */}
      <CustomToast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
};

export default CreateAppointmentScreen;
