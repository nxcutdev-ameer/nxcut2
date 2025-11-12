import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import colors from '../Constants/colors';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from '../Utils/helpers';

interface SaleItem {
  item_type: string;
  total_price: number;
  sales: {
    id: number;
    location_id: string;
    created_at: string;
  };
}

interface SaleItemSummaryProps {
  data: SaleItem[];
  loading: boolean;
}

const SaleItemSummary: React.FC<SaleItemSummaryProps> = ({ data, loading }) => {
  const { colors: paint } = colors;

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const aggregateItemData = () => {
    const itemSummary: { [key: string]: { quantity: number; total: number } } = {};

    // Sort sale items by time before processing
    const sortedData = [...data].sort((a, b) =>
      new Date(a.sales.created_at).getTime() - new Date(b.sales.created_at).getTime()
    );

    sortedData.forEach(item => {
      const itemType = item.item_type;

      if (itemSummary[itemType]) {
        itemSummary[itemType].quantity += 1;
        itemSummary[itemType].total += item.total_price;
      } else {
        itemSummary[itemType] = {
          quantity: 1,
          total: item.total_price
        };
      }
    });

    return itemSummary;
  };

  const renderTableHeader = () => (
    <View style={[styles.tableRow, styles.headerRow, { backgroundColor: paint.backgroundSecondary }]}>
      <Text style={[styles.headerCell, styles.itemTypeColumn, { color: paint.text }]}>
        Item Type
      </Text>
      <Text style={[styles.headerCell, styles.quantityColumn, { color: paint.text }]}>
        Sales Qty
      </Text>
      <Text style={[styles.headerCell, styles.totalColumn, { color: paint.text }]}>
        Gross Total
      </Text>
    </View>
  );

  const renderTableRow = (itemType: string, data: { quantity: number; total: number }, index: number) => (
    <View key={itemType} style={[styles.tableRow, { borderBottomColor: paint.border }]}>
      <Text style={[styles.cell, styles.itemTypeColumn, { color: paint.text }]}>
        {itemType}
      </Text>
      <Text style={[styles.cell, styles.quantityColumn, { color: paint.text }]}>
        {data.quantity}
      </Text>
      <Text style={[styles.cell, styles.totalColumn, { color: paint.text, fontWeight: '600' }]}>
        {formatCurrency(data.total)}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: paint.textSecondary }]}>
        No sale items found for this date
      </Text>
    </View>
  );

  const calculateGrandTotal = () => {
    return data.reduce((sum, item) => sum + item.total_price, 0);
  };

  const renderSummary = () => {
    if (data.length === 0) return null;

    const grandTotal = calculateGrandTotal();
    const totalItems = data.length;

    return (
      <View style={[styles.summaryContainer, { backgroundColor: paint.backgroundSecondary }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: paint.text }]}>
            Total Items Sold: {totalItems}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.summaryLabel, styles.totalLabel, { color: paint.text }]}>
            Grand Total:
          </Text>
          <Text style={[styles.summaryValue, styles.totalValue, { color: paint.primary }]}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paint.primary} />
        <Text style={[styles.loadingText, { color: paint.textSecondary }]}>
          Loading sale items...
        </Text>
      </View>
    );
  }

  const aggregatedData = aggregateItemData();

  return (
    <View style={styles.container}>
      {renderTableHeader()}
      {Object.keys(aggregatedData).length === 0 ? (
        renderEmptyState()
      ) : (
        Object.entries(aggregatedData).map(([itemType, itemData], index) =>
          renderTableRow(itemType, itemData, index)
        )
      )}
      {renderSummary()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: getHeightEquivalent(16),
    marginBottom: getHeightEquivalent(16),
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerRow: {
    borderBottomWidth: 2,
  },
  headerCell: {
    fontSize: fontEq(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  cell: {
    fontSize: fontEq(13),
    textAlign: 'center',
  },
  itemTypeColumn: {
    flex: 2,
    textAlign: 'left',
  },
  quantityColumn: {
    flex: 1,
  },
  totalColumn: {
    flex: 1.5,
    textAlign: 'right',
  },
  emptyState: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontEq(16),
    fontStyle: 'italic',
  },
  loadingContainer: {
    paddingVertical: getHeightEquivalent(40),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontEq(16),
    marginTop: getHeightEquivalent(12),
  },
  summaryContainer: {
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(16),
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
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
  totalRow: {
    marginTop: getHeightEquivalent(8),
    paddingTop: getHeightEquivalent(8),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: fontEq(16),
    fontWeight: '700',
  },
  totalValue: {
    fontSize: fontEq(16),
    fontWeight: '700',
  },
});

export default SaleItemSummary;