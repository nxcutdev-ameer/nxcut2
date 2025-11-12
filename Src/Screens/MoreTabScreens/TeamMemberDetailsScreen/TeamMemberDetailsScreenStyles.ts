import { StyleSheet } from "react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

export const TeamMemberDetailsScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colors.white,
  },
  contentContainer: {
    flex: 1,
    height: "100%",
    padding: 36,
    alignItems: "center",
    // borderWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.colors.white,
    shadowColor: "#1e293b",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(20),
    paddingBottom: getHeightEquivalent(16),
    backgroundColor: colors.colors.white,
  },
  backArrow: {
    flexDirection: "row",
    alignItems: "center",
    width: getWidthEquivalent(80),
  },
  backArrowText: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.colors.text,
    marginLeft: getWidthEquivalent(8),
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(12),
  },
  deleteButton: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(40),
    borderRadius: getWidthEquivalent(20),
    backgroundColor: colors.colors.dangerLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getHeightEquivalent(20),
  },

  // Profile Header Section
  profileSection: {
    backgroundColor: colors.colors.white,
    paddingVertical: getHeightEquivalent(24),
    paddingHorizontal: getWidthEquivalent(20),
    alignItems: "center",
    marginBottom: getHeightEquivalent(16),
  },
  profileImageContainer: {
    marginBottom: getHeightEquivalent(16),
  },
  profileImage: {
    width: getWidthEquivalent(100),
    height: getHeightEquivalent(100),
    borderRadius: getWidthEquivalent(50),
  },
  profileInitialCircle: {
    width: getWidthEquivalent(100),
    height: getHeightEquivalent(100),
    borderRadius: getWidthEquivalent(50),
    backgroundColor: colors.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitialText: {
    fontSize: fontEq(36),
    fontWeight: "700",
    color: colors.colors.white,
  },
  memberName: {
    fontSize: fontEq(24),
    fontWeight: "700",
    color: colors.colors.text,
    marginBottom: getHeightEquivalent(4),
  },
  memberRole: {
    fontSize: fontEq(16),
    fontWeight: "500",
    color: colors.colors.textSecondary,
    marginBottom: getHeightEquivalent(8),
  },
  memberStatus: {
    fontSize: fontEq(14),
    fontWeight: "600",
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(4),
    borderRadius: getWidthEquivalent(12),
    overflow: "hidden",
  },
  activeStatus: {
    backgroundColor: colors.colors.successLight,
    color: colors.colors.success,
  },
  inactiveStatus: {
    backgroundColor: colors.colors.dangerLight,
    color: colors.colors.danger,
  },
  premissionContainer: {
    marginTop: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(20),
    width: "100%",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeightEquivalent(12),
  },
  switchLabel: {
    fontSize: fontEq(16),
    fontWeight: "500",
    color: colors.colors.text,
    flex: 1,
  },

  // Quick Actions Section
  quickActionsSection: {
    backgroundColor: colors.colors.white,
    marginHorizontal: getWidthEquivalent(20),
    marginBottom: getHeightEquivalent(16),
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionsHeader: {
    paddingHorizontal: getWidthEquivalent(16),
    marginBottom: getHeightEquivalent(12),
  },
  sectionTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.colors.text,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: getWidthEquivalent(16),
  },
  quickActionButton: {
    alignItems: "center",
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
    borderRadius: getWidthEquivalent(12),
    minWidth: getWidthEquivalent(70),
  },
  quickActionIcon: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(40),
    borderRadius: getWidthEquivalent(20),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: getHeightEquivalent(8),
  },
  callAction: {
    backgroundColor: colors.colors.successLight,
  },
  emailAction: {
    backgroundColor: colors.colors.infoLight,
  },
  scheduleAction: {
    backgroundColor: colors.colors.warningLight,
    width: "40%",
  },
  performanceAction: {
    backgroundColor: colors.colors.primaryLight,
    width: "40%",
  },
  quickActionText: {
    fontSize: fontEq(12),
    fontWeight: "500",
    color: colors.colors.text,
    textAlign: "center",
  },

  // Member Information Section
  infoSection: {
    backgroundColor: colors.colors.white,
    marginHorizontal: getWidthEquivalent(20),
    marginBottom: getHeightEquivalent(16),
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(20),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoSectionHeader: {
    paddingHorizontal: getWidthEquivalent(16),
    marginBottom: getHeightEquivalent(16),
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.borderLight,
  },
  infoItemLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: getWidthEquivalent(32),
    height: getHeightEquivalent(32),
    borderRadius: getWidthEquivalent(16),
    backgroundColor: colors.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: getWidthEquivalent(12),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontEq(12),
    fontWeight: "500",
    color: colors.colors.textSecondary,
    marginBottom: getHeightEquivalent(2),
  },
  infoValue: {
    fontSize: fontEq(16),
    fontWeight: "500",
    color: colors.colors.text,
  },
  infoInput: {
    fontSize: fontEq(16),
    fontWeight: "500",
    color: colors.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.borderFocus,
    paddingVertical: getHeightEquivalent(4),
    paddingHorizontal: 0,
  },
  colorDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(12),
  },
  colorSquare: {
    width: getWidthEquivalent(24),
    height: getWidthEquivalent(24),
    borderRadius: getWidthEquivalent(6),
    borderWidth: 1,
    borderColor: colors.colors.border,
  },

  // Bottom Action Button
  actionButtonContainer: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(16),
    backgroundColor: colors.colors.white,
  },
  editButton: {
    backgroundColor: colors.colors.primary,
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  editButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.colors.white,
    marginLeft: getWidthEquivalent(8),
  },
  editModeButtons: {
    flexDirection: "row",
    gap: getWidthEquivalent(12),
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.colors.primary,
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  saveButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.colors.white,
    marginLeft: getWidthEquivalent(8),
  },
  editCancelButton: {
    flex: 1,
    backgroundColor: colors.colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.colors.borderLight,
  },
  editCancelButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.colors.text,
    marginLeft: getWidthEquivalent(8),
  },

  // Confirmation Dialog Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(40),
  },
  loadingText: {
    fontSize: fontEq(16),
    color: colors.colors.textSecondary,
    marginTop: getHeightEquivalent(12),
  },

  // Confirmation Dialog
  confirmationDialog: {
    backgroundColor: colors.colors.white,
    marginHorizontal: getWidthEquivalent(40),
    borderRadius: getWidthEquivalent(16),
    padding: getWidthEquivalent(24),
  },
  confirmationTitle: {
    fontSize: fontEq(18),
    fontWeight: "700",
    color: colors.colors.text,
    textAlign: "center",
    marginBottom: getHeightEquivalent(8),
  },
  confirmationMessage: {
    fontSize: fontEq(14),
    color: colors.colors.textSecondary,
    textAlign: "center",
    lineHeight: getHeightEquivalent(20),
    marginBottom: getHeightEquivalent(24),
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: getWidthEquivalent(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.colors.backgroundSecondary,
    paddingVertical: getHeightEquivalent(12),
    borderRadius: getWidthEquivalent(8),
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.colors.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.colors.danger,
    paddingVertical: getHeightEquivalent(12),
    borderRadius: getWidthEquivalent(8),
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.colors.white,
  },
});
