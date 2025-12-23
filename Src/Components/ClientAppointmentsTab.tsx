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
import { formatMinutesToHours, formatCurrency, fontEq } from "../Utils/helpers";
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
     <View style={styles.fullStateContainer}>
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
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
      contentContainerStyle={[styles.appointmentsListContent, { paddingHorizontal: horizontalPadding, flexGrow: 1 }]}
    >
      {appointments.map((item: any) => {
        const services = item.appointment_services || [];

        const buildAppointmentDateLabel = (): string => {
          const rawDate: string | undefined = item.appointment_date;
          if (!rawDate) return "Date not available";

          // If backend ever returns a real timestamp, let JS parse it normally.
          const looksLikeDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);

          // Prefer the earliest service start_time as the appointment "time".
          const startTimes: string[] = (services || [])
            .map((s: any) => s?.start_time)
            .filter((t: any) => typeof t === "string" && t.length >= 5);

          const earliestStart = startTimes.sort((a, b) => String(a).localeCompare(String(b)))[0];

          const formatWithTime = (dt: Date) =>
            dt.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

          const formatDateOnly = (dt: Date) =>
            dt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

          // Date-only values like "2025-09-18" are parsed as UTC by `new Date(str)`.
          // That shifts the local time (commonly to 04:00). Build a *local* Date instead.
          if (looksLikeDateOnly) {
            const [y, m, d] = rawDate.split("-").map((v: string) => Number(v));

            if (earliestStart) {
              const [hh, mm, ss] = earliestStart.split(":").map((v) => Number(v));
              const localDt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
              return formatWithTime(localDt);
            }

            const localDate = new Date(y, (m || 1) - 1, d || 1);
            return formatDateOnly(localDate);
          }

          // Non-date-only string; treat as timestamp.
          const parsed = new Date(rawDate);
          if (Number.isNaN(parsed.getTime())) return rawDate;
          return earliestStart ? formatWithTime(parsed) : formatDateOnly(parsed);
        };

        const appointmentDate = buildAppointmentDateLabel();

        const locationName = item.location?.name || item.location_name || "Location not specified";
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
                    const durationLabel = formatMinutesToHours(durationValue);
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
                            <Text style={styles.serviceInfoText}>
                              {(() => {
                                const startTime = typeof service?.start_time === "string" ? service.start_time : undefined;
                                const endTime = typeof service?.end_time === "string" ? service.end_time : undefined;

                                const looksLikeTime = (t?: string) => typeof t === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(t);

                                const formatTime = (t: string) => {
                                  const [hh, mm] = t.split(":").map((v) => Number(v));
                                  const dt = new Date(2000, 0, 1, hh || 0, mm || 0, 0);
                                  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                                };

                                const addMinutes = (t: string, minutesToAdd: number) => {
                                  const [hh, mm] = t.split(":").map((v) => Number(v));
                                  const dt = new Date(2000, 0, 1, hh || 0, mm || 0, 0);
                                  dt.setMinutes(dt.getMinutes() + (Number(minutesToAdd) || 0));
                                  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                                };

                                const durationMinutes = Number(durationValue ?? 0);

                                const startLabel = looksLikeTime(startTime) ? formatTime(startTime!) : undefined;
                                const endLabel = looksLikeTime(endTime)
                                  ? formatTime(endTime!)
                                  : looksLikeTime(startTime) && durationMinutes
                                    ? addMinutes(startTime!, durationMinutes)
                                    : undefined;

                                if (startLabel && endLabel) return `${startLabel} • ${durationLabel}`;
                                if (startLabel) return `${startLabel} • ${durationLabel}`;
                                return durationLabel;
                              })()}
                            </Text>
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
  fullStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
  },
  loaderContainer: {
      justifyContent: "center",
      alignItems: "center",
  },
  tabStateCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginHorizontal: 4,
    width:"100%"
  },
  tabStateTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(16): fontEq(18),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  tabStateBody: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    color: colors.text,
    opacity: 0.7,
    lineHeight: 20,
  },
  appointmentsListContent: {
    paddingBottom: 16,
    flexGrow: 1,
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
    fontSize:Platform.OS === 'android' ?fontEq(16): fontEq(20),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    color: colors.black,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardStatus: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(13),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(13),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    color: colors.text,
    opacity: 0.6,
    //fontStyle: "italic",
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
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  servicePrice: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(12),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    color: colors.text,
    opacity: 0.8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "600",
    color: colors.text,
    opacity: 0.8,
  },
  totalValue: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(15),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(13),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
