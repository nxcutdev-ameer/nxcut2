import { StyleSheet } from "react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

const paint = colors.colors;
export const SalesScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: paint.background,
  },
  headerContainer: {
    height: getHeightEquivalent(60),
    width: "100%",
    borderColor: paint.border,
    backgroundColor: paint.background,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingLeft: getWidthEquivalent(20),
    paddingRight: getWidthEquivalent(20),
  },
  headerProfile: {
    height: getHeightEquivalent(40),
    width: getHeightEquivalent(40),
    backgroundColor: paint.primaryLight,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: paint.primary,
    alignSelf: "center",
  },
  headerNotification: {
    height: getHeightEquivalent(50),
    width: getHeightEquivalent(50),
    marginRight: getWidthEquivalent(10),
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: paint.background,
    paddingHorizontal: getWidthEquivalent(20),
  },
  bodyTitle: {
    fontSize: fontEq(26),
    fontWeight: "700",
    color: paint.black,
    marginLeft: getWidthEquivalent(8),
    marginTop: getHeightEquivalent(15),
    // lineHeight: getHeightEquivalent(28),
    marginBottom: getHeightEquivalent(12),
  },
});
