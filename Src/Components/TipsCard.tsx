import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DollarSign, Calendar, User, CreditCard } from "lucide-react-native";
import colors from "../Constants/colors";
import { SaleTipBO } from "../Repository/teamRepository";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";

interface TipsCardProps {
  tip: SaleTipBO;
}

const TipsCard: React.FC<TipsCardProps> = ({ tip }) => {
  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get payment method color
  const getPaymentMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case "card":
        return colors.colors.primary;
      case "cash":
        return colors.colors.success;
      default:
        return colors.colors.textSecondary;
    }
  };

  // Format payment method display
  const formatPaymentMethod = (method: string) => {
    return method?.charAt(0).toUpperCase() + method?.slice(1) || "N/A";
  };

  return (
    <View style={styles.card}>
      {/* Header Section with Tip ID and Date */}
      <View style={styles.header}>
        <View style={styles.tipIdContainer}>
          <Text style={styles.tipIdLabel}>Tip ID</Text>
          <Text style={styles.tipId}>{tip.sale_id}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={colors.colors.textSecondary} />
          <Text style={styles.dateText}>{formatDateTime(tip.created_at)}</Text>
        </View>
      </View>

      {/* Staff Member Section */}
      <View style={styles.staffSection}>
        <User size={18} color={colors.colors.textSecondary} />
        <Text style={styles.staffName}>
          {tip.team_members.first_name} {tip.team_members.last_name}
        </Text>
      </View>

      {/* Tip Amount Section */}
      <View style={styles.tipSection}>
        <View style={styles.tipInfo}>
          <DollarSign size={20} color={colors.colors.success} />
          <View style={styles.tipDetails}>
            <Text style={styles.tipLabel}>Tip Amount</Text>
            <Text style={styles.tipAmount}>
              AED{" "}
              {tip.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>

      {/* Payment & Total Section */}
      <View style={styles.bottomSection}>
        <View style={styles.paymentRow}>
          <View style={styles.paymentMethod}>
            <CreditCard
              size={16}
              color={getPaymentMethodColor(tip.payment_method_tip)}
            />
            <Text
              style={[
                styles.paymentText,
                { color: getPaymentMethodColor(tip.payment_method_tip) },
              ]}
            >
              {formatPaymentMethod(tip.payment_method_tip)}
            </Text>
          </View>
          <View style={styles.totalAmount}>
            <Text style={styles.totalLabel}>Sale Total</Text>
            <Text style={styles.totalValue}>
              AED{" "}
              {tip.sales.total_amount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
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
  tipIdContainer: {
    flexDirection: "column",
  },
  tipIdLabel: {
    fontSize: fontEq(12),
    color: colors.colors.textSecondary,
    fontWeight: "500",
    marginBottom: 2,
  },
  tipId: {
    fontSize: fontEq(16),
    color: colors.colors.text,
    fontWeight: "600",
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
  staffSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(8),
    marginBottom: getHeightEquivalent(16),
  },
  staffName: {
    fontSize: fontEq(16),
    color: colors.colors.text,
    fontWeight: "600",
  },
  tipSection: {
    marginBottom: getHeightEquivalent(20),
  },
  tipInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(12),
  },
  tipDetails: {
    flex: 1,
  },
  tipLabel: {
    fontSize: fontEq(14),
    color: colors.colors.textSecondary,
    fontWeight: "500",
    marginBottom: getHeightEquivalent(4),
  },
  tipAmount: {
    fontSize: fontEq(24),
    color: colors.colors.success,
    fontWeight: "700",
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: colors.colors.border + "30",
    paddingTop: getHeightEquivalent(16),
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: getWidthEquivalent(6),
  },
  paymentText: {
    fontSize: fontEq(14),
    fontWeight: "600",
    textTransform: "capitalize",
  },
  totalAmount: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: fontEq(12),
    color: colors.colors.textSecondary,
    fontWeight: "500",
    marginBottom: 2,
  },
  totalValue: {
    fontSize: fontEq(16),
    color: colors.colors.text,
    fontWeight: "600",
  },
});

export default TipsCard;
