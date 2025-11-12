import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import useSalesLogScreenVM from "./SalesLogScreenVM";
import { SafeAreaView } from "react-native-safe-area-context";
import SalesLogScreenStyles from "./SalesLogScreenStyles";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Sliders,
  Star,
} from "lucide-react-native";

const SalesLogScreen = () => {
  const { navigation, saleLogData } = useSalesLogScreenVM();
  return (
    <SafeAreaView style={SalesLogScreenStyles.mainContainer}>
      {/* -----------------------------------HEADER---------------------------------------- */}
      <View style={SalesLogScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={SalesLogScreenStyles.backButton}
        >
          <ChevronLeft size={32} />
          <Text style={SalesLogScreenStyles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={SalesLogScreenStyles.starContainer}>
          <Star color={"#fbbf24"} fill={"#fbbf24"} size={26} />
        </TouchableOpacity>
        <TouchableOpacity style={SalesLogScreenStyles.optionButton}>
          <EllipsisVertical size={26} />
        </TouchableOpacity>
      </View>
      {/* -----------------------------------TITLECONTAINER---------------------------------------- */}
      <View style={SalesLogScreenStyles.titleContainer}>
        <Text style={SalesLogScreenStyles.title}>Sales Log Detils</Text>
        <Text style={SalesLogScreenStyles.description}>
          In-depth view into each sale transaction with server-side filtering.
        </Text>
        <View style={SalesLogScreenStyles.filterContainer}>
          <TouchableOpacity
            style={SalesLogScreenStyles.filterButton}
            onPress={() => navigation.navigate("FilterScreen")}
          >
            <Sliders size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={SalesLogScreenStyles.filterButton}
            onPress={() => navigation.navigate("FilterScreen")}
          >
            <ChevronLeft size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={SalesLogScreenStyles.dateButton}>
            <Text>Sep 01 - sep 30 2025</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={SalesLogScreenStyles.filterButton}
            onPress={() => navigation.navigate("FilterScreen")}
          >
            <ChevronRight size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SalesLogScreen;
