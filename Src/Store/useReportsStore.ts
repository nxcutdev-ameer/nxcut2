import { create } from "zustand";
import { paymentRepository } from "../Repository/paymentsRepository";
import { reportsRepository, SalesByLocationRow } from "../Repository/reportsRepository";
type Timestamped<T> = {
  data: T;
  fetchedAt: number;
};

type SalesByLocationCache = Record<string, Timestamped<SalesByLocationRow[]>>;
import { SaleBO } from "../BOs/reportsBO";
//import { fetch } from "../../node_modules/react-native/Libraries/Network/fetch";

export type PaymentTransactionFilterBO = {
  fromDate: string;
  toDate: string;
  isVoided?: boolean;
  paymentMethod?: string | string[];
  locationId?: string | string[];
  saleId?: number | number[];
  appointmentId?: string | string[];
  clientId?: string | string[];
  teamMemberId?: string | string[];
  transactionType?: string | string[];
};

const getDefaultPaymentFilter = (): PaymentTransactionFilterBO => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
    isVoided: false,
  };
};

interface ReportStore {
  saleDetails: SaleBO;
  paymentTransactions: any[];
  paymentTransactionFilter: PaymentTransactionFilterBO;
  loading: boolean;
  error: string | null;
  salesByLocationSummary: SalesByLocationRow[];
  salesByLocationLoading: boolean;
  salesByLocationError: string | null;
  salesByLocationCache: SalesByLocationCache;
  cacheConfig: {
    enabled: boolean;
    salesByLocationTTL: number;
  };
  salesByLocationPrevious: SalesByLocationRow[] | null;
  salesByLocationLastGood: SalesByLocationRow[];
  pendingSalesByLocationRequest: symbol | null;

  fetchPayments: () => Promise<void>;
  setFilter: (
    filter: Partial<PaymentTransactionFilterBO>,
    refetch?: boolean
  ) => void;
  resetPaymentFilter: (refetch?: boolean) => void;

  fetchSaleDetials: (sale_id: number) => Promise<void>;
  fetchSalesByLocationSummary: (params: {
    startDate: string;
    endDate?: string;
    locationIds?: string[];
  }) => Promise<void>;
  setSalesCacheEnabled: (enabled: boolean) => void;
  setSalesCacheTTL: (ttlMs: number) => void;
  clearSalesByLocationCache: () => void;
  restoreSalesByLocationFallback: () => void;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  saleDetails: {
    id: 0,
    sale_type: "",
    subtotal: 0,
    tax_amount: 0,
    tip_amount: 0,
    total_amount: 0,
    discount_amount: 0,
    manual_discount: 0,
    membership_discount: 0,
    voucher_discount: 0,
    voucher_code: null,
    payment_method: "",
    receptionist_id: "",
    receptionist_name: "",
    notes: null,
    is_voided: false,
    created_at: "",
    updated_at: "",
    client_id: "",
    client: {
      id: "",
      first_name: "",
      last_name: "",
    },
    location_id: "",
    location: {
      id: "",
      name: "",
    },
    team_member_id: "",
    team_member: {
      id: "",
      first_name: "",
      last_name: "",
    },
    appointment_id: "",
    // appointment: {
    //   id: "",
    //   start_time: "2022-01-01T00:00:00.000Z",
    //   end_time: "",
    // },
    appointment_services: [],
    sales: [],
  },
  paymentTransactions: [],
  paymentTransactionFilter: getDefaultPaymentFilter(),
  loading: false,
  error: null,
  salesByLocationSummary: [],
  salesByLocationLoading: false,
  salesByLocationError: null,
  salesByLocationCache: {},
  cacheConfig: {
    enabled: true,
    salesByLocationTTL: 2 * 60 * 1000,
  },
  salesByLocationPrevious: null,
  salesByLocationLastGood: [],
  pendingSalesByLocationRequest: null,
  setSalesCacheEnabled: (enabled: boolean) =>
    set((state) => ({
      cacheConfig: {
        ...state.cacheConfig,
        enabled,
      },
    })),
  setSalesCacheTTL: (ttlMs: number) =>
    set((state) => ({
      cacheConfig: {
        ...state.cacheConfig,
        salesByLocationTTL: ttlMs,
      },
    })),
  clearSalesByLocationCache: () => set({ salesByLocationCache: {} }),
  restoreSalesByLocationFallback: () =>
    set((state) => ({
      salesByLocationSummary:
        state.salesByLocationLastGood.length > 0
          ? state.salesByLocationLastGood.slice()
          : state.salesByLocationSummary,
      salesByLocationError: null,
    })),

  fetchPayments: async () => {
    const { paymentTransactionFilter } = get();
    try {
      set({ loading: true, error: null });

      const data = await paymentRepository.getPayments(
        paymentTransactionFilter as any
      );

      set({ paymentTransactions: data, loading: false });
    } catch (err: any) {
      console.error("❌ Fetch payments error:", err);
      set({ error: err.message, loading: false });
    }
  },

  setFilter: (filter, refetch = true) => {
    set((state) => ({
      paymentTransactionFilter: {
        ...state.paymentTransactionFilter,
        ...filter,
      },
    }));

    if (refetch) {
      get().fetchPayments();
    }
  },

  resetPaymentFilter: (refetch = false) => {
    const defaultFilter = getDefaultPaymentFilter();
    set({ paymentTransactionFilter: defaultFilter });

    if (refetch) {
      get().fetchPayments();
    }
  },

  fetchSaleDetials: async (sale_id: number) => {
    try {
      set({ loading: true, error: null });

      const data = await paymentRepository.getSaleById(sale_id);

      set({ saleDetails: data, loading: false });
    } catch (err: any) {
      console.error("❌ Fetch payments error:", err);
      set({ error: err.message, loading: false });
    }
  },

