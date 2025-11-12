import { StyleSheet } from "react-native";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

export const PaperCalendarStyles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
  },
  headerTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
  },
  resetButton: {
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(6),
    borderRadius: 8,
    borderWidth: 1,
  },
  resetText: {
    fontSize: fontEq(13),
    fontWeight: "600",
  },
  rangeSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(10),
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  rangeItem: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: fontEq(12),
    fontWeight: "500",
    marginBottom: getHeightEquivalent(4),
  },
  rangeValue: {
    fontSize: fontEq(14),
    fontWeight: "600",
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: getWidthEquivalent(12),
  },
  calendarWrapper: {
    paddingHorizontal: getWidthEquivalent(8),
    paddingVertical: getHeightEquivalent(12),
  },
});
