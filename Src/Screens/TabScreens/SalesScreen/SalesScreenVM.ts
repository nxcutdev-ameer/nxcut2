import React from "react";
import { MenuItemBO } from "../../../BOs/MenuItemBO";
import { useAuthStore } from "../../../Store/useAuthStore";
import {
  ChartNoAxesColumnIncreasing,
  ClipboardClock,
  HandCoins,
  Gift,
  IdCard,
  SprayCan,
  HandHeart,
} from "lucide-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";

export const useSalesScreenVM = () => {
  const { session } = useAuthStore();

  const navigation: NavigationProp<any> = useNavigation();

  const menuItems: MenuItemBO[] = [
    {
      label: "Daily sales summary",
      icon: ChartNoAxesColumnIncreasing,
      onPress: () => {
        navigation.navigate("DailySalesScreen");
      },
      //showBadge: true,
      // badgeValue: 52,
    },
    // {
    //   label: "Appointments",
    //   icon: ClipboardClock,
    //   onPress: () => {},
    //   // showBadge: true,
    //   // badgeValue: 6,
    // },

    {
      label: "Payments",
      icon: HandCoins,
      onPress: () => {
        navigation.navigate("PaymentTransactionsScreen");
      },
      //showBadge: true,
      // badgeValue: 44,
    },
    // {
    //   label: "Memberships sold",
    //   icon: IdCard,
    //   onPress: () => {},
    //   //showBadge: true,
    //   //badgeValue: 0,
    // },
    {
      label: "Vouchers",
      icon: Gift,
      onPress: () => {
        navigation.navigate("SalesVoucherScreen");
      },
      //showBadge: true,
      //badgeValue: 8,
    },

    // {
    //   label: "Product orders",
    //   icon: SprayCan,
    //   onPress: () => {
    //     navigation.navigate("SalesProductScreen");
    //   },
    // },
    {
      label: "Tips",
      icon: HandHeart,
      onPress: () => {
        navigation.navigate("SalesTipsScreen");
      },
      //showBadge: true,
      //badgeValue: 2,
    },
  ];

  return {
    menuItems,
    session,
    navigation,
  };
};
