import { StyleSheet } from "react-native";
import { colors } from "../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../Utils/helpers";
//import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
//import { BorderColor } from "../../../node_modules/lightningcss/node/ast.d";

export const LocationScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    //justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeightEquivalent(16), // 16,
    paddingHorizontal: getWidthEquivalent(16), //16,
    paddingVertical: getHeightEquivalent(16), //16,
    // borderWidth: 1,

    // borderColor: colors.border,
  },
  hederText: {
    fontSize: fontEq(25),
    fontWeight: "bold",
    color: colors.text,
  },
  subHeaderText: {
    marginTop: getHeightEquivalent(15),
    fontSize: fontEq(14),
    color: colors.textSecondary,
    marginBottom: getHeightEquivalent(8),
    textAlign: "center",
  },
  locationItem: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentLocationItem: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.borderFocus,
  },
  locationText: {
    fontSize: fontEq(18),
    color: colors.text,
    fontWeight: "700",
    marginBottom: getHeightEquivalent(10),
  },
  locationIDText: {
    fontSize: fontEq(12),
    color: colors.textSecondary,
    fontWeight: "500",
    // marginBottom: getHeightEquivalent(10),
  },
  currentLocationText: {
    // color: colors.,
    //fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: fontEq(18),
    fontWeight: "bold",
    color: colors.white,
  },
  buttonTextDisabled: {
    color: colors.gray[500],
  },
  
  // Modern card-based location styles
  LocationCard: {
    marginHorizontal: getWidthEquivalent(20),
    marginVertical: getHeightEquivalent(10),
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  LocationCardSelected: {
    borderColor: colors.primary,
    elevation: 8,
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  locationImageBackground: {
    width: '100%',
    height: getHeightEquivalent(180),
    justifyContent: 'flex-end',
  },
  locationImage: {
    borderRadius: 14,
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: getWidthEquivalent(20),
  },
  locationNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  LocationText: {
    fontSize: fontEq(20),
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  locationDateText: {
    fontSize: fontEq(12),
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: getHeightEquivalent(4),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(6),
    borderRadius: 20,
    marginLeft: getWidthEquivalent(10),
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: fontEq(12),
    fontWeight: '600',
  },
  
  // Placeholder styles for locations without images
  locationPlaceholder: {
    width: '100%',
    height: getHeightEquivalent(180),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: getWidthEquivalent(20),
  },
  locationPlaceholderSelected: {
    backgroundColor: colors.primaryLight || colors.backgroundSecondary,
  },
  placeholderIcon: {
    width: getWidthEquivalent(70),
    height: getWidthEquivalent(70),
    borderRadius: getWidthEquivalent(35),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getHeightEquivalent(15),
  },
  placeholderIconText: {
    fontSize: fontEq(32),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholderTextContainer: {
    alignItems: 'center',
    marginTop: getHeightEquivalent(8),
  },
  placeholderLocationText: {
    fontSize: fontEq(20),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  placeholderLocationTextSelected: {
    color: colors.primary,
  },
  placeholderDateText: {
    fontSize: fontEq(12),
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: getHeightEquivalent(4),
  },
  placeholderDateTextSelected: {
    color: colors.primary,
    opacity: 0.8,
  },
});
