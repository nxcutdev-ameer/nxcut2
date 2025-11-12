import { View, Text } from "react-native";
import React, { useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";

const useTeamPerformanceScreenVM = () => {
  const [teamPerformanceData, setteamPerformanceData] = useState([]);
  const navigation = useNavigation<NavigationProp<any>>();

  const fetchTeamPerformanceData = () => {
    try {




        
    } catch (error) {
      console.log(error);
    }
  };

  return { navigation };
};

export default useTeamPerformanceScreenVM;
