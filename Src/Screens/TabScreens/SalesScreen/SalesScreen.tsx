import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SalesScreenStyles } from "./SalesScreenStyles";
import { Bell } from "lucide-react-native";
import { colors } from "../../../Constants/colors";
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
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationScreen")}
          style={SalesScreenStyles.headerNotification}
        >
          <Bell size={25} color={colors.text} strokeWidth={1.7} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfileAreaScreen")}
          style={SalesScreenStyles.headerProfile}
        >
          <Text style={SalesScreenStyles.headerTitle}>
            {session?.user.email?.slice(0, 1).toLocaleUpperCase()}
          </Text>
        </TouchableOpacity>
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
