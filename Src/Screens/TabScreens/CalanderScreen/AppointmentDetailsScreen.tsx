import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../Navigations/RootStackNavigator";
import { useAuthStore } from "../../../Store/useAuthStore";
import {
  ArrowLeft,
  Calendar,
  Clock,
  UserRound,
  Scissors,
  MapPin,
  FileText,
  Users,
  Tag,
  X,
  ClipboardClock,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import { AppointmentCalanderBO, appointmentsRepository } from "../../../Repository/appointmentsRepository";
import { supabase } from "../../../Utils/supabase";

interface AppointmentDetailsRouteParams {
  appointment?: AppointmentCalanderBO;
  appointment_id?: string;
  appointment_service_id?: string;
}

const AppointmentDetailsScreen = () => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const params = (route.params || {}) as AppointmentDetailsRouteParams;
  const initialAppointment = params.appointment;
  const { allLocations } = useAuthStore();
  const { colors: paint } = colors;
  const [isCanceling, setIsCanceling] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentCalanderBO | null>(initialAppointment ?? null);
  const [isLoading, setIsLoading] = useState(!initialAppointment);
  // const [unavailable, setUnavailable] = useState(false);
  
  // Store the appointment service ID separately to avoid closure issues
  const appointmentServiceId = React.useRef<string | null>(initialAppointment?.id ?? params.appointment_service_id ?? null);

  // Fetch fresh appointment data from the database
  const fetchAppointmentDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("appointment_services")
        .select(`
          id,
          appointment_id,
          service_id,
          staff_id,
          price,
          start_time,
          end_time,
          voucher_discount,
          created_at,
          original_staff_id,
          services (
            id,
            name,
            description,
            duration_minutes,
            price,
            category
          ),
          staff:team_members!appointment_services_staff_id_fkey (
            id,
            first_name,
            last_name,
            phone_number,
            calendar_color
          ),
          appointments!appointment_services_appointment_id_fkey (
            id,
            client_id,
            appointment_date,
            status,
            notes,
            location_id,
            clients (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          )
        `)
        .eq("id", appointmentServiceId.current)
        .maybeSingle(); // Use maybeSingle to avoid caching issues

      if (error) {
        console.error("[AppointmentDetails] Error fetching appointment:", error);
        console.error("[AppointmentDetails] Error details:", JSON.stringify(error));
        Alert.alert("Error", "Failed to load appointment details. Please try again.");
        setIsLoading(false);
        setAppointment(null);  
        return;
      }

      if (!data) {
        console.error("[AppointmentDetails] No data returned for appointment service ID:", appointmentServiceId.current);
         Alert.alert("Error", "Failed to load appointment details. Please try again.");
         setIsLoading(false);
         setAppointment(null);  
        return;
      }

      console.log("[AppointmentDetails] Fresh data received:", data);
      
      // Handle the nested appointments and clients data properly
      const appointmentData = data.appointments as any;
      const serviceData = data.services as any;
      const staffData = data.staff as any;
      
      
      // Transform the data to match AppointmentCalanderBO structure
      const freshAppointment: AppointmentCalanderBO = {
        id: data.id,
        appointment_id: data.appointment_id,
        service_id: data.service_id,
        staff_id: data.staff_id,
        created_at: data.created_at,
        original_staff: null,
        original_staff_id: data.original_staff_id,
        appointment: {
          id: appointmentData.id,
          client_id: appointmentData.client_id,
          appointment_date: appointmentData.appointment_date,
          status: appointmentData.status,
          notes: appointmentData.notes,
          location_id: appointmentData.location_id,
          client: appointmentData.clients,
        } as any,
        service: serviceData as any,
        staff: staffData as any,
        price: data.price,
        start_time: data.start_time,
        end_time: data.end_time,
        voucher_discount: data.voucher_discount,
      };
      
      
      setAppointment(freshAppointment);
      console.log("[AppointmentDetails] State updated successfully");
    } catch (e) {
      console.error("[AppointmentDetails] Error in fetchAppointmentDetails:", e);
       Alert.alert("Error", "Failed to load appointment details. Please try again.");
      setIsLoading(false);
      setAppointment(null);  
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when only appointment_id or appointment_service_id provided
  useEffect(() => {
    const load = async () => {
      try {
        if (appointment) return; // already have it
        setIsLoading(true);
        // If we only have appointment_id (no service id), resolve a service id first.
        if (!appointmentServiceId.current && params?.appointment_id) {
          const { data: svcRow, error: svcErr } = await supabase
            .from("appointment_services")
            .select("id")
            .eq("appointment_id", params.appointment_id)
            .order("start_time", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (svcErr) {
            console.error(
              "[AppointmentDetails] Failed to resolve appointment_service_id from appointment_id",
              svcErr
            );
          }

          if (svcRow?.id) {
            appointmentServiceId.current = svcRow.id;
          }
        }

        if (appointmentServiceId.current) {
          const { data, error } = await supabase
            .from("appointment_services")
            .select(`
              id,
              appointment_id,
              service_id,
              staff_id,
              price,
              start_time,
              end_time,
              voucher_discount,
              created_at,
              original_staff_id,
              services (*),
              staff:team_members!appointment_services_staff_id_fkey (*),
              appointments!appointment_services_appointment_id_fkey (
                id,
                client_id,
                appointment_date,
                status,
                notes,
                location_id,
                clients (* )
              )
            `)
            .eq("id", appointmentServiceId.current)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            const appointmentData = data.appointments as any;
            const fresh: AppointmentCalanderBO = {
              id: data.id,
              appointment_id: data.appointment_id,
              service_id: data.service_id,
              staff_id: data.staff_id,
              created_at: data.created_at,
              original_staff: null,
              original_staff_id: data.original_staff_id,
              appointment: {
                id: appointmentData.id,
                client_id: appointmentData.client_id,
                appointment_date: appointmentData.appointment_date,
                status: appointmentData.status,
                notes: appointmentData.notes,
                location_id: appointmentData.location_id,
                client: appointmentData.clients,
              } as any,
              service: data.services as any,
              staff: data.staff as any,
              price: data.price,
              start_time: data.start_time,
              end_time: data.end_time,
              voucher_discount: data.voucher_discount,
            };
            setAppointment(fresh);
          }
        } else if (params.appointment_id) {
          const { data, error } = await supabase
            .from("appointment_services")
            .select(`
              id,
              appointment_id,
              service_id,
              staff_id,
              price,
              start_time,
              end_time,
              voucher_discount,
              created_at,
              original_staff_id,
              services (*),
              staff:team_members!appointment_services_staff_id_fkey (*),
              appointments!appointment_services_appointment_id_fkey (
                id,
                client_id,
                appointment_date,
                status,
                notes,
                location_id,
                clients (* )
              )
            `)
            .eq("appointment_id", params.appointment_id)
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            appointmentServiceId.current = data.id;
            const appointmentData = data.appointments as any;
            const fresh: AppointmentCalanderBO = {
              id: data.id,
              appointment_id: data.appointment_id,
              service_id: data.service_id,
              staff_id: data.staff_id,
              created_at: data.created_at,
              original_staff: null,
              original_staff_id: data.original_staff_id,
              appointment: {
                id: appointmentData.id,
                client_id: appointmentData.client_id,
                appointment_date: appointmentData.appointment_date,
                status: appointmentData.status,
                notes: appointmentData.notes,
                location_id: appointmentData.location_id,
                client: appointmentData.clients,
              } as any,
              service: data.services as any,
              staff: data.staff as any,
              price: data.price,
              start_time: data.start_time,
              end_time: data.end_time,
              voucher_discount: data.voucher_discount,
            };
            setAppointment(fresh);
          }
        }
      } catch (e) {
        console.error('[AppointmentDetails] load error', e);
        Alert.alert("Error", "Failed to load appointment details. Please try again.");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params?.appointment_id]);

  // Refetch appointment data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!appointmentServiceId.current) return;
      fetchAppointmentDetails();
    }, [fetchAppointmentDetails])
  );

  // Find the location name using location_id
  const location = appointment?.appointment?.location_id
    ? allLocations.find((loc) => loc.id === appointment.appointment.location_id)
    : undefined;
  const locationName = location?.name || "Location not found";

  // Handle cancelled appointment: alert and return
  const hasHandledCancelled = React.useRef(false);
  useEffect(() => {
    if (appointment && appointment.appointment?.status?.toLowerCase() === 'cancelled' && !hasHandledCancelled.current) {
      hasHandledCancelled.current = true;
      Alert.alert(
        'Appointment Cancelled',
        'This appointment has been cancelled and cannot be viewed.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    }
  }, [appointment, navigation]);

  const isCancelled = !!(appointment && appointment.appointment?.status?.toLowerCase() === 'cancelled');

  const handleCancelAppointment = () => {
    if (!appointment) return;
    if (isCancelled) {
      Alert.alert('Already Cancelled', 'This appointment is already cancelled.');
      return;
    }
    Alert.alert(
      "Void Sale",
      "Are you sure you want to void this sale? This action cannot be undone",
      [
        {
          text: "Cancel ",
          style: "cancel",
        },
        {
          text: "Void Sale",
          style: "destructive",
          onPress: async () => {
            setIsCanceling(true);
            try {
              const success = await appointmentsRepository.cancelAppointment(
                appointment.appointment.id
              );

              if (success) {
                Alert.alert(
                  "Success",
                  "Appointment has been canceled successfully.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Navigate back with params using setParams before going back
                        const parent = navigation.getParent();
                        if (parent) {
                          parent.setParams({ dataChanged: true });
                        }
                        navigation.goBack();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to cancel the appointment. Please try again."
                );
              }
            } catch (error) {
              console.error("Error canceling appointment:", error);
              Alert.alert("Error", "Something went wrong. Please try again.");
            } finally {
              setIsCanceling(false);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString || typeof timeString !== "string") {
      return "—";
    }

    // timeString format: "12:30:00"
    const [hours, minutes] = timeString.split(":");
    if (!hours || !minutes) {
      return "—";
    }

    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const navigateToClientDetail = (client: any) => {
    if (!appointment) return;
    navigation.navigate("ClientDetail", { item: client });
  };

  const calculateDuration = () => {
    if (!appointment?.start_time || !appointment?.end_time) return "0m";

    const startParts = String(appointment.start_time).split(":");
    const endParts = String(appointment.end_time).split(":");
    if (startParts.length < 2 || endParts.length < 2) {
      return "0m";
    }

    const [startHours, startMinutes] = startParts.map(Number);
    const [endHours, endMinutes] = endParts.map(Number);

    if (
      Number.isNaN(startHours) ||
      Number.isNaN(startMinutes) ||
      Number.isNaN(endHours) ||
      Number.isNaN(endMinutes)
    ) {
      return "0m";
    }

    const durationMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    const safeMinutes = Math.max(0, durationMinutes);

    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return paint.primary;
      case "completed":
        return paint.success;
      case "cancelled":
        return paint.danger;
      default:
        return paint.textSecondary;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return paint.primary + "20";
      case "completed":
        return paint.success + "20";
      case "cancelled":
        return paint.danger + "20";
      default:
        return paint.textSecondary + "20";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: paint.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.colors.white,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color={paint.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Details</Text>
        </View>
        {appointment && !isCancelled && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelAppointment}
            disabled={isCanceling}
          >
            {isCanceling ? (
              <ActivityIndicator size="small" color={paint.white} />
            ) : (
              <View style={styles.cancelButtonContent}>
                <Text style={styles.cancelButtonText}>Void Sale</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paint.primary} />
          <Text style={[styles.loadingText, { color: paint.textSecondary }]}>
            Loading appointment details...
          </Text>
        </View>
      ) : !appointment ? (
        <View style={styles.loadingContainer}>
          <ClipboardClock size={40} color={paint.gray[400]} />
          <Text style={[styles.loadingText, { color: paint.textSecondary }]}>
            No appointment found or it has been canceled.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
        {(() => {
          const appt = appointment?.appointment;
          const client = appt?.client;
          const firstName = client?.first_name ? String(client.first_name) : "";
          const lastName = client?.last_name ? String(client.last_name) : "";
          const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();

          return (
            <>
              {/* Client Information Card */}
              <View style={[styles.card, { backgroundColor: paint.white }]}>
                <View style={styles.clientInfo}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientInitials}>
                      {initials || "?"}
                    </Text>
                  </View>
                  <View style={styles.clientDetails}>
                    <Text style={[styles.clientName, { color: paint.text }]}>
                      {`${firstName} ${lastName}`.trim() || "Unknown client"}
                    </Text>
                    {client?.phone ? (
                      <Text
                        style={[
                          styles.clientContact,
                          { color: paint.textSecondary },
                        ]}
                      >
                        {client.phone}
                      </Text>
                    ) : null}
                    {client?.email ? (
                      <Text
                        style={[
                          styles.clientContact,
                          { color: paint.textSecondary },
                        ]}
                      >
                        {client.email}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* View Client Details Button */}
                <TouchableOpacity
                  style={styles.viewClientButton}
                  onPress={() => {
                    if (client) {
                      navigateToClientDetail(client);
                    }
                  }}
                  disabled={!client}
                >
                  <UserRound size={16} color={paint.black} />
                  <Text
                    style={[styles.viewClientButtonText, { color: paint.black }]}
                  >
                    View Client Details
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          );
        })()}

        {/* Appointment Time Card */}
        <View style={[styles.card, { backgroundColor: paint.white }]}>
          {/* <View style={styles.cardHeader}>
            <Clock size={18} color={paint.black} />
            <Text style={[styles.cardTitle, { color: paint.text }]}>
              Appointment Time
            </Text>
          </View> */}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Calendar size={18} color={paint.black} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: paint.textSecondary }]}>
                Date
              </Text>
              <Text style={[styles.infoValue, { color: paint.text }]}>
                {appointment?.appointment?.appointment_date
                  ? formatDate(appointment.appointment.appointment_date)
                  : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Clock size={18} color={paint.black} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: paint.textSecondary }]}>
                Time
              </Text>
              <Text style={[styles.infoValue, { color: paint.text }]}>
                {formatTime(appointment.start_time)} -{" "}
                {formatTime(appointment.end_time)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Clock size={18} color={paint.black} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: paint.textSecondary }]}>
                Duration
              </Text>
              <Text style={[styles.infoValue, { color: paint.text }]}>
                {calculateDuration()}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Details Card */}
        <View style={[styles.card, { backgroundColor: paint.white }]}>
          <View style={styles.cardHeader}>
            <Scissors size={18} color={paint.black} />
            <Text style={[styles.cardTitle, { color: paint.text }]}>
              Service Details
            </Text>
          </View>

          <View
            style={[
              styles.serviceInfo,
              {
                borderLeftColor:
                  appointment?.staff?.calendar_color || paint.primary,
              },
            ]}
          >
            <Text style={[styles.serviceName, { color: paint.text }]}>
              {appointment?.service?.name ?? "Unknown service"}
            </Text>
            {appointment?.service?.description ? (
              <Text
                style={[
                  styles.serviceDescription,
                  { color: paint.textSecondary },
                ]}
              >
                {appointment?.service?.description ?? ""}
              </Text>
            ) : null}
          </View>

          <View style={styles.serviceDetails}>
            <View style={styles.serviceDetailItem}>
              <Clock size={16} color={paint.textSecondary} />
              <Text
                style={[
                  styles.serviceDetailText,
                  { color: paint.textSecondary },
                ]}
              >
                {(appointment?.service?.duration_minutes ?? 0)} minutes
              </Text>
            </View>
            {appointment?.service?.category ? (
              <View style={styles.serviceDetailItem}>
                <Tag size={16} color={paint.textSecondary} />
                <Text
                  style={[
                    styles.serviceDetailText,
                    { color: paint.textSecondary },
                  ]}
                >
                  {appointment?.service?.category ?? ""}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Staff Information Card */}
        <View style={[styles.card, { backgroundColor: paint.white }]}>
          <View style={styles.cardHeader}>
            <Users size={18} color={paint.black} />
            <Text style={[styles.cardTitle, { color: paint.text }]}>
              Staff Member
            </Text>
          </View>

          <View style={styles.staffInfo}>
            <View
              style={[
                styles.staffAvatar,
                {
                  backgroundColor:
                    appointment?.staff?.calendar_color || paint.primaryLight,
                },
              ]}
            >
              <Text style={styles.staffInitials}>
                {(appointment?.staff?.first_name
                  ? String(appointment.staff.first_name).charAt(0)
                  : "?")}
                {(appointment?.staff?.last_name
                  ? String(appointment.staff.last_name).charAt(0)
                  : "")}
              </Text>
            </View>
            <View style={styles.staffDetails}>
              <Text style={[styles.staffName, { color: paint.text }]}>
                {`${appointment?.staff?.first_name ?? ""} ${
                  appointment?.staff?.last_name ?? ""
                }`.trim() || "Unknown staff"}
              </Text>
              {appointment?.staff?.phone_number ? (
                <Text
                  style={[styles.staffContact, { color: paint.textSecondary }]}
                >
                  {appointment?.staff?.phone_number}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Pricing Card */}
        <View style={[styles.card, { backgroundColor: paint.white }]}>
          {/* <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: paint.text }]}>
              Pricing
            </Text>
          </View> */}

          <View style={styles.pricingRow}>
            <Text style={[styles.pricingLabel, { color: paint.textSecondary }]}>
              Service Price
            </Text>
            <Text style={[styles.pricingValue, { color: paint.text }]}>
              {formatCurrency(appointment.price)}
            </Text>
          </View>

          {appointment.voucher_discount && appointment.voucher_discount > 0 && (
            <View style={styles.pricingRow}>
              <Text
                style={[styles.pricingLabel, { color: paint.textSecondary }]}
              >
                Voucher Discount
              </Text>
              <Text style={[styles.pricingValue, { color: paint.success }]}>
                -{formatCurrency(appointment.voucher_discount)}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: paint.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: paint.text }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalValue, { color: paint.black }]}>
              {formatCurrency(
                appointment.price - (appointment.voucher_discount || 0)
              )}
            </Text>
          </View>
        </View>

        {/* Additional Information Card */}
        <View style={[styles.card, { backgroundColor: paint.white }]}>
          {/* <View style={styles.cardHeader}>
            <FileText size={24} color={paint.primary} />
            <Text style={[styles.cardTitle, { color: paint.text }]}>
              Additional Information
            </Text>
          </View> */}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MapPin size={20} color={paint.black} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: paint.textSecondary }]}>
                Location
              </Text>
              <Text style={[styles.infoValue, { color: paint.text }]}>
                {locationName}
              </Text>
            </View>
          </View>

          {appointment?.appointment?.notes ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <FileText size={20} color={paint.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[styles.infoLabel, { color: paint.textSecondary }]}
                >
                  Notes
                </Text>
                <Text style={[styles.infoValue, { color: paint.text }]}>
                  {appointment?.appointment?.notes ?? ""}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        {/* Status Badge */}
        <View style={[styles.card, { backgroundColor: paint.white }]}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusBgColor(
                    appointment?.appointment?.status ?? ""
                  ),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: paint.black,
                  },
                ]}
              >
                {(appointment?.appointment?.status ?? "").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: getHeightEquivalent(50),
    paddingBottom: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(16),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: getWidthEquivalent(8),
    marginRight: getWidthEquivalent(8),
  },
  headerTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    color: "black",
  },
  cancelButton: {
    paddingVertical: getHeightEquivalent(8),
    paddingHorizontal: getWidthEquivalent(12),
    borderRadius: getWidthEquivalent(8),
    backgroundColor: "white",
    minWidth: getWidthEquivalent(80),
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#C22D28",
    borderWidth: 1,
  },
  cancelButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(4),
  },
  cancelButtonText: {
    color: "#C22D28",
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: getWidthEquivalent(16),
    marginTop: getHeightEquivalent(20),
    padding: getWidthEquivalent(20),
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(12),
    marginBottom: getHeightEquivalent(16),
  },
  cardTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(16),
    marginBottom: getHeightEquivalent(12),
  },
  clientAvatar: {
    width: getWidthEquivalent(50),
    height: getWidthEquivalent(50),
    borderRadius: getWidthEquivalent(30),
    backgroundColor: "#f5e7fd",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInitials: {
    fontSize:Platform.OS === 'android' ?fontEq(16): fontEq(18),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    color: "#3C096C",
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    marginBottom: getHeightEquivalent(4),
  },
  clientContact: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    marginTop: getHeightEquivalent(2),
  },
  viewClientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getHeightEquivalent(10),
    paddingHorizontal: getWidthEquivalent(16),
    borderRadius: getWidthEquivalent(8),
    borderWidth: 1,
    borderColor: colors.colors.gray[300],
    backgroundColor: "transparent",
    gap: getWidthEquivalent(8),
  },
  viewClientButtonText: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: getHeightEquivalent(16),
  },
  infoIcon: {
    width: getWidthEquivalent(40),
    height: getWidthEquivalent(40),
    borderRadius: getWidthEquivalent(20),
    // backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: getWidthEquivalent(12),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "500",
    marginBottom: getHeightEquivalent(4),
  },
  infoValue: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "500",
  },
  serviceInfo: {
    marginBottom: getHeightEquivalent(12),
    borderLeftWidth: getWidthEquivalent(3),
    paddingLeft: getWidthEquivalent(12),
    borderTopLeftRadius: getWidthEquivalent(4),
    borderBottomLeftRadius: getWidthEquivalent(4),
  },
  serviceName: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "400",
    marginBottom: getHeightEquivalent(8),
  },
  serviceDescription: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    lineHeight: fontEq(20),
  },
  serviceDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: getWidthEquivalent(16),
    marginTop: getHeightEquivalent(8),
  },
  serviceDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(6),
  },
  serviceDetailText: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(13),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(16),
  },
  staffAvatar: {
    width: getWidthEquivalent(50),
    height: getWidthEquivalent(50),
    borderRadius: getWidthEquivalent(25),
    alignItems: "center",
    justifyContent: "center",
  },
  staffInitials: {
    fontSize:Platform.OS === 'android' ?fontEq(18): fontEq(20),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    color: "white",
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
     fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    marginBottom: getHeightEquivalent(4),
  },
  staffContact: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeightEquivalent(12),
  },
  pricingLabel: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "500",
  },
  pricingValue: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: getHeightEquivalent(12),
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
  },
  totalValue: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
  },
  statusContainer: {
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(32),
    borderRadius: 24,
  },
  statusText: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "700",
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(40),
  },
  loadingText: {
    marginTop: getHeightEquivalent(16),
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
  },
});

export default AppointmentDetailsScreen;
