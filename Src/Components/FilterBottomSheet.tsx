import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import colors from '../Constants/colors';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from '../Utils/helpers';

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  activeFilter: 7 | 30;
  onFilterSelect: (value: 7 | 30) => void;
  title: string;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  activeFilter,
  onFilterSelect,
  title,
}) => {
  const { colors: paint } = colors;

  const filterOptions = [
    { label: 'Last 7 days', value: 7 as const },
    { label: 'Last 30 days', value: 30 as const },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.bottomSheet, { backgroundColor: paint.white }]}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: paint.border }]} />

            {/* Title */}
            <Text style={[styles.title, { color: paint.text }]}>
              Filter {title}
            </Text>

            {/* Filter Options */}
            <View style={styles.optionsContainer}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    { borderColor: paint.border },
                    activeFilter === option.value && {
                      backgroundColor: paint.primary,
                      borderColor: paint.primary,
                    },
                  ]}
                  onPress={() => onFilterSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: paint.text },
                      activeFilter === option.value && {
                        color: paint.white,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: paint.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: paint.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    borderRadius: 20,
    paddingHorizontal: getWidthEquivalent(20),
    paddingBottom: getHeightEquivalent(30),
    paddingTop: getHeightEquivalent(10),
    minHeight: getHeightEquivalent(250),
    width: '90%',
    maxWidth: getWidthEquivalent(350),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handle: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(4),
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: getHeightEquivalent(20),
  },
  title: {
    fontSize: fontEq(20),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: getHeightEquivalent(25),
  },
  optionsContainer: {
    marginBottom: getHeightEquivalent(20),
  },
  option: {
    paddingVertical: getHeightEquivalent(15),
    paddingHorizontal: getWidthEquivalent(20),
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: getHeightEquivalent(10),
    alignItems: 'center',
  },
  optionText: {
    fontSize: fontEq(16),
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: getHeightEquivalent(15),
    paddingHorizontal: getWidthEquivalent(20),
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: getHeightEquivalent(10),
  },
  cancelText: {
    fontSize: fontEq(16),
    fontWeight: '500',
  },
});

export default FilterBottomSheet;