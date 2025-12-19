import React from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronDown,
  ChevronUp,
  Check,
  MapPinned,
  Users,
  X,
} from "lucide-react-native";
import { colors } from "../Constants/colors";
import PerformanceDashboardScreenStyles from "../Screens/MoreTabScreens/PerformanceDashboardScreen/PerformanceDashboardScreenStyles";
import { fontEq } from "../Utils/helpers";

export type FilterOptionId = "location" | "team_member";

interface FilterPanelModalProps {
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  expandedFilter: string | null;
  toggleFilterAccordion: (filterType: string) => void;
  allLocations: any[];
  allTeamMembers: any[];
  pageFilter: any;
  toggleLocationFilter: (locationId: string) => void;
  toggleTeamMemberFilter: (staffId: string) => void;
  allowedFilters?: readonly FilterOptionId[];
}

const FilterPanelModal: React.FC<FilterPanelModalProps> = ({
  visible,
  onClose,
  onClear,
  onApply,
  expandedFilter,
  toggleFilterAccordion,
  allLocations,
  allTeamMembers,
  pageFilter,
  toggleLocationFilter,
  toggleTeamMemberFilter,
  allowedFilters,
}) => {
  const baseFilterOptions = [
    {
      id: "location",
      label: "Location",
      icon: MapPinned,
      iconColor: colors.warningDark,
    },
    {
      id: "team_member",
      label: "Team Member",
      icon: Users,
      iconColor: colors.primary,
    },
  ];

  const filterOptions = allowedFilters
    ? baseFilterOptions.filter((option) => allowedFilters.includes(option.id as FilterOptionId))
    : baseFilterOptions;

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
        <View style={PerformanceDashboardScreenStyles.filterPanelHeader}>
          <Text style={PerformanceDashboardScreenStyles.filterPanelTitle}>
            Filter
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={PerformanceDashboardScreenStyles.filterCloseButton}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={PerformanceDashboardScreenStyles.filterPanelContent}>
          {filterOptions.map((filter) => (
            <View key={filter.id}>
              <TouchableOpacity
                style={PerformanceDashboardScreenStyles.filterOption}
                onPress={() => toggleFilterAccordion(filter.id)}
              >
                <View style={PerformanceDashboardScreenStyles.filterOptionLeft}>
                  <filter.icon
                    size={20}
                    color={filter.iconColor}
                    style={PerformanceDashboardScreenStyles.filterOptionIcon}
                  />
                  <Text style={PerformanceDashboardScreenStyles.filterOptionText}>
                    {filter.label}
                  </Text>
                </View>
                {expandedFilter === filter.id ? (
                  <ChevronUp size={20} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>

              {expandedFilter === filter.id && (
                <View style={{ paddingLeft: 40, paddingBottom: 10 }}>
                  {filter.id === "location" &&
                    allLocations.map((location) => {
                      const isSelected = pageFilter.location_ids?.includes(
                        location.id
                      );
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
                                ? colors.primary
                                : colors.border,
                              backgroundColor: isSelected
                                ? colors.primary
                                : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            {isSelected && (
                              <Check
                                size={16}
                                color={colors.white}
                                strokeWidth={3}
                              />
                            )}
                          </View>
                          <Text
                            style={{
                              fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
                              fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
                              color: colors.text,
                              fontWeight: isSelected ? "600" : "400",
                            }}
                          >
                            {location.name || location.location_name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                  {filter.id === "team_member" && (() => {
                    const selectedLocationIds = pageFilter.location_ids || [];

                    const filteredTeamMembers =
                      selectedLocationIds.length === 0
                        ? allTeamMembers
                        : allTeamMembers.filter((member) =>
                            selectedLocationIds.includes(member.location_id)
                          );

                    if (filteredTeamMembers.length === 0) {
                      return (
                        <View
                          style={{
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
                              fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
                              color: colors.textSecondary,
                              fontStyle: "italic",
                            }}
                          >
                            {selectedLocationIds.length === 0
                              ? "No team members available"
                              : "No team members found for selected locations"}
                          </Text>
                        </View>
                      );
                    }

                    return filteredTeamMembers.map((member) => {
                      const isSelected = pageFilter.staff_ids?.includes(member.id);

                      const memberLocation = allLocations.find(
                        (location) => location.id === member.location_id
                      );
                      const locationName =
                        memberLocation?.name || memberLocation?.location_name || "";

                      const displayName =
                        member.name ||
                        `${member.first_name || ""} ${member.last_name || ""}`.trim();

                      return (
                        <TouchableOpacity
                          key={member.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            marginVertical: 2,
                          }}
                          onPress={() => toggleTeamMemberFilter(member.id)}
                        >
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 4,
                              borderWidth: 2,
                              borderColor: isSelected
                                ? colors.primary
                                : colors.border,
                              backgroundColor: isSelected
                                ? colors.primary
                                : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            {isSelected && (
                              <Check size={16} color={colors.white} strokeWidth={3} />
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
                                color: colors.text,
                                fontWeight: isSelected ? "600" : "400",
                              }}
                            >
                              {displayName}
                              {locationName && (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: colors.textSecondary,
                                    fontWeight: "400",
                                  }}
                                >
                                  {` (${locationName})`}
                                </Text>
                              )}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    });
                  })()}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={PerformanceDashboardScreenStyles.filterPanelButtons}>
          <TouchableOpacity
            style={PerformanceDashboardScreenStyles.filterClearButton}
            onPress={onClear}
          >
            <Text style={PerformanceDashboardScreenStyles.filterClearButtonText}>
              Clear Filter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={PerformanceDashboardScreenStyles.filterApplyButton}
            onPress={onApply}
          >
            <Text style={PerformanceDashboardScreenStyles.filterApplyButtonText}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilterPanelModal;
