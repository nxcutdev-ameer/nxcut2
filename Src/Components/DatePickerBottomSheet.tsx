import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import colors from '../Constants/colors';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from '../Utils/helpers';

interface DatePickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  onDateSelect: (date: Date) => void;
  title?: string;
}

const DatePickerBottomSheet: React.FC<DatePickerBottomSheetProps> = ({
  visible,
  onClose,
  date,
  onDateSelect,
  title = 'Select Date',
}) => {
  const { colors: paint } = colors;
  const screenHeight = Dimensions.get('window').height;

  const onConfirmDate = (params: any) => {
    onDateSelect(params.date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[
          styles.bottomSheet,
          {
            backgroundColor: paint.white,
            height: screenHeight * 0.5,
          }
        ]}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: paint.border }]} />

            {/* Title */}
            <Text style={[styles.title, { color: paint.text }]}>
              {title}
            </Text>

            {/* Date Picker Container */}
            <View style={styles.datePickerContainer}>
              <DatePickerModal
                locale="en"
                mode="single"
                visible={true}
                onDismiss={() => {}}
                date={date}
                onConfirm={onConfirmDate}
                presentationStyle="pageSheet"
              />
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: getWidthEquivalent(20),
    paddingBottom: getHeightEquivalent(30),
    paddingTop: getHeightEquivalent(10),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
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
  datePickerContainer: {
    flex: 1,
    marginBottom: getHeightEquivalent(20),
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

export default DatePickerBottomSheet;