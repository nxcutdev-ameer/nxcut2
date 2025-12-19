import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
  Platform,
} from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';
import colors from '../Constants/colors';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from '../Utils/helpers';

interface StaffPerformanceFilterProps {
  searchText: string;
  selectedMonth: number;
  selectedYear: number;
  onSearchChange: (text: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const StaffPerformanceFilter: React.FC<StaffPerformanceFilterProps> = ({
  searchText,
  selectedMonth,
  selectedYear,
  onSearchChange,
  onMonthChange,
  onYearChange,
}) => {
  const { colors: paint } = colors;

  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  // Generate months array
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Generate years array (2020-2025)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const getMonthName = (monthNumber: number) => {
    return months.find(m => m.value === monthNumber)?.label || '';
  };

  const DropdownModal = ({
    visible,
    onClose,
    data,
    selectedValue,
    onSelect,
    title
  }: {
    visible: boolean;
    onClose: () => void;
    data: { value: number; label: string }[];
    selectedValue: number;
    onSelect: (value: number) => void;
    title: string;
  }) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalOverlayTouchable}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { backgroundColor: paint.white }]}>
          <Text style={[styles.modalTitle, { color: paint.text }]}>
            Select {title}
          </Text>
          <ScrollView style={styles.modalScrollView}>
            {data.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.modalOption,
                  { borderColor: paint.border },
                  selectedValue === item.value && {
                    backgroundColor: paint.primary,
                    borderColor: paint.primary,
                  },
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: paint.text },
                    selectedValue === item.value && { color: paint.white },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderColor: paint.border }]}>
        <Search size={20} color={paint.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: paint.text }]}
          placeholder="Search staff by name..."
          placeholderTextColor={paint.textSecondary}
          value={searchText}
          onChangeText={onSearchChange}
        />
      </View>

      {/* Date Filters */}
      <View style={styles.dateFiltersContainer}>
        {/* Month Dropdown */}
        <TouchableOpacity
          style={[styles.dropdown, { borderColor: paint.border }]}
          onPress={() => setShowMonthModal(true)}
        >
          <Text style={[styles.dropdownText, { color: paint.text }]}>
            {getMonthName(selectedMonth)}
          </Text>
          <ChevronDown size={20} color={paint.textSecondary} />
        </TouchableOpacity>

        {/* Year Dropdown */}
        <TouchableOpacity
          style={[styles.dropdown, { borderColor: paint.border }]}
          onPress={() => setShowYearModal(true)}
        >
          <Text style={[styles.dropdownText, { color: paint.text }]}>
            {selectedYear}
          </Text>
          <ChevronDown size={20} color={paint.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Month Modal */}
      <DropdownModal
        visible={showMonthModal}
        onClose={() => setShowMonthModal(false)}
        data={months}
        selectedValue={selectedMonth}
        onSelect={onMonthChange}
        title="Month"
      />

      {/* Year Modal */}
      <DropdownModal
        visible={showYearModal}
        onClose={() => setShowYearModal(false)}
        data={years.map(year => ({ value: year, label: year.toString() }))}
        selectedValue={selectedYear}
        onSelect={onYearChange}
        title="Year"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getHeightEquivalent(15),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(10),
    marginBottom: getHeightEquivalent(10),
  },
  searchInput: {
    flex: 1,
    marginLeft: getWidthEquivalent(8),
    fontSize:Platform.OS === 'android' ?fontEq(10): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '500',
  },
  dateFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: getWidthEquivalent(10),
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(12),
  },
  dropdownText: {
       fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderRadius: 15,
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(20),
    width: '80%',
    maxWidth: getWidthEquivalent(300),
    maxHeight: getHeightEquivalent(400),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(16): fontEq(18),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: getHeightEquivalent(15),
  },
  modalScrollView: {
    maxHeight: getHeightEquivalent(300),
  },
  modalOption: {
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(15),
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: getHeightEquivalent(8),
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize:Platform.OS === 'android' ?fontEq(12): fontEq(14),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : undefined,
    fontWeight: '500',
  },
});

export default StaffPerformanceFilter;