import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import colors from '../Constants/colors';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from '../Utils/helpers';

interface SalePaymentMethod {
  payment_method: string;
  amount: number;
  sales: {
    id: number;
    location_id: string;
    created_at: string;
    tip_amount: number;
  };
  adjustedTipAmount?: number;
  isTipTransaction?: boolean;
}

interface CashMovementSummaryProps {
  data: SalePaymentMethod[];
}

const CashMovementSummary: React.FC<CashMovementSummaryProps> = ({ data }) => {
  const { colors: paint } = colors;

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const calculateSummary = () => {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const totalTips = data.reduce((sum, item) => sum + (item.adjustedTipAmount || 0), 0);
    const grandTotal = totalAmount + totalTips;

    return { totalAmount, totalTips, grandTotal };
  };

  const calculateCashMovement = () => {
    const paymentTypes: { [key: string]: number } = {};

    data.forEach(item => {
      const paymentMethod = item.payment_method;
      const totalAmount = item.amount + (item.adjustedTipAmount || 0);

      if (paymentTypes[paymentMethod]) {
        paymentTypes[paymentMethod] += totalAmount;
      } else {
        paymentTypes[paymentMethod] = totalAmount;
      }
    });

    return paymentTypes;
  };

  if (data.length === 0) {
    return (
      <View style={[styles.cashMovementContainer, { backgroundColor: paint.surface }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: paint.textSecondary }]}>
            No cash movement data available for this date
          </Text>
        </View>
      </View>
    );
  }

  const paymentTypes = calculateCashMovement();
  const { totalTips, grandTotal } = calculateSummary();

  return (
    <View style={[styles.cashMovementContainer, { backgroundColor: paint.surface }]}>
      <Text style={[styles.cashMovementTitle, { color: paint.text }]}>
        Cash Movement Summary
      </Text>

      {/* Payment Types Table */}
      <View style={styles.cashMovementTable}>
        <View style={[styles.cashMovementHeader, { backgroundColor: paint.backgroundSecondary }]}>
          <Text style={[styles.cashMovementHeaderText, { color: paint.text }]}>
            Payment Type
          </Text>
          <Text style={[styles.cashMovementHeaderText, { color: paint.text }]}>
            Payment Collected
          </Text>
        </View>

        {Object.entries(paymentTypes)
          .sort(([, amountA], [, amountB]) => amountB - amountA)
          .map(([paymentType, amount], i) => (
            <View
              key={paymentType}
              style={[
                styles.cashMovementRow,
                { borderBottomColor: paint.border },
                Object.entries(paymentTypes).length - 1 === i && {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <Text style={[styles.cashMovementCell, { color: paint.text }]}>
                {paymentType}
              </Text>
              <Text style={[styles.cashMovementCell, { color: paint.text }]}>
                {formatCurrency(amount)}
              </Text>
            </View>
          ))}
      </View>

      {/* Total Section */}
      <View style={[styles.cashMovementTotals, { borderTopColor: paint.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, styles.totalLabel, { color: paint.text }]}>
            Overall Payments Collected:
          </Text>
          <Text style={[styles.summaryValue, styles.totalValue, { color: paint.primary }]}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: paint.textSecondary }]}>
            Of which Tips:
          </Text>
          <Text style={[styles.summaryValue, { color: paint.success }]}>
            {formatCurrency(totalTips)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cashMovementContainer: {
    marginTop: getHeightEquivalent(16),
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(16),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cashMovementTitle: {
    fontSize: fontEq(18),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: getHeightEquivalent(16),
  },
  cashMovementTable: {
    marginBottom: getHeightEquivalent(6),
  },
  cashMovementHeader: {
    flexDirection: 'row',
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
    borderRadius: 8,
    marginBottom: getHeightEquivalent(8),
  },
  cashMovementHeaderText: {
    flex: 1,
    fontSize: fontEq(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  cashMovementRow: {
    flexDirection: 'row',
    paddingVertical: getHeightEquivalent(10),
    paddingHorizontal: getWidthEquivalent(16),
    borderBottomWidth: 1,
  },
  cashMovementCell: {
    flex: 1,
    fontSize: fontEq(14),
    textAlign: 'center',
    fontWeight: '500',
  },
  cashMovementTotals: {
    borderTopWidth: 2,
    paddingTop: getHeightEquivalent(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getHeightEquivalent(4),
  },
  summaryLabel: {
    fontSize: fontEq(14),
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: fontEq(14),
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: fontEq(16),
    fontWeight: '700',
  },
  totalValue: {
    fontSize: fontEq(16),
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontEq(16),
    fontStyle: 'italic',
  },
});

export default CashMovementSummary;