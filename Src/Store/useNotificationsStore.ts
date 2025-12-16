import { create } from 'zustand';

interface NotificationsState {
  hasUnread: boolean;
  setUnread: (value?: boolean) => void;
  markRead: () => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  hasUnread: false,
  setUnread: (value = true) => set({ hasUnread: value }),
  markRead: () => set({ hasUnread: false }),
  reset: () => set({ hasUnread: false }),
}));
