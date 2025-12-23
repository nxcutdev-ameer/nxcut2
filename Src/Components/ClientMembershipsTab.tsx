import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../Constants/colors";
import {
  ClientMembership,
  clientRepository,
} from "../Repository/clientRepository";
import { fontEq } from "../Utils/helpers";

export type ClientMembershipsTabProps = {
  clientId: string;
};

const ClientMembershipsTab: React.FC<ClientMembershipsTabProps> = ({
  clientId,
}) => {
  const [memberships, setMemberships] = useState<ClientMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles({ width, height }), [width, height]);

  const fetchMemberships = useCallback(async () => {
    if (!clientId) {
      setMemberships([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await clientRepository.getClientMembershipsByClientId({
        clientId,
      });

      if (__DEV__) {
        console.log("[ClientMembershipsTab] fetched memberships", {
          clientId,
          count: data?.length ?? 0,
        });
      }

      setMemberships(data || []);
    } catch (e: any) {
      setError(e?.message || "Unable to load memberships");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  if (!clientId) {
    return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>No Client Linked</Text>
          <Text style={styles.messageBody}>
            Sign in with an account linked to memberships to view your status.
          </Text>
        </View>
    );
  }

  if (isLoading && memberships.length === 0) {
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
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Unable to load memberships</Text>
          <Text style={styles.messageBody}>{error}</Text>
        </View>
    );
  }

  if (memberships.length === 0) {
    return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>No Active Memberships</Text>
          <Text style={styles.messageBody}>
            You currently do not have any memberships assigned to this client.
          </Text>
        </View>
    );
  }

  return (
    <FlatList
      data={memberships}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const title = item.membership?.name || "Membership";
        const description = item.membership?.description || "";
        const totalSessions = item.membership?.total_sessions ?? 0;
        const sessionsUsed = item.used_sessions ?? 0;
        const remainingSessions = Math.max(totalSessions - sessionsUsed, 0);
        const computedStatus = remainingSessions > 0 ? "active" : "inactive";
        const usageRatio =
          totalSessions > 0 ? Math.min(sessionsUsed / totalSessions, 1) : 0;

        const price = item.membership?.price ?? 0;
        const serviceName = item.membership?.service?.name ?? "-";

        const purchasedLabel = item.created_at
          ? new Date(item.created_at).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";

        const statusStyle =
          computedStatus === "active" ? styles.active : styles.inactive;

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons
                  name="star"
                  size={16}
                  color={colors.primary}
                  style={styles.cardTitleIcon}
                />
                <Text style={styles.cardTitle}>{title}</Text>
              </View>
              <Text style={[styles.cardStatus, statusStyle]}>
                {computedStatus.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.cardDescription}>{description}</Text>

            <View style={styles.cardMetaRowInline}>
              <Ionicons
                name="pulse-outline"
                size={14}
                color={"rgba(0, 122, 255, 0.9)"}
                style={styles.inlineIcon}
              />
              <Text style={styles.cardService}>Session Usage</Text>
            </View>

            <View style={styles.usageBarTrack}>
              <View
                style={[styles.usageBarFill, { width: `${usageRatio * 100}%` }]}
              />
            </View>

            <View style={styles.sessionStatsRow}>
              <Text style={styles.sessionStatText}>
                {sessionsUsed}/{totalSessions || "∞"} sessions used
              </Text>
              <Text style={styles.sessionRemainingText}>
                {remainingSessions} remaining
              </Text>
            </View>

            {serviceName && (
              <View style={styles.cardMetaRowInline}>
                <Ionicons
                  name="cut-outline"
                  size={14}
                  color={colors.text}
                  style={styles.inlineIcon}
                />
                <Text style={styles.cardService}>Service: {serviceName}</Text>
              </View>
            )}

            <View style={styles.cardMetaRowInline}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.text}
                style={styles.inlineIcon}
              />
              <Text style={styles.cardMeta}>Purchased: {purchasedLabel}</Text>
            </View>

            <Text style={styles.cardPrice}>AED {Number(price || 0).toFixed(2)}</Text>
          </View>
        );
      }}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={fetchMemberships}
          colors={[colors.primary]}
        />
      }
      contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
    />
  );
};

