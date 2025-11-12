import { useState, useCallback } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    // First hide any existing toast, then show the new one
    setToast(prev => ({ ...prev, visible: false }));

    // Use a small delay to ensure the state update is processed
    setTimeout(() => {
      setToast({
        visible: true,
        message,
        type,
      });
    }, 50);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showComingSoon = useCallback(() => {
    showToast('Feature coming soon!', 'info');
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showComingSoon,
  };
};