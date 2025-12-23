import { useCallback, useMemo } from "react";
import { formatMinutesToHours } from "../../../Utils/helpers";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { ClientSale } from "../../../Repository/clientRepository";
import { useSaleDetails } from "./useSaleDetails";

interface TransactionDetailsRouteParams {
  transaction?: {
    payment_method: string;
    amount: number;
    sales: {
      id: number;
      created_at: string;
      tip_amount: number | null;
      location?: {
        id?: string | number | null;
        name?: string | null;
      };
      client?: {
        id?: string | number | null;
        first_name?: string | null;
        last_name?: string | null;
        phone?: string | null;
      };
    };
    adjustedTipAmount?: number;
    isTipTransaction?: boolean;
  };
  saleId?: string;
}

type TransactionDetailsRoute = RouteProp<ParamListBase, string>;

const buildFallbackSale = (
  transaction?: TransactionDetailsRouteParams["transaction"]
): ClientSale | null => {
  if (!transaction?.sales?.id) {
    return null;
  }

  const createdAt = transaction.sales.created_at ?? new Date().toISOString();

  return {
    id: String(transaction.sales.id),
    payment_method: transaction.payment_method,
    amount: transaction.amount,
    subtotal: transaction.amount,
    total_amount: transaction.amount,
    created_at: createdAt,
    tip_amount: transaction.sales.tip_amount ?? null,
    adjusted_tip_amount: transaction.adjustedTipAmount,
    is_tip_transaction: transaction.isTipTransaction,
    sale_items: [],
    sale_tips: [],
    sale_payment_methods: [],
    client: transaction.sales.client
      ? {
          id: transaction.sales.client.id
            ? String(transaction.sales.client.id)
            : "",
          first_name: transaction.sales.client.first_name ?? "",
          last_name: transaction.sales.client.last_name ?? "",
          email: null,
          phone: null,
        }
      : undefined,
    appointment: undefined,
    location: transaction.sales.location
      ? {
          id: transaction.sales.location.id
            ? String(transaction.sales.location.id)
            : "",
          name: transaction.sales.location.name ?? "",
        }
      : undefined,
  };
};

