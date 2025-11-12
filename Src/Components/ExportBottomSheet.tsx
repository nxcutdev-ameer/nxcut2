import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { FileText, Download, Grid3X3 } from 'lucide-react-native';
import colors from '../Constants/colors';
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from '../Utils/helpers';

interface ExportBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const ExportBottomSheet: React.FC<ExportBottomSheetProps> = ({
  visible,
  onClose,
  onExportCSV,
  onExportPDF,
  onExportExcel,
}) => {
  const { colors: paint } = colors;
  const screenHeight = Dimensions.get('window').height;

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 50) {
        onClose();
      }
    }
  };

  const exportOptions = [
    {
      title: 'Export as CSV',
      subtitle: 'Comma-separated values',
      icon: <FileText size={24} color={paint.primary} />,
      onPress: onExportCSV,
    },
    {
      title: 'Export as PDF',
      subtitle: 'Portable document format',
      icon: <FileText size={24} color={paint.danger} />,
      onPress: onExportPDF,
    },
    {
      title: 'Export as Excel',
      subtitle: 'Microsoft Excel format',
      icon: <Grid3X3 size={24} color={paint.success} />,
      onPress: onExportExcel,
    },
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
        <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
          <View style={[
            styles.bottomSheet,
            {
              backgroundColor: paint.white,
              height: screenHeight * 0.35,
            }
          ]}>
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: paint.border }]} />

            {/* Title */}
            <Text style={[styles.title, { color: paint.text }]}>
              Export Sales Report
            </Text>

            {/* Export Options */}
            <View style={styles.optionsContainer}>
              {exportOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, { borderBottomColor: paint.border }]}
                  onPress={() => {
                    option.onPress();
                    onClose();
                  }}
                >
                  <View style={styles.optionIcon}>
                    {option.icon}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: paint.text }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: paint.textSecondary }]}>
                      {option.subtitle}
                    </Text>
                  </View>
                  <Download size={20} color={paint.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </PanGestureHandler>
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
    paddingBottom: getHeightEquivalent(20),
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
    fontSize: fontEq(18),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: getHeightEquivalent(20),
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getHeightEquivalent(12),
    borderBottomWidth: 1,
  },
  optionIcon: {
    marginRight: getWidthEquivalent(15),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontEq(16),
    fontWeight: '500',
    marginBottom: getHeightEquivalent(2),
  },
  optionSubtitle: {
    fontSize: fontEq(12),
    fontWeight: '400',
  },
});

export default ExportBottomSheet;