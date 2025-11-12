import { useState, useCallback } from "react";
import { Alert } from "react-native";

interface PaymentMethod {
  id: string;
  type: "card" | "wallet" | "bank";
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
}

export const usePaymentMethodsVM = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - replace with actual API calls
  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: "1",
      type: "card",
      name: "Visa Card",
      lastFour: "1234",
      expiryDate: "12/25",
      isDefault: true,
      isActive: true,
    },
    {
      id: "2",
      type: "card",
      name: "Mastercard",
      lastFour: "5678",
      expiryDate: "06/26",
      isDefault: false,
      isActive: true,
    },
    // {
    //   id: "3",
    //   type: "wallet",
    //   name: "Apple Pay",
    //   isDefault: false,
    //   isActive: true,
    // },
  ];

  const fetchPaymentMethods = useCallback(async (): Promise<PaymentMethod[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, API here
      // const response = await paymentMethodsAPI.getAll();
      // return response.data;
      
      return mockPaymentMethods;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch payment methods";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (paymentMethodData: Omit<PaymentMethod, "id">): Promise<PaymentMethod> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call your API here
      // const response = await paymentMethodsAPI.create(paymentMethodData);
      // return response.data;
      
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethodData,
        id: Date.now().toString(),
      };
      
      return newPaymentMethod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add payment method";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePaymentMethod = useCallback(async (methodId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would call your API here
      // await paymentMethodsAPI.delete(methodId);
      
      console.log(`Payment method ${methodId} deleted`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete payment method";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (methodId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would call your API here
      // await paymentMethodsAPI.setDefault(methodId);
      
      console.log(`Payment method ${methodId} set as default`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to set default payment method";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePaymentMethod = useCallback(async (methodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would call your API here
      // const response = await paymentMethodsAPI.update(methodId, updates);
      // return response.data;
      
      const updatedPaymentMethod: PaymentMethod = {
        id: methodId,
        type: "card",
        name: "Updated Card",
        lastFour: "9999",
        expiryDate: "12/27",
        isDefault: false,
        isActive: true,
        ...updates,
      };
      
      return updatedPaymentMethod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update payment method";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    updatePaymentMethod,
  };
};
