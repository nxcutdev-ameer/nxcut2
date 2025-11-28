import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { getWidthEquivalent, getHeightEquivalent } from '../Utils/helpers';
import { colors } from '../Constants/colors';

interface TimeGutterHeaderProps {
  headerHeight: number;
}

const TimeGutterHeader: React.FC<TimeGutterHeaderProps> = ({ headerHeight }) => {
  return (
    <View style={[styles.headerSpacing, { height: headerHeight }]} />
  );
};

const styles = StyleSheet.create({
  headerSpacing: {
    width: getWidthEquivalent(40),
    backgroundColor: colors.white,
    // borderRightWidth: 1,
    // borderRightColor: '#E0E0E0',
     borderBottomWidth: 3,
     borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 8,
  },
});

export default TimeGutterHeader;
