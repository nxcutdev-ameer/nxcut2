import { StyleSheet } from "react-native";
import { colors } from "../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../Utils/helpers";
//import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
//import { BorderColor } from "../../../node_modules/lightningcss/node/ast.d";

export const LocationScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    //justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeightEquivalent(16), // 16,
    paddingHorizontal: getWidthEquivalent(16), //16,
    paddingVertical: getHeightEquivalent(16), //16,
    // borderWidth: 1,

    // borderColor: colors.border,
  },
  hederText: {
    fontSize: fontEq(25),
    fontWeight: "bold",
    color: colors.text,
  },
  subHeaderText: {
    marginTop: getHeightEquivalent(15),
    fontSize: fontEq(14),
    color: colors.textSecondary,
    marginBottom: getHeightEquivalent(8),
    textAlign: "center",
  },
  locationItem: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentLocationItem: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.borderFocus,
  },
  locationText: {
    fontSize: fontEq(18),
    color: colors.text,
    fontWeight: "700",
    marginBottom: getHeightEquivalent(10),
  },
  locationIDText: {
    fontSize: fontEq(12),
    color: colors.textSecondary,
    fontWeight: "500",
    // marginBottom: getHeightEquivalent(10),
  },
  currentLocationText: {
    // color: colors.,
    //fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: fontEq(18),
    fontWeight: "bold",
    color: colors.white,
  },
  buttonTextDisabled: {
    color: colors.gray[500],
  },
});
