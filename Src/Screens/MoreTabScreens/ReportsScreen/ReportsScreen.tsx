import {
  Settings,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ReportsScreenStyles from "./ReportsScreenStyles";
import {
  Home,
  Smile,
  CalendarCheck,
  BookOpen,
  Megaphone,
  Users,
  BarChart,
  Grid,
  Target,
  BarChart3,
  Columns,
  List,
  Rocket,
  Star,
  UserCircle,
  ArrowLeft,
} from "lucide-react-native";
import { MenuItemBO } from "../../../BOs/MenuItemBO";
import MenuList from "../../../Components/MenuList";
import { ScrollView } from "react-native-gesture-handler";
import { colors } from "../../../Constants/colors";
import { useNavigation } from "@react-navigation/native";
import { getHeightEquivalent } from "../../../Utils/helpers";
import useReportsScreenVM from "./ReportsScreenVM";

const ReportsScreen = () => {
  const navigation: any = useNavigation();
  const { onPressReports } = useReportsScreenVM();
  const menuItems: MenuItemBO[] = [
    {
      label: "All reports",
      icon: List,
      onPress: onPressReports,
      showBadge: false,
      badgeValue: 52,
    },
    // {
    //   label: "Favourites",
    //   icon: Star,
    //   onPress: () => {},
    //   showBadge: true,
    //   badgeValue: 6,
    // },
    // {
    //   label: "Dashboards",
    //   icon: BarChart3,
    //   onPress: () => {},
    //   showBadge: true,
    //   badgeValue: 2,
    // },
    // {
    //   label: "Standard",
    //   icon: Columns,
    //   onPress: () => {},
    //   showBadge: true,
    //   badgeValue: 44,
    // },
    // {
    //   label: "Premium",
    //   icon: Rocket,
    //   onPress: () => {},
    //   showBadge: true,
    //   badgeValue: 8,
    // },
    // {
    //   label: "Custom",
    //   icon: UserCircle,
    //   onPress: () => {},
    //   showBadge: true,
    //   badgeValue: 0,
    // },
    // {
    //   label: "Targets",
    //   icon: Target,
    //   onPress: () => {},
    // },
  ];
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={ReportsScreenStyles.header}>
        <TouchableOpacity
          style={ReportsScreenStyles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <ArrowLeft size={20} color={colors.black} />
          <Text style={ReportsScreenStyles.headerText}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: getHeightEquivalent(15),
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={ReportsScreenStyles.title}>Reports</Text>
        <MenuList items={menuItems} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;