const createStyles = ({ width, height }: { width: number; height: number }) => {
  const isLargeScreen = width >= 768;
  const isTallScreen = height >= 800;

  const paddingHorizontal = isLargeScreen ? 24 : 12;
  const paddingTop = isTallScreen ? -32 : -6;
  const headerMargin = isLargeScreen ? 20 : 16;
  const listPaddingBottom = isTallScreen ? 48 : 32;
  const cardPadding = isLargeScreen ? 20 : 16;
  const cardSpacing = isLargeScreen ? 18 : 12;
  const messageRadius = isLargeScreen ? 16 : 12;
  const messagePadding = isLargeScreen ? 20 : 16;
  const messageMaxWidth = Math.min(width - paddingHorizontal * 2, 720);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
      paddingHorizontal,
      paddingTop,
    },
    title: {
      fontSize: isLargeScreen ? 26 : 24,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 4,
    },
    subtitle: {
      fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
      fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
      color: colors.black,
      opacity: 0.7,
    },
    header: {
      marginBottom: headerMargin,
      alignSelf: "center",
      width: "100%",
      maxWidth: messageMaxWidth,
    },
    listContent: {
      paddingBottom: listPaddingBottom,
      paddingHorizontal: isLargeScreen ? 8 : 0,
      flexGrow: 1,
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
    messageContainer: {
      backgroundColor: colors.white,
      borderRadius: messageRadius,
      borderWidth: 1,
      borderColor: colors.gray[200],
      padding: messagePadding,
      marginHorizontal: 4,
      alignSelf: "center",
      maxWidth: messageMaxWidth,
      width: "100%",
    },
    messageTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.black,
      marginBottom: 8,
    },
    messageBody: {
      fontSize: 14,
      color: colors.gray[700],
      opacity: 0.9,
      lineHeight: 20,
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: cardPadding,
      marginBottom: cardSpacing,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 2,
      borderColor: colors.gray[200],
      alignSelf: "center",
      width: "100%",
      maxWidth: messageMaxWidth,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: isLargeScreen ? 20 : 18,
      fontWeight: "600",
      color: colors.black,
      flex: 1,
      marginRight: 8,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.black,
      opacity: 0.6,
      marginLeft: 20,
      marginBottom: 6,
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    cardTitleIcon: {
      marginRight: 6,
    },
    cardStatus: {
      fontSize: 12,
      fontWeight: "700",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      overflow: "hidden",
      textTransform: "uppercase",
    },
    cardMetaRowInline: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    inlineIcon: {
      marginRight: 6,
    },
    cardMeta: {
      fontSize: 13,
      color: colors.gray[700],
      opacity: 0.9,
    },
    cardService: {
      marginTop: 0,
      fontSize: 13,
      color: colors.black,
      fontWeight: "600",
    },
    usageBarTrack: {
      marginTop: 10,
      height: 8,
      borderRadius: 999,
      backgroundColor: "rgba(0, 122, 255, 0.15)",
      overflow: "hidden",
    },
    usageBarFill: {
      height: "100%",
      backgroundColor: "rgba(0, 122, 255, 0.9)",
      borderRadius: 999,
    },
    sessionStatsRow: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sessionStatText: {
      fontSize: 12,
      color: colors.gray[700],
      opacity: 0.95,
    },
    sessionRemainingText: {
      fontSize: 12,
      color: "rgba(0, 122, 255, 0.9)",
      fontWeight: "600",
    },
    cardPrice: {
      marginTop: 18,
      fontSize: 15,
      fontWeight: "700",
      color: colors.success,
      textAlign: "right",
    },
    active: {
      backgroundColor: "#D5F5E3",
      color: "#1E8449",
    },
    inactive: {
      backgroundColor: "#F5B7B1",
      color: "#922B21",
    },
    expired: {
      backgroundColor: "#FADBD8",
      color: "#C0392B",
    },
    pending: {
      backgroundColor: "#FCF3CF",
      color: "#9C640C",
    },
  });
};

export default ClientMembershipsTab;
