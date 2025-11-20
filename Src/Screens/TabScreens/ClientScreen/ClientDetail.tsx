  import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import React, { useMemo, useCallback } from "react";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { ClientBO } from "../../../Repository/clientRepository";
import { StyleSheet } from "react-native";
import { colors } from "../../../Constants/colors";
import {
  getHeightEquivalent,
  fontEq,
  getWidthEquivalent,
  formatCurrency,
} from "../../../Utils/helpers";
import { ArrowLeft, Phone } from "lucide-react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClientStore } from "../../../Store/useClientsStore";

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
      {/* Profile Section */}
      <View style={ClientDetailStyles.profileContainer}>
        <View style={ClientDetailStyles.clientImageContainer}>
          <Text style={ClientDetailStyles.clientInitials}>
            {(client.first_name.charAt(0) + client.last_name.charAt(0)).toUpperCase()}
          </Text>
        </View>
        <View style={ClientDetailStyles.clientNameRow}>
          <View style={ClientDetailStyles.clientInfo}>
            <Text style={ClientDetailStyles.clientName}>
              {client.first_name} {client.last_name}
            </Text>
            <Text style={ClientDetailStyles.clientPhone}>{client.phone || "-"}</Text>
          </View>
          <View style={ClientDetailStyles.clientSalesBadge}>
            <Text style={ClientDetailStyles.clientSales}>
              AED {formatCurrency(client.total_sales ?? 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Card */}
      <View style={ClientDetailStyles.infoCard}>
        <Text style={ClientDetailStyles.label}>Email</Text>
        <Text style={ClientDetailStyles.value}>{client.email || "-"}</Text>

        <Text style={ClientDetailStyles.label}>Phone</Text>
        <Text style={ClientDetailStyles.value}>{client.phone || "-"}</Text>
      </View>

      <View style={ClientDetailStyles.actionsContainer}>
        <TouchableOpacity
          style={ClientDetailStyles.actionButton}
          onPress={handleCall}
        >
          <Phone size={20} color={colors.black} />
          <Text style={ClientDetailStyles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[ClientDetailStyles.actionButton, ClientDetailStyles.whatsappButton]}
          onPress={handleWhatsApp}
        >
          <FontAwesome name="whatsapp" size={20} color={colors.black} />
          <Text style={ClientDetailStyles.actionButtonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.black,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: getWidthEquivalent(40),
  },
  profileContainer: {
    alignItems: "center",
    marginTop: getHeightEquivalent(30),
    marginBottom: getHeightEquivalent(30),
    paddingHorizontal: getWidthEquivalent(24),
  },
  clientImageContainer: {
    height: getHeightEquivalent(100),
    width: getHeightEquivalent(100),
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5E7FD",
    marginBottom: getHeightEquivalent(10),
  },
  clientInitials: {
    fontSize: fontEq(24),
    fontWeight: "700",
    color: "#3C096C",
  },
  clientNameRow: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginTop: getHeightEquivalent(8),
    gap: getHeightEquivalent(4),
  },
  clientInfo: {
    flexShrink: 1,
    marginRight: getWidthEquivalent(12),
  },
  clientName: {
    fontSize: fontEq(16),
    fontWeight: "700",
    color: colors.black,
    marginBottom: getHeightEquivalent(4),
    textAlign: "center",
  },
  clientPhone: {
    fontSize: fontEq(16),
    color: colors.textSecondary,
    textAlign: "center",
  },
  clientSalesBadge: {
    backgroundColor: colors.gray[50],
    borderRadius: 10,
    paddingVertical: getHeightEquivalent(6),
    paddingHorizontal: getWidthEquivalent(14),
    alignItems: "center",
    justifyContent: "center",
  },
  clientSales: {
    fontSize: fontEq(14),
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: getWidthEquivalent(20),
    marginTop: getHeightEquivalent(20),
    gap: getWidthEquivalent(12),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getHeightEquivalent(12),
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: getWidthEquivalent(8),
  },
  whatsappButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    gap: getWidthEquivalent(8),
  },
  actionButtonText: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: colors.black,
  },
  label: {
    fontSize: fontEq(14),
    color: colors.gray[600],
    marginBottom: 4,
  },
  value: {
    fontSize: fontEq(16),
    fontWeight: "500",
    color: colors.black,
    marginBottom: 16,
  },
});

export default ClientDetail;
