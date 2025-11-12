import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gift, Calendar, User } from "lucide-react-native";
import colors from "../Constants/colors";
import {
  ClientVoucher,
  VoucherUsage,
} from "../Repository/clientRepository";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";

interface VoucherCardProps {
  voucher: ClientVoucher;
  voucherUsage?: VoucherUsage;
}

const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, voucherUsage }) => {
  // Calculate remaining amount and usage percentage using real data
  const usedAmount = voucherUsage?.amount_used || 0;
  const remainingAmount = voucher.original_value - usedAmount;
  const usagePercentage =
    voucher.original_value > 0
      ? (usedAmount / voucher.original_value) * 100
      : 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return colors.colors.success;
      case "expired":
        return colors.colors.danger;
      case "revoked":
        return colors.colors.danger;
      case "used":
        return colors.colors.textSecondary;
      default:
        return colors.colors.success;
    }
  };

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={colors.colors.primary} />
          <Text style={styles.dateText}>
            {formatDate(voucher.purchase_date)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(voucher.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {voucher.status || "Active"}
          </Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={styles.clientSection}>
        <User size={18} color={colors.colors.textSecondary} />
        <Text style={styles.clientName}>
          {voucher.client_first_name} {voucher.client_last_name}
        </Text>
      </View>

      {/* Voucher Info */}
      <View style={styles.voucherSection}>
        <View style={styles.voucherInfo}>
          <Gift size={20} color={colors.colors.primary} />
          <View style={styles.voucherDetails}>
            <Text style={styles.voucherName}>
              {voucher.voucher_name}
            </Text>
            <Text style={styles.voucherCode}>
              {voucher.voucher_code}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Section */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Remaining</Text>
          <Text style={styles.remainingAmount}>
            AED{" "}
            {remainingAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${usagePercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {usagePercentage.toFixed(0)}% used
          </Text>
        </View>

        <View style={styles.totalAmountRow}>
          <Text style={styles.totalLabel}>Total Value</Text>
          <Text style={styles.totalAmount}>
            AED{" "}
            {voucher.original_value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.colors.white,
    borderRadius: getWidthEquivalent(16),
    padding: getWidthEquivalent(20),
    marginHorizontal: getWidthEquivalent(20),
    marginVertical: getHeightEquivalent(8),
    shadowColor: colors.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.colors.border + "20",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeightEquivalent(16),
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(6),
  },
  dateText: {
    fontSize: fontEq(14),
    color: colors.colors.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(6),
    borderRadius: getWidthEquivalent(12),
  },
  statusText: {
    fontSize: fontEq(12),
    color: colors.colors.white,
    fontWeight: "600",
  },
  clientSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(8),
    marginBottom: getHeightEquivalent(16),
  },
  clientName: {
    fontSize: fontEq(16),
    color: colors.colors.text,
    fontWeight: "600",
  },
  voucherSection: {
    marginBottom: getHeightEquivalent(20),
  },
  voucherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(12),
  },
  voucherDetails: {
    flex: 1,
  },
  voucherName: {
    fontSize: fontEq(18),
    color: colors.colors.text,
    fontWeight: "700",
    marginBottom: getHeightEquivalent(4),
  },
  voucherCode: {
    fontSize: fontEq(14),
    color: colors.colors.primary,
    fontWeight: "500",
    letterSpacing: 1,
  },
  amountSection: {
    borderTopWidth: 1,
    borderTopColor: colors.colors.border + "30",
    paddingTop: getHeightEquivalent(16),
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeightEquivalent(12),
  },
  amountLabel: {
    fontSize: fontEq(14),
    color: colors.colors.textSecondary,
    fontWeight: "500",
  },
  remainingAmount: {
    fontSize: fontEq(18),
    color: colors.colors.success,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: getHeightEquivalent(16),
  },
  progressBackground: {
    height: getHeightEquivalent(8),
    backgroundColor: colors.colors.border + "30",
    borderRadius: getHeightEquivalent(4),
    overflow: "hidden",
    marginBottom: getHeightEquivalent(8),
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.colors.primary,
    borderRadius: getHeightEquivalent(4),
  },
  progressText: {
    fontSize: fontEq(12),
    color: colors.colors.textSecondary,
    textAlign: "right",
    fontWeight: "500",
  },
  totalAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fontEq(14),
    color: colors.colors.textSecondary,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: fontEq(16),
    color: colors.colors.text,
    fontWeight: "600",
  },
});

export default VoucherCard;