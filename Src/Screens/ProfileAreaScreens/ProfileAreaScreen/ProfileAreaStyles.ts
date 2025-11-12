import { StyleSheet } from "react-native";
import { colors, theme, shadows } from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const ProfileAreaScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: getWidthEquivalent(theme.spacing.md),
    paddingVertical: getHeightEquivalent(theme.spacing.md),
  },
  header: {
    marginBottom: getHeightEquivalent(theme.spacing.md),
  },
  profileSection: {
    marginBottom: getHeightEquivalent(theme.spacing.lg),
  },
  subTitle: {
    fontSize: fontEq(14),
    color: colors.textSecondary,
    marginBottom: getHeightEquivalent(4),
  },
  userName: {
    fontSize: fontEq(20),
    fontWeight: "bold",
    color: colors.text,
  },
  mutedText: {
    fontSize: fontEq(14),
    color: colors.textMuted,
    marginBottom: getHeightEquivalent(theme.spacing.md),
  },
  profileCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: getWidthEquivalent(48),
    height: getHeightEquivalent(48),
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: fontEq(16),
    fontWeight: "bold",
    color: colors.primary,
  },

  // Verification Banner
  verifyBanner: {
    backgroundColor: colors.warningLight,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: getWidthEquivalent(theme.spacing.md),
    paddingVertical: getHeightEquivalent(theme.spacing.md),
    marginBottom: getHeightEquivalent(theme.spacing.lg),
  },
  verifyTitle: {
    fontWeight: "bold",
    color: colors.text,
    marginBottom: getHeightEquivalent(2),
  },
  verifySubtitle: {
    color: colors.textSecondary,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.medium,
    marginBottom: getHeightEquivalent(theme.spacing.lg),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(theme.spacing.md),
    paddingVertical: getHeightEquivalent(theme.spacing.md - 3),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  menuLabel: {
    fontSize: fontEq(15),
    color: colors.text,
  },
  arrow: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
