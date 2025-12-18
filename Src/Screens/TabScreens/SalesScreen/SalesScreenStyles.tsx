import { Platform, StyleSheet } from "react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

const paint = colors.colors;
export const SalesScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: paint.background,
  },
  headerContainer: {
    height: getHeightEquivalent(50),
    width: '100%',
    backgroundColor: paint.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: getWidthEquivalent(16),
  },
  //   height: getHeightEquivalent(60),
  //   width: "100%",
  //   borderColor: paint.border,
  //   backgroundColor: paint.background,
  //   alignItems: "center",
  //   flexDirection: "row",
  //   justifyContent: 'space-between',
  //   paddingLeft: getWidthEquivalent(20),
  //   paddingRight: getWidthEquivalent(20),
  // },
  profileButton: {
    width: getWidthEquivalent(38),
    height: getWidthEquivalent(38),
    borderRadius: getWidthEquivalent(50),
    backgroundColor: paint.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getWidthEquivalent(8),
  },
  headerTitle: {
   fontSize:Platform.OS === 'android' ?fontEq(14): fontEq(16),
     fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "600",
    color: paint.primary,
    alignSelf: "center",
  },
  headerButton: {
    width: getWidthEquivalent(40),
    height: getWidthEquivalent(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: getWidthEquivalent(20),
    marginRight: getWidthEquivalent(10),
  },
  // Backward-compat alias used by SalesScreen.tsx
  headerNotification: {
    width: getWidthEquivalent(40),
    height: getWidthEquivalent(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: getWidthEquivalent(20),
  },
  notificationBadge: {
    position: 'absolute',
    top: getHeightEquivalent(6),
    right: getWidthEquivalent(8),
    width: getWidthEquivalent(11),
    height: getWidthEquivalent(11),
    borderRadius: getWidthEquivalent(11) / 2,
    backgroundColor: paint.danger || '#FF4444',
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: paint.background,
    paddingHorizontal: getWidthEquivalent(20),
  },
  bodyTitle: {
    fontSize:Platform.OS === 'android' ?fontEq(20): fontEq(26),
    fontFamily: Platform.OS === 'android' ? 'sans-serif-condensed' : 'Helvetica',
    fontWeight: "700",
    color: paint.black,
    marginLeft: getWidthEquivalent(8),
    marginTop: getHeightEquivalent(15),
    // lineHeight: getHeightEquivalent(28),
    marginBottom: getHeightEquivalent(12),
  },
});
