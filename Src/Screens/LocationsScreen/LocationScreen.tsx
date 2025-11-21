import React, { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../Store/useAuthStore";
import { LocationScreenStyles } from "./LocationScreenStyles";
import useLocationScreenVM from "./LocationScreenVM";
import colors from "../../Constants/colors";
import { fontEq, getHeightEquivalent, getWidthEquivalent } from "../../Utils/helpers";

const LocationScreen = () => {
  const {
    session,
    currentLocation,
    locationData,
    updateCurrentLocation,
    navigateToDashboard,
    isHydrating,
    hydrationProgress,
  } = useLocationScreenVM();
  // Get locations from user metadata (fallback empty array)
  useEffect(() => {
    console.log("session", session?.user?.user_metadata);
  }, []);
  return (
    <SafeAreaView style={LocationScreenStyles.mainContainer}>
      <View style={LocationScreenStyles.header}>
        <Text style={LocationScreenStyles.hederText}>Locations</Text>
        <Text style={LocationScreenStyles.subHeaderText}>
          Select the location where you work to continue to your dashboard
        </Text>
      </View>

      <FlatList
        data={locationData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCurrent = item.id === currentLocation;
          return (
            <TouchableOpacity
              onPress={() => updateCurrentLocation(item.id)}
              style={[
                LocationScreenStyles.locationItem, //51f127d0-8993-4b19-a60e-b515a8e50fa7  //8e369b56-fe5b-42de-a7ba-4a49da9511db
                isCurrent && LocationScreenStyles.currentLocationItem,
              ]}
            >
              <Text
                style={[
                  LocationScreenStyles.locationText,
                  isCurrent && LocationScreenStyles.currentLocationText,
                ]}
              >
                {item.name}
              </Text>
              {/* <Text
                style={[
                  LocationScreenStyles.locationIDText,
                  isCurrent && LocationScreenStyles.currentLocationText,
                ]}
              >
                Location ID: {item.id}
              </Text> */}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={LocationScreenStyles.emptyContainer}>
            <Text style={LocationScreenStyles.emptyText}>
              No locations available
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => navigateToDashboard()}
        style={[
          LocationScreenStyles.button,
          ((!currentLocation || currentLocation === "") || isHydrating) && LocationScreenStyles.buttonDisabled
        ]}
        activeOpacity={((!currentLocation || currentLocation === "") || isHydrating) ? 1 : 0.7}
        disabled={isHydrating}
      >
        {isHydrating ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.colors.white} style={{ marginRight: 8 }} />
            <Text style={LocationScreenStyles.buttonText}>
              Loading Dashboard...
            </Text>
          </View>
        ) : (
          <Text style={[
            LocationScreenStyles.buttonText,
            (!currentLocation || currentLocation === "") && LocationScreenStyles.buttonTextDisabled
          ]}>
            Continue To Dashboard
          </Text>
        )}
      </TouchableOpacity>

      {isHydrating && (
        <View style={{
          marginTop: getHeightEquivalent(20),
          alignItems: 'center',
          paddingHorizontal: getWidthEquivalent(40),
        }}>
          <Text style={{
            fontSize: fontEq(14),
            color: colors.colors.text,
            marginBottom: getHeightEquivalent(12),
            textAlign: 'center',
          }}>
            {hydrationProgress.currentStep}
          </Text>
          <View style={{
            width: '100%',
            height: getHeightEquivalent(6),
            backgroundColor: colors.colors.border,
            borderRadius: 3,
            marginBottom: getHeightEquivalent(8),
          }}>
            <View style={{
              height: '100%',
              backgroundColor: colors.colors.primary,
              borderRadius: 3,
              width: `${(hydrationProgress.completedSteps / hydrationProgress.totalSteps) * 100}%`,
              minWidth: '5%',
            }} />
          </View>
          <Text style={{
            fontSize: fontEq(12),
            color: colors.colors.textSecondary,
          }}>
            {hydrationProgress.completedSteps}/{hydrationProgress.totalSteps}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LocationScreen;
