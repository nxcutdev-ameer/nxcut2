import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SalesScreenStyles } from "./SalesScreenStyles";
import { Bell } from "lucide-react-native";
import { colors } from "../../../Constants/colors";
import { useNotificationsStore } from "../../../Store/useNotificationsStore";
import { useSalesScreenVM } from "./SalesScreenVM";
import MenuList from "../../../Components/MenuList";

const SalesScreen = () => {
  const { menuItems, navigation, session } = useSalesScreenVM();
  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={SalesScreenStyles.mainContainer}
    >
      <View style={SalesScreenStyles.headerContainer}>
        <View style={SalesScreenStyles.rightHeaderContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationScreen")}
            style={SalesScreenStyles.headerNotification}
          >
            <Bell size={24} color={colors.text} strokeWidth={1.7} />
            {useNotificationsStore((s) => s.hasUnread) ? (
              <View style={SalesScreenStyles.notificationBadge} />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileAreaScreen")}
            style={SalesScreenStyles.profileButton}
          >
            <Text style={SalesScreenStyles.headerTitle}>
              {session?.user.email?.slice(0, 1).toLocaleUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={SalesScreenStyles.bodyContainer}>
        <Text style={SalesScreenStyles.bodyTitle}>Sales</Text>
        <MenuList items={menuItems} />
      </View>
    </SafeAreaView>
  );
};

export default SalesScreen;

const styles = StyleSheet.create({});
