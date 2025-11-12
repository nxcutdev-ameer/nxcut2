import { useEffect, useState, useMemo } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  TeamMemberBO,
  teamRepository,
} from "../../../Repository/teamRepository";

const useTeamScrenVM = () => {
  const [teamMembersData, setTeamMembersData] = useState<TeamMemberBO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState({
    showActiveOnly: false,
    showInactiveOnly: false,
    showAdminOnly: false,
  });
  const [selectedMember, setSelectedMember] = useState<TeamMemberBO | null>(
    null
  );
  const [showMemberBottomSheet, setShowMemberBottomSheet] =
    useState<boolean>(false);

  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const responce = await teamRepository.getTeamMembersByLocation();
      if (!responce) {
        setTeamMembersData([]);
      } else {
        setTeamMembersData(responce);
        console.log("[TEAM-MEMBERS-VM]", responce);
      }
    } catch (error) {
      console.log(error);
      setTeamMembersData([]);
    } finally {
      setLoading(false);
    }
  };

  // Local search and filter functionality
  const filteredTeamMembers = useMemo(() => {
    let filtered = [...teamMembersData];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((member) => {
        const fullName =
          `${member.first_name} ${member.last_name}`.toLowerCase();
        const email = member.email.toLowerCase();
        const phone = member.phone_number.toLowerCase();
        const query = searchQuery.toLowerCase();

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      });
    }

    // Apply status filters
    if (filterOptions.showActiveOnly) {
      filtered = filtered.filter((member) => member.is_active === true);
    }

    if (filterOptions.showInactiveOnly) {
      filtered = filtered.filter((member) => member.is_active === false);
    }

    if (filterOptions.showAdminOnly) {
      filtered = filtered.filter((member) => member.isAdmin === true);
    }

    return filtered.sort((a, b) => a.first_name.localeCompare(b.first_name));
  }, [teamMembersData, searchQuery, filterOptions]);

  const handleMemberPress = (member: TeamMemberBO) => {
    // Navigate to team member details screen
    navigation.navigate("TeamMemberDetailsScreen", { member });
  };

  const handleMemberOptionsPress = (member: TeamMemberBO) => {
    // setSelectedMember(member);
    // setShowMemberBottomSheet(true);
  };

  const handleEditMember = () => {
    // Navigate to edit screen or handle edit logic
    console.log("Edit member:", selectedMember?.first_name);
    setShowMemberBottomSheet(false);
    // TODO: Navigate to edit screen
  };

  const handleEditShift = () => {
    // Navigate to shift edit screen or handle shift logic
    console.log("Edit shift for:", selectedMember?.first_name);
    setShowMemberBottomSheet(false);
    // TODO: Navigate to shift edit screen
  };

  const handleDeleteMember = () => {
    // Handle delete logic
    console.log("Delete member:", selectedMember?.first_name);
    setShowMemberBottomSheet(false);
    // TODO: Implement delete functionality
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const resetFilters = () => {
    setFilterOptions({
      showActiveOnly: false,
      showInactiveOnly: false,
      showAdminOnly: false,
    });
  };

  return {
    navigation,
    teamMembersData,
    filteredTeamMembers,
    loading,
    searchQuery,
    setSearchQuery,
    showFilter,
    setShowFilter,
    filterOptions,
    setFilterOptions,
    selectedMember,
    showMemberBottomSheet,
    setShowMemberBottomSheet,
    fetchTeamMembers,
    handleMemberPress,
    handleMemberOptionsPress,
    handleEditMember,
    handleEditShift,
    handleDeleteMember,
    clearSearch,
    resetFilters,
  };
};

export default useTeamScrenVM;
