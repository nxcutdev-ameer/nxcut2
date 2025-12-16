import { StyleSheet } from "react-native";
import { getHeightEquivalent, getWidthEquivalent, fontEq } from "../../../Utils/helpers";
import { colors } from "../../../Constants/colors";

export const AddPaymentMethodScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradientHeader: {
    paddingTop: getHeightEquivalent(0), // gradient will extend under status bar via SafeAreaView
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(16),
  },
  backButton: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(40),
    borderRadius: getWidthEquivalent(20),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.white,
  },
  headerSpacer: {
    width: getWidthEquivalent(40),
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    // borderTopLeftRadius: getWidthEquivalent(24),
    // borderTopRightRadius: getWidthEquivalent(24),
    paddingTop: getHeightEquivalent(24),
    paddingHorizontal: getWidthEquivalent(20),
  },
  section: {
    marginBottom: getHeightEquivalent(24),
  },
  sectionTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.text,
    marginBottom: getHeightEquivalent(16),
  },
  paymentTypeCard: {
    backgroundColor: colors.white,
    borderRadius: getWidthEquivalent(12),
    padding: getWidthEquivalent(16),
    marginBottom: getHeightEquivalent(12),
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  paymentTypeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentTypeIcon: {
    width: getWidthEquivalent(48),
    height: getHeightEquivalent(48),
    borderRadius: getWidthEquivalent(24),
    backgroundColor: colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: getWidthEquivalent(12),
  },
  paymentTypeInfo: {
    flex: 1,
  },
  paymentTypeName: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.text,
    marginBottom: getHeightEquivalent(4),
  },
  paymentTypeDescription: {
    fontSize: fontEq(14),
    color: colors.textSecondary,
  },
  selectedIndicator: {
    width: getWidthEquivalent(32),
    height: getHeightEquivalent(32),
    borderRadius: getWidthEquivalent(16),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: getWidthEquivalent(12),
    padding: getWidthEquivalent(16),
    marginBottom: getHeightEquivalent(24),
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  formTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.text,
    marginBottom: getHeightEquivalent(16),
  },
  formDescription: {
    fontSize: fontEq(14),
    color: colors.textSecondary,
    lineHeight: getHeightEquivalent(20),
  },
  inputGroup: {
    marginBottom: getHeightEquivalent(16),
  },
  rowInputs: {
    flexDirection: "row",
    gap: getWidthEquivalent(12),
  },
  inputLabel: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: colors.text,
    marginBottom: getHeightEquivalent(8),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: getWidthEquivalent(8),
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(12),
    fontSize: fontEq(16),
    color: colors.text,
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getHeightEquivalent(24),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.white,
  },
});
