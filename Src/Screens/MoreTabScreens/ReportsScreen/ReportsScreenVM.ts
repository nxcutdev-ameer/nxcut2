import { View, Text } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const useReportsScreenVM = () => {
  const naviagtion: any = useNavigation();
  const onPressReports = () => {
    naviagtion.navigate("ReportsDetailsScreen");
  };

  return {
    onPressReports,
  };
};

export default useReportsScreenVM;
