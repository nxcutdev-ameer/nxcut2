import { StyleSheet } from "react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

const SalesLogScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.colors.white,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: getHeightEquivalent(50),
    paddingRight: getWidthEquivalent(20),
    paddingLeft: getWidthEquivalent(15),
    paddingVertical: getHeightEquivalent(16),
  },
  backButton: {
    height: getHeightEquivalent(50),
    alignItems: "center",
    // justifyContent: "center",
    borderRadius: 10,
    flexDirection: "row",
    paddingRight: getWidthEquivalent(10),
  },
  backButtonText: {
    fontSize: fontEq(18),
    fontWeight: "700",
    color: colors.colors.text,
  },
  starContainer: {
    position: "absolute",
    right: getWidthEquivalent(80),
  },
  optionButton: {
    height: getHeightEquivalent(40),
    // width: getWidthEquivalent(40),
    borderWidth: 1,
    borderColor: colors.colors.border,
    alignItems: "center",
    alignSelf: "center",
    // justifyContent: "center",
    borderRadius: 10,
    flexDirection: "row",
    paddingHorizontal: getWidthEquivalent(10),
  },
  titleContainer: {
    height: getHeightEquivalent(200),
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(10),
  },
  title: {
    fontSize: fontEq(24),
    fontWeight: "700",
    color: colors.colors.text,
    marginBottom: getHeightEquivalent(10),
  },
  description: {
    fontSize: fontEq(14),
    fontWeight: "400",
    color: colors.colors.textSecondary,
    marginBottom: getHeightEquivalent(30),
  },
  filterButton: {
    height: getHeightEquivalent(40),
    width: getWidthEquivalent(40),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.colors.border,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButton: {
    height: getHeightEquivalent(40),
    width: getWidthEquivalent(180),
    paddingHorizontal: getWidthEquivalent(10),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.colors.border,
  },
});
export default SalesLogScreenStyles;
