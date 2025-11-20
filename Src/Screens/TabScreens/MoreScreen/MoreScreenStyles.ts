import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { colors, theme, shadows } from "../../../Constants/colors";
import { StyleSheet } from "react-native";
import {
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

export const MoreScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  bellWrapper: {
    position: "relative",
    marginRight: theme.spacing.md,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
  },
  profileCircle: {
    width: getWidthEquivalent(38), //32,
    height: getWidthEquivalent(38),
    borderRadius: 30,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    color: colors.text,
    fontWeight: "bold",
  },

  // Wallet Card
  walletCard: {
    backgroundColor: colors.gradient.start,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
  },
  walletLabel: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 4,
  },
  walletAmount: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
  },
  walletButton: {
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: theme.borderRadius.round,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  walletButtonText: {
    color: colors.white,
    fontSize: 14,
  },

  // Menu Grid
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    marginTop: theme.spacing.sm,
    color: colors.text,
    fontSize: 14,
  },
  footer: {
    flex: 1,
    backgroundColor: colors.white,
    //padding: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.borderRadius.large,
    borderColor: colors.gray[200],
    marginBottom: getHeightEquivalent(90),
  },
  footerItem: {
    paddingHorizontal: getWidthEquivalent(theme.spacing.lg),
    flexDirection: "row",
    alignItems: "center",
    gap: getHeightEquivalent(theme.spacing.lg),
    paddingVertical: getHeightEquivalent(theme.spacing.md),
  },
  footerIcon: {
    width: getWidthEquivalent(24),
    height: getWidthEquivalent(24),
    right: getWidthEquivalent(15),
    position: "absolute",
  },
  footerLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
});
