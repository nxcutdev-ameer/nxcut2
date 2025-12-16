import { colors, theme, shadows } from "../../../Constants/colors";
import { StyleSheet } from "react-native";
import { getHeightEquivalent, getWidthEquivalent, fontEq } from "../../../Utils/helpers";

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
    height: getHeightEquivalent(50),
    width: '100%',
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: getWidthEquivalent(16),
    marginBottom: theme.spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getWidthEquivalent(4),
  },
  headerButton: {
    width: getWidthEquivalent(40),
    height: getWidthEquivalent(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: getWidthEquivalent(20),
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: getHeightEquivalent(6),
    right: getWidthEquivalent(8),
    width: getWidthEquivalent(11),
    height: getWidthEquivalent(11),
    borderRadius: getWidthEquivalent(11) / 2,
    backgroundColor: '#FF4444',
  },
  profileButton: {
    width: getWidthEquivalent(38),
    height: getWidthEquivalent(38),
    borderRadius: getWidthEquivalent(50),
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: getWidthEquivalent(4),
  },
  profileInitials: {
    fontSize: fontEq(14),
    fontWeight: "600",
    color: colors.primary,
  },
  headerTitle: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.primary,
    alignSelf: "center",
  },
  // Wallet Card
  walletCardWrapper: {
    marginBottom: theme.spacing.lg,
  },
  walletCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  walletCard: {
    backgroundColor: colors.gradient.start,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    overflow: "hidden",
    height: getHeightEquivalent(150),
  },
  walletLabel: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 4,
  },
  walletAmount: {
    color: colors.white,
    fontSize: 26,
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
