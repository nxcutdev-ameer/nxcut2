import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../Utils/supabase";
import {
  paymentRepository,
  SalesLogBO,
} from "../../../Repository/paymentsRepository";
import { NavigationProp, useNavigation } from "@react-navigation/native";

const useSalesLogScreenVM = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const [saleLogData, setSaleLogData] = useState<SalesLogBO[]>([]);
  useEffect(() => {
    fetchFilteredSales();
    console.log("useSalesLogScreenVM", saleLogData);
  }, []);
  async function fetchFilteredSales() {
    try {
      const range = await paymentRepository.getSalesPaymentsByDateRange(
        new Date().toISOString(),
        new Date().toISOString()
      );
      // Map to SalesLogBO-like minimal shape if needed, or keep raw
      // For now, we keep raw into saleLogData with a type cast
      // If you want exact SalesLogBO rows, swap to the RPC when available.
      setSaleLogData((range as unknown) as SalesLogBO[]);
    } catch (e) {
      console.log("[SALES-LOG-VM] error", e);
    }
  }

  // Call i
  return {
    navigation,
    saleLogData,
  };
};

export default useSalesLogScreenVM;
