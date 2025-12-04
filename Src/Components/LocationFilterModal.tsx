import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import { X, Check } from "lucide-react-native";
import colors from "../Constants/colors";
import PerformanceDashboardScreenStyles from "../Screens/MoreTabScreens/PerformanceDashboardScreen/PerformanceDashboardScreenStyles";

interface Location {
  id: string;
  name?: string;
  location_name?: string;
}

interface PageFilter {
  location_ids?: string[];
}

interface LocationFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  allLocations: Location[];
  pageFilter: PageFilter;
  toggleLocationFilter: (locationId: string) => void;
  title?: string;
  applyButtonStyle?: any;
}

const LocationFilterModal: React.FC<LocationFilterModalProps> = ({
  visible,
  onClose,
  onClear,
  onApply,
  allLocations,
  pageFilter,
  toggleLocationFilter,
  title = "Filter",
  applyButtonStyle,
}) => {
  const hasNoLocationsSelected =
    !pageFilter.location_ids || pageFilter.location_ids.length === 0;

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      onBackdropPress={onClose}
      style={PerformanceDashboardScreenStyles.filterPanelModal}
    >
      <SafeAreaView
        edges={["top", "right", "bottom"]}
        style={PerformanceDashboardScreenStyles.filterPanel}
      >
        {/* Header */}
        <View style={PerformanceDashboardScreenStyles.filterPanelHeader}>
          <Text style={PerformanceDashboardScreenStyles.filterPanelTitle}>
            {title}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={PerformanceDashboardScreenStyles.filterCloseButton}
          >
            <X size={20} color={colors.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={PerformanceDashboardScreenStyles.filterPanelContent}>
          {/* Location Filter Section */}
          <View style={PerformanceDashboardScreenStyles.filterOption}>
            <Text style={PerformanceDashboardScreenStyles.filterOptionText}>
              Locations
            </Text>
          </View>

          {allLocations.map((location) => {
            const isSelected = pageFilter.location_ids?.includes(location.id);
            const locationName = location.name || location.location_name || "Unnamed Location";
            
            return (
              <TouchableOpacity
                key={location.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginVertical: 2,
                }}
                onPress={() => toggleLocationFilter(location.id)}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: isSelected
                      ? colors.colors.primary
                      : colors.colors.border,
                    backgroundColor: isSelected
                      ? colors.colors.primary
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {isSelected && (
                    <Check
                      size={16}
                      color={colors.colors.white}
                      strokeWidth={3}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.colors.text,
                    fontWeight: isSelected ? "600" : "400",
                  }}
                >
                  {locationName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={PerformanceDashboardScreenStyles.filterPanelButtons}>
          <TouchableOpacity
            style={PerformanceDashboardScreenStyles.filterClearButton}
            onPress={onClear}
          >
            <Text
              style={PerformanceDashboardScreenStyles.filterClearButtonText}
            >
              Clear All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              PerformanceDashboardScreenStyles.filterApplyButton,
              applyButtonStyle,
              hasNoLocationsSelected && { opacity: 0.5 },
            ]}
            onPress={onApply}
            disabled={hasNoLocationsSelected}
          >
            <Text
              style={PerformanceDashboardScreenStyles.filterApplyButtonText}
            >
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default LocationFilterModal;
