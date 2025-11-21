import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  EllipsisVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Mail,
  Phone,
  User,
  Edit,
  Calendar,
  Trash2,
  X,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import { TeamScreenStyles } from "./TeamScreenStyles";
import useTeamScrenVM from "./TeamScrenVM";
import { TeamMemberBO } from "../../../Repository/teamRepository";
import { useToast } from "../../../Hooks/useToast";
import CustomToast from "../../../Components/CustomToast";

// Team Member Card Component
const TeamMemberCard: React.FC<{
  member: TeamMemberBO;
  onPress: (member: TeamMemberBO) => void;
  onOptionsPress: (member: TeamMemberBO) => void;
}> = ({ member, onPress, onOptionsPress }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <TouchableOpacity
      style={TeamScreenStyles.memberCard}
      onPress={() => onPress(member)}
      activeOpacity={0.7}
    >
      <View style={TeamScreenStyles.memberCardHeader}>
        <View style={TeamScreenStyles.memberImageContainer}>
          {member.image_url ? (
            <Image
              resizeMode="contain"
              source={{ uri: member.image_url }}
              style={TeamScreenStyles.memberImage}
            />
          ) : (
            <View style={TeamScreenStyles.memberInitialCircle}>
              <Text style={TeamScreenStyles.memberInitialText}>
                {getInitials(member.first_name, member.last_name)}
              </Text>
            </View>
          )}
          <View style={TeamScreenStyles.memberInfo}>
            <Text style={TeamScreenStyles.memberName}>
              {member.first_name} {member.last_name}
            </Text>
            <Text
              style={[
                TeamScreenStyles.memberStatus,
                member.is_active
                  ? TeamScreenStyles.activeStatus
                  : TeamScreenStyles.inactiveStatus,
              ]}
            >
              {member.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        {/* <TouchableOpacity
          style={TeamScreenStyles.memberOptionsButton}
          onPress={
            () => null
            // onOptionsPress(member)
          }
        >
          <EllipsisVertical size={20} color={colors.colors.text} />
        </TouchableOpacity> */}
      </View>

      <View style={TeamScreenStyles.memberDetails}>
        <View style={TeamScreenStyles.memberDetailRow}>
          <Mail size={16} color={colors.colors.textSecondary} />
          <Text style={TeamScreenStyles.memberDetailText}>{member.email}</Text>
        </View>
        <View style={TeamScreenStyles.memberDetailRow}>
          <Phone size={16} color={colors.colors.textSecondary} />
          <Text style={TeamScreenStyles.memberDetailText}>
            {member.phone_number}
          </Text>
        </View>
        {/* <View style={TeamScreenStyles.memberDetailRow}>
          <User size={16} color={colors.colors.textSecondary} />
          <Text style={TeamScreenStyles.memberDetailText}>
            ID: {member.team_member_id}
          </Text>
        </View> */}
      </View>
    </TouchableOpacity>
  );
};

