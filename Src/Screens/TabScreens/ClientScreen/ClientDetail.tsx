  import { View, Text, TouchableOpacity, Linking, Alert, Platform, ScrollView } from "react-native";
import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { ClientBO, clientRepository } from "../../../Repository/clientRepository";
import { StyleSheet } from "react-native";
import { colors } from "../../../Constants/colors";
import {
  getHeightEquivalent,
  fontEq,
  getWidthEquivalent,
  formatCurrency,
} from "../../../Utils/helpers";
import { ArrowLeft, Phone, CalendarCheck, ReceiptText, ShoppingBag, Ticket, CreditCard, Award } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClientStore } from "../../../Store/useClientsStore";
import ClientAppointmentsTab from "../../../Components/ClientAppointmentsTab";
import ClientSalesTab from "../../../Components/ClientSalesTab";
import ClientProductsTab from "../../../Components/ClientProductsTab";
import ClientVouchersTab from "../../../Components/ClientVouchersTab";
import ClientMembershipsTab from "../../../Components/ClientMembershipsTab";

type RouteParams = {
  ClientDetail: {
    item: ClientBO;
  };
};



const ClientDetail = () => {
  const route = useRoute<RouteProp<RouteParams, "ClientDetail">>();
  const navigation = useNavigation();
  const { item } = route.params;
  const clientsData = useClientStore((state) => state.clientsData);

  const client = useMemo<ClientBO>(() => {
    const existing = clientsData.find((storedClient) => storedClient.id === item.id);
    return existing ?? item;
  }, [clientsData, item]);

  const ensurePhone = useCallback(() => client.phone?.trim() ?? "", [client.phone]);

  type ClientDetailTabKey = "appointments" | "sales" | "products" | "vouchers" | "memberships" | "loyalty";

  const clientTabs = useMemo(
    () =>
      ([
        { key: "appointments" as const, label: "Appointments", Icon: CalendarCheck },
        { key: "sales" as const, label: "Sales", Icon: ReceiptText },
        { key: "products" as const, label: "Products", Icon: ShoppingBag },
        { key: "vouchers" as const, label: "Vouchers", Icon: Ticket },
        { key: "memberships" as const, label: "Memberships", Icon: CreditCard },
        { key: "loyalty" as const, label: "Loyalty", Icon: Award },
      ]) satisfies Array<{
        key: ClientDetailTabKey;
        label: string;
        Icon: React.ComponentType<{ size?: number; color?: string }>;
      }>,
    []
  );

  const [activeTab, setActiveTab] = useState<ClientDetailTabKey>("appointments");
  const [hasVouchers, setHasVouchers] = useState(false);
  const [hasMemberships, setHasMemberships] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [v, m] = await Promise.all([
          clientRepository.hasClientVouchers(client.id),
          clientRepository.hasClientMemberships(client.id),
        ]);
        if (!mounted) return;
        setHasVouchers(v);
        setHasMemberships(m);
      } catch (e) {
        // Non-blocking
      }
    })();

    return () => {
      mounted = false;
    };
  }, [client.id]);


  const handleCall = useCallback(() => {
    const phoneNumber = ensurePhone();

    if (!phoneNumber) {
      Alert.alert("Unavailable", "Client phone number is not provided.");
      return;
    }

    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
      console.error("[ClientDetail] Unable to open dialer", err)
    );
  }, [ensurePhone]);

  const handleWhatsApp = useCallback(() => {
    const phoneNumber = ensurePhone().replace(/[^\d]/g, "");

    if (!phoneNumber) {
      Alert.alert("Unavailable", "Client phone number is not valid.");
      return;
    }

    const url = `https://wa.me/${phoneNumber}`;
    Linking.openURL(url).catch((err) =>
      console.error("[ClientDetail] Unable to open WhatsApp", err)
    );
  }, [ensurePhone]);

  return (
    <SafeAreaView style={ClientDetailStyles.mainContainer} edges={['top']}>
      {/* Custom Header */}
      <View style={ClientDetailStyles.header}>
        <TouchableOpacity
          style={ClientDetailStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={ClientDetailStyles.headerTitle}>Client Details</Text>
        <View style={ClientDetailStyles.headerRight} />
      </View>
      {/* Profile + Actions Row */}
      <View style={ClientDetailStyles.profileContainer}>
        <View style={ClientDetailStyles.clientImageContainer}>
          <Text style={ClientDetailStyles.clientInitials}>
            {(client.first_name.charAt(0) + client.last_name.charAt(0)).toUpperCase()}
          </Text>
        </View>

        <View style={ClientDetailStyles.profileDetails}>
          <Text style={ClientDetailStyles.clientName}>
            {client.first_name} {client.last_name}
          </Text>

          <View style={ClientDetailStyles.clientSalesBadge}>
            <Text style={ClientDetailStyles.clientSales}>
              AED {formatCurrency(client.total_sales ?? 0)}
            </Text>
          </View>
        </View>

        <View style={ClientDetailStyles.actionsInline}>
          <TouchableOpacity
            style={ClientDetailStyles.actionIconButton}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Phone size={18} color={colors.black} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[ClientDetailStyles.actionIconButton, ClientDetailStyles.whatsappButton]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <FontAwesome name="whatsapp" size={18} color={colors.black} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Tabs (to be linked later) */}
      <View style={ClientDetailStyles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ClientDetailStyles.tabsContainer}
        >
          {clientTabs.map(({ key, label, Icon }) => {
            const isActive = key === activeTab;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  ClientDetailStyles.tabPill,
                  isActive ? ClientDetailStyles.tabPillActive : null,
                ]}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.85}
              >
                <Icon size={18} color={isActive ? colors.white : colors.gray[700]} />
                <View style={ClientDetailStyles.tabPillLabelRow}>
                  <Text
                    style={[
                      ClientDetailStyles.tabPillText,
                      isActive ? ClientDetailStyles.tabPillTextActive : null,
                    ]}
                  >
                    {label}
                  </Text>
                  {(key === 'vouchers' && hasVouchers) ||
                  (key === 'memberships' && hasMemberships) ? (
                    <View style={ClientDetailStyles.tabBadgeDot} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={ClientDetailStyles.tabContent}>
        {activeTab === "appointments" ? (
          <ClientAppointmentsTab clientId={client.id} />
        ) : activeTab === "sales" ? (
          <ClientSalesTab clientId={client.id} />
        ) : activeTab === "products" ? (
          <ClientProductsTab clientId={client.id} />
        ) : activeTab === "vouchers" ? (
          <ClientVouchersTab clientId={client.id} />
        ) : activeTab === "memberships" ? (
          <ClientMembershipsTab clientId={client.id} />
        ) : (
          <View style={ClientDetailStyles.comingSoonCard}>
            <Text style={ClientDetailStyles.comingSoonTitle}>Coming soon</Text>
            <Text style={ClientDetailStyles.comingSoonBody}>This section will be linked later.</Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      {/* <View style={ClientDetailStyles.infoCard}>
        <Text style={ClientDetailStyles.label}>Email</Text>
        <Text style={ClientDetailStyles.value}>{client.email || "-"}</Text>

        <Text style={ClientDetailStyles.label}>Phone</Text>
        <Text style={ClientDetailStyles.value}>{client.phone || "-"}</Text>
      </View> */}
    </SafeAreaView>
  );
};

const ClientDetailStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(16),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: getWidthEquivalent(8),
  },
  headerTitle: {
  fontSize:Platform.OS === 'android' ?fontEq(16): fontEq(18),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "600",
    color: colors.black,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: getWidthEquivalent(40),
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: getHeightEquivalent(10),
    marginBottom: getHeightEquivalent(6),
    paddingHorizontal: getWidthEquivalent(20),
  },
  profileDetails: {
    flex: 1,
    marginLeft: getWidthEquivalent(12),
  },
  actionsInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: getWidthEquivalent(10),
  },
  clientImageContainer: {
    height: getHeightEquivalent(72),
    width: getHeightEquivalent(72),
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5E7FD",
  },
  clientInitials: {
    fontSize:Platform.OS === 'android' ?fontEq(18): fontEq(24),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "700",
    color: "#3C096C",
  },
  clientNameRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: getWidthEquivalent(10),
  },
  clientInfo: {
    flexShrink: 1,
    marginRight: getWidthEquivalent(12),
  },
  clientName: {
    fontSize: Platform.OS === "android" ? fontEq(14) : fontEq(16),
    fontFamily: Platform.OS === "android" ? "sans-serif-condensed" : "Helvetica",
    fontWeight: "700",
    color: colors.black,
    marginBottom: 0,
    textAlign: "left",
  },
  clientPhone: {
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    color: colors.textSecondary,
    textAlign: "center",
  },
  clientSalesBadge: {
    alignSelf: "flex-start",
    marginTop: getHeightEquivalent(6),
    backgroundColor: colors.gray[50],
    borderRadius: 10,
    paddingVertical: getHeightEquivalent(6),
    paddingHorizontal: getWidthEquivalent(12),
    alignItems: "center",
    justifyContent: "center",
  },
  clientSales: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "500",
    color: colors.gray[700],
  },
  infoCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    elevation: 2,
  },
  // Old inline action row removed (actions now live in the profile header).
  actionsContainer: {
    display: "none",
  },
  actionButton: {
    display: "none",
  },
  actionIconButton: {
    height: getHeightEquivalent(40),
    width: getHeightEquivalent(60),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    gap: getWidthEquivalent(8),
  },
  actionButtonText: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "500",
    color: colors.black,
  },
  tabsWrapper: {
    marginTop: getHeightEquivalent(6),
  },
  tabsContainer: {
    paddingHorizontal: getWidthEquivalent(20),
    gap: getWidthEquivalent(10),
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(6),
    paddingVertical: getHeightEquivalent(10),
    paddingHorizontal: getWidthEquivalent(14),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  tabPillActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  tabPillLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getWidthEquivalent(6),
  },
  tabBadgeDot: {
    width: getWidthEquivalent(8),
    height: getWidthEquivalent(8),
    borderRadius: 999,
    backgroundColor: colors.danger,
  },
  tabPillText: {
    fontSize: Platform.OS === "android" ? fontEq(12) : fontEq(13),
    fontFamily: Platform.OS === "android" ? "sans-serif-condensed" : "Helvetica",
    fontWeight: "600",
    color: colors.gray[700],
  },
  tabPillTextActive: {
    color: colors.white,
  },
  tabContent: {
    flex: 1,
    marginTop: getHeightEquivalent(12),
  },
  comingSoonCard: {
    marginHorizontal: getWidthEquivalent(20),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
    padding: getWidthEquivalent(16),
  },
  comingSoonTitle: {
    fontSize: Platform.OS === "android" ? fontEq(14) : fontEq(15),
    fontFamily: Platform.OS === "android" ? "sans-serif-condensed" : "Helvetica",
    fontWeight: "700",
    color: colors.black,
    marginBottom: getHeightEquivalent(6),
  },
  comingSoonBody: {
    fontSize: Platform.OS === "android" ? fontEq(12) : fontEq(13),
    fontFamily: Platform.OS === "android" ? "sans-serif-condensed" : "Helvetica",
    fontWeight: "500",
    color: colors.gray[700],
  },

  label: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    color: colors.gray[600],
    marginBottom: 4,
  },
  value: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: "500",
    color: colors.black,
    marginBottom: 16,
  },
});

export default ClientDetail;
