import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  BackHandler,
  TextInput,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Trash2,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  User,
  Clock,
  Shield,
  Edit,
  X,
  MapPin,
  Hash,
  FileText,
  Eye,
  Image as ImageIcon,
} from "lucide-react-native";
import colors from "../../../Constants/colors";
import { TeamMemberDetailsScreenStyles } from "./TeamMemberDetailsScreenStyles";
import useTeamMemberDetailsScreenVM from "./TeamMemberDetailsScreenVM";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Switch } from "react-native-paper";

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  style?: any;
}> = ({ icon, label, onPress, style }) => (
  <TouchableOpacity
    style={[TeamMemberDetailsScreenStyles.quickActionButton, style]}
    onPress={onPress}
  >
    <View style={[TeamMemberDetailsScreenStyles.quickActionIcon, style]}>
      {icon}
    </View>
    <Text style={TeamMemberDetailsScreenStyles.quickActionText}>{label}</Text>
  </TouchableOpacity>
);

// Info Item Component
const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
  isEditable?: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  isColorField?: boolean;
}> = ({ icon, label, value, isLast = false, isEditable = false, onChangeText, keyboardType = 'default', isColorField = false }) => (
  <View
    style={[
      TeamMemberDetailsScreenStyles.infoItem,
      isLast && TeamMemberDetailsScreenStyles.infoItemLast,
    ]}
  >
    <View style={TeamMemberDetailsScreenStyles.infoIcon}>{icon}</View>
    <View style={TeamMemberDetailsScreenStyles.infoContent}>
      <Text style={TeamMemberDetailsScreenStyles.infoLabel}>{label}</Text>
      {isEditable ? (
        <TextInput
          style={TeamMemberDetailsScreenStyles.infoInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={colors.colors.textSecondary}
        />
      ) : isColorField && value ? (
        <View style={TeamMemberDetailsScreenStyles.colorDisplayContainer}>
          <View
            style={[
              TeamMemberDetailsScreenStyles.colorSquare,
              { backgroundColor: value },
            ]}
          />
          <Text style={TeamMemberDetailsScreenStyles.infoValue}>{value}</Text>
        </View>
      ) : (
        <Text style={TeamMemberDetailsScreenStyles.infoValue}>{value || "-"}</Text>
      )}
    </View>
  </View>
);

// Confirmation Dialog
const ConfirmationDialog: React.FC<{
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ visible, title, message, onCancel, onConfirm }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={TeamMemberDetailsScreenStyles.modalOverlay}>
      <View style={TeamMemberDetailsScreenStyles.confirmationDialog}>
        <Text style={TeamMemberDetailsScreenStyles.confirmationTitle}>
          {title}
        </Text>
        <Text style={TeamMemberDetailsScreenStyles.confirmationMessage}>
          {message}
        </Text>
        <View style={TeamMemberDetailsScreenStyles.confirmationButtons}>
          <TouchableOpacity
            style={TeamMemberDetailsScreenStyles.cancelButton}
            onPress={onCancel}
          >
            <Text style={TeamMemberDetailsScreenStyles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={TeamMemberDetailsScreenStyles.confirmButton}
            onPress={onConfirm}
          >
            <Text style={TeamMemberDetailsScreenStyles.confirmButtonText}>
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const TeamMemberDetailsScreen = () => {
  const {
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
  } = useTeamMemberDetailsScreenVM();

  const formattedInfo = getFormattedMemberInfo();
  const currentData = pageMode === 'edit' ? editedTeamMember : memberData;

  if (loading) {
    return (
      <SafeAreaView style={TeamMemberDetailsScreenStyles.mainContainer}>
        <View style={TeamMemberDetailsScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.colors.primary} />
          <Text style={TeamMemberDetailsScreenStyles.loadingText}>
            Loading member details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={TeamMemberDetailsScreenStyles.mainContainer}
    >
      {/* Header */}
      <View style={TeamMemberDetailsScreenStyles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={TeamMemberDetailsScreenStyles.backArrow}
        >
          <ArrowLeft size={24} color={colors.colors.text} />
          <Text style={TeamMemberDetailsScreenStyles.backArrowText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={TeamMemberDetailsScreenStyles.deleteButton}
          onPress={() => setShowDeleteConfirmation(true)}
        >
          <Trash2 size={20} color={colors.colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={TeamMemberDetailsScreenStyles.scrollContainer}
        contentContainerStyle={TeamMemberDetailsScreenStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={TeamMemberDetailsScreenStyles.profileSection}>
          <View style={TeamMemberDetailsScreenStyles.profileImageContainer}>
            {memberData.image_url ? (
              <Image
                source={{ uri: memberData.image_url }}
                style={TeamMemberDetailsScreenStyles.profileImage}
              />
            ) : (
              <View style={TeamMemberDetailsScreenStyles.profileInitialCircle}>
                <Text style={TeamMemberDetailsScreenStyles.profileInitialText}>
                  {formattedInfo.initials}
                </Text>
              </View>
            )}
          </View>

          <Text style={TeamMemberDetailsScreenStyles.memberName}>
            {formattedInfo.fullName}
          </Text>

          <Text style={TeamMemberDetailsScreenStyles.memberRole}>
            {formattedInfo.adminStatus}
          </Text>

          <Text
            style={[
              TeamMemberDetailsScreenStyles.memberStatus,
              memberData.is_active
                ? TeamMemberDetailsScreenStyles.activeStatus
                : TeamMemberDetailsScreenStyles.inactiveStatus,
            ]}
          >
            {formattedInfo.statusText}
          </Text>
          {pageMode === "edit" && (
            <View style={TeamMemberDetailsScreenStyles.premissionContainer}>
              <View style={TeamMemberDetailsScreenStyles.switchRow}>
                <Text style={TeamMemberDetailsScreenStyles.switchLabel}>
                  Admin User
                </Text>
                <Switch
                  value={editedTeamMember.isAdmin || false}
                  onValueChange={onToggleSwitch}
                />
              </View>
              <View style={TeamMemberDetailsScreenStyles.switchRow}>
                <Text style={TeamMemberDetailsScreenStyles.switchLabel}>
                  Visible to Clients
                </Text>
                <Switch
                  value={editedTeamMember.visible_to_clients || false}
                  onValueChange={onToggleSwitch2}
                />
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
       {/* <View style={TeamMemberDetailsScreenStyles.quickActionsSection}>
          <View style={TeamMemberDetailsScreenStyles.quickActionsHeader}>
            <Text style={TeamMemberDetailsScreenStyles.sectionTitle}>
              Quick Actions
            </Text>
          </View>
          <View style={TeamMemberDetailsScreenStyles.quickActionsGrid}>
            {/* <QuickActionButton
              icon={<Phone size={20} color={colors.colors.success} />}
              label="Call"
              onPress={handleCallMember}
              style={TeamMemberDetailsScreenStyles.callAction}
            />
            <QuickActionButton
              icon={<Mail size={20} color={colors.colors.info} />}
              label="Email"
              onPress={handleEmailMember}
              style={TeamMemberDetailsScreenStyles.emailAction}
            />
            <QuickActionButton
              icon={<Calendar size={20} color={colors.colors.warning} />}
              label="Schedule"
              onPress={handleViewSchedule}
              style={TeamMemberDetailsScreenStyles.scheduleAction}
            />
            <QuickActionButton
              icon={<TrendingUp size={20} color={colors.colors.primary} />}
              label="Performance"
              onPress={handleViewPerformance}
              style={TeamMemberDetailsScreenStyles.performanceAction}
            />
          </View>
        </View> */}

        {/* Member Information */}
        <View style={TeamMemberDetailsScreenStyles.infoSection}>
          <View style={TeamMemberDetailsScreenStyles.infoSectionHeader}>
            <Text style={TeamMemberDetailsScreenStyles.sectionTitle}>
              Member Information
            </Text>
          </View>

          <InfoItem
            icon={<User size={16} color={colors.colors.textSecondary} />}
            label="First Name"
            value={currentData.first_name || ""}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("first_name", text)}
          />

          <InfoItem
            icon={<User size={16} color={colors.colors.textSecondary} />}
            label="Last Name"
            value={currentData.last_name || "-"}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("last_name", text)}
          />

          <InfoItem
            icon={<Hash size={16} color={colors.colors.textSecondary} />}
            label="Member ID"
            value={currentData.team_member_id || "-"}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("team_member_id", text)}
          />

          <InfoItem
            icon={<Mail size={16} color={colors.colors.textSecondary} />}
            label="Email Address"
            value={currentData.email}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("email", text)}
            keyboardType="email-address"
          />

          <InfoItem
            icon={<Phone size={16} color={colors.colors.textSecondary} />}
            label="Phone Number"
            value={currentData.phone_number}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("phone_number", text)}
            keyboardType="phone-pad"
          />

          {pageMode === "view" && (
            <InfoItem
              icon={<Shield size={16} color={colors.colors.textSecondary} />}
              label="Role"
              value={formattedInfo.adminStatus}
            />
          )}

          {pageMode === "view" && (
            <InfoItem
              icon={<Eye size={16} color={colors.colors.textSecondary} />}
              label="Visible to Clients"
              value={currentData.visible_to_clients ? "Yes" : "No"}
            />
          )}

          <InfoItem
            icon={<MapPin size={16} color={colors.colors.textSecondary} />}
            label="Location"
            value={pageMode === "edit" ? currentData.location_id : getLocationName(currentData.location_id)}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("location_id", text)}
          />

          <InfoItem
            icon={<Hash size={16} color={colors.colors.textSecondary} />}
            label="Order"
            value={currentData.order?.toString() ?? ""}
            isEditable={pageMode === "edit"}
            onChangeText={(text) =>
              updateEditedField("order", parseInt(text) || 0)
            }
            keyboardType="numeric"
          />

          <InfoItem
            icon={<Calendar size={16} color={colors.colors.textSecondary} />}
            label="Calendar Color"
            value={currentData.calendar_color || "-"}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("calendar_color", text)}
            isColorField={pageMode === "view"}
          />

          {pageMode === "edit" && (
            <InfoItem
              icon={<ImageIcon size={16} color={colors.colors.textSecondary} />}
              label="Image URL"
              value={currentData.image_url || ""}
              isEditable={true}
              onChangeText={(text) => updateEditedField("image_url", text)}
            />
          )}

          {pageMode === "view" && currentData.image_url && (
            <InfoItem
              icon={<ImageIcon size={16} color={colors.colors.textSecondary} />}
              label="Profile Image"
              value="Available"
            />
          )}

          {pageMode === "view" && (
            <InfoItem
              icon={<Calendar size={16} color={colors.colors.textSecondary} />}
              label="Member Since"
              value={formattedInfo.memberSince}
            />
          )}

          {pageMode === "view" && (
            <InfoItem
              icon={<Clock size={16} color={colors.colors.textSecondary} />}
              label="Last Updated"
              value={formattedInfo.lastUpdated}
              isLast={!currentData.notes}
            />
          )}

          <InfoItem
            icon={<FileText size={16} color={colors.colors.textSecondary} />}
            label="Notes"
            value={currentData.notes || "-"}
            isEditable={pageMode === "edit"}
            onChangeText={(text) => updateEditedField("notes", text)}
            isLast={true}
          />
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={TeamMemberDetailsScreenStyles.actionButtonContainer}>
        {pageMode === "edit" ? (
          <View style={TeamMemberDetailsScreenStyles.editModeButtons}>
            <TouchableOpacity
              style={TeamMemberDetailsScreenStyles.editCancelButton}
              onPress={handleCancelEdit}
            >
              <X size={20} color={colors.colors.text} />
              <Text style={TeamMemberDetailsScreenStyles.editCancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={TeamMemberDetailsScreenStyles.saveButton}
              onPress={handleEditMember}
            >
              <Edit size={20} color={colors.colors.white} />
              <Text style={TeamMemberDetailsScreenStyles.saveButtonText}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={TeamMemberDetailsScreenStyles.editButton}
            onPress={handleEditMember}
          >
            <Edit size={20} color={colors.colors.white} />
            <Text style={TeamMemberDetailsScreenStyles.editButtonText}>
              Edit Member
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showDeleteConfirmation}
        title="Deactivate Member"
        message={`Are you sure you want to deactivate ${formattedInfo.fullName}? This action can be reversed later.`}
        onCancel={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDeactivateMember}
      />
      {/* ---------------------------------bottomsheet */}
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["63%", "95%"]}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: colors.colors.white, // 👈 this changes the pan gesture handle color
          width: 40,
          height: 5,
          borderRadius: 3,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        backgroundStyle={{ backgroundColor: colors.colors.borderFocus }}
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          colors: colors.colors.borderFocus,
        }}
      >
        <BottomSheetView style={TeamMemberDetailsScreenStyles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default TeamMemberDetailsScreen;
