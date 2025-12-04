import { StyleSheet } from "react-native";
import { colors } from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(12),
    backgroundColor: colors.white,
    height: getHeightEquivalent(50),
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignSelf: "center",
    height: getHeightEquivalent(50),
    gap: getWidthEquivalent(10),
  },
  headerButton: {
    height: getHeightEquivalent(50),
    width: getHeightEquivalent(50),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderColor: colors.border,
    flexDirection: "row",
  },
  header: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(20),
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: fontEq(22),
    fontWeight: "700",
    color: colors.text,
    marginBottom: getHeightEquivalent(8),
  },
  subHeaderText: {
    fontSize: fontEq(14),
    color: colors.textSecondary,
    marginBottom: getHeightEquivalent(20),
    lineHeight: getHeightEquivalent(22),
  },
  headerActions: {
    flexDirection: "row",
    gap: getWidthEquivalent(12),
  },
  button: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(50),
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  buttonText: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: colors.text,
  },
  contentContainer: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    width: getWidthEquivalent(375),
    flexDirection: "row",
    backgroundColor: colors.white,
  },
  // Table Styles
  tableContainer: {
    flex: 1,
    width: getWidthEquivalent(375),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(20),
  },
  tableHeaderText: {
    fontSize: fontEq(16),
    fontWeight: "700",
    color: colors.text,
  },
  salesColumn: {
    flex: 2,
    textAlign: "center",
  },
  totalColumn: {
    flex: 1,
    textAlign: "center",
  },
  tableBody: {
    backgroundColor: colors.text,
    alignItems: "center", // no useb
    justifyContent: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: getHeightEquivalent(20),
    paddingHorizontal: getWidthEquivalent(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tableRowLast: {
    borderBottomWidth: 0,
    // borderBottomLeftRadius: getWidthEquivalent(12),
    //borderBottomRightRadius: getWidthEquivalent(12),
  },
  tableCellText: {
    fontSize: fontEq(13),
    fontWeight: "500",
    color: colors.text,
  },
  // Highlighted row styles for totals
  tableRowHighlighted: {
    backgroundColor: colors.primaryLight,
  },
  tableCellTextHighlighted: {
    fontSize: fontEq(13),
    fontWeight: "700",
    color: "#000000",
  },
  // Left-aligned text for fields column
  fieldCellTextLeft: {
    textAlign: "left",
    width: "100%",
    //alignSelf: "center",
  },
  // Indented row styles for sub-fields
  salesColumnIndented: {
    flex: 2,
    textAlign: "left",
    alignContent: "center",
    paddingLeft: getWidthEquivalent(12),
  },
  // Blue text for sub-fields
  tableCellTextBlue: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: "#007AFF",
    alignSelf: "center",
  },
  // Red text for specific fields
  tableCellTextRed: {
    fontSize: fontEq(14),
    fontWeight: "500",
    color: "#FF3B30",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(100),
  },
  loadingLottie: {
    width: getWidthEquivalent(150),
    height: getHeightEquivalent(150),
  },
  loadingText: {
    fontSize: fontEq(16),
    color: colors.textSecondary,
    marginTop: getHeightEquivalent(20),
    textAlign: "center",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: getWidthEquivalent(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontEq(20),
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    padding: getWidthEquivalent(8),
  },
  exportOptions: {
    paddingVertical: getHeightEquivalent(32),
    gap: getHeightEquivalent(16),
  },
  exportOption: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(12),
    padding: getWidthEquivalent(20),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportOptionTitle: {
    fontSize: fontEq(18),
    fontWeight: "600",
    color: colors.text,
    marginTop: getHeightEquivalent(12),
    marginBottom: getHeightEquivalent(4),
  },
  exportOptionDescription: {
    fontSize: fontEq(14),
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Daily breakdown table styles
  dailyBreakdownWrapper: {
    flex: 1,
    width: "100%",
    //backgroundColor: colors.text,
    flexDirection: "row",
    //paddingHorizontal: getWidthEquivalent(20),
  },
  dailyTableContainer: {
    backgroundColor: colors.background,
    marginTop: getHeightEquivalent(20),
    borderRadius: getWidthEquivalent(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    // height: getHeightEquivalent(500),
  },
  dailyTableHeaderScroll: {
    maxHeight: getHeightEquivalent(60),
  },
  dailyTableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    borderTopLeftRadius: getWidthEquivalent(12),
    borderTopRightRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
  },
  dailyTableBodyHorizontal: {
    flex: 1,
  },
  dailyTableBody: {
    backgroundColor: colors.background,
    flex: 1,
  },
  dailyTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  dailyTableCell: {
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(8),
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  fieldLabelColumn: {
    width: getWidthEquivalent(200),
    backgroundColor: colors.backgroundSecondary,
  },
  dayColumn: {
    width: getWidthEquivalent(120),
    minWidth: getWidthEquivalent(120),
  },
  dailyAmountText: {
    textAlign: "center",
    fontSize: fontEq(13),
  },
  // Sticky table styles
  stickyTableContainer: {
    backgroundColor: colors.white,
    // borderColor: colors.border,
    flex: 1,
    width: "100%",
    height: getHeightEquivalent(500),
  },
  stickyTableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    // borderTopLeftRadius: getWidthEquivalent(12),
    //borderTopRightRadius: getWidthEquivalent(12),
    height: getHeightEquivalent(48),
  },
  stickyTableHeaderCell: {
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(8),

    justifyContent: "center",
    alignItems: "center",
  },
  stickyTableBody: {
    backgroundColor: colors.background,
    flex: 1,
  },
  stickyTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    minHeight: getHeightEquivalent(48),
  },
  stickyTableRowCell: {
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(8),
    justifyContent: "center",
  },
  stickyFieldColumn: {
    width: getWidthEquivalent(200),
    backgroundColor: colors.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  stickyTableCell: {
    paddingVertical: getHeightEquivalent(12),
    paddingHorizontal: getWidthEquivalent(8),
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    minHeight: getHeightEquivalent(48),
  },
  scrollableColumnsContainer: {
    flex: 1,
  },
  stickyTableWrapper: {
    flexDirection: "row",
    flex: 1,
  },
  fixedFieldsColumn: {
    width: getWidthEquivalent(200),
    backgroundColor: colors.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    flexDirection: "column",
  },
  scrollableSection: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "red",
  },
  scrollableHeader: {
    backgroundColor: colors.primaryLight,
    height: getHeightEquivalent(48),
  },
  scrollableTableBody: {
    flex: 1,
  },
  scrollableTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: getHeightEquivalent(48),
  },
  scrollableHeaderContent: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
  },
  // New table structure styles
  mainTableScrollView: {
    flex: 1,
  },
  mainTableScrollContent: {
    flexDirection: "row",
    minHeight: "100%",
  },
  fieldHeaderCell: {
    width: getWidthEquivalent(250),
    height: getHeightEquivalent(48),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(16),
  },
  fieldRowCell: {
    width: getWidthEquivalent(250),
    height: getHeightEquivalent(48),
    //backgroundColor: colors.text,     /////field row cell
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    // borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(14),
  },
  horizontalScrollContainer: {
    flex: 1,
  },
  scrollableColumnsWrapper: {
    flex: 1,
    flexDirection: "column",
  },
  scrollableHeaderRow: {
    flexDirection: "row",
    height: getHeightEquivalent(48),
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollableHeaderCell: {
    height: getHeightEquivalent(48),
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(8),
  },
  scrollableDataRow: {
    flexDirection: "row",
    height: getHeightEquivalent(48),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollableDataCell: {
    height: getHeightEquivalent(48),
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(8),
  },
  // Additional styles for improved table structure
  tableHeaderRow: {
    flexDirection: "row",
    height: getHeightEquivalent(48),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerScrollView: {
    flex: 1,
  },
  tableBodyContainer: {
    flex: 1,
  },
  verticalScrollView: {
    flex: 1,
  },
  tableBodyContent: {
    flexDirection: "row",
  },
  fixedFieldsBody: {
    width: getWidthEquivalent(250),
    flexDirection: "column",
  },
  dataScrollView: {
    flex: 1,
  },
  scrollableDataBody: {
    flexDirection: "column",
  },
  // New proper table structure styles
  overallVerticalScroll: {
    flex: 1,
    //  borderWidth:3
  },
  tableMainWrapper: {
    flexDirection: "row",
  },
  fixedFieldsContainer: {
    width: getWidthEquivalent(250),
    flexDirection: "column",
    backgroundColor: colors.white,
    borderRightWidth: 1, ///want -rightBorder for field column update here
    borderRightColor: colors.border,
  },
  scrollableDataContainer: {
    flex: 1,
  },
  horizontalScrollView: {
    flex: 1,
  },
  scrollableDataWrapper: {
    flexDirection: "column",
  },
  scrollableHeadersContainer: {
    flexDirection: "row",
    height: getHeightEquivalent(48),
    //backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollableDataRowsContainer: {
    flexDirection: "column",
  },
});