  fetchSalesByLocationSummary: async ({
    startDate,
    endDate,
    locationIds,
  }) => {
    if (!startDate) {
      console.warn("[reports-store] fetchSalesByLocationSummary requires a start date");
      return;
    }

    const effectiveEndDate = endDate ?? startDate;
    const ensureEndDateHasTime = (dateValue: string) => {
      if (!dateValue) {
        return dateValue;
      }

      if (dateValue.includes("T")) {
        return dateValue;
      }

      const now = new Date();
      const pad = (num: number) => num.toString().padStart(2, "0");
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
        now.getSeconds()
      )}`;
      return `${dateValue}T${timeStr}`;
    };

    const endDateWithTime = ensureEndDateHasTime(effectiveEndDate);

    const normalizedLocationIds =
      locationIds && locationIds.length > 0
        ? [...locationIds].sort()
        : null;
    const cacheKey = JSON.stringify({
      startDate,
      endDate: endDateWithTime,
      locations: normalizedLocationIds,
    });

    const requestToken = Symbol("salesByLocationRequest");

    set((state) => ({
      salesByLocationLoading: true,
      salesByLocationError: null,
      pendingSalesByLocationRequest: requestToken,
      salesByLocationPrevious:
        state.salesByLocationSummary.length > 0
          ? state.salesByLocationSummary.slice()
          : state.salesByLocationPrevious,
    }));

    const { cacheConfig, salesByLocationCache } = get();

    if (cacheConfig.enabled) {
      const cached = salesByLocationCache[cacheKey];
      const isValid =
        cached && Date.now() - cached.fetchedAt <= cacheConfig.salesByLocationTTL;
      if (isValid) {
        set((state) => ({
          salesByLocationSummary: cached.data,
          salesByLocationLoading: false,
          salesByLocationError: null,
          pendingSalesByLocationRequest:
            state.pendingSalesByLocationRequest === requestToken
              ? null
              : state.pendingSalesByLocationRequest,
          salesByLocationLastGood: cached.data.slice(),
        }));
        return;
      }
    }

    try {
      set({
        salesByLocationLoading: true,
        salesByLocationError: null,
        salesByLocationSummary: [],
      });

      const response = await reportsRepository.getSalesByLocationSummary({
        start_date: startDate,
        end_date: endDateWithTime,
       // location_ids: normalizedLocationIds,
      });

      const normalizedResponse = Array.isArray(response) ? response : [];
      const containsCorruptedValues = normalizedResponse.some((row: any) => {
        if (!row) {
          return true;
        }
        const numericFields = [
          row.total_sales_amount,
          row.transaction_count,
          row.avg_transaction_value,
          row.card_amount,
          row.cash_amount,
          row.online_amount,
          row.other_amount,
        ];
        return numericFields.some(
          (value) => typeof value !== "number" || Number.isNaN(value)
        );
      });

      console.log(
        "[reports-store] Sales by location params:",
        {
          startDate,
          endDate: endDateWithTime,
       //   locationIds: normalizedLocationIds,
        }
      );
      console.log(
        "[reports-store] Sales by location row count:",
        normalizedResponse.length
      );
      if (normalizedResponse.length > 0) {
        console.log(
          "[reports-store] Sales by location sample row:",
          normalizedResponse[0]
        );
      }

      if (containsCorruptedValues) {
        console.warn(
          "[reports-store] Corrupted sales by location data detected, restoring previous snapshot"
        );
        set((state) => {
          if (state.pendingSalesByLocationRequest !== requestToken) {
            return {};
          }
          const fallbackData =
            state.salesByLocationPrevious ?? state.salesByLocationLastGood;

          return {
            salesByLocationSummary:
              fallbackData && fallbackData.length > 0
                ? fallbackData.slice()
                : [],
            salesByLocationLoading: false,
            salesByLocationError:
              "Received invalid sales distribution data. Restored previous values.",
            pendingSalesByLocationRequest: null,
          };
        });
        return;
      }

      set((state) => {
        if (state.pendingSalesByLocationRequest !== requestToken) {
          return {};
        }

        return {
          salesByLocationSummary: normalizedResponse,
          salesByLocationLoading: false,
          salesByLocationError: null,
          salesByLocationCache: cacheConfig.enabled
            ? {
                ...state.salesByLocationCache,
                [cacheKey]: {
                  data: normalizedResponse,
                  fetchedAt: Date.now(),
                },
              }
            : state.salesByLocationCache,
          salesByLocationLastGood: normalizedResponse.slice(),
          salesByLocationPrevious: null,
          pendingSalesByLocationRequest: null,
        };
      });
    } catch (err: any) {
      console.error("[reports-store] Error fetching sales by location summary:", err);
      set((state) => {
        const isLatest = state.pendingSalesByLocationRequest === requestToken;
        const fallbackFromCache =
          cacheConfig.enabled && salesByLocationCache[cacheKey]
            ? salesByLocationCache[cacheKey].data.slice()
            : null;
        const fallbackData = fallbackFromCache
          ? fallbackFromCache
          : state.salesByLocationPrevious ?? state.salesByLocationLastGood;

        if (!isLatest) {
          return {};
        }

        return {
          salesByLocationSummary:
            fallbackData && fallbackData.length > 0
              ? fallbackData.slice()
              : state.salesByLocationSummary,
          salesByLocationLoading: false,
          salesByLocationError: err?.message ?? "Unknown error",
          pendingSalesByLocationRequest: null,
        };
      });
    }
  },
}));
