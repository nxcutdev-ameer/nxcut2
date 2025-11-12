import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { Calendar as CalendarPicker } from "react-native-calendars";
import { colors } from "../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../Utils/helpers";

interface DateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  title?: string;
  minDate?: string;
  maxDate?: string;
}

const DateModal: React.FC<DateModalProps> = ({
  isVisible,
  onClose,
  onSelectDate,
  selectedDate,
  title = "Select Date",
  minDate,
  maxDate,
}) => {
  const currentDate = selectedDate || new Date();
  
  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        {/* Drag Indicator */}
        <View style={styles.dragIndicator} />
        
        <Text style={styles.modalTitle}>{title}</Text>
        
        <CalendarPicker
          onDayPress={(day) => {
            const selected = new Date(day.dateString);
            onSelectDate(selected);
            onClose();
          }}
          markedDates={{
            [currentDate.toISOString().split("T")[0]]: {
              selected: true,
              selectedColor: colors.primary,
            },
          }}
          minDate={minDate}
          maxDate={maxDate}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.white,
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.white,
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            dotColor: colors.primary,
            selectedDotColor: colors.white,
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            indicatorColor: colors.primary,
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: getWidthEquivalent(20),
    borderTopRightRadius: getWidthEquivalent(20),
    paddingHorizontal: getWidthEquivalent(20),
    paddingBottom: getHeightEquivalent(30),
    maxHeight: "75%",
  },
  dragIndicator: {
    width: getWidthEquivalent(40),
    height: getHeightEquivalent(5),
    borderRadius: getWidthEquivalent(3),
    backgroundColor: colors.gray[300],
    alignSelf: "center",
    marginTop: getHeightEquivalent(10),
    marginBottom: getHeightEquivalent(20),
  },
  modalTitle: {
    fontSize: fontEq(20),
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: getHeightEquivalent(20),
  },
  buttonContainer: {
    marginTop: getHeightEquivalent(20),
    paddingHorizontal: getWidthEquivalent(16),
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
    paddingVertical: getHeightEquivalent(14),
    borderRadius: getWidthEquivalent(12),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.text,
  },
});

export default DateModal;