const toNumber = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const useTransactionDetailsScreenVM = (
  route: TransactionDetailsRoute
) => {
  const params = (route?.params ?? {}) as TransactionDetailsRouteParams;
  const transactionParam = params.transaction;
  const saleId = params.saleId
    ?? (transactionParam?.sales?.id !== undefined
      ? String(transactionParam.sales.id)
      : undefined);

  const { sale: fetchedSale, isLoading, error, refetch } = useSaleDetails({
    saleId,
    enabled: !!saleId,
  });

  const fallbackSale = useMemo(
    () => buildFallbackSale(transactionParam),
    [transactionParam]
  );
  const sale = fetchedSale ?? fallbackSale ?? null;

  const saleItems = sale?.sale_items ?? [];
  const appointmentServices = sale?.appointment?.appointment_services ?? [];
  const paymentMethods = Array.isArray(sale?.sale_payment_methods)
    ? sale.sale_payment_methods
    : [];

  const subtotal = useMemo(() => {
    if (sale?.subtotal !== undefined && sale.subtotal !== null) {
      return toNumber(sale.subtotal);
    }
    if (sale?.amount !== undefined && sale.amount !== null) {
      return toNumber(sale.amount);
    }
    if (transactionParam) {
      return toNumber(transactionParam.amount);
    }
    return 0;
  }, [sale, transactionParam]);

  const adjustedTip = useMemo(() => {
    if (
      sale?.adjusted_tip_amount !== undefined &&
      sale.adjusted_tip_amount !== null
    ) {
      return toNumber(sale.adjusted_tip_amount);
    }
    if (sale?.tip_amount !== undefined && sale.tip_amount !== null) {
      return toNumber(sale.tip_amount);
    }
    if (
      transactionParam?.adjustedTipAmount !== undefined &&
      transactionParam.adjustedTipAmount !== null
    ) {
      return toNumber(transactionParam.adjustedTipAmount);
    }
    if (
      transactionParam?.sales?.tip_amount !== undefined &&
      transactionParam.sales.tip_amount !== null
    ) {
      return toNumber(transactionParam.sales.tip_amount);
    }
    return 0;
  }, [sale, transactionParam]);

  const taxAmount = toNumber(sale?.tax_amount);
  const voucherDiscount = toNumber(sale?.voucher_discount);

  const totalAmount = useMemo(() => {
    if (sale?.total_amount !== undefined && sale.total_amount !== null) {
      return toNumber(sale.total_amount);
    }
    return subtotal + adjustedTip;
  }, [sale, subtotal, adjustedTip]);

  const payableAmount = useMemo(() => {
    return subtotal + taxAmount - voucherDiscount;
  }, [subtotal, taxAmount, voucherDiscount]);

  const paymentMethod = useMemo(() => {
    const method = sale?.payment_method ?? transactionParam?.payment_method;
    if (!method) {
      return "N/A";
    }
    const isTip = sale?.is_tip_transaction ?? transactionParam?.isTipTransaction;
    return isTip ? `${method} (Tip)` : method;
  }, [sale, transactionParam]);

  const createdAt = sale?.created_at ?? transactionParam?.sales?.created_at ?? null;

  const createdAtLabel = useMemo(() => {
    if (!sale?.created_at) {
      return "Date not available";
    }

    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(sale.created_at));
    } catch (err) {
      console.warn("[TransactionDetails] date format fallback", err);
      return new Date(sale.created_at).toLocaleString();
    }
  }, [sale?.created_at]);

  const locationName =
    sale?.location?.name ?? transactionParam?.sales?.location?.name ?? "N/A";

  const clientSource =
    sale?.appointment?.client ?? sale?.client ?? transactionParam?.sales?.client;

  const clientName = useMemo(() => {
    if (!clientSource) {
      return "Unknown";
    }
    const parts = [clientSource.first_name, clientSource.last_name]
      .map((part) => (part ? String(part).trim() : ""))
      .filter((part) => part.length > 0);
    return parts.length ? parts.join(" ") : "Unknown";
  }, [clientSource]);

  const clientPhone = clientSource?.phone ?? "Not provided";

  const clientInitial = useMemo(() => {
    const name = clientName?.trim();
    if (!name) {
      return "C";
    }
    return name.charAt(0).toUpperCase();
  }, [clientName]);

  const transactionId =
    sale?.id ?? (transactionParam?.sales?.id !== undefined
      ? String(transactionParam.sales.id)
      : "N/A");

  const primaryPaymentAmount = paymentMethods.length
    ? toNumber(paymentMethods[0]?.amount)
    : 0;
  const paymentMethodsTotal = paymentMethods.reduce(
    (sum, method) => sum + toNumber(method?.amount),
    0
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 2,
      }),
    []
  );

  const formatCurrency = useCallback(
    (value?: number | string | null) => {
      return currencyFormatter.format(toNumber(value));
    },
    [currencyFormatter]
  );

  const shortTime = useCallback((value?: string | null) => {
    if (!value) return null;

    // Support raw time strings coming from DB like "10:15:00".
    const timeOnlyMatch = /^\d{2}:\d{2}(:\d{2})?$/.exec(value);
    if (timeOnlyMatch) {
      const [hh, mm] = value.split(":").map((v) => Number(v));
      const dt = new Date(2000, 0, 1, hh || 0, mm || 0, 0);
      return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }, []);

  const appointmentServiceCreatedAt =
    appointmentServices?.[0]?.created_at ?? null;

  const appointmentServiceCreatedAtLabel = useMemo(() => {
    if (!appointmentServiceCreatedAt) {
      return "";
    }

    try {
      const date = new Date(appointmentServiceCreatedAt);
      if (Number.isNaN(date.getTime())) {
        return appointmentServiceCreatedAt;
      }

      const day = date.getDate();
      const suffixIndex = day % 10;
      const suffixMap = ["th", "st", "nd", "rd"] as const;
      const isTeen = Math.floor((day % 100) / 10) === 1;
      const suffix = isTeen || suffixIndex > 3 ? "th" : suffixMap[suffixIndex];
      const dayWithSuffix = `${day}${suffix}`;

      const weekday = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(date);
      const month = new Intl.DateTimeFormat("en-US", {
        month: "long",
      }).format(date);
      const year = date.getFullYear();
      const timeLabel = shortTime(appointmentServiceCreatedAt) ?? "";

      return `${weekday} ${dayWithSuffix} ${month} ${year}${
        timeLabel ? ` at ${timeLabel}` : ""
      }`;
    } catch (err) {
      console.warn(
        "[TransactionDetails] Failed to format appointment service date",
      );
      return appointmentServiceCreatedAt;
    }
  }, [appointmentServiceCreatedAt, shortTime]);

  const combinedItems = useMemo(() => {
    // Preferred: linked appointment services (has service + staff).
    if (appointmentServices.length) {
      return appointmentServices.map((service) => {
        const linkedSaleItem = saleItems.find((item) => {
          if (!item?.appointment_service_id) {
            return false;
          }
          return String(item.appointment_service_id) === String(service.id);
        });

        const amount = toNumber(service?.price ?? linkedSaleItem?.price);
        const unitPrice = toNumber(linkedSaleItem?.unit_price ?? amount);
        const title =
          service?.service?.name ??
          linkedSaleItem?.description ??
          linkedSaleItem?.name ??
          "Service";

        const staffEntries = service?.staff ? [service.staff] : [];
        const staffNames = staffEntries
          .map((member) =>
            [member?.first_name, member?.last_name].filter(Boolean).join(" ")
          )
          .filter(Boolean);

        const durationMinutes =
          service?.service?.duration_minutes ??
          service?.service?.duration ??
          service?.duration_minutes ??
          service?.duration ??
          null;
        const durationLabel = durationMinutes ? formatMinutesToHours(durationMinutes) : null;

        const startTimeRaw =
          service?.start_time ??
          service?.scheduled_start ??
          service?.appointment_start ??
          null;
        const endTimeRaw = service?.end_time ?? null;

        const startTimeLabel = shortTime(startTimeRaw);

        const computeEndFromDuration = (start: string, minutesToAdd: number) => {
          const match = /^\d{2}:\d{2}(:\d{2})?$/.exec(start);
          if (!match) return null;
          const [hh, mm] = start.split(":").map((v) => Number(v));
          const dt = new Date(2000, 0, 1, hh || 0, mm || 0, 0);
          dt.setMinutes(dt.getMinutes() + (Number(minutesToAdd) || 0));
          return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
        };

        const endTimeLabel =
          shortTime(endTimeRaw) ??
          (startTimeRaw && durationMinutes
            ? computeEndFromDuration(String(startTimeRaw), Number(durationMinutes))
            : null);

        const timeRangeLabel =
          startTimeLabel && endTimeLabel
            ? `${startTimeLabel}`
            : startTimeLabel;

        const staffLabel = staffNames.length
          ? staffNames.join(", ")
          : "No staff recorded";

        const metaParts = [timeRangeLabel, durationLabel, staffLabel].filter(Boolean);
        const itemMeta = metaParts.join(" · ");

        return {
          id: String(service.id ?? linkedSaleItem?.id ?? title),
          title,
          amount,
          unitPrice,
          staff: itemMeta,
        };
      });
    }

    // Fallback: show sale_items when no linked appointment services exist.
    if (saleItems.length) {
      return saleItems.map((item) => {
        const title =
          item?.item_name ??
          item?.name ??
          item?.description ??
          "Item";

        const amount =
          item?.total_price !== undefined && item?.total_price !== null
            ? toNumber(item.total_price)
            : item?.unit_price !== undefined && item?.unit_price !== null
              ? toNumber(item.unit_price) * toNumber(item.quantity ?? 1)
              : toNumber(item.price);

        const unitPrice =
          item?.unit_price !== undefined && item?.unit_price !== null
            ? toNumber(item.unit_price)
            : amount;

        // Staff names can come from sale_item_staff.team_members (fetchSaleById)
        // or item.staff (other queries).
        const staffFromSaleItemStaff = Array.isArray(item?.sale_item_staff)
          ? item.sale_item_staff
              .map((s: any) => s?.team_members)
              .filter(Boolean)
              .map((m: any) => [m?.first_name, m?.last_name].filter(Boolean).join(" "))
              .filter(Boolean)
          : [];

        const staffFromItemStaff = item?.staff
          ? [[item.staff?.first_name, item.staff?.last_name].filter(Boolean).join(" ")].filter(Boolean)
          : [];

        const staffNames = [...staffFromSaleItemStaff, ...staffFromItemStaff];
        const staffLabel = staffNames.length ? staffNames.join(", ") : "No staff recorded";

        return {
          id: String(item?.id ?? title),
          title,
          amount,
          unitPrice,
          staff: staffLabel,
        };
      });
    }

    return [] as {
      id: string;
      title: string;
      amount: number;
      unitPrice: number;
      staff: string;
    }[];
  }, [appointmentServices, saleItems, shortTime]);

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "N/A";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (value?: string | null) => {
    if (!value) {
      return "N/A";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return {
    sale,
    isLoading,
    error,
    refetch,
    saleItems,
    appointmentServices,
    paymentMethods,
    subtotal,
    adjustedTip,
    taxAmount,
    voucherDiscount,
    payableAmount,
    totalAmount,
    paymentMethod,
    displayPaymentMethod: paymentMethod,
    createdAt,
    createdAtLabel,
    locationName,
    clientName,
    clientPhone,
    clientInitial,
    transactionId,
    appointmentServiceCreatedAtLabel,
    combinedItems,
    paymentMethodsTotal,
    primaryPaymentAmount,
    formatCurrency,
    formatDate,
    formatTime,
  };
};