// Team Member Bottom Sheet Component
const TeamMemberBottomSheet: React.FC<{
  visible: boolean;
  member: TeamMemberBO | null;
  onClose: () => void;
  onEdit: () => void;
  onEditShift: () => void;
  onDelete: () => void;
}> = ({ visible, member, onClose, onEdit, onEditShift, onDelete }) => {
  if (!member) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={TeamScreenStyles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={TeamScreenStyles.bottomSheet}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={TeamScreenStyles.bottomSheetHandle} />

          <View style={TeamScreenStyles.bottomSheetHeader}>
            <Text style={TeamScreenStyles.bottomSheetTitle}>
              {member.first_name} {member.last_name}
            </Text>
            <TouchableOpacity
              style={TeamScreenStyles.closeButton}
              onPress={onClose}
            >
              <X size={16} color={colors.colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              TeamScreenStyles.bottomSheetOption,
              TeamScreenStyles.editOption,
            ]}
            onPress={onEdit}
          >
            <Edit size={20} color={colors.colors.primary} />
            <Text
              style={[
                TeamScreenStyles.bottomSheetOptionText,
                TeamScreenStyles.editOptionText,
              ]}
            >
              Edit Member
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              TeamScreenStyles.bottomSheetOption,
              TeamScreenStyles.shiftOption,
            ]}
            onPress={onEditShift}
          >
            <Calendar size={20} color={colors.colors.info} />
            <Text
              style={[
                TeamScreenStyles.bottomSheetOptionText,
                TeamScreenStyles.shiftOptionText,
              ]}
            >
              Edit Shift
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              TeamScreenStyles.bottomSheetOption,
              TeamScreenStyles.deleteOption,
            ]}
            onPress={onDelete}
          >
            <Trash2 size={20} color={colors.colors.danger} />
            <Text
              style={[
                TeamScreenStyles.bottomSheetOptionText,
                TeamScreenStyles.deleteOptionText,
              ]}
            >
              Delete Member
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const TeamScreen = () => {
  const { toast, showComingSoon, hideToast } = useToast();
  const {
    navigation,
    filteredTeamMembers,
    loading,
    searchQuery,
    setSearchQuery,
    selectedMember,
    showMemberBottomSheet,
    setShowMemberBottomSheet,
    handleMemberPress,
    handleMemberOptionsPress,
    handleEditMember,
    handleEditShift,
    handleDeleteMember,
  } = useTeamScrenVM();

  const renderEmptyState = () => (
    <View style={TeamScreenStyles.emptyState}>
      <User size={48} color={colors.colors.textSecondary} />
      <Text style={TeamScreenStyles.emptyStateText}>
        {searchQuery.trim()
          ? "No team members found matching your search"
          : "No team members found"}
      </Text>
    </View>
  );

  const renderTeamMember = ({ item }: { item: TeamMemberBO }) => (
    <TeamMemberCard
      member={item}
      onPress={handleMemberPress}
      onOptionsPress={handleMemberOptionsPress}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={TeamScreenStyles.mainContainer}>
        <View style={TeamScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.colors.primary} />
          <Text style={TeamScreenStyles.loadingText}>
            Loading team members...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={TeamScreenStyles.mainContainer}>
      {/* Header */}
      <View style={TeamScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={TeamScreenStyles.backArrow}
        >
          <ArrowLeft size={20} color={colors.colors.black} />
          <Text style={TeamScreenStyles.backArrowText}>Back</Text>
        </TouchableOpacity>
        <View style={TeamScreenStyles.headerRightContainer}>
          {/* <TouchableOpacity style={TeamScreenStyles.elipseBox}>
            <EllipsisVertical size={20} color={colors.colors.text} />
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity
            onPress={() => navigation.navigate("AddTeamMemberScreen")}
            style={TeamScreenStyles.addButton}
          >
            <Plus size={16} color={colors.colors.white} />
            <Text style={TeamScreenStyles.addButtonText}>Add</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Title and Search Section */}
      <View style={TeamScreenStyles.titleSection}>
        <Text style={TeamScreenStyles.bodyTitle}>Team Members</Text>
        <View style={TeamScreenStyles.searchContainer}>
          <View style={TeamScreenStyles.searchInputContainer}>
            <Search size={20} color={colors.colors.textSecondary} />
            <TextInput
              style={TeamScreenStyles.searchInput}
              placeholder="Search team members..."
              placeholderTextColor={colors.colors.gray[300]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {/* <TouchableOpacity
            style={TeamScreenStyles.filterButton}
            onPress={()=> {}}
          >
            <SlidersHorizontal size={20} color={colors.colors.text} />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Team Members List */}
      <FlatList
        style={TeamScreenStyles.scrollContainer}
        contentContainerStyle={TeamScreenStyles.scrollContent}
        data={filteredTeamMembers}
        renderItem={renderTeamMember}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Team Member Options Bottom Sheet */}
      <TeamMemberBottomSheet
        visible={showMemberBottomSheet}
        member={selectedMember}
        onClose={() => setShowMemberBottomSheet(false)}
        onEdit={handleEditMember}
        onEditShift={handleEditShift}
        onDelete={handleDeleteMember}
      />
      <CustomToast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

export default TeamScreen;
