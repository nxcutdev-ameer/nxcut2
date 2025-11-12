import { useCallback, useEffect, useState } from "react";
import {
  ClientSale,
  fetchSaleById,
} from "../../../Repository/clientRepository";

interface UseSaleDetailsOptions {
  saleId?: string;
  enabled?: boolean;
}

interface UseSaleDetailsResult {
  sale: ClientSale | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSaleDetails = ({
  saleId,
  enabled = true,
}: UseSaleDetailsOptions): UseSaleDetailsResult => {
  const [sale, setSale] = useState<ClientSale | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSale = useCallback(async () => {
    if (!saleId || !enabled) {
      setSale(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSaleById(saleId);
      setSale(data);
    } catch (err: any) {
      console.error("[useSaleDetails] Failed to fetch sale", err);
      setError(err?.message || "Failed to load sale details");
    } finally {
      setIsLoading(false);
    }
  }, [saleId, enabled]);

  useEffect(() => {
    loadSale();
  }, [loadSale]);

  return {
    sale,
    isLoading,
    error,
    refetch: loadSale,
  };
};
