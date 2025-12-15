import { StyleSheet } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import SplashScreen from "../Screens/SplashScreen/SplashScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LoginScreen from "../Screens/AuthScreens/LoginScreen/LoginScreen";
import RegisterScreen from "../Screens/AuthScreens/RegisterScreens/RegisterScreen";
import PasswordScreen from "../Screens/AuthScreens/PasswordScreen/PasswordScreen";
import ProfileAreaScreen from "../Screens/ProfileAreaScreens/ProfileAreaScreen/ProfileAreaScreen";
import ReportsDetailsScreen from "../Screens/MoreTabScreens/ReportDetailsScreen/ReportDetailsScreen";
import LocationScreen from "../Screens/LocationsScreen/LocationScreen";
import { PaymentTransactionsScreen } from "../Screens/MoreTabScreens/PaymentTransactionsScreen/PaymentTransactionsScreen";
import DashBoardScreen from "../Screens/MoreTabScreens/DashBoardScreen/DashBoardScreen";
import DailySalesScreen from "../Screens/SalesTabScreens/DailySalesScreen/DailySalesScreen";
import TransactionDetailsScreen from "../Screens/SalesTabScreens/TransactionDetailsScreen/TransactionDetailsScreen";
import PaymentSummaryScreen from "../Screens/MoreTabScreens/PaymentSummaryScreen/PaymentSummaryScreen";
import FinanceSummaryScreen from "../Screens/MoreTabScreens/FinanceSummaryScreen/FinanceSummaryScreen";
import TeamScreen from "../Screens/MoreTabScreens/TeamScreen/TeamScreen";
import TeamMemberDetailsScreen from "../Screens/MoreTabScreens/TeamMemberDetailsScreen/TeamMemberDetailsScreen";
import SalesLogScreen from "../Screens/MoreTabScreens/SalesLogScreen/SalesLogScreen";
import TeamPerformanceScreen from "../Screens/MoreTabScreens/TeamPerformanceScreen/TeamPerformanceScreen";
import PerfromanceDashboardScreen from "../Screens/MoreTabScreens/PerformanceDashboardScreen/PerformanceDashboardScreen";
import SalesProductScreen from "../Screens/SalesTabScreens/SalesProductScreen/SalesProductScreen";
import SalesVoucherScreen from "../Screens/SalesTabScreens/SalesVoucherScreen/SalesVoucherScreen";
import SalesTipsScreen from "../Screens/SalesTabScreens/SalesTipsScreen/SalesTipsScreen";
import NotificationScreen from "../Screens/NotificationScreen/NotificationScreen";
import SupportScreen from "../Screens/MoreTabScreens/SupportScreen/SupportScreen";
import WalletScreen from "../Screens/TabScreens/MoreScreen/WalletScreen";
import AddTeamMemberScreen from "../Screens/MoreTabScreens/TeamScreen/AddTeamMemberScreen";
import ClientDetail from "../Screens/TabScreens/ClientScreen/ClientDetail";
import AppointmentDetailsScreen from "../Screens/TabScreens/CalanderScreen/AppointmentDetailsScreen";
import CreateAppointmentScreen from "../Screens/TabScreens/CalanderScreen/CreateAppointmentScreen";
import AddClientScreen from "../Screens/TabScreens/ClientScreen/AddClientScreen";
import PaymentMethodsScreen from "../Screens/MoreTabScreens/PaymentMethodsScreen/PaymentMethodsScreen";
import AddPaymentMethodScreen from "../Screens/MoreTabScreens/AddPaymentMethodScreen/AddPaymentMethodScreen";
import CheckoutScreen from "../Screens/TabScreens/CalanderScreen/CheckoutScreen";
import TipsSummary from "../Screens/MoreTabScreens/TipsSummary/TipsSummary";

