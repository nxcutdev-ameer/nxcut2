import { StyleSheet } from "react-native";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import colors from "../../../Constants/colors";

const paint = colors.colors;

export const FilterScreenStyles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    height: "95%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    paddingTop: getHeightEquivalent(10),
  },
  header: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(20),
    borderBottomWidth: 1,
    borderBottomColor: paint.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: fontEq(20),
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
    paddingBottom: getHeightEquivalent(20),
  },
  section: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingTop: getHeightEquivalent(20),
    marginBottom: getHeightEquivalent(16),
  },
  sectionLabel: {
    fontSize: fontEq(14),
    fontWeight: "500",
    marginBottom: getHeightEquivalent(8),
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(14),
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: fontEq(14),
    fontWeight: "500",
  },
  dropdownMenu: {
    marginTop: getHeightEquivalent(8),
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: getHeightEquivalent(250),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: getHeightEquivalent(250),
  },
  dropdownOption: {
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    borderBottomWidth: 0.5,
    borderBottomColor: paint.border,
  },
  dropdownOptionText: {
    fontSize: fontEq(15),
  },
  dateInputsContainer: {
    flexDirection: "row",
    paddingHorizontal: getWidthEquivalent(20),
    paddingTop: getHeightEquivalent(16),
    gap: getWidthEquivalent(12),
    //marginBottom: getHeightEquivalent(6),
  },
  dateInputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: fontEq(14),
    fontWeight: "500",
    marginBottom: getHeightEquivalent(8),
  },
  dateInput: {
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(14),
    borderRadius: 12,
    borderWidth: 1,
    fontSize: fontEq(14),
    fontWeight: "500",
  },
  errorText: {
    fontSize: fontEq(12),
    fontWeight: "500",
    marginTop: getHeightEquivalent(4),
    marginLeft: getWidthEquivalent(4),
  },
  calendarSection: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingTop: getHeightEquivalent(16),
    marginBottom: getHeightEquivalent(16),
  },
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: getHeightEquivalent(18),
    paddingHorizontal: getWidthEquivalent(20),
  },
  datePickerButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePreviewColumn: {
    flex: 1,
    alignItems: "flex-start",
  },
  datePreviewLabel: {
    fontSize: fontEq(13),
    fontWeight: "500",
    marginBottom: getHeightEquivalent(6),
  },
  datePreviewValue: {
    fontSize: fontEq(16),
    fontWeight: "600",
  },
  datePreviewSeparator: {
    width: 1,
    height: getHeightEquivalent(40),
    backgroundColor: paint.border,
    marginHorizontal: getWidthEquivalent(18),
  },
  calendarSubHint: {
    fontSize: fontEq(12),
    textAlign: "center",
    marginTop: getHeightEquivalent(12),
    fontStyle: "italic",
  },
  calendarWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: paint.border,
    overflow: "hidden",
    backgroundColor: paint.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  calendarLabel: {
    fontSize: fontEq(16),
    fontWeight: "600",
    marginBottom: getHeightEquivalent(12),
  },
  calendarHint: {
    fontSize: fontEq(13),
    fontWeight: "500",
    marginBottom: getHeightEquivalent(12),
    textAlign: "center",
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(16),
    borderTopWidth: 1,
  },
  applyButton: {
    width: "100%",
    paddingVertical: getHeightEquivalent(16),
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: paint.white,
    fontSize: fontEq(16),
    fontWeight: "700",
  },
});
