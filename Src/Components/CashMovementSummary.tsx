import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
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

interface CashMovementItem {
  payment_type: string;
  payment_collected: number;
}

interface CashMovementSummaryProps {
  data: SalePaymentMethod[] | CashMovementItem[];
  totalTips?: number;
  grandTotal?: number;
}

const CashMovementSummary: React.FC<CashMovementSummaryProps> = ({ 
  data, 
  totalTips = 0, 
  grandTotal = 0 
}) => {
  const { colors: paint } = colors;

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const calculateSummary = () => {
    // Check if data is from RPC function (has payment_type) or old structure (has payment_method)
    const isRPCData = data.length > 0 && 'payment_type' in data[0];
    
    if (isRPCData) {
      const rpcData = data as CashMovementItem[];
      const grandTotal = rpcData.reduce((sum, item) => sum + item.payment_collected, 0);
      return { totalAmount: grandTotal, totalTips: 0, grandTotal };
    } else {
      const oldData = data as SalePaymentMethod[];
      const totalAmount = oldData.reduce((sum, item) => sum + item.amount, 0);
      const totalTips = oldData.reduce((sum, item) => sum + (item.adjustedTipAmount || 0), 0);
      const grandTotal = totalAmount + totalTips;
      return { totalAmount, totalTips, grandTotal };
    }
  };

  const calculateCashMovement = () => {
    const paymentTypes: { [key: string]: number } = {};

    // Check if data is from RPC function (has payment_type) or old structure (has payment_method)
    const isRPCData = data.length > 0 && 'payment_type' in data[0];

    if (isRPCData) {
      // Data from RPC function
      const rpcData = data as CashMovementItem[];
      rpcData.forEach(item => {
        if (item.payment_type && item.payment_collected > 0) {
          paymentTypes[item.payment_type] = item.payment_collected;
        }
      });
    } else {
      // Old data structure
      const oldData = data as SalePaymentMethod[];
      oldData.forEach(item => {
        const paymentMethod = item.payment_method;
        const totalAmount = item.amount;

        if (paymentTypes[paymentMethod]) {
          paymentTypes[paymentMethod] += totalAmount;
        } else {
          paymentTypes[paymentMethod] = totalAmount;
        }
      });
    }

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
  
  // Use props if provided (from parent with RPC data), otherwise calculate from data
  const displayTotalTips = totalTips > 0 ? totalTips : calculateSummary().totalTips;
  const displayGrandTotal = grandTotal > 0 ? grandTotal : calculateSummary().grandTotal;

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
            {formatCurrency(displayGrandTotal)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: paint.textSecondary }]}>
            Of which Tips:
          </Text>
          <Text style={[styles.summaryValue, { color: paint.success }]}>
            {formatCurrency(displayTotalTips)}
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
    fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(18),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
      fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
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
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '700',
  },
  totalValue: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(16),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontStyle: 'italic',
  },
});

export default CashMovementSummary;