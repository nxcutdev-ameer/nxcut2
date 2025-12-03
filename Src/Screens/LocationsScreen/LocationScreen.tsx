import React, { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, Image, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../Store/useAuthStore";
import { LocationScreenStyles } from "./LocationScreenStyles";
import useLocationScreenVM from "./LocationScreenVM";
import colors from "../../Constants/colors";
import { fontEq, getHeightEquivalent, getWidthEquivalent } from "../../Utils/helpers";
import { LinearGradient } from 'expo-linear-gradient';

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
        contentContainerStyle={{ paddingBottom: getHeightEquivalent(20) }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isCurrent = item.id === currentLocation;
          const imageUrl = item.photosUrl && item.photosUrl.length > 0 ? item.photosUrl[0] : null;
          
          // Format created_at date
          const formatDate = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });
          };
          
          return (
            <TouchableOpacity
              onPress={() => updateCurrentLocation(item.id)}
              style={[
                LocationScreenStyles.LocationCard,
                isCurrent && LocationScreenStyles.LocationCardSelected,
              ]}
              activeOpacity={0.8}
            >
              {imageUrl ? (
                <ImageBackground
                  source={{ uri: imageUrl }}
                  style={LocationScreenStyles.locationImageBackground}
                  imageStyle={LocationScreenStyles.locationImage}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={LocationScreenStyles.imageGradient}
                  >
                    <View style={LocationScreenStyles.locationNameContainer}>
                      <View style={LocationScreenStyles.locationInfo}>
                        <Text style={LocationScreenStyles.LocationText}>
                          {item.name}
                        </Text>
                        {item.created_at && (
                          <Text style={LocationScreenStyles.locationDateText}>
                            Created: {formatDate(item.created_at)}
                          </Text>
                        )}
                      </View>
                      {isCurrent && (
                        <View style={LocationScreenStyles.selectedBadge}>
                          <Text style={LocationScreenStyles.selectedBadgeText}>
                            ✓ Selected
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </ImageBackground>
              ) : (
                <View
                  style={[
                    LocationScreenStyles.locationPlaceholder,
                    isCurrent &&
                      LocationScreenStyles.locationPlaceholderSelected,
                  ]}
                >
                  <View style={LocationScreenStyles.placeholderIcon}>
                    <Text style={LocationScreenStyles.placeholderIconText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={LocationScreenStyles.placeholderTextContainer}>
                    <Text
                      style={[
                        LocationScreenStyles.placeholderLocationText,
                        isCurrent &&
                          LocationScreenStyles.placeholderLocationTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.created_at && (
                      <Text
                        style={[
                          LocationScreenStyles.placeholderDateText,
                          isCurrent &&
                            LocationScreenStyles.placeholderDateTextSelected,
                        ]}
                      >
                        Added: {formatDate(item.created_at)}
                      </Text>
                    )}
                  </View>
                  {isCurrent && (
                    <View style={LocationScreenStyles.selectedBadge}>
                      <Text style={LocationScreenStyles.selectedBadgeText}>
                        ✓ Selected
                      </Text>
                    </View>
                  )}
                </View>
              )}
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
