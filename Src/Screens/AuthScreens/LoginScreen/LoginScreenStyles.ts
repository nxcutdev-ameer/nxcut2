import { Platform, StyleSheet } from "react-native";
import {
  getHeightEquivalent,
  getWidthEquivalent,
  fontEq,
} from "../../../Utils/helpers";
import { colors } from "../../../Constants/colors";

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: getWidthEquivalent(20),
  },
  content: {
    flex: 1,
    //justifyContent: "space-around",
    paddingTop: getHeightEquivalent(60),
    marginTop: getHeightEquivalent(80),
  },
  title: {
    fontSize:Platform.OS === 'android' ?fontEq(24): fontEq(32),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: getHeightEquivalent(8),
  },
  subtitle: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: getHeightEquivalent(40),
  },
  inputContainer: {
    marginBottom: getHeightEquivalent(24),
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: getHeightEquivalent(16),
    borderRadius: getWidthEquivalent(12),
    alignItems: "center",
    marginBottom: getHeightEquivalent(32),
  },
  continueButtonDisabled: {
    backgroundColor: colors.borderFocus,
    opacity: 0.6,
  },
  continueButtonText: {
    color: colors.white,
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "600",
  },
  continueButtonTextDisabled: {
    color: colors.textMuted,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: fontEq(14),
    color: colors.textMuted,
  },
  signupLink: {
    fontSize: fontEq(14),
    color: colors.primary,
    fontWeight: "600",
  },
});
