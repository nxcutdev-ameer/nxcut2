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
    fetchFilteredSalesDynamic();
    console.log("useSalesLogScreenVM", saleLogData);
  }, []);
  async function fetchFilteredSalesDynamic() {
    const responce = await paymentRepository.getFilteredSalesDynamic({
      p_start_date: new Date().toString(),
      p_end_date: new Date().toString(),
      // p_limit: 1000,
      // p_offset: 0,
      // p_location_ids: ,
      // p_payment_methods: null,
      // p_sale_types: null,
      // p_staff_ids: null,
    });

    if (responce) {
      setSaleLogData(responce);
      console.log("[SALES-LOG-VM]", responce);
    }
  }

  // Call i
  return {
    navigation,
    saleLogData,
  };
};

export default useSalesLogScreenVM;
