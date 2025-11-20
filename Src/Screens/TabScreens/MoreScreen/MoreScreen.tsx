import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, theme, shadows } from "../../../Constants/colors";

import {
  Search,
  Bell,
  Home,
  Smile,
  CalendarCheck,
  BookOpen,
  Megaphone,
  Users,
  BarChart,
  Grid,
  Gift,
  Rocket,
  HeartHandshake,
  Languages,
  ChevronRight,
  ChartNoAxesCombined,
  MoreHorizontalIcon,
  Boxes,
} from "lucide-react-native";
import { MoreScreenStyles } from "./MoreScreenStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../../Utils/supabase";
import { useAuthStore } from "../../../Store/useAuthStore";
import CustomToast from "../../../Components/CustomToast";
import { useToast } from "../../../Hooks/useToast";
const MoreScreen = () => {
  const navigation: any = useNavigation();
  const { toast, hideToast } = useToast();
  const menuItems = [
    {
      label: "DashBoard",
      icon: ChartNoAxesCombined,
      onPress: () => navigation.navigate("DashBoardScreen"),
    },
    {
      label: "Clients",
      icon: Smile,
      onPress: () => navigation.navigate("Client"),
    },
    // { label: "Online booking", icon: CalendarCheck, onPress: showComingSoon },
    // {
    //   label: "Catalog",
    //   icon: BookOpen,
    //   onPress: showComingSoon,
    // },
    // { label: "Marketing", icon: Megaphone, onPress: showComingSoon },
    {
      label: "Team",
      icon: Users,
      onPress: () => {
        navigation.navigate("TeamScreen");
      },
    },
    {
      label: "Reports",
      icon: BarChart,
      onPress: () => navigation.navigate("ReportsScreen"),
    },
    // { label: "Add-ons", icon: Grid, onPress: showComingSoon },
    // {
    //   label: "Settings",
    //   icon: Settings,
    //   onPress: () => {},
    // },
  ];

  const footerItems = [
    // { label: "Refer a friend", icon: Gift, onPress: () => {} },
    // { label: "English", icon: Languages, onPress: () => {} },
    // { label: "News", icon: Rocket, onPress: () => {} },
    { label: "Help and Support", icon: HeartHandshake, onPress: () => {navigation.navigate("SupportScreen")} },
  ];
  return (
    <SafeAreaView style={MoreScreenStyles.mainContainer}>
      {/* Header */}
      <View style={MoreScreenStyles.header}>
        {/* <Boxes size={24} color={colors.text} /> */}
        <View style={MoreScreenStyles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationScreen")}
            style={MoreScreenStyles.bellWrapper}
          >
            <Bell size={24} color={colors.text} />
            {/* <View style={MoreScreenStyles.badge} /> */}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileAreaScreen")}
            style={MoreScreenStyles.profileCircle}
          >
            <Text style={MoreScreenStyles.profileText}>M</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={MoreScreenStyles.container}>
        {/* Wallet Card */}
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[MoreScreenStyles.walletCard, shadows.medium]}
        >
          <Text style={MoreScreenStyles.walletLabel}>Business wallet</Text>
          <Text style={MoreScreenStyles.walletAmount}>AED 0.00</Text>
          {/* <TouchableOpacity
            onPress={() => navigation.navigate("WalletScreen")}
            style={MoreScreenStyles.walletButton}
          >
            <Text style={MoreScreenStyles.walletButtonText}>View wallet</Text>
          </TouchableOpacity> */}
        </LinearGradient>

        {/* Menu Grid */}
        <View style={MoreScreenStyles.menuGrid}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[MoreScreenStyles.menuItem, shadows.card]}
                onPress={item.onPress}
              >
                <Icon size={22} color={colors.text} />
                <Text style={MoreScreenStyles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={MoreScreenStyles.footer}>
          {footerItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={MoreScreenStyles.footerItem}
                onPress={item.onPress}
              >
                <Icon size={22} color={colors.text} />
                <Text style={MoreScreenStyles.footerLabel}>{item.label}</Text>
                <ChevronRight
                  style={MoreScreenStyles.footerIcon}
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <CustomToast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

export default MoreScreen;