export type RootStackParamList = {
  SplashScreen: undefined;
  BottomTabNavigator: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  PasswordScreen: undefined;
  ProfileAreaScreen: undefined;
  ReportsDetailsScreen: undefined;
  LocationScreen: undefined;
  PaymentTransactionsScreen: undefined;
  DashBoardScreen: undefined;
  DailySalesScreen: undefined;
  TransactionDetailsScreen: {
    saleId?: string;
    fallbackTransaction?: any;
  };
  PaymentSummaryScreen: undefined;
  FinanceSummaryScreen: undefined;
  TeamScreen: undefined;
  TeamMemberDetailsScreen: undefined;
  SalesLogScreen: undefined;
  TeamPerformanceScreen: undefined;
  PerfromanceDashboardScreen: undefined;
  TipsSummary: undefined;
  SalesProductScreen: undefined;
  SalesVoucherScreen: undefined;
  SalesTipsScreen: undefined;
  NotificationScreen: undefined;
  WalletScreen: undefined;
  AddTeamMemberScreen: undefined;
  SupportScreen: undefined;
  ClientDetail: {
    item: any;
  };
  AddClientScreen: undefined;
  AppointmentDetailsScreen: { appointment_id?: string; appointment_service_id?: string; appointment?: any } | undefined;
  CreateAppointment: undefined;
  PaymentMethodsScreen: undefined;
  AddPaymentMethodScreen: undefined;
  CheckoutScreen: {
    total: number;
  };
};

const RootStackNavigator = () => {
  const Stack = createStackNavigator<RootStackParamList>();

  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen
            name="BottomTabNavigator"
            component={BottomTabNavigator}
          />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen
            name="ProfileAreaScreen"
            component={ProfileAreaScreen}
          />
          <Stack.Screen
            name="ReportsDetailsScreen"
            component={ReportsDetailsScreen}
          />
          <Stack.Screen name="LocationScreen" component={LocationScreen} />
          <Stack.Screen
            name="PaymentTransactionsScreen"
            component={PaymentTransactionsScreen}
          />
          <Stack.Screen name="DashBoardScreen" component={DashBoardScreen} />
          <Stack.Screen name="DailySalesScreen" component={DailySalesScreen} />
          <Stack.Screen
            name="TransactionDetailsScreen"
            component={TransactionDetailsScreen}
            // options={{
            //   animation: "slide_from_right",
            // }}
          />
          <Stack.Screen
            name="PaymentSummaryScreen"
            component={PaymentSummaryScreen}
          />
          <Stack.Screen
            name="FinanceSummaryScreen"
            component={FinanceSummaryScreen}
          />
          <Stack.Screen name="TeamScreen" component={TeamScreen} />
          <Stack.Screen
            name="TeamMemberDetailsScreen"
            component={TeamMemberDetailsScreen}
          />
          <Stack.Screen name="SalesLogScreen" component={SalesLogScreen} />
          <Stack.Screen
            name="TeamPerformanceScreen"
            component={TeamPerformanceScreen}
          />
          <Stack.Screen
            name="PerfromanceDashboardScreen"
            component={PerfromanceDashboardScreen}
          />
          <Stack.Screen name="TipsSummary" component={TipsSummary} />
          <Stack.Screen
            name="SalesProductScreen"
            component={SalesProductScreen}
          />
          <Stack.Screen
            name="SalesVoucherScreen"
            component={SalesVoucherScreen}
          />
          <Stack.Screen name="SalesTipsScreen" component={SalesTipsScreen} />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
          />
          <Stack.Screen name="WalletScreen" component={WalletScreen} />
          <Stack.Screen
            name="AddTeamMemberScreen"
            component={AddTeamMemberScreen}
          />
          <Stack.Screen name="SupportScreen" component={SupportScreen} />
          <Stack.Screen
            name="ClientDetail"
            component={ClientDetail}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="AddClientScreen" component={AddClientScreen} />
          <Stack.Screen
            name="AppointmentDetailsScreen"
            component={AppointmentDetailsScreen}
            // options={{
            //   animation: "slide_from_right",
            // }}
          />
          <Stack.Screen
            name="CreateAppointment"
            component={CreateAppointmentScreen}
          />
          <Stack.Screen
            name="PaymentMethodsScreen"
            component={PaymentMethodsScreen}
            // options={{
            //   animation: "slide_from_right",
            // }}
          />
          <Stack.Screen
            name="AddPaymentMethodScreen"
            component={AddPaymentMethodScreen}
            // options={{
            //   animation: "slide_from_right",
            // }}
          />
          <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default RootStackNavigator;

const styles = StyleSheet.create({});
