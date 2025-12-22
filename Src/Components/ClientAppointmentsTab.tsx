import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { colors } from "../Constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { appointmentsRepository } from "../Repository/appointmentsRepository";
import { AppointmentActivityBO } from "../BOs/appointmentBOs";
import { fontEq, getHeightEquivalent, getWidthEquivalent, formatCurrency } from "../Utils/helpers";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Navigations/RootStackNavigator";

export type ClientAppointmentsTabProps = {
  clientId: string;
  /** If provided, fetch appointments from the last N days. If omitted, fetch all. */
  lookbackDays?: number;
};

const ClientAppointmentsTab: React.FC<ClientAppointmentsTabProps> = ({
  clientId,
  lookbackDays,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(16, Math.max(12, width * 0.02));
  const [appointments, setAppointments] = useState<AppointmentActivityBO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: { clientId: string; startDate?: string } = { clientId };

      if (lookbackDays !== undefined) {
        const start = new Date();
        start.setDate(start.getDate() - lookbackDays);
        params.startDate = start.toISOString().split("T")[0];
      }

      const data = await appointmentsRepository.getAppointmentsByClientId(params);

      if (__DEV__) {
        console.log("[ClientAppointmentsTab] fetched appointments", { clientId, count: data?.length ?? 0 });
      }

      setAppointments(data || []);
    } catch (e: any) {
      setError(e?.message || "Unable to load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [clientId, lookbackDays]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (isLoading && appointments.length === 0) {
    return (
      <View style={styles.tabStateContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.tabStateCard}>
        <Text style={styles.tabStateTitle}>Unable to load appointments</Text>
        <Text style={styles.tabStateBody}>{error}</Text>
      </View>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <View style={styles.tabStateCard}>
        <Text style={styles.tabStateTitle}>No Appointments Found</Text>
        <Text style={styles.tabStateBody}>
          This client doesn't have any appointments yet.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={fetchAppointments}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.appointmentsListContent, { paddingHorizontal: horizontalPadding }]}
    >
      {appointments.map((item: any) => {
        const appointmentDate = item.appointment_date
          ? new Date(item.appointment_date).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date not available";

        const locationName = item.location?.name || item.location_name || "Location not specified";
        const services = item.appointment_services || [];
        const primarySale = (item.sales || []).find((sale: any) => !sale?.is_voided);
        const saleId = primarySale?.id ? String(primarySale.id) : null;
        const hasSales = Boolean(saleId);
        const status = (item.status || "scheduled").toString().toLowerCase();

        const serviceTotals = services.reduce(
          (acc: number, svc: any) => acc + Number(svc.price ?? 0),
          0
        );

        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.92}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleGroup}>
                <Text style={styles.cardLabel}>Appointment</Text>
              </View>
              <Text
                style={[
                  styles.cardStatus,
                  statusStyles[status] || styles.cardStatusDefault,
                ]}
              >
                {status.toUpperCase()}
              </Text>
            </View>

            <View style={styles.cardMetaContainer}>
              <View style={styles.cardMetaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.text}
                  style={styles.metaIcon}
                />
                <Text style={styles.cardMetaText}>{appointmentDate}</Text>
              </View>

              <View style={[styles.cardMetaRow, styles.cardMetaRowRight]}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.text}
                  style={styles.metaIcon}
                />
                <Text style={[styles.cardMetaText, styles.cardMetaTextRight]}>
                  {locationName}
                </Text>
              </View>
            </View>

            <View style={styles.servicesContainer}>
              {services.length === 0 ? (
                <Text style={styles.emptyServices}>
                  No services recorded for this appointment.
                </Text>
              ) : (
                <View style={styles.servicesCard}>
                  {services.map((service: any, index: number) => {
                    const serviceName = service?.service?.name || "Service";
                    const price = Number(service.price ?? 0);
                    const durationValue =
                      service?.service?.duration_minutes ?? service?.duration;
                    const durationLabel = durationValue ? `${durationValue} min` : "Duration N/A";
                    const staff = service?.staff;
                    const staffName =
                      staff?.full_name ||
                      [staff?.first_name, staff?.last_name].filter(Boolean).join(" ") ||
                      staff?.name ||
                      "Staff not assigned";

                    return (
                      <View
                        key={service.id || `${serviceName}-${index}`}
                        style={[
                          styles.serviceRow,
                          index < services.length - 1 && styles.serviceRowDivider,
                        ]}
                      >
                        <View style={styles.serviceRowHeader}>
                          <Text style={styles.serviceName}>{serviceName}</Text>
                          <Text style={styles.servicePrice}>AED {formatCurrency(price)}</Text>
                        </View>

                        <View style={styles.serviceDetails}>
                          <View style={styles.serviceInfoBlock}>
                            <Ionicons
                              name="time-outline"
                              size={16}
                              color={colors.black}
                              style={styles.serviceDetailIcon}
                            />
                            <Text style={styles.serviceInfoText}>{durationLabel}</Text>
                          </View>

                          <View style={[styles.serviceInfoBlock, styles.serviceInfoBlockRight]}>
                            <Ionicons
                              name="person-outline"
                              size={16}
                              color={colors.black}
                              style={styles.serviceDetailIcon}
                            />
                            <Text style={[styles.serviceInfoText, styles.serviceInfoTextRight]}>
                              {staffName}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {services.length > 1 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>AED {formatCurrency(serviceTotals)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.viewSaleButton, !hasSales ? styles.viewSaleButtonHidden : null]}
              onPress={() => {
                if (!saleId) return;
                navigation.navigate("TransactionDetailsScreen", { saleId });
              }}
              disabled={!hasSales}
              activeOpacity={0.85}
            >
              <View style={styles.viewSaleContent}>
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color={hasSales ? colors.black : colors.border}
                  style={styles.viewSaleIcon}
                />
                <Text style={[styles.viewSaleText, !hasSales ? styles.viewSaleTextDisabled : null]}>
                  View Sale
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  tabStateCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginHorizontal: 4,
  },
  tabStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  tabStateBody: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  appointmentsListContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitleGroup: {
    flex: 1,
    marginRight: 12,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardStatusDefault: {
    backgroundColor: colors.border,
    color: colors.text,
  },
  cardMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    justifyContent: "space-between",
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flex: 1,
  },
  cardMetaRowRight: {
    justifyContent: "flex-end",
  },
  cardMetaTextRight: {
    textAlign: "right",
  },
  metaIcon: {
    marginRight: 6,
  },
  cardMetaText: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.75,
    //flexShrink: 1,
  },
  servicesContainer: {
    marginTop: 12,
  },
  servicesCard: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyServices: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    fontStyle: "italic",
  },
  serviceRow: {
    flexDirection: "column",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  serviceRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    marginBottom: 8,
  },
  serviceRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.black,
  },
  serviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
  },
  serviceInfoBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  serviceInfoBlockRight: {
    justifyContent: "flex-end",
  },
  serviceInfoTextRight: {
    textAlign: "right",
  },
  serviceDetailIcon: {
    marginRight: 8,
  },
  serviceInfoText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    flexShrink: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    opacity: 0.8,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.black,
  },
  viewSaleButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.10)",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    height: 40,
  },
  viewSaleButtonHidden: {
    display: "none",
  },
  viewSaleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  viewSaleIcon: {
    marginRight: 2,
  },
  viewSaleText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.black,
    textTransform: "uppercase",
    textAlign: "center",
  },
  viewSaleTextDisabled: {
    color: colors.textMuted,
  },
});

const statusStyles: Record<string, any> = {
  scheduled: {
    backgroundColor: colors.gray[100],
    color: colors.gray[700],
  },
  pending: {
    backgroundColor: colors.warningLight,
    color: colors.warningDark,
  },
  completed: {
    backgroundColor: colors.successLight,
    color: colors.successDark,
  },
  paid: {
    backgroundColor: colors.infoLight,
    color: colors.infoDark,
  },
  cancelled: {
    backgroundColor: colors.dangerLight,
    color: colors.dangerDark,
  },
};
export default ClientAppointmentsTab;
