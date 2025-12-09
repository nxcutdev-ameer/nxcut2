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

import { useCalendarEditingStore } from "../Store/useCalendarEditingStore";
import { ActivityIndicator } from "react-native";

const BottomTabNavigator = () => {
  const { isVisible, isSaving, onSave, onCancel } = useCalendarEditingStore();

  return (
    <View style={{ flex: 1, position: 'relative' }}>
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

      {/* Global Editing Footer Overlay */}
      {isVisible && (
        <View style={styles.editingFooter}>
          <TouchableOpacity
            style={[
              styles.editingButton,
              styles.editingCancelButton,
            ]}
            onPress={onCancel}
            disabled={isSaving}
            activeOpacity={0.4}
          >
            <Text
              style={[
                styles.editingButtonText,
                styles.editingCancelText,
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.editingButton,
              styles.editingSaveButton,
            ]}
            onPress={onSave}
            disabled={isSaving}
            activeOpacity={0.4}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text
                style={[
                  styles.editingButtonText,
                  styles.editingSaveText,
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  // Editing Footer Styles
  editingFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    height: getHeightEquivalent(103),
    bottom: getHeightEquivalent(-18),
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: getWidthEquivalent(12),
    borderTopWidth: 1,
    borderTopColor: colors.gray[300],
    zIndex: 2000, // Higher than TabBar (0)
    elevation: 16,
    // Shadow to pop over tab bar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    // Optional: make it float or sit on bottom
    marginBottom: getHeightEquivalent(20),
   // marginHorizontal: getWidthEquivalent(20),
   // borderRadius: 0,
  },
  editingButton: {
    flex: 1,
    height: getHeightEquivalent(48),
    borderRadius: getWidthEquivalent(24),
    alignItems: "center",
    justifyContent: "center",
  },
  editingCancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  editingSaveButton: {
    backgroundColor: colors.black,
  },
  editingButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
  },
  editingCancelText: {
    color: colors.text,
  },
  editingSaveText: {
    color: colors.white,
  },
});
