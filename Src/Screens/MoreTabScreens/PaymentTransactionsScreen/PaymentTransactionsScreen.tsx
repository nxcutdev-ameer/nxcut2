import React, {
  FC,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { useReportStore } from "../../../Store/useReportsStore";
import { colors } from "../../../Constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";
import {
  ChevronLeft,
  EllipsisVertical,
  FileArchive,
  FileSpreadsheet,
  FileText,
  SlidersVertical,
  Star,
  X,
} from "lucide-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import SelectPeriodModal from "../../../Components/SelectPeriodModal";
import LottieView from "lottie-react-native";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { paymentRepository } from "../../../Repository/paymentsRepository";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { RootStackParamList } from "../../../Navigations/RootStackNavigator";
import { Dimensions } from "react-native";

export const PaymentTransactionsScreen = () => {
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const {
    paymentTransactions,
    loading,
    fetchPayments,
    paymentTransactionFilter,
    setFilter,
    resetPaymentFilter,
  } = useReportStore();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Fetch on first render with default filter
  useEffect(() => {
    fetchPayments();
    // console.log("paymentTransactions", paymentTransactions);
  }, [paymentTransactionFilter, fetchPayments]);

  useEffect(() => {
    return () => {
      resetPaymentFilter();
    };
  }, [resetPaymentFilter]);
  // const bottomsheetContent: FC = (): ReactElement => {
  //   return (
  //     <View>
  //       <Text>Bottom Sheet Content</Text>
  //     </View>
  //   );
  // };
  // Format date
  const formatDateRangeLabel = (from?: string, to?: string) => {
    if (!from || !to) {
      return "Select Period";
    }

    const start = new Date(from);
    const end = new Date(to);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Select Period";
    }

    const dateFormatter: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };

    const startText = start.toLocaleDateString("en-US", dateFormatter);
    const endText = end.toLocaleDateString("en-US", dateFormatter);

    if (startText === endText) {
      return startText;
    }

    return `${startText} - ${endText}`;
  };

  const selectedPeriodLabel = useMemo(
    () =>
      formatDateRangeLabel(
        paymentTransactionFilter?.fromDate,
        paymentTransactionFilter?.toDate
      ),
    [paymentTransactionFilter?.fromDate, paymentTransactionFilter?.toDate]
  );

  const formatDateTime = useCallback((dateString: string) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return "-";

      const day = date.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12

      return `${day} ${month} ${year}, ${hours}:${minutes}${ampm}`;
    } catch (error) {
      return "-";
    }
  }, []);
  const formatDataForExport = useCallback(() => {
    return paymentTransactions.map((item) => ({
      "Sale No.": item.sale_id || "",
      "Payment Date": formatDateTime(item.created_at),
      "Sale Date": formatDateTime(item.created_at),
      Client: item.sale?.client?.first_name || "",
      Location: item.sale?.location?.name || "",
      "Team Member":
        item.sale?.appointment?.appointment_services &&
        item.sale.appointment.appointment_services.length > 0
          ? item.sale.appointment.appointment_services
              .map(
                (service: { staff: { first_name: any } }) =>
                  service.staff?.first_name
              )
              .filter(Boolean)
              .join(", ")
          : "No staff assigned",
      "Transaction Type": "Sales",
      "Payment Method": item.payment_method || "",
      Amount: item.amount || "",
    }));
  }, [formatDateTime, paymentTransactions]);

  const generateCSV = (data: any[]) => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => `"${String(row[header]).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    return csvContent;
  };

  const generateHTML = (data: any[]) => {
    if (data.length === 0)
      return "<html><body><p>No data available</p></body></html>";

    const headers = Object.keys(data[0]);
    const tableRows = data
      .map(
        (row) =>
          `<tr>${headers
            .map(
              (header) =>
                `<td style="border: 1px solid #ddd; padding: 8px;">${row[header]}</td>`
            )
            .join("")}</tr>`
      )
      .join("");

    return `
      <html>
        <head>
          <title>Payment Transactions Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #f2f2f2; border: 1px solid #ddd; padding: 12px; text-align: left; }
            td { border: 1px solid #ddd; padding: 8px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Payment Transactions Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const handleDownload = async (type: string) => {
    try {
      if (paymentTransactions.length === 0) {
        Alert.alert("No Data", "There are no payment transactions to export.");
        return;
      }

      const formattedData = formatDataForExport();
      const timestamp = new Date().toISOString().split("T")[0];

      let fileContent = "";
      let fileName = "";
      let mimeType = "";

      switch (type) {
        case "CSV":
          fileContent = generateCSV(formattedData);
          fileName = `payment_transactions_${timestamp}.csv`;
          mimeType = "text/csv";
          break;
        case "Excel":
          // For Excel, we'll use CSV format but with .xls extension
          fileContent = generateCSV(formattedData);
          fileName = `payment_transactions_${timestamp}.xls`;
          mimeType = "application/vnd.ms-excel";
          break;
        case "PDF":
          // Generate actual PDF using expo-print
          const htmlContent = generateHTML(formattedData);
          const { uri: pdfUri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
          });
          fileName = `payment_transactions_${timestamp}.pdf`;

          // Copy to documents directory for sharing
          const finalPdfUri = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.copyAsync({
            from: pdfUri,
            to: finalPdfUri,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(finalPdfUri, {
              mimeType: "application/pdf",
              dialogTitle: `Export Payment Transactions as PDF`,
            });
          } else {
            Alert.alert("Success", `PDF saved as ${fileName}`);
          }

          setShowExportModal(false);
          return; // Return early for PDF case
        default:
          Alert.alert("Error", "Unsupported export format");
          return;
      }

      // Create file using new FileSystem API
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Use new writeAsStringAsync method
      await FileSystem.writeAsStringAsync(fileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export Payment Transactions as ${type}`,
        });
      } else {
        Alert.alert("Success", `File saved as ${fileName}`);
      }

      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    }
  };

  // Define consistent column widths
  const columnWidths = useMemo(
    () => ({
      paymentDate: getWidthEquivalent(190),
      saleDate: getWidthEquivalent(110),
      saleNo: getWidthEquivalent(110),
      client: getWidthEquivalent(170),
      location: getWidthEquivalent(150),
      teamMember: getWidthEquivalent(150),
      transactionType: getWidthEquivalent(150),
      paymentMethod: getWidthEquivalent(150),
      amount: getWidthEquivalent(110),
    }),
    []
  );

  const tableContentWidth = useMemo(
    () =>
      Object.values(columnWidths).reduce(
        (total, width) => total + width,
        0
      ),
    [columnWidths]
  );

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = getWidthEquivalent(24);
  const scrollContentWidth = Math.max(screenWidth, tableContentWidth);

  const tableHeader = useMemo(
    () => (
      <View style={[styles.tableHeader, { minWidth: tableContentWidth }]}>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.saleNo },
          ]}
        >
          <Text style={styles.tableHeaderText}>Sale No.</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.paymentDate },
          ]}
        >
          <Text style={styles.tableHeaderText}>Payment Date</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.saleDate },
          ]}
        >
          <Text style={styles.tableHeaderText}>Sale Date</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.client },
          ]}
        >
          <Text style={styles.tableHeaderText}>Client</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.location },
          ]}
        >
          <Text style={styles.tableHeaderText}>Location</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.teamMember },
          ]}
        >
          <Text style={styles.tableHeaderText}>Team Member</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.transactionType },
          ]}
        >
          <Text style={styles.tableHeaderText}>Transaction Type</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.paymentMethod },
          ]}
        >
          <Text style={styles.tableHeaderText}>Payment Method</Text>
        </View>
        <View
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.amount },
          ]}
        >
          <Text style={styles.tableHeaderText}>Amount</Text>
        </View>
      </View>
    ),
    [columnWidths, tableContentWidth]
  );

  const renderTableRow = useCallback(
    ({ item }: { item: any }) => (
      <View style={[styles.tableRow, { minWidth: tableContentWidth }]}>
        <TouchableOpacity
          onPress={() =>
            item.sale_id
              ? navigation.navigate("TransactionDetailsScreen", {
                  saleId: String(item.sale_id),
                  fallbackTransaction: {
                    payment_method: item.payment_method,
                    amount: item.amount,
                    sales: {
                      id: Number(item.sale_id),
                      created_at: item.created_at,
                      location: item.sale?.location,
                      client: item.sale?.client,
                    },
                  },
                })
              : undefined
          }
          style={[
            styles.cellContainer,
            styles.tableCell,
            { width: columnWidths.saleNo },
          ]}
          activeOpacity={item.sale_id ? 0.7 : 1}
          disabled={!item.sale_id}
        >
          <Text
            style={[
              styles.tableCell,
              item.sale_id ? styles.linkText : styles.disabledLinkText,
            ]}
            numberOfLines={1}
          >
            {item.sale_id || "-"}
          </Text>
        </TouchableOpacity>
        <View style={[styles.cellContainer, { width: columnWidths.paymentDate }]}>
          <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
            {formatDateTime(item.created_at)}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.saleDate }]}>
          <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
            {formatDateTime(item.created_at)}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.client }]}>
          <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
            {(() => {
              const client = item.sale?.client;
              if (!client) return "-";
              const parts = [client.first_name, client.last_name]
                .map((part: string | undefined | null) =>
                  part ? String(part).trim() : ""
                )
                .filter((part: string) => part.length > 0);
              if (parts.length > 0) {
                return parts.join(" ");
              }
              if (client.email) return client.email;
              if (client.phone) return client.phone;
              return "-";
            })()}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.location }]}>
          <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
            {item.sale?.location?.name || "-"}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.teamMember }]}>
          <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
            {item.sale?.appointment?.appointment_services &&
            item.sale.appointment.appointment_services.length > 0
              ? item.sale.appointment.appointment_services
                  .map(
                    (service: { staff: { first_name: any } }) =>
                      service.staff?.first_name
                  )
                  .filter(Boolean)
                  .join(", ")
              : "No staff assigned"}
          </Text>
        </View>
        <View
          style={[styles.cellContainer, { width: columnWidths.transactionType }]}
        >
          <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
            Sales {/* {item.transaction_type || "-"} */}
          </Text>
        </View>
        <View
          style={[styles.cellContainer, { width: columnWidths.paymentMethod }]}
        >
          <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
            {item.payment_method || "-"}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.amount }]}>
          <Text style={styles.tableCell} numberOfLines={1}>
            {item.amount || "-"}
          </Text>
        </View>
      </View>
    ),
    [
      columnWidths,
      formatDateTime,
      navigation,
      tableContentWidth,
    ]
  );

  const keyExtractor = useCallback(
    (item: any, index: number) => `${item.sale_id}-${index}`,
    []
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      {showMonthFilter && (
        <SelectPeriodModal
          visible={showMonthFilter}
          onClose={() => setShowMonthFilter(false)}
          onApply={(range) => {
            setFilter(
              {
                fromDate: range.fromDate,
                toDate: range.toDate,
              },
              true
            );
          }}
          initialFromDate={paymentTransactionFilter?.fromDate}
          initialToDate={paymentTransactionFilter?.toDate}
        />
      )}
      <View style={styles.headNav}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={20}
          style={styles.back}
        >
          <ChevronLeft size={25} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          {/* <Star size={25} color={"#fbbf24"} fill={"#fbbf24"} /> */}
          <TouchableOpacity
            onPress={() => {
              console.log("EllipsisVertical pressed");
              setShowExportModal(true);
            }}
            hitSlop={10}
          >
            <EllipsisVertical style={styles.ellipsis} size={25} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Payment Transactions</Text>
        <Text style={styles.subHeaderText}>
          Detailed view of all payment transactions.
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowMonthFilter(true)}
            style={styles.periodFilterButton}
          >
            <SlidersVertical size={18} color={colors.text} />
            <Text style={styles.periodFilterButtonText}>{selectedPeriodLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Container with Single Horizontal Scroll */}
      <View style={styles.tableContainer}>
        <ScrollView
          horizontal
          bounces={false}
          scrollEnabled={!loading}
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScrollView}
          contentContainerStyle={{
            minWidth: scrollContentWidth,
            paddingHorizontal: scrollContentWidth > screenWidth ? horizontalPadding / 2 : 0,
          }}
        >
          <View style={[styles.tableWrapper, { width: tableContentWidth }]}>
            {/* Table Header */}
            {tableHeader}

            {/* Table Body with Vertical Scroll */}
            <View style={styles.tableBody}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <LottieView
                    source={{
                      uri: "https://lottie.host/92d6a904-9ded-41b4-96f0-4632d03e9932/M8v4CyMIGB.lottie",
                    }}
                    autoPlay
                    loop
                    style={styles.loadingLottie}
                  />
                  <Text style={styles.loadingText}>
                    Loading payment transactions...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={paymentTransactions}
                  keyExtractor={keyExtractor}
                  renderItem={renderTableRow}
                  showsVerticalScrollIndicator={true}
                  style={styles.flatList}
                  ListEmptyComponent={() => (
                    <View>
                      <LottieView
                        source={{
                          uri: "https://lottie.host/56697a87-8e19-4b0e-a455-44dce2ae4955/Gg6VlksYSU.lottie",
                        }}
                        autoPlay
                        loop
                        style={{
                          height: getWidthEquivalent(250),
                          width: getWidthEquivalent(250),
                          alignSelf: "flex-start",
                          justifyContent: "center",
                          marginTop: getHeightEquivalent(100),
                          marginLeft: getWidthEquivalent(60),
                        }}
                        // style={{
                        //   alignSelf: "flex-start",
                        //   width: "100%",
                        //   height: "100%",
                        // }}
                      />
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExportModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export</Text>
              <TouchableOpacity
                onPress={() => setShowExportModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Export Options */}
            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleDownload("CSV")}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: "#EFF6FF" }]}
                >
                  <FileText size={24} color="#2563EB" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Download as CSV</Text>
                  <Text style={styles.optionDescription}>
                    Comma-separated values file
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleDownload("Excel")}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: "#F0FDF4" }]}
                >
                  <FileSpreadsheet size={24} color="#16A34A" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Download as Excel</Text>
                  <Text style={styles.optionDescription}>
                    Microsoft Excel spreadsheet
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleDownload("PDF")}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: "#FEF2F2" }]}
                >
                  <FileArchive size={24} color="#DC2626" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Download as PDF</Text>
                  <Text style={styles.optionDescription}>
                    Portable document format
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: getWidthEquivalent(20),
    paddingTop: getHeightEquivalent(10),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getHeightEquivalent(30),
    paddingBottom: getHeightEquivalent(15),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontEq(24),
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  exportOptions: {
    flex: 1,
  },
  exportOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(16),
    paddingHorizontal: getWidthEquivalent(16),
    marginBottom: getHeightEquivalent(12),
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: getWidthEquivalent(16),
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: fontEq(16),
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: fontEq(13),
    color: colors.textSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headNav: {
    height: getHeightEquivalent(50),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getWidthEquivalent(10),
  },
  back: {
    height: "100%",
    width: getWidthEquivalent(60),
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignSelf: "center",
  },
  ellipsis: {
    marginLeft: getWidthEquivalent(10),
  },
  header: {
    //flexDirection: "row",
    paddingVertical: getHeightEquivalent(10),
    paddingHorizontal: getWidthEquivalent(16),
    // height: getHeightEquivalent(200),
    backgroundColor: colors.white,
    // borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: fontEq(26),
    fontWeight: "600",
    color: colors.text,
  },
  subHeaderText: {
    fontSize: fontEq(14),
    color: colors.textSecondary,
    marginTop: getHeightEquivalent(8),
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    marginVertical: getHeightEquivalent(25),
  },
  periodFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getWidthEquivalent(16),
    paddingVertical: getHeightEquivalent(12),
    backgroundColor: colors.backgroundSecondary,
    borderRadius: getWidthEquivalent(20),
    justifyContent: "center",
    gap: getWidthEquivalent(8),
  },
  periodFilterButtonText: {
    fontSize: fontEq(14),
    fontWeight: "600",
    color: colors.text,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  horizontalScrollView: {
    flex: 1,
  },
  tableWrapper: {
    flexGrow: 0,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.background,
    paddingVertical: 12,
    //paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
    minHeight: 50,
    alignItems: "center",
  },
  tableHeaderText: {
    fontWeight: "600",
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    backgroundColor: colors.white,
    borderBottomColor: colors.gray[200],
    minHeight: 50,
    alignItems: "stretch",
  },
  tableCell: {
    color: colors.text,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    width: getWidthEquivalent(100),

  },
  linkText: {
    color: colors.primary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  disabledLinkText: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
    opacity: 0.6,
  },
  cellContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    width: getWidthEquivalent(100),
  },
  flatList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: getHeightEquivalent(60),
    paddingHorizontal: getWidthEquivalent(40),
  },
  loadingLottie: {
    width: getWidthEquivalent(200),
    height: getHeightEquivalent(200),
  },
  loadingText: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: fontEq(16),
    fontWeight: "500",
    marginTop: getHeightEquivalent(20),
  },
  loading: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 16,
  },
});
