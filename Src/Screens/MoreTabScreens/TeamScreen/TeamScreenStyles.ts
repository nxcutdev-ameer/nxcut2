import { StyleSheet } from "react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

export const TeamScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colors.white,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(16),
    backgroundColor: colors.colors.white,
    // borderBottomWidth: 1,
    borderBottomColor: colors.colors.border,
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
  elipseBox: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(40),
    borderRadius: getWidthEquivalent(20),
    backgroundColor: colors.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.colors.primary,
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(10),
    borderRadius: getWidthEquivalent(20),
  },
  addButtonText: {
    color: colors.colors.white,
    fontSize: fontEq(14),
    fontWeight: "600",
    marginLeft: getWidthEquivalent(4),
  },
  titleSection: {
    paddingHorizontal: getWidthEquivalent(20),
    // paddingVertical: getHeightEquivalent(20),
    backgroundColor: colors.colors.white,
    // borderBottomWidth: 1,
    marginBottom: getHeightEquivalent(10),
    borderBottomColor: colors.colors.border,
  },
  bodyTitle: {
    fontSize: fontEq(24),
    fontWeight: "700",
    color: colors.colors.text,
    marginBottom: getHeightEquivalent(16),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(12),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(12),
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(12),
  },
  searchInput: {
    flex: 1,
    fontSize: fontEq(16),
    color: colors.colors.text,
    marginLeft: getWidthEquivalent(8),
  },
  filterButton: {
    backgroundColor: colors.colors.backgroundSecondary,
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    borderRadius: getWidthEquivalent(12),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingBottom: getHeightEquivalent(20),
  },
  // Team Member Card Styles
  memberCard: {
    backgroundColor: colors.colors.white,
    borderRadius: getWidthEquivalent(12),
    padding: getWidthEquivalent(16),
    marginTop: getHeightEquivalent(12),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getHeightEquivalent(12),
  },
  memberImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberImage: {
    width: getWidthEquivalent(50),
    height: getHeightEquivalent(50),
    borderRadius: getWidthEquivalent(25),
  },
  memberInitialCircle: {
    width: getWidthEquivalent(50),
    height: getHeightEquivalent(50),
    borderRadius: getWidthEquivalent(25),
    backgroundColor: colors.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  memberInitialText: {
    fontSize: fontEq(18),
    fontWeight: "700",
    color: colors.colors.white,
  },
  memberInfo: {
    marginLeft: getWidthEquivalent(12),
    flex: 1,
  },
  memberName: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.colors.text,
    marginBottom: getHeightEquivalent(2),
  },
  memberStatus: {
    fontSize: fontEq(12),
    fontWeight: "500",
    paddingHorizontal: getWidthEquivalent(8),
    paddingVertical: getHeightEquivalent(2),
    borderRadius: getWidthEquivalent(8),
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  activeStatus: {
    backgroundColor: colors.colors.success + "20",
    color: colors.colors.success,
  },
  inactiveStatus: {
    backgroundColor: colors.colors.danger + "20",
    color: colors.colors.danger,
  },
  memberOptionsButton: {
    padding: getWidthEquivalent(8),
  },
  memberDetails: {
    gap: getHeightEquivalent(8),
  },
  memberDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberDetailText: {
    fontSize: fontEq(14),
    color: colors.colors.textSecondary,
    marginLeft: getWidthEquivalent(8),
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(60),
  },
  emptyStateText: {
    fontSize: fontEq(16),
    color: colors.colors.textSecondary,
    textAlign: "center",
    marginTop: getHeightEquivalent(16),
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
  // Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.colors.white,
    borderTopLeftRadius: getWidthEquivalent(20),
    borderTopRightRadius: getWidthEquivalent(20),
    paddingTop: getHeightEquivalent(8),
    paddingBottom: getHeightEquivalent(32),
    paddingHorizontal: getWidthEquivalent(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomSheetHandle: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(4),
    backgroundColor: colors.colors.border,
    borderRadius: getHeightEquivalent(2),
    alignSelf: "center",
    marginBottom: getHeightEquivalent(20),
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: getHeightEquivalent(20),
  },
  bottomSheetTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.colors.text,
  },
  closeButton: {
    padding: getWidthEquivalent(8),
    borderRadius: getWidthEquivalent(20),
    backgroundColor: colors.colors.backgroundSecondary,
  },
  bottomSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(16),
    borderRadius: getWidthEquivalent(12),
    marginBottom: getHeightEquivalent(8),
  },
  bottomSheetOptionText: {
    fontSize: fontEq(16),
    fontWeight: "500",
    color: colors.colors.text,
    marginLeft: getWidthEquivalent(12),
  },
  editOption: {
    backgroundColor: colors.colors.primaryLight,
  },
  editOptionText: {
    color: colors.colors.primary,
  },
  shiftOption: {
    backgroundColor: colors.colors.infoLight,
  },
  shiftOptionText: {
    color: colors.colors.info,
  },
  deleteOption: {
    backgroundColor: colors.colors.dangerLight,
  },
  deleteOptionText: {
    color: colors.colors.danger,
  },
});
