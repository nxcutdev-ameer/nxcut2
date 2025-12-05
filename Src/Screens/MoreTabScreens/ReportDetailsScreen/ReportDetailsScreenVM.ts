import { useState } from "react";
import { reportsRepository } from "../../../Repository/reportsRepository";
import { useAuthStore } from "../../../Store/useAuthStore";
import {
  BadgeDollarSign,
  ChartColumn,
  FileText,
  ShoppingCart,
  HandHeart,
} from "lucide-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";

const useReportDetailsScreenVM = () => {
  const { currentLocation } = useAuthStore();
  const [searchText, setSearchText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const navigation: NavigationProp<any> = useNavigation();
  const tabs = [
    {
      id: 0,
      title: "All reports",
    },
    {
      id: 1,
      title: "Sales",
    },
    {
      id: 3,
      title: "Finance",
    },
    {
      id: 4,
      title: "Appointments",
    },
    {
      id: 5,
      title: "Team",
    },
    {
      id: 6,
      title: "Clients",
    },
    {
      id: 7,
      title: "Inventory",
    },
  ];
  const reportsOptions = [
    // {
    //   id: 0,
    //   type: "Sales",
    //   title: "Sales Summary",
    //   description: "Comprehensive overview of sales performance",
    //   icon: ShoppingCart,
    //   onPress: () => {},
    //   isFavourite: true,
    // },
    // {
    //   id: 1,
    //   type: "Sales",
    //   title: "Sales List",
    //   description: "Complete listing of all sales transcations",
    //   icon: FileText,
    //   onPress: () => {},
    //   isFavourite: true,
    // },
    {
      id: 1,
      type: "Team",
      title: "Preformance Dashboard",
      description: "Dashboard of your business performance.",
      icon: ChartColumn,
      onPress: () => {
        navigation.navigate("PerfromanceDashboardScreen");
      },
      isFavourite: true,
    },
    {
      id: 2,
      type: "Finance",
      title: "Finance Summary",
      description: "High level summary of sales payments and liabilities",
      icon: ShoppingCart,
      onPress: () => {
        navigation.navigate("FinanceSummaryScreen");
      },
      isFavourite: true,
    },
    {
      id: 3,
      type: "Finance",
      title: "Payments transactions",
      description: "Detailed view of all payment transactions",
      icon: FileText,
      onPress: () => {
        navigation.navigate("PaymentTransactionsScreen");
      },
      isFavourite: true,
    },
    {
      id: 4,
      type: "Finance",
      title: "Payments Summary",
      description: "Payments split by payment method",
      icon: FileText,
      onPress: () => {
        navigation.navigate("PaymentSummaryScreen");
      },
      isFavourite: true,
    },
    // {
    //   id: 6,
    //   type: "Team",
    //   title: "Team Performance",
    //   description: "Staff performance metrics and analysis.",
    //   icon: Users,
    //   onPress: () => {
    //     navigation.navigate("TeamPerformanceScreen");
    //   },
    //   isFavourite: true,
    // },
    {
      id: 6,
      type: "Team",
      title: "Tips summary",
      description: "Analysis of gratuity income.",
      icon: HandHeart,
      onPress: () => {
        navigation.navigate("TipsSummary");
      },
      isFavourite: true,
    },
  ];
  //   useEffect(() => {
  //     const fetchPayments = async () => {
  //       try {
  //         const res = await reportsRepository.getPaymentTransactions({
  //           p_start_date: "2025-09-01T00:00:00Z",
  //           p_end_date: "2025-09-12T23:59:59Z",
  //           p_date_type: "payment_date",
  //           p_locations: ["51f127d0-8993-4b19-a60e-b515a8e50fa7"], // optional
  //           p_limit: 50,
  //         });

  //         console.log("✅ Payment transactions:", res);
  //       } catch (err) {
  //         console.error("❌ Failed to fetch payments:", err);
  //       }
  //     };

  //     fetchPayments();
  //   }, []);
  //   useEffect(() => {
  //     const testConnection = async () => {
  //       try {
  //         const { data, error } = await supabase
  //           .from("locations")
  //           .select("*")
  //           .limit(1);
  //         if (error) throw error;
  //         console.log("✅ Supabase is reachable:", data);
  //       } catch (err) {
  //         console.error("❌ Supabase connection failed:", err);
  //       }
  //     };

  //     testConnection();
  //   }, []);
  //   useEffect(() => {
  //     const fetchSales = async () => {
  //       try {
  //         const response = await reportsRepository.getFilteredSalesDynamic({
  //           startDate: "2025-09-01",
  //           endDate: "2025-09-12",
  //           locationIds: ["51f127d0-8993-4b19-a60e-b515a8e50fa7"], // Example location_id
  //           saleTypes: ["services", "items"],
  //           paymentMethods: ["card", "cash"],
  //           limit: 10,
  //           offset: 0,
  //         });

  //         console.log("📊 Sales Report Response:", response);
  //       } catch (error) {
  //         console.error("❌ Error fetching sales:", error);
  //       }
  //     };

  //     fetchSales();
  //   }, []);
  //   useEffect(() => {
  //     // getAppointments();
  //     getAppointmentsByLocation();
  //   }, [activeTab]);

  const getAppointments = () => {
    let responce = reportsRepository.getAppointments();
    console.log("in funtion screen location", responce);
  };

  const getAppointmentsByLocation = () => {
    let responce = reportsRepository.getAppointmentsByLocation(
      "51f127d0-8993-4b19-a60e-b515a8e50fa7"
    );
    console.log("[APPBYLOCATION]", responce);
  };
  const clearSearchText = () => {
    setSearchText("");
  };
  const onFilterPress = () => {};
  const onTabPress = (id: number) => {
    setActiveTab(id);
  };
  return {
    tabs,
    activeTab,
    clearSearchText,
    searchText,
    setSearchText,
    onFilterPress,
    onTabPress,
    reportsOptions,
  };
};

export default useReportDetailsScreenVM;
