import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getWidthEquivalent } from '../Utils/helpers';
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#00000079',
    shadowOffset: {
      width: -7,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
});

export default TimeGutterHeader;
