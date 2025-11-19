import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { paymentRepository } from "../../../Repository/paymentsRepository";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

export interface PaymentSummaryData {
  paymentMethod: string;
  numberOfPayments: number;
  paymentAmount: number;
  numberOfRefunds: number;
  refundAmount: number;
}

const usePaymentSummaryScreenVM = () => {
  const navigation: NavigationProp<any> = useNavigation();
  const [paymentSummaryData, setPaymentSummaryData] = useState<
    PaymentSummaryData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize with Month to date range
  const getMonthToDateRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const monthToDate = getMonthToDateRange();
  const [startDate, setStartDate] = useState<Date>(monthToDate.start);
  const [endDate, setEndDate] = useState<Date>(monthToDate.end);

  useEffect(() => {
    fetchDataForDateRange(startDate, endDate);
  }, []);

  useEffect(() => {
    fetchDataForDateRange(startDate, endDate);
  }, [startDate, endDate]);

  const fetchDataForDateRange = async (fromDate: Date, toDate: Date) => {
    try {
      setLoading(true);
      const fromDateString = fromDate.toISOString().split("T")[0];
      const toDateString = toDate.toISOString().split("T")[0];

      console.log(
        "[PAYMENT-SUMMARY-VM] Fetching data for range:",
        fromDateString,
        "to",
        toDateString
      );

      // Fetch payment data for the selected date range
      const paymentsData = await paymentRepository.getSalesPaymentsByDateRange(
        fromDateString,
        toDateString
      );
      // console.log("[PAYMENT-SUMMARY-VM] Payments data:", paymentsData);
      // Process the data to create payment summary
      // const processedData = processPaymentData(
      //   [
      //     {
      //       id: "YVJQQJ18FTF91NK9",
      //       sale_id: 1897,
      //       payment_method: "card",
      //       amount: 295.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T15:18:38.545441+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T15:18:37.865+00:00",
      //       },
      //     },
      //     {
      //       id: "ZMCZEBGQZJ7W1P9C",
      //       sale_id: 1915,
      //       payment_method: "cash",
      //       amount: 255.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T13:37:57.600799+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T13:37:57.483+00:00",
      //       },
      //     },
      //     {
      //       id: "JAVELO1K4P0EG6XS",
      //       sale_id: 1937,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T08:06:48.228651+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T08:05:24.022+00:00",
      //       },
      //     },
      //     {
      //       id: "GK1EEDGWACOD3V19",
      //       sale_id: 1958,
      //       payment_method: "card",
      //       amount: 130.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T13:02:26.992381+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T13:01:02.808+00:00",
      //       },
      //     },
      //     {
      //       id: "NR6A29Z7ZXBE8V48",
      //       sale_id: 1976,
      //       payment_method: "card",
      //       amount: 165.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T17:48:29.118892+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T17:48:28.565+00:00",
      //       },
      //     },
      //     {
      //       id: "J4YLL4P5YVR28K82",
      //       sale_id: 1994,
      //       payment_method: "card",
      //       amount: 380.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T13:10:03.842441+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T13:10:03.945+00:00",
      //       },
      //     },
      //     {
      //       id: "WMYD4JVXPTYRDHLC",
      //       sale_id: 2012,
      //       payment_method: "voucher",
      //       amount: 212.5,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:22:41.856507+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:21:17.609+00:00",
      //       },
      //     },
      //     {
      //       id: "VNZ4NIOPDPC0NFKQ",
      //       sale_id: 1898,
      //       payment_method: "card",
      //       amount: 156.75,
      //       is_voided: false,
      //       created_at: "2025-09-18T15:29:33.301033+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T15:28:10.477+00:00",
      //       },
      //     },
      //     {
      //       id: "KWVP3X2M2OJXVQX2",
      //       sale_id: 1916,
      //       payment_method: "card",
      //       amount: 70.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T13:39:28.147916+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T13:38:04.976+00:00",
      //       },
      //     },
      //     {
      //       id: "A2KIDSCR8WTNNYQH",
      //       sale_id: 1938,
      //       payment_method: "card",
      //       amount: 200.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T08:13:11.095804+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T08:13:11.768+00:00",
      //       },
      //     },
      //     {
      //       id: "F41VGGBRJVX873B1",
      //       sale_id: 1959,
      //       payment_method: "card",
      //       amount: 21.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T13:02:52.138236+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T13:01:27.974+00:00",
      //       },
      //     },
      //     {
      //       id: "GWHBVM75OXKFEMWS",
      //       sale_id: 1977,
      //       payment_method: "card",
      //       amount: 73.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T06:24:14.040031+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T06:22:49.87+00:00",
      //       },
      //     },
      //     {
      //       id: "CZF80M30ECSN8ANW",
      //       sale_id: 1995,
      //       payment_method: "card",
      //       amount: 200.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T13:11:39.747862+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T13:11:39.864+00:00",
      //       },
      //     },
      //     {
      //       id: "ULA8RTWGI2H3HYAJ",
      //       sale_id: 2013,
      //       payment_method: "courtesy",
      //       amount: 205.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:24:35.286508+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:24:35.328+00:00",
      //       },
      //     },
      //     {
      //       id: "L9V9V2D82QZT8AZ8",
      //       sale_id: 1899,
      //       payment_method: "card",
      //       amount: 425.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T15:41:59.305719+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T15:41:58.806+00:00",
      //       },
      //     },
      //     {
      //       id: "NRT4AU5SOOZREMI1",
      //       sale_id: 1917,
      //       payment_method: "voucher",
      //       amount: 1130.5,
      //       is_voided: false,
      //       created_at: "2025-09-19T13:43:37.626508+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T13:43:37.615+00:00",
      //       },
      //     },
      //     {
      //       id: "KZN0SV3SMQ2UV5VE",
      //       sale_id: 1939,
      //       payment_method: "card",
      //       amount: 120.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T08:23:54.454403+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T08:22:30.333+00:00",
      //       },
      //     },
      //     {
      //       id: "QSJXI9WE612RNSLU",
      //       sale_id: 1960,
      //       payment_method: "card",
      //       amount: 80.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T13:20:15.036911+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T13:18:50.83+00:00",
      //       },
      //     },
      //     {
      //       id: "SHMN7KSB4VIPTBCY",
      //       sale_id: 1978,
      //       payment_method: "card",
      //       amount: 320.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T06:45:59.591502+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T06:45:59.659+00:00",
      //       },
      //     },
      //     {
      //       id: "7VKK3P2JBIDING4S",
      //       sale_id: 1996,
      //       payment_method: "card",
      //       amount: 590.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T13:35:12.095666+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T13:33:47.764+00:00",
      //       },
      //     },
      //     {
      //       id: "0LBL9GF9DVBKCC4O",
      //       sale_id: 2014,
      //       payment_method: "cash",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:24:51.631904+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:24:51.759+00:00",
      //       },
      //     },
      //     {
      //       id: "6C6KZHQO7FGH1G72",
      //       sale_id: 1900,
      //       payment_method: "card",
      //       amount: 70.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T15:44:50.93497+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T15:43:27.994+00:00",
      //       },
      //     },
      //     {
      //       id: "CMN0V2YZQGIW9NCT",
      //       sale_id: 1940,
      //       payment_method: "membership",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T08:26:14.898376+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T08:24:50.774+00:00",
      //       },
      //     },
      //     {
      //       id: "FWAFCNGPBCFN5KTK",
      //       sale_id: 1961,
      //       payment_method: "card",
      //       amount: 40.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T13:43:18.818819+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T13:43:18.353+00:00",
      //       },
      //     },
      //     {
      //       id: "KV229HB9FFCRAYNQ",
      //       sale_id: 1979,
      //       payment_method: "card",
      //       amount: 78.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T06:57:21.908069+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T06:55:57.788+00:00",
      //       },
      //     },
      //     {
      //       id: "4RRQ1FKUGTXH8LPW",
      //       sale_id: 1997,
      //       payment_method: "card",
      //       amount: 140.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T13:41:18.306056+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T13:39:54.129+00:00",
      //       },
      //     },
      //     {
      //       id: "QRJNUES3IDNBHYXC",
      //       sale_id: 2015,
      //       payment_method: "card",
      //       amount: 140.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:35:09.054836+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:33:44.85+00:00",
      //       },
      //     },
      //     {
      //       id: "RH9RD3VCU8MCDAKC",
      //       sale_id: 1883,
      //       payment_method: "card",
      //       amount: 130.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T07:48:12.5173+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T07:48:11.98+00:00",
      //       },
      //     },
      //     {
      //       id: "EJBUC3QRQOJ4XFVT",
      //       sale_id: 1901,
      //       payment_method: "card",
      //       amount: 25.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T16:30:41.613924+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T16:30:40.974+00:00",
      //       },
      //     },
      //     {
      //       id: "4OK73I8KL3UGT9M6",
      //       sale_id: 1919,
      //       payment_method: "cash",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T14:40:15.233243+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T14:38:52.045+00:00",
      //       },
      //     },
      //     {
      //       id: "LTCORK3O9MM7DXV9",
      //       sale_id: 1941,
      //       payment_method: "card",
      //       amount: 80.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T08:33:53.667446+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T08:32:29.411+00:00",
      //       },
      //     },
      //     {
      //       id: "MCD60HM8IFBRDLEN",
      //       sale_id: 1962,
      //       payment_method: "card",
      //       amount: 40.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T13:44:09.133896+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T13:44:08.783+00:00",
      //       },
      //     },
      //     {
      //       id: "463O31GF7PXD3ZUY",
      //       sale_id: 1980,
      //       payment_method: "card",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T07:03:30.952392+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T07:03:31.125+00:00",
      //       },
      //     },
      //     {
      //       id: "X2ZEGT94QGWRYMK9",
      //       sale_id: 1998,
      //       payment_method: "membership",
      //       amount: 90.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T13:49:11.957015+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T13:47:47.783+00:00",
      //       },
      //     },
      //     {
      //       id: "OPZWNNPLRZEUQN7R",
      //       sale_id: 2016,
      //       payment_method: "voucher",
      //       amount: 939.25,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:48:38.455352+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:47:14.185+00:00",
      //       },
      //     },
      //     {
      //       id: "AXGM1T0Q6RQS1KGR",
      //       sale_id: 1884,
      //       payment_method: "card",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T08:34:20.706946+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T08:34:20.248+00:00",
      //       },
      //     },
      //     {
      //       id: "MBKNNMU24SB9AIBR",
      //       sale_id: 1902,
      //       payment_method: "card",
      //       amount: 225.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T17:27:08.316324+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T17:27:07.786+00:00",
      //       },
      //     },
      //     {
      //       id: "NVX6ZKJ38UATQC72",
      //       sale_id: 1920,
      //       payment_method: "card",
      //       amount: 450.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T15:14:07.188321+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T15:12:43.999+00:00",
      //       },
      //     },
      //     {
      //       id: "FPXOF90RP6K4AIUX",
      //       sale_id: 1942,
      //       payment_method: "voucher",
      //       amount: 306.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T09:33:31.756255+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T09:33:31.257+00:00",
      //       },
      //     },
      //     {
      //       id: "JCWN1PBWAZSFVCE8",
      //       sale_id: 1963,
      //       payment_method: "card",
      //       amount: 165.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T14:16:30.023083+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T14:15:05.786+00:00",
      //       },
      //     },
      //     {
      //       id: "LV6VB9WRON9OLV1Z",
      //       sale_id: 1981,
      //       payment_method: "card",
      //       amount: 35.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T07:31:21.364867+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T07:29:57.191+00:00",
      //       },
      //     },
      //     {
      //       id: "7C5DGUX4VL9ODVVI",
      //       sale_id: 1999,
      //       payment_method: "card",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T14:16:54.749334+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T14:16:54.769+00:00",
      //       },
      //     },
      //     {
      //       id: "0UN4LIU8XGZXOPMR",
      //       sale_id: 2017,
      //       payment_method: "card",
      //       amount: 495.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:57:24.93789+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:56:00.66+00:00",
      //       },
      //     },
      //     {
      //       id: "PQSXYW6AM1WVDIJ6",
      //       sale_id: 1885,
      //       payment_method: "card",
      //       amount: 335.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T08:52:56.419472+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T08:51:33.632+00:00",
      //       },
      //     },
      //     {
      //       id: "EBP9QRTC0XQ2YHG6",
      //       sale_id: 1903,
      //       payment_method: "card",
      //       amount: 115.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T18:22:31.447905+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T18:22:30.745+00:00",
      //       },
      //     },
      //     {
      //       id: "EHDAR6OB2Q49YNEG",
      //       sale_id: 1921,
      //       payment_method: "card",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T15:47:30.654759+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T15:47:30.506+00:00",
      //       },
      //     },
      //     {
      //       id: "W43KU2TASVDOD90L",
      //       sale_id: 1964,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T14:20:48.814032+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T14:20:48.456+00:00",
      //       },
      //     },
      //     {
      //       id: "L24BU7X617ES4NO5",
      //       sale_id: 1982,
      //       payment_method: "card",
      //       amount: 140.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T08:28:49.684351+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T08:28:49.792+00:00",
      //       },
      //     },
      //     {
      //       id: "03AHJ97KHTGWD9VH",
      //       sale_id: 1886,
      //       payment_method: "card",
      //       amount: 84.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T08:55:30.332181+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T08:54:07.615+00:00",
      //       },
      //     },
      //     {
      //       id: "ONCECQF943J6IJU3",
      //       sale_id: 1904,
      //       payment_method: "card",
      //       amount: 75.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T07:12:54.192072+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T07:11:30.993+00:00",
      //       },
      //     },
      //     {
      //       id: "C6NXRWOVYTPDC8BG",
      //       sale_id: 1922,
      //       payment_method: "card",
      //       amount: 160.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T15:53:17.290934+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T15:51:54.074+00:00",
      //       },
      //     },
      //     {
      //       id: "I9AOCDOXX8676O6Q",
      //       sale_id: 1947,
      //       payment_method: "card",
      //       amount: 155.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T10:09:25.716889+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T10:09:25.303+00:00",
      //       },
      //     },
      //     {
      //       id: "HTCNZATBREQ2LXVL",
      //       sale_id: 1983,
      //       payment_method: "card",
      //       amount: 65.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T09:34:45.621859+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T09:34:45.668+00:00",
      //       },
      //     },
      //     {
      //       id: "VRFB2JDY1XBXNR8X",
      //       sale_id: 2001,
      //       payment_method: "card",
      //       amount: 470.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T14:55:43.135941+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T14:54:18.924+00:00",
      //       },
      //     },
      //     {
      //       id: "9CG1E7QK2OFUM3OS",
      //       sale_id: 1887,
      //       payment_method: "card",
      //       amount: 100.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T09:07:41.433925+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T09:06:18.691+00:00",
      //       },
      //     },
      //     {
      //       id: "H0UUY2BC8JMENLSO",
      //       sale_id: 1905,
      //       payment_method: "cash",
      //       amount: 200.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T08:21:24.26738+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T08:21:24.245+00:00",
      //       },
      //     },
      //     {
      //       id: "5ZJA19EHEI9G214I",
      //       sale_id: 1923,
      //       payment_method: "card",
      //       amount: 90.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T16:08:10.506994+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T16:08:10.436+00:00",
      //       },
      //     },
      //     {
      //       id: "AQGQKSXH5F9F4YQ5",
      //       sale_id: 1948,
      //       payment_method: "card",
      //       amount: 115.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T10:28:04.856035+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T10:26:40.647+00:00",
      //       },
      //     },
      //     {
      //       id: "P7GTD0KRJ6DK7P21",
      //       sale_id: 1966,
      //       payment_method: "card",
      //       amount: 42.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T14:26:57.595987+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T14:25:33.415+00:00",
      //       },
      //     },
      //     {
      //       id: "HX02NYO0APZRFJE2",
      //       sale_id: 1984,
      //       payment_method: "card",
      //       amount: 63.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T09:41:00.573088+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T09:39:36.412+00:00",
      //       },
      //     },
      //     {
      //       id: "S45BNBHHJY5ZFLG8",
      //       sale_id: 2002,
      //       payment_method: "card",
      //       amount: 75.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T15:04:28.527033+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T15:03:04.276+00:00",
      //       },
      //     },
      //     {
      //       id: "WC8JXQDSHIRKGH6E",
      //       sale_id: 1888,
      //       payment_method: "card",
      //       amount: 140.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T12:05:27.72801+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T12:05:27.091+00:00",
      //       },
      //     },
      //     {
      //       id: "QP0XX5P6JBJ6ROFH",
      //       sale_id: 1888,
      //       payment_method: "voucher",
      //       amount: 437.75,
      //       is_voided: false,
      //       created_at: "2025-09-18T12:05:27.72801+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T12:05:27.091+00:00",
      //       },
      //     },
      //     {
      //       id: "ET5H9ZZKR2TAZUP2",
      //       sale_id: 1906,
      //       payment_method: "voucher",
      //       amount: 68.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T09:04:43.323606+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T09:03:20.064+00:00",
      //       },
      //     },
      //     {
      //       id: "7TVE44A89108WL4V",
      //       sale_id: 1924,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T16:20:54.118585+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T16:19:30.957+00:00",
      //       },
      //     },
      //     {
      //       id: "99CONDXBDPRC201D",
      //       sale_id: 1949,
      //       payment_method: "card",
      //       amount: 350.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T10:40:41.681571+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T10:40:41.238+00:00",
      //       },
      //     },
      //     {
      //       id: "VXVB2CLVBBAIUSAA",
      //       sale_id: 1985,
      //       payment_method: "voucher",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T10:29:31.392289+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T10:28:07.222+00:00",
      //       },
      //     },
      //     {
      //       id: "1MJA1JIUWVP683JJ",
      //       sale_id: 2003,
      //       payment_method: "online",
      //       amount: 3000.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T15:32:44.359404+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T15:31:20.1+00:00",
      //       },
      //     },
      //     {
      //       id: "FOYLGSBT90BH2KWG",
      //       sale_id: 1889,
      //       payment_method: "card",
      //       amount: 10.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T12:05:58.119717+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T12:05:57.666+00:00",
      //       },
      //     },
      //     {
      //       id: "9HWMSUDHQOWNMFFG",
      //       sale_id: 1889,
      //       payment_method: "membership",
      //       amount: 90.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T12:05:58.119717+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T12:05:57.666+00:00",
      //       },
      //     },
      //     {
      //       id: "0HI4V17Z35REDXA6",
      //       sale_id: 1907,
      //       payment_method: "card",
      //       amount: 42.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T09:13:55.630686+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T09:12:32.546+00:00",
      //       },
      //     },
      //     {
      //       id: "7GQVV708SP2S452Z",
      //       sale_id: 1925,
      //       payment_method: "voucher",
      //       amount: 94.5,
      //       is_voided: false,
      //       created_at: "2025-09-19T16:25:56.993891+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T16:25:56.889+00:00",
      //       },
      //     },
      //     {
      //       id: "AW5JIXEPCKQN80LC",
      //       sale_id: 1950,
      //       payment_method: "card",
      //       amount: 130.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T10:46:27.841116+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T10:45:03.689+00:00",
      //       },
      //     },
      //     {
      //       id: "4VI7B0K9KYSIJOXP",
      //       sale_id: 1968,
      //       payment_method: "card",
      //       amount: 392.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T15:13:09.551605+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T15:11:45.341+00:00",
      //       },
      //     },
      //     {
      //       id: "507HIN01YV90NWO7",
      //       sale_id: 1986,
      //       payment_method: "card",
      //       amount: 21.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T10:51:38.844933+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T10:50:14.665+00:00",
      //       },
      //     },
      //     {
      //       id: "CRNKO7M163CNZK2Z",
      //       sale_id: 2004,
      //       payment_method: "card",
      //       amount: 185.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T15:38:20.375904+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T15:38:20.4+00:00",
      //       },
      //     },
      //     {
      //       id: "59NVZOG8DFFY9DFN",
      //       sale_id: 1890,
      //       payment_method: "cash",
      //       amount: 650.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T12:29:52.01524+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T12:28:29.185+00:00",
      //       },
      //     },
      //     {
      //       id: "NKIY5POZ5B2MOV9X",
      //       sale_id: 1926,
      //       payment_method: "voucher",
      //       amount: 127.5,
      //       is_voided: false,
      //       created_at: "2025-09-19T16:45:55.275078+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T16:45:55.168+00:00",
      //       },
      //     },
      //     {
      //       id: "IB6298SAF8REWT5L",
      //       sale_id: 1951,
      //       payment_method: "card",
      //       amount: 480.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T11:20:33.871791+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T11:20:33.536+00:00",
      //       },
      //     },
      //     {
      //       id: "EMDY16QFVATP83XV",
      //       sale_id: 1969,
      //       payment_method: "card",
      //       amount: 45.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T15:18:38.359098+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T15:18:37.814+00:00",
      //       },
      //     },
      //     {
      //       id: "J75XIN9B9HDG2TP6",
      //       sale_id: 1987,
      //       payment_method: "card",
      //       amount: 160.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T11:07:14.274621+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T11:07:14.354+00:00",
      //       },
      //     },
      //     {
      //       id: "HNOO94ADO94UCOX2",
      //       sale_id: 2005,
      //       payment_method: "card",
      //       amount: 84.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T16:07:58.931756+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T16:06:34.628+00:00",
      //       },
      //     },
      //     {
      //       id: "7HWPB76WILE9NIQR",
      //       sale_id: 1891,
      //       payment_method: "card",
      //       amount: 165.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T13:01:01.685328+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T12:59:38.873+00:00",
      //       },
      //     },
      //     {
      //       id: "K4UHIF028G19FTW1",
      //       sale_id: 1927,
      //       payment_method: "card",
      //       amount: 75.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T17:17:37.416294+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T17:17:37.19+00:00",
      //       },
      //     },
      //     {
      //       id: "NB78CNARCPPBN5IY",
      //       sale_id: 1952,
      //       payment_method: "card",
      //       amount: 287.85,
      //       is_voided: false,
      //       created_at: "2025-09-20T11:56:23.025156+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T11:54:58.734+00:00",
      //       },
      //     },
      //     {
      //       id: "1I3WXPHFNYB9AZ2I",
      //       sale_id: 1970,
      //       payment_method: "card",
      //       amount: 250.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T15:26:15.366791+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T15:24:51.079+00:00",
      //       },
      //     },
      //     {
      //       id: "0KQX2JU60MVRXPSP",
      //       sale_id: 1988,
      //       payment_method: "card",
      //       amount: 400.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T11:12:04.673315+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T11:10:40.477+00:00",
      //       },
      //     },
      //     {
      //       id: "896VP347DYU664I3",
      //       sale_id: 2006,
      //       payment_method: "voucher",
      //       amount: 110.5,
      //       is_voided: false,
      //       created_at: "2025-09-21T16:18:59.054079+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T16:17:34.877+00:00",
      //       },
      //     },
      //     {
      //       id: "12I4J5L8D0TRUQRA",
      //       sale_id: 1892,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T13:56:40.116363+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T13:56:39.506+00:00",
      //       },
      //     },
      //     {
      //       id: "0UEUDIZKU102H7HA",
      //       sale_id: 1928,
      //       payment_method: "card",
      //       amount: 140.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T17:51:08.792672+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T17:49:45.578+00:00",
      //       },
      //     },
      //     {
      //       id: "9XWM3FQJCWEV2DI6",
      //       sale_id: 1971,
      //       payment_method: "card",
      //       amount: 80.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T15:36:03.084136+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T15:36:02.674+00:00",
      //       },
      //     },
      //     {
      //       id: "F9KKY4VQ3MVCSR10",
      //       sale_id: 1989,
      //       payment_method: "voucher",
      //       amount: 525.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T11:17:07.432022+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T11:15:43.223+00:00",
      //       },
      //     },
      //     {
      //       id: "UFRLKUJ7QQ2A8W8K",
      //       sale_id: 2007,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T16:30:22.387287+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T16:30:22.47+00:00",
      //       },
      //     },
      //     {
      //       id: "JMGBPWC8YQVM3N3W",
      //       sale_id: 1893,
      //       payment_method: "card",
      //       amount: 115.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T14:17:22.248019+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T14:15:59.421+00:00",
      //       },
      //     },
      //     {
      //       id: "XBC1CHODBTYV1UAA",
      //       sale_id: 1954,
      //       payment_method: "card",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T12:52:17.64598+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T12:52:17.261+00:00",
      //       },
      //     },
      //     {
      //       id: "LP5LT62CQIS2LGY2",
      //       sale_id: 1972,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T15:40:34.275611+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T15:39:10.045+00:00",
      //       },
      //     },
      //     {
      //       id: "R16FNEYSW1W5N5GA",
      //       sale_id: 1990,
      //       payment_method: "voucher",
      //       amount: 110.5,
      //       is_voided: false,
      //       created_at: "2025-09-21T11:26:28.406793+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T11:25:04.181+00:00",
      //       },
      //     },
      //     {
      //       id: "NC3GNWWGP5NM58P2",
      //       sale_id: 1894,
      //       payment_method: "cash",
      //       amount: 80.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T14:51:42.550606+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T14:50:19.443+00:00",
      //       },
      //     },
      //     {
      //       id: "3EKTLEP5Y8OONBW6",
      //       sale_id: 1912,
      //       payment_method: "card",
      //       amount: 155.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T12:52:08.927932+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T12:50:45.812+00:00",
      //       },
      //     },
      //     {
      //       id: "FDX12SVVZ47ANAGJ",
      //       sale_id: 1930,
      //       payment_method: "card",
      //       amount: 80.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T17:55:35.453082+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T17:54:12.287+00:00",
      //       },
      //     },
      //     {
      //       id: "TERYZVZL342D3W6A",
      //       sale_id: 1955,
      //       payment_method: "cash",
      //       amount: 450.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T12:52:51.974052+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T12:52:51.644+00:00",
      //       },
      //     },
      //     {
      //       id: "CVYDSJ5T1DUIAMNL",
      //       sale_id: 1973,
      //       payment_method: "card",
      //       amount: 160.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T15:57:28.175075+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T15:57:27.771+00:00",
      //       },
      //     },
      //     {
      //       id: "WNKC1LVPRWW4VSQU",
      //       sale_id: 1991,
      //       payment_method: "card",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T12:20:09.695934+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T12:20:09.73+00:00",
      //       },
      //     },
      //     {
      //       id: "H4N1PKAN5XZCSRUU",
      //       sale_id: 2009,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T16:37:57.999796+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T16:37:58.125+00:00",
      //       },
      //     },
      //     {
      //       id: "RGI3ED5I5WF8Y45A",
      //       sale_id: 1895,
      //       payment_method: "online",
      //       amount: 2000.0,
      //       is_voided: false,
      //       created_at: "2025-09-18T14:59:01.180274+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T14:57:38.384+00:00",
      //       },
      //     },
      //     {
      //       id: "LU1WDJCO7TIH17XC",
      //       sale_id: 1931,
      //       payment_method: "card",
      //       amount: 260.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T17:56:20.181596+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T17:54:57.007+00:00",
      //       },
      //     },
      //     {
      //       id: "E9S4Y5MMABHGC4MV",
      //       sale_id: 1956,
      //       payment_method: "card",
      //       amount: 390.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T12:56:27.658156+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T12:55:03.418+00:00",
      //       },
      //     },
      //     {
      //       id: "2LB9AU3HOOTFHZVN",
      //       sale_id: 1974,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T16:01:38.621795+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T16:00:14.421+00:00",
      //       },
      //     },
      //     {
      //       id: "227HY1UX6WKL1EO4",
      //       sale_id: 2010,
      //       payment_method: "card",
      //       amount: 300.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:12:36.671861+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:11:12.413+00:00",
      //       },
      //     },
      //     {
      //       id: "NYIIHV2EJKEOYVSD",
      //       sale_id: 1913,
      //       payment_method: "online",
      //       amount: 4000.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T12:54:27.232066+00:00",
      //       payment_method_id: 3,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T12:53:04.066+00:00",
      //       },
      //     },
      //     {
      //       id: "NB7KTTHMO99ZVPRG",
      //       sale_id: 1992,
      //       payment_method: "card",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T12:51:11.784896+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T12:51:11.907+00:00",
      //       },
      //     },
      //     {
      //       id: "F8YHLJ0EY68R0TQ1",
      //       sale_id: 1861,
      //       payment_method: "cash",
      //       amount: 120.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T10:07:55.93622+00:00",
      //       payment_method_id: 1,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T10:07:55.454+00:00",
      //       },
      //     },
      //     {
      //       id: "BNUGKQQC52E97HD2",
      //       sale_id: 1822,
      //       payment_method: "card",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T07:45:32.883919+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T07:45:31.918+00:00",
      //       },
      //     },
      //     {
      //       id: "4KZOT08XWPZ01XZO",
      //       sale_id: 1825,
      //       payment_method: "card",
      //       amount: 2000.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T08:34:07.680238+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T08:34:07.008+00:00",
      //       },
      //     },
      //     {
      //       id: "99HV5H2JKS192PCR",
      //       sale_id: 1826,
      //       payment_method: "membership",
      //       amount: 90.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T08:38:52.590148+00:00",
      //       payment_method_id: 5,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T08:37:31.379+00:00",
      //       },
      //     },
      //     {
      //       id: "QNFDIH2NK267ZIZV",
      //       sale_id: 1827,
      //       payment_method: "card",
      //       amount: 250.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T08:39:08.308797+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T08:37:47.124+00:00",
      //       },
      //     },
      //     {
      //       id: "T0PEY99SAJDFWEPM",
      //       sale_id: 1828,
      //       payment_method: "card",
      //       amount: 121.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T08:52:30.965496+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T08:51:09.754+00:00",
      //       },
      //     },
      //     {
      //       id: "7U9N8294WZL005YS",
      //       sale_id: 1829,
      //       payment_method: "card",
      //       amount: 155.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T09:06:40.503814+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T09:06:39.493+00:00",
      //       },
      //     },
      //     {
      //       id: "2SB3OS2GRMW7SAVP",
      //       sale_id: 1831,
      //       payment_method: "card",
      //       amount: 240.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T09:18:42.926933+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T09:18:42.057+00:00",
      //       },
      //     },
      //     {
      //       id: "05T8V8XMXCPPNUOD",
      //       sale_id: 1832,
      //       payment_method: "card",
      //       amount: 165.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T09:34:52.188161+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T09:34:51.13+00:00",
      //       },
      //     },
      //     {
      //       id: "F1Z92WQGE6SG7ZNO",
      //       sale_id: 1842,
      //       payment_method: "voucher",
      //       amount: 60.25,
      //       is_voided: false,
      //       created_at: "2025-09-15T15:17:31.513037+00:00",
      //       payment_method_id: 4,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T15:16:10.14+00:00",
      //       },
      //     },
      //     {
      //       id: "MAA7GIFQT3ICQXKX",
      //       sale_id: 1842,
      //       payment_method: "voucher",
      //       amount: 67.25,
      //       is_voided: false,
      //       created_at: "2025-09-15T15:17:31.513037+00:00",
      //       payment_method_id: 4,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T15:16:10.14+00:00",
      //       },
      //     },
      //     {
      //       id: "T7LCEGZ5RK2I4TQP",
      //       sale_id: 1843,
      //       payment_method: "card",
      //       amount: 130.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T15:26:13.618199+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T15:26:12.153+00:00",
      //       },
      //     },
      //     {
      //       id: "401L7GIKG6D67PLR",
      //       sale_id: 1844,
      //       payment_method: "card",
      //       amount: 90.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T16:25:15.446158+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T16:25:13.684+00:00",
      //       },
      //     },
      //     {
      //       id: "NG8OZNIWAOWOPY52",
      //       sale_id: 1833,
      //       payment_method: "card",
      //       amount: 205.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T10:22:32.506091+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T10:21:11.172+00:00",
      //       },
      //     },
      //     {
      //       id: "9ZR9R7W1FEV1VUQR",
      //       sale_id: 1834,
      //       payment_method: "card",
      //       amount: 240.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T10:40:39.279089+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T10:39:18.054+00:00",
      //       },
      //     },
      //     {
      //       id: "5ZIICI1JAA553LUE",
      //       sale_id: 1835,
      //       payment_method: "membership",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T11:39:36.749705+00:00",
      //       payment_method_id: 5,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T11:38:15.407+00:00",
      //       },
      //     },
      //     {
      //       id: "5PPE7T4XKMI2UQDG",
      //       sale_id: 1836,
      //       payment_method: "card",
      //       amount: 90.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T11:48:01.138266+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T11:48:00.101+00:00",
      //       },
      //     },
      //     {
      //       id: "O4TFNAIRFEQE5SYY",
      //       sale_id: 1837,
      //       payment_method: "card",
      //       amount: 60.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T12:41:05.489433+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T12:39:44.155+00:00",
      //       },
      //     },
      //     {
      //       id: "XN1JOHKC2XTURW7U",
      //       sale_id: 1838,
      //       payment_method: "voucher",
      //       amount: 881.25,
      //       is_voided: false,
      //       created_at: "2025-09-15T12:50:39.050874+00:00",
      //       payment_method_id: 4,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T12:49:17.776+00:00",
      //       },
      //     },
      //     {
      //       id: "A4PJFGCIZV14BK78",
      //       sale_id: 1839,
      //       payment_method: "card",
      //       amount: 315.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T13:05:10.015782+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T13:03:48.769+00:00",
      //       },
      //     },
      //     {
      //       id: "KF5FKQOSN70OO8O1",
      //       sale_id: 1840,
      //       payment_method: "card",
      //       amount: 250.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T13:51:32.339733+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T13:50:11.023+00:00",
      //       },
      //     },
      //     {
      //       id: "5BK0LEMB5HCB71DO",
      //       sale_id: 1841,
      //       payment_method: "card",
      //       amount: 240.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T15:05:51.181909+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T15:05:49.566+00:00",
      //       },
      //     },
      //     {
      //       id: "8RFH4M5UPPMGQD8O",
      //       sale_id: 1845,
      //       payment_method: "card",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-15T17:41:11.665851+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-15T17:41:10.007+00:00",
      //       },
      //     },
      //     {
      //       id: "ZKZF0ALKK4K9J1N6",
      //       sale_id: 1846,
      //       payment_method: "cash",
      //       amount: 150.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T06:58:32.636215+00:00",
      //       payment_method_id: 1,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T06:57:10.636+00:00",
      //       },
      //     },
      //     {
      //       id: "F7ZWYN274KO7Z700",
      //       sale_id: 1847,
      //       payment_method: "voucher",
      //       amount: 67.5,
      //       is_voided: false,
      //       created_at: "2025-09-16T07:45:46.380672+00:00",
      //       payment_method_id: 4,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T07:45:44.511+00:00",
      //       },
      //     },
      //     {
      //       id: "DWUHPUQR2VHZ1VYO",
      //       sale_id: 1848,
      //       payment_method: "card",
      //       amount: 165.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T09:40:08.171904+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T09:40:07.738+00:00",
      //       },
      //     },
      //     {
      //       id: "JNXP35GUKIWFBSW1",
      //       sale_id: 1849,
      //       payment_method: "card",
      //       amount: 265.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T09:56:08.908648+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T09:54:46.947+00:00",
      //       },
      //     },
      //     {
      //       id: "IE10R65TZDFIW94O",
      //       sale_id: 1850,
      //       payment_method: "card",
      //       amount: 440.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T10:25:57.404322+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T10:25:57.036+00:00",
      //       },
      //     },
      //     {
      //       id: "IQUTLFG8J0MIWQU8",
      //       sale_id: 1851,
      //       payment_method: "card",
      //       amount: 42.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T12:18:45.504821+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T12:17:23.565+00:00",
      //       },
      //     },
      //     {
      //       id: "A47W66CK9Y4B588N",
      //       sale_id: 1852,
      //       payment_method: "card",
      //       amount: 71.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T15:11:04.273973+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T15:11:03.751+00:00",
      //       },
      //     },
      //     {
      //       id: "O6BH1Y6SZCH4WJIZ",
      //       sale_id: 1853,
      //       payment_method: "card",
      //       amount: 275.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T15:37:44.920306+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T15:37:44.49+00:00",
      //       },
      //     },
      //     {
      //       id: "YSCH40PKQV602679",
      //       sale_id: 1854,
      //       payment_method: "cash",
      //       amount: 140.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T16:19:01.331067+00:00",
      //       payment_method_id: 1,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T16:17:39.323+00:00",
      //       },
      //     },
      //     {
      //       id: "LL5V2JOOM6WBMGSR",
      //       sale_id: 1855,
      //       payment_method: "card",
      //       amount: 42.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T17:25:56.27993+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T17:24:34.26+00:00",
      //       },
      //     },
      //     {
      //       id: "7BM89K1R3VU6EZCN",
      //       sale_id: 1856,
      //       payment_method: "card",
      //       amount: 375.0,
      //       is_voided: false,
      //       created_at: "2025-09-16T18:15:33.317751+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-16T18:15:32.74+00:00",
      //       },
      //     },
      //     {
      //       id: "EEIFGHP9I8XW8K7K",
      //       sale_id: 1857,
      //       payment_method: "card",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T07:29:22.626301+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T07:29:21.067+00:00",
      //       },
      //     },
      //     {
      //       id: "CL1Q8H74TX3SURNH",
      //       sale_id: 1858,
      //       payment_method: "card",
      //       amount: 55.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T07:33:38.129741+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T07:32:16.132+00:00",
      //       },
      //     },
      //     {
      //       id: "CV81SXW9X3PGTFPU",
      //       sale_id: 1859,
      //       payment_method: "card",
      //       amount: 130.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T08:10:45.07991+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T08:10:43.75+00:00",
      //       },
      //     },
      //     {
      //       id: "U8R734PJ41BW4IFJ",
      //       sale_id: 1860,
      //       payment_method: "cash",
      //       amount: 300.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T09:45:57.559715+00:00",
      //       payment_method_id: 1,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T09:44:35.583+00:00",
      //       },
      //     },
      //     {
      //       id: "PUE4Z2HRMHTS1ZBU",
      //       sale_id: 1862,
      //       payment_method: "card",
      //       amount: 21.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T10:17:04.989373+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T10:15:43.041+00:00",
      //       },
      //     },
      //     {
      //       id: "JVRVPQ2HLRGGCNGE",
      //       sale_id: 1863,
      //       payment_method: "card",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T12:01:17.668061+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T12:01:17.16+00:00",
      //       },
      //     },
      //     {
      //       id: "9U3B69Y71YCHU90R",
      //       sale_id: 1864,
      //       payment_method: "cash",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T12:41:58.039443+00:00",
      //       payment_method_id: 1,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T12:41:57.589+00:00",
      //       },
      //     },
      //     {
      //       id: "HBPZR14I4L1ZSL1C",
      //       sale_id: 1865,
      //       payment_method: "card",
      //       amount: 158.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T12:59:47.502038+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T12:58:25.482+00:00",
      //       },
      //     },
      //     {
      //       id: "JW3ZDDBEV46FTLQR",
      //       sale_id: 1866,
      //       payment_method: "card",
      //       amount: 61.7,
      //       is_voided: false,
      //       created_at: "2025-09-17T13:08:24.783455+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T13:07:02.666+00:00",
      //       },
      //     },
      //     {
      //       id: "TQ9W8KKL8BTNNCE4",
      //       sale_id: 1866,
      //       payment_method: "voucher",
      //       amount: 142.3,
      //       is_voided: false,
      //       created_at: "2025-09-17T13:08:24.783455+00:00",
      //       payment_method_id: 4,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T13:07:02.666+00:00",
      //       },
      //     },
      //     {
      //       id: "UJJQZS1ID5JYM50U",
      //       sale_id: 1867,
      //       payment_method: "cash",
      //       amount: 105.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T15:32:27.759772+00:00",
      //       payment_method_id: 1,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T15:32:27.128+00:00",
      //       },
      //     },
      //     {
      //       id: "ZHU0RK2PDLOTWXED",
      //       sale_id: 1868,
      //       payment_method: "card",
      //       amount: 450.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T15:42:31.420114+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T15:41:09.219+00:00",
      //       },
      //     },
      //     {
      //       id: "RDTYIGL79QUE2O54",
      //       sale_id: 1869,
      //       payment_method: "card",
      //       amount: 130.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T15:58:20.28367+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T15:58:19.862+00:00",
      //       },
      //     },
      //     {
      //       id: "1HAL998PB25E5LO1",
      //       sale_id: 1870,
      //       payment_method: "card",
      //       amount: 25.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T16:27:24.466925+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T16:27:24.029+00:00",
      //       },
      //     },
      //     {
      //       id: "5K2TJM413YUH491Q",
      //       sale_id: 1873,
      //       payment_method: "card",
      //       amount: 100.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T17:27:01.956838+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T17:25:39.869+00:00",
      //       },
      //     },
      //     {
      //       id: "WJQS0DMX4XHSPVXM",
      //       sale_id: 1874,
      //       payment_method: "card",
      //       amount: 180.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T17:50:05.785173+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T17:50:05.352+00:00",
      //       },
      //     },
      //     {
      //       id: "7TBC5QJ7OLIZZDQ4",
      //       sale_id: 1875,
      //       payment_method: "card",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T17:51:28.769495+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T17:51:28.362+00:00",
      //       },
      //     },
      //     {
      //       id: "WFUMLRE0EFJQFE5I",
      //       sale_id: 1876,
      //       payment_method: "card",
      //       amount: 335.0,
      //       is_voided: false,
      //       created_at: "2025-09-17T18:25:01.282152+00:00",
      //       payment_method_id: 2,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-17T18:23:39.246+00:00",
      //       },
      //     },
      //     {
      //       id: "V6O9H3S3KW7M2415",
      //       sale_id: 1896,
      //       payment_method: "voucher",
      //       amount: 110.5,
      //       is_voided: false,
      //       created_at: "2025-09-18T15:01:08.995101+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-18T14:59:46.185+00:00",
      //       },
      //     },
      //     {
      //       id: "J2FH17CGOY79GN0Q",
      //       sale_id: 1914,
      //       payment_method: "voucher",
      //       amount: 309.0,
      //       is_voided: false,
      //       created_at: "2025-09-19T13:00:37.47536+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-19T12:59:14.345+00:00",
      //       },
      //     },
      //     {
      //       id: "72S5WX01LDG7AM0G",
      //       sale_id: 1936,
      //       payment_method: "card",
      //       amount: 50.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T06:48:26.138923+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T06:47:01.953+00:00",
      //       },
      //     },
      //     {
      //       id: "GRS8RG170WSKJ4MR",
      //       sale_id: 1957,
      //       payment_method: "card",
      //       amount: 170.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T12:58:01.165101+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T12:56:37.001+00:00",
      //       },
      //     },
      //     {
      //       id: "L4TUYVEIE8KWVZEM",
      //       sale_id: 1975,
      //       payment_method: "card",
      //       amount: 63.0,
      //       is_voided: false,
      //       created_at: "2025-09-20T16:02:59.683188+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-20T16:01:35.473+00:00",
      //       },
      //     },
      //     {
      //       id: "4ZRMKZ14KCCX9L2P",
      //       sale_id: 1993,
      //       payment_method: "card",
      //       amount: 30.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T13:05:02.548671+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T13:05:02.651+00:00",
      //       },
      //     },
      //     {
      //       id: "MT2833M035G87NF3",
      //       sale_id: 1993,
      //       payment_method: "voucher",
      //       amount: 127.5,
      //       is_voided: false,
      //       created_at: "2025-09-21T13:05:02.548671+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T13:05:02.651+00:00",
      //       },
      //     },
      //     {
      //       id: "RLZC59DPEHPV2DNX",
      //       sale_id: 2011,
      //       payment_method: "card",
      //       amount: 2000.0,
      //       is_voided: false,
      //       created_at: "2025-09-21T17:20:00.809954+00:00",
      //       payment_method_id: null,
      //       sale: {
      //         is_voided: false,
      //         created_at: "2025-09-21T17:18:36.567+00:00",
      //       },
      //     },
      //   ]
      // );
      const processedData = processPaymentData(paymentsData || []);
      setPaymentSummaryData(processedData);

      console.log("[PAYMENT-SUMMARY-DATA]", processedData);
    } catch (error) {
      console.error("[PAYMENT-SUMMARY-VM] Error fetching data:", error);
      setPaymentSummaryData([]);
    } finally {
      setLoading(false);
    }
  };

  const processPaymentData = (payments: any[]): PaymentSummaryData[] => {
    const paymentMethodMap = new Map<string, PaymentSummaryData>();

    payments.forEach((payment) => {
      const method = payment.payment_method || "Unknown";
      const amount = payment.amount;

      if (!paymentMethodMap.has(method)) {
        paymentMethodMap.set(method, {
          paymentMethod: method,
          numberOfPayments: 0,
          paymentAmount: 0,
          numberOfRefunds: 0,
          refundAmount: 0,
        });
      }

      const summary = paymentMethodMap.get(method)!;

      if (amount >= 0) {
        // Normal payment
        summary.numberOfPayments += 1;
        summary.paymentAmount += amount;
      } else {
        // Refund (negative amount)
        summary.numberOfRefunds += 1;
        summary.refundAmount += Math.abs(amount);
      }
    });

    return Array.from(paymentMethodMap.values()).sort(
      (a, b) => b.paymentAmount - a.paymentAmount
    );
  };

  const fetchPaymentSummary = async () => {
    await fetchDataForDateRange(startDate, endDate);
  };

  const updateDateRange = (fromDate: Date, toDate: Date) => {
    setStartDate(fromDate);
    setEndDate(toDate);
  };

  const getDateRangeDisplay = () => {
    const now = new Date();
    const isSameDay = startDate.toDateString() === endDate.toDateString();
    const isMonthToDate =
      startDate.getDate() === 1 &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear() &&
      endDate.getFullYear() === now.getFullYear() &&
      endDate.getMonth() === now.getMonth() &&
      endDate.getDate() === now.getDate();

    if (isMonthToDate) {
      return "Month to date";
    }

    if (isSameDay) {
      return startDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    return `${startDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    })} - ${endDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatDateForFilename = (fromDate: Date, toDate: Date) => {
    const isSameDay = fromDate.toDateString() === toDate.toDateString();
    if (isSameDay) {
      return fromDate.toISOString().split("T")[0];
    } else {
      return `${fromDate.toISOString().split("T")[0]}_to_${
        toDate.toISOString().split("T")[0]
      }`;
    }
  };

  const getTotalSummary = () => {
    return paymentSummaryData.reduce(
      (totals, item) => ({
        numberOfPayments: totals.numberOfPayments + item.numberOfPayments,
        paymentAmount: totals.paymentAmount + item.paymentAmount,
        numberOfRefunds: totals.numberOfRefunds + item.numberOfRefunds,
        refundAmount: totals.refundAmount + item.refundAmount,
      }),
      {
        numberOfPayments: 0,
        paymentAmount: 0,
        numberOfRefunds: 0,
        refundAmount: 0,
      }
    );
  };

  const exportAsCSV = async () => {
    try {
      const dateStr = formatDateForFilename(startDate, endDate);
      const totals = getTotalSummary();

      // Create CSV content
      let csvContent = `Payment Summary Report - ${getDateRangeDisplay()}\n\n`;

      // CSV Headers
      csvContent +=
        "Payment Method,No. of Payments,Payment Amount,No. of Refunds,Refunds\n";

      // Add data rows
      paymentSummaryData.forEach((item) => {
        csvContent += `${item.paymentMethod},${
          item.numberOfPayments
        },${formatCurrency(item.paymentAmount)},${
          item.numberOfRefunds
        },${formatCurrency(item.refundAmount)}\n`;
      });

      // Add total row
      csvContent += `Total,${totals.numberOfPayments},${formatCurrency(
        totals.paymentAmount
      )},${totals.numberOfRefunds},${formatCurrency(totals.refundAmount)}\n`;

      // Save and share CSV file
      const filename = `PaymentSummary_${dateStr}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: `Export Payment Summary as CSV`,
        });
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const exportAsPDF = async () => {
    try {
      const dateStr = formatDateForFilename(startDate, endDate);
      const totals = getTotalSummary();

      // Create HTML content for PDF
      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .total { background-color: #e8f5e8; font-weight: bold; }
              .amount { text-align: right; }
            </style>
          </head>
          <body>
            <h1>Payment Summary Report - ${getDateRangeDisplay()}</h1>
            <table>
              <tr>
                <th>Payment Method</th>
                <th>No. of Payments</th>
                <th>Payment Amount</th>
                <th>No. of Refunds</th>
                <th>Refunds</th>
              </tr>
      `;

      paymentSummaryData.forEach((item) => {
        htmlContent += `
          <tr>
            <td>${item.paymentMethod}</td>
            <td>${item.numberOfPayments}</td>
            <td class="amount">AED ${formatCurrency(item.paymentAmount)}</td>
            <td>${item.numberOfRefunds}</td>
            <td class="amount">AED ${formatCurrency(item.refundAmount)}</td>
          </tr>
        `;
      });

      htmlContent += `
              <tr class="total">
                <td>Total</td>
                <td>${totals.numberOfPayments}</td>
                <td class="amount">AED ${formatCurrency(
                  totals.paymentAmount
                )}</td>
                <td>${totals.numberOfRefunds}</td>
                <td class="amount">AED ${formatCurrency(
                  totals.refundAmount
                )}</td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const filename = `PaymentSummary_${dateStr}.pdf`;
      const finalPdfUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: finalPdfUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(finalPdfUri, {
          mimeType: "application/pdf",
          dialogTitle: `Export Payment Summary as PDF`,
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const exportAsExcel = async () => {
    try {
      const dateStr = formatDateForFilename(startDate, endDate);
      const totals = getTotalSummary();

      let excelContent = `Payment Summary Report - ${getDateRangeDisplay()}\n\n`;

      // Excel Headers (tab-separated)
      excelContent +=
        "Payment Method\tNo. of Payments\tPayment Amount\tNo. of Refunds\tRefunds\n";

      // Add data rows
      paymentSummaryData.forEach((item) => {
        excelContent += `${item.paymentMethod}\t${
          item.numberOfPayments
        }\t${formatCurrency(item.paymentAmount)}\t${
          item.numberOfRefunds
        }\t${formatCurrency(item.refundAmount)}\n`;
      });

      // Add total row
      excelContent += `Total\t${totals.numberOfPayments}\t${formatCurrency(
        totals.paymentAmount
      )}\t${totals.numberOfRefunds}\t${formatCurrency(totals.refundAmount)}\n`;

      // Save as Excel-compatible file
      const filename = `PaymentSummary_${dateStr}.xls`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, excelContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/vnd.ms-excel",
          dialogTitle: `Export Payment Summary as Excel`,
        });
      }
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };

  return {
    navigation,
    fetchPaymentSummary,
    paymentSummaryData,
    loading,
    startDate,
    endDate,
    updateDateRange,
    fetchDataForDateRange,
    getDateRangeDisplay,
    exportAsCSV,
    exportAsPDF,
    exportAsExcel,
    getTotalSummary,
  };
};

export default usePaymentSummaryScreenVM;
