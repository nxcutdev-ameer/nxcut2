import { StyleSheet } from "react-native";
import { colors } from "../../../Constants/colors";
import {
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

export const PasswordScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 32,
  },
  formContainer: {
    width: "100%",
    gap: 16,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 16,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontWeight: "500",
    fontSize: 15,
  },
  continueButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
  },
  backButtonContainer: {
    position: "absolute",
    zIndex: 10,
    alignContent: "flex-start",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 44,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text,
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 280,
    alignSelf: "center",
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 48,
  },
  loadingLottie: {
    width: getWidthEquivalent(200),
    height: getHeightEquivalent(200),
  },
});
