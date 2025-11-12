import { Text, TouchableOpacity, View } from "react-native";
import React from "react";
import useTeamPerformanceScreenVM from "./TeamPerformanceScreenVM";
import {
  ChevronLeft,
  Star,
  EllipsisVertical,
  Sliders,
  ChevronRight,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TeamPerformanceScreenStyles from "./TeamPerformanceScreenStyles";

const TeamPerformanceScreen = () => {
  const { navigation } = useTeamPerformanceScreenVM();
  return (
    <SafeAreaView style={TeamPerformanceScreenStyles.mainContainer}>
      {/* -----------------------------------HEADER---------------------------------------- */}
      <View style={TeamPerformanceScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={TeamPerformanceScreenStyles.backButton}
        >
          <ChevronLeft size={32} />
          <Text style={TeamPerformanceScreenStyles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={TeamPerformanceScreenStyles.starContainer}>
          <Star color={"#fbbf24"} fill={"#fbbf24"} size={26} />
        </TouchableOpacity>
        <TouchableOpacity style={TeamPerformanceScreenStyles.optionButton}>
          <EllipsisVertical size={26} />
        </TouchableOpacity>
      </View>
      {/* -----------------------------------TITLECONTAINER---------------------------------------- */}
      <View style={TeamPerformanceScreenStyles.titleContainer}>
        <Text style={TeamPerformanceScreenStyles.title}>Team Performance</Text>
        <Text style={TeamPerformanceScreenStyles.description}>
          Staff performance metrics and analysis.
        </Text>
        <View style={TeamPerformanceScreenStyles.filterContainer}>
          <TouchableOpacity
            style={TeamPerformanceScreenStyles.filterButton}
            onPress={() => navigation.navigate("FilterScreen")}
          >
            <Sliders size={24} />
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={TeamPerformanceScreenStyles..filterButton}
            onPress={() => navigation.navigate("FilterScreen")}
          >
            <ChevronLeft size={24} />
          </TouchableOpacity> */}
          <TouchableOpacity style={TeamPerformanceScreenStyles.dateButton}>
            <Text>Sep 01 - sep 30 2025</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={TeamPerformanceScreenStyles..filterButton}
            onPress={() => navigation.navigate("FilterScreen")}
          >
            <ChevronRight size={24} />
          </TouchableOpacity> */}
        </View>
      </View>
      {/* -----------------------------------BODYCONTAINER---------------------------------------- */}
      {/* <View style={TeamPerformanceScreenStyles.bodyContainer}></View> */}
    </SafeAreaView>
  );
};

export default TeamPerformanceScreen;
