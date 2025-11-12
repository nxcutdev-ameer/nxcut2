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

    const { cacheConfig, salesByLocationCache } = get();

    if (cacheConfig.enabled) {
      const cached = salesByLocationCache[cacheKey];
      const isValid =
        cached && Date.now() - cached.fetchedAt <= cacheConfig.salesByLocationTTL;
      if (isValid) {
        set({
          salesByLocationSummary: cached.data,
          salesByLocationLoading: false,
          salesByLocationError: null,
        });
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
        location_ids: normalizedLocationIds,
      });

      const normalizedResponse = Array.isArray(response) ? response : [];
      console.log(
        "[reports-store] Sales by location params:",
        {
          startDate,
          endDate: endDateWithTime,
          locationIds: normalizedLocationIds,
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

      set((state) => ({
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
      }));
    } catch (err: any) {
      console.error("[reports-store] Error fetching sales by location summary:", err);
      if (cacheConfig.enabled) {
        const fallback = salesByLocationCache[cacheKey];
        if (fallback) {
          console.warn(
            "[reports-store] Using cached sales by location data due to fetch error"
          );
          set({
            salesByLocationSummary: fallback.data,
            salesByLocationLoading: false,
            salesByLocationError: null,
          });
          return;
        }
      }
      set({
        salesByLocationSummary: [],
        salesByLocationLoading: false,
        salesByLocationError: err?.message ?? "Unknown error",
      });
    }
  },
}));
