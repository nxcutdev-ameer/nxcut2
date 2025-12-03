import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors, shadows } from "../Constants/colors";
import CalanderScreen from "../Screens/TabScreens/CalanderScreen/CalanderScreen";
import ClientScreen from "../Screens/TabScreens/ClientScreen/ClientScreen";
import MoreScreen from "../Screens/TabScreens/MoreScreen/MoreScreen";
import SalesScreen from "../Screens/TabScreens/SalesScreen/SalesScreen";

// Lucide Icons
import {
  Calendar,
  Tag,
  Plus,
  Smile,
  LayoutGrid,
} from "lucide-react-native";
import CreateAppointmentScreen from "../Screens/TabScreens/CalanderScreen/CreateAppointmentScreen";
import { useNavigation } from '@react-navigation/native';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";

const Tab = createBottomTabNavigator();

// Custom Create Button
const CreateButton = ({ children, onPress }: any) => {
  const navigation = useNavigation();

  const handlePress = () => {
    // Navigate to CreateAppointmentScreen in stack navigator
    (navigation as any).navigate('CreateAppointment');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.createBtn, shadows.medium]}
    >
      {children}
    </TouchableOpacity>
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Calander"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* Calendar */}
      <Tab.Screen
        name="Calander"
        component={CalanderScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar
                size={fontEq(26)}
                color={focused ? colors.primary : "black"}
                strokeWidth={1.8}
              >
                <Text
                  style={{
                    color: focused ? colors?.primary : "black",
                    fontSize: fontEq(10),
                    fontWeight: "700",
                    fontFamily: "Helvetica",
                    // position: "absolute",
                    marginTop: fontEq(11),
                    alignSelf: "center",
                    textAlign: "center",
                    //  includeFontPadding: false,
                    textAlignVertical: "center",
                  }}
                >
                  {new Date().getDate()}
                </Text>
              </Calendar>
            </View>
          ),
        }}
      />

      {/* Sales */}
      <Tab.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Tag
              size={fontEq(26)}
              color={focused ? colors.primary : "black"}
              strokeWidth={1.8}
            />
          ),
        }}
      />

      {/* Create (Custom Center Button) */}
      <Tab.Screen
        name="Create"
        component={CreateAppointmentScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Plus size={fontEq(26)} color={colors.white} strokeWidth={1.8} />
          ),
          tabBarButton: (props) => <CreateButton {...props} />,
        }}
      />

      {/* Client */}
      <Tab.Screen
        name="Client"
        component={ClientScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Smile
              size={fontEq(26)}
              color={focused ? colors.primary : "black"}
              strokeWidth={1.8}
            />
          ),
        }}
      />

      {/* More */}
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <LayoutGrid
              size={fontEq(26)}
              color={focused ? colors.primary : "black"}
              strokeWidth={1.8}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: getHeightEquivalent(22),
    left: getWidthEquivalent(20), // 20,
    right: getWidthEquivalent(20),
    backgroundColor: colors.white,
    zIndex: 0,
    // borderRadius: 30,
    height: getHeightEquivalent(105), // 70,
    ...shadows.medium,
  },
  createBtn: {
   // top: getHeightEquivalent(1), // -25,
   bottom: getHeightEquivalent(2),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: getWidthEquivalent(55),
    height: getHeightEquivalent(40), //60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
});
