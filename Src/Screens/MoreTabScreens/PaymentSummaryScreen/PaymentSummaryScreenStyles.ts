import { StyleSheet } from "react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

export const PaymentSummaryScreenStyles = StyleSheet.create({
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
    //padding: getWidthEquivalent(8),
    alignItems: "center",
    //justifyContent: "space-between",
    width: getWidthEquivalent(80),
  },
  backArrowText: {
    fontSize: fontEq(16),
    fontWeight: "500",
    color: colors.colors.black,
    marginLeft: getHeightEquivalent(5),
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
    paddingVertical: getHeightEquivalent(20),
    backgroundColor: colors.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.colors.border,
  },
  bodyTitle: {
    fontSize: fontEq(22),
    fontWeight: "700",
    color: colors.colors.text,
    marginBottom: getHeightEquivalent(8),
  },
  bodySubtitle: {
    fontSize: fontEq(13),
    color: colors.colors.textSecondary,
    lineHeight: getHeightEquivalent(22),
    marginBottom: getHeightEquivalent(20),
  },
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: getWidthEquivalent(12),
  },
  todayButton: {
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(8),
    backgroundColor: colors.colors.primary,
    borderRadius: getWidthEquivalent(20),
  },
  todayButtonDisabled: {
    backgroundColor: colors.colors.backgroundSecondary,
  },
  todayButtonText: {
    color: colors.colors.white,
    fontSize: fontEq(14),
    fontWeight: "600",
  },
  todayButtonTextDisabled: {
    color: colors.colors.textSecondary,
  },
  chevronButton: {
    padding: getWidthEquivalent(8),
    backgroundColor: colors.colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(20),
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    backgroundColor: colors.colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(20),
    flex: 1,
    justifyContent: "center",
  },
  secondaryFilterButton: {
    width: getWidthEquivalent(40),
    height: getWidthEquivalent(40),
    borderRadius: getWidthEquivalent(22),
    backgroundColor: colors.colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.colors.black,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: fontEq(14),
    fontWeight: "600",
    color: colors.colors.text,
    marginLeft: getWidthEquivalent(8),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    //paddingHorizontal: getWidthEquivalent(0),
    paddingBottom: getHeightEquivalent(20),
  },
  sectionTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.colors.text,
    marginTop: getHeightEquivalent(20),
    marginBottom: getHeightEquivalent(8),
  },
});
