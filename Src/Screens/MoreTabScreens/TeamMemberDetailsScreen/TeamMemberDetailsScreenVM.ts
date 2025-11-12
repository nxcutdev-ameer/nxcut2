import { useCallback, useRef, useState } from "react";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { TeamMemberBO } from "../../../Repository/teamRepository";
import BottomSheet from "@gorhom/bottom-sheet";
import { useAuthStore } from "../../../Store/useAuthStore";

interface RouteParams {
  member: TeamMemberBO;
}

const useTeamMemberDetailsScreenVM = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { member } = route.params as RouteParams;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { allLocations } = useAuthStore();
  const [memberData, setMemberData] = useState<TeamMemberBO>(member);
  const [editedTeamMember, setEditedTeamMember] = useState<TeamMemberBO>(member);
  const [pageMode, setPageMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const location = allLocations.find(loc => loc.id === locationId);
    return location?.name || "-";
  };

  // Format member data for display
  const getFormattedMemberInfo = () => {
    return {
      fullName: `${memberData.first_name} ${memberData.last_name || "-"}`,
      initials: (
        memberData.first_name.charAt(0) + (memberData.last_name?.charAt(0) || "")
      ).toUpperCase(),
      statusText: memberData.is_active ? "Active" : "Inactive",
      statusColor: memberData.is_active ? "success" : "danger",
      memberSince: new Date(memberData.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      lastUpdated: new Date(memberData.updated_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      adminStatus: memberData.isAdmin ? "Administrator" : "Team Member",
      notes: memberData.notes,
      locationName: getLocationName(memberData.location_id),
    };
  };

  const handleEditMember = () => {
    if (pageMode === 'view') {
      // Switch to edit mode
      setPageMode('edit');
      setEditedTeamMember({ ...memberData });
      console.log("Switched to edit mode for:", memberData.first_name);
    } else {
      // Save changes mode
      handleSaveChanges();
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      console.log("Saving changes for:", editedTeamMember.first_name);

      // TODO: Implement API call to save changes
      // const updatedMember = await teamRepository.updateTeamMember(editedTeamMember);

      // For now, just update local state
      setMemberData({ ...editedTeamMember });
      setPageMode('view');

      console.log("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setPageMode('view');
    setEditedTeamMember({ ...memberData });
    console.log("Edit cancelled");
  };

  const confirmDeactivateMember = async () => {
    try {
      setLoading(true);
      setShowDeleteConfirmation(false);

      // TODO: Implement actual deactivation API call
      console.log("Deactivating member:", memberData.first_name);

      // For now, just update local state
      setMemberData((prev) => ({ ...prev, is_active: false }));
    } catch (error) {
      console.error("Error deactivating member:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleViewSchedule = () => {
    // Navigate to member's schedule
    bottomSheetRef.current?.expand();
    console.log("View schedule for:", memberData.first_name);
    // TODO: navigation.navigate("MemberScheduleScreen", { member: memberData });
  };

  const handleViewPerformance = () => {
    // Navigate to member's performance
    console.log("View performance for:", memberData.first_name);
    // TODO: navigation.navigate("MemberPerformanceScreen", { member: memberData });
  };

  const onToggleSwitch = (value: boolean) => {
    if (pageMode === 'edit') {
      setEditedTeamMember((prev) => ({ ...prev, isAdmin: value }));
      console.log("Admin status changed to:", value);
    }
  };

  const onToggleSwitch2 = (value: boolean) => {
    if (pageMode === 'edit') {
      setEditedTeamMember((prev) => ({ ...prev, visible_to_clients: value }));
      console.log("Client visibility changed to:", value);
    }
  };

  const updateEditedField = (field: keyof TeamMemberBO, value: string | number | boolean) => {
    setEditedTeamMember((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  return {
    navigation,
    memberData,
    editedTeamMember,
    pageMode,
    loading,
    showDeleteConfirmation,
    bottomSheetRef,
    handleSheetChanges,
    setShowDeleteConfirmation,
    getFormattedMemberInfo,
    handleEditMember,
    handleCancelEdit,
    confirmDeactivateMember,
    handleViewSchedule,
    handleViewPerformance,
    onToggleSwitch,
    onToggleSwitch2,
    updateEditedField,
    getLocationName,
  };
};

export default useTeamMemberDetailsScreenVM;
