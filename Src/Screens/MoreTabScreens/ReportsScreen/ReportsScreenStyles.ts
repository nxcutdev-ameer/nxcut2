import { StyleSheet } from "react-native";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import { colors } from "../../../Constants/colors";

const ReportsScreenStyles = StyleSheet.create({
  header: {
    height: getHeightEquivalent(60),
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(10),
  },
  headerText: {
    fontSize: fontEq(18),
    fontWeight: "500",
    color: colors.black,
    marginLeft: getWidthEquivalent(10),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: getWidthEquivalent(10),
    paddingVertical: getHeightEquivalent(14),
  },
  title: {
    fontSize: fontEq(26),
    fontWeight: "bold",
    color: colors.text,
    marginTop: getHeightEquivalent(10),
  },

});

export default ReportsScreenStyles;
