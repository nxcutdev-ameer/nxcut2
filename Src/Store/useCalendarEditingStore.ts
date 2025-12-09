import { create } from 'zustand';

interface CalendarEditingState {
  isVisible: boolean;
  isSaving: boolean;
  onSave: (() => void) | undefined;
  onCancel: (() => void) | undefined;
  
  // Actions
  showEditingFooter: (callbacks: { onSave: () => void; onCancel: () => void }) => void;
  hideEditingFooter: () => void;
  setIsSaving: (isSaving: boolean) => void;
  updateCallbacks: (callbacks: { onSave: () => void; onCancel: () => void }) => void;
}

export const useCalendarEditingStore = create<CalendarEditingState>((set) => ({
  isVisible: false,
  isSaving: false,
  onSave: undefined,
  onCancel: undefined,

  showEditingFooter: ({ onSave, onCancel }) => 
    set({ isVisible: true, onSave, onCancel, isSaving: false }),

  hideEditingFooter: () => 
    set({ isVisible: false, onSave: undefined, onCancel: undefined, isSaving: false }),

  setIsSaving: (isSaving) => set({ isSaving }),

  updateCallbacks: ({ onSave, onCancel }) => set({ onSave, onCancel }),
}));
