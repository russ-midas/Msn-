import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

interface SettingsState extends AppSettings {
  // Actions
  setTheme: (theme: AppSettings['theme']) => void;
  toggleSounds: () => void;
  toggleNotifications: () => void;
  toggleTimestamps: () => void;
  toggleEnterToSend: () => void;
  toggleShowOfflineContacts: () => void;
  toggleCompactMode: () => void;
  setFontSize: (size: AppSettings['fontSize']) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'msn',
  soundsEnabled: true,
  notificationsEnabled: true,
  showTimestamps: true,
  enterToSend: true,
  showOfflineContacts: true,
  compactMode: false,
  fontSize: 'medium',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),

      toggleSounds: () => set((state) => ({ soundsEnabled: !state.soundsEnabled })),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      toggleTimestamps: () => set((state) => ({ showTimestamps: !state.showTimestamps })),

      toggleEnterToSend: () => set((state) => ({ enterToSend: !state.enterToSend })),

      toggleShowOfflineContacts: () =>
        set((state) => ({ showOfflineContacts: !state.showOfflineContacts })),

      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),

      setFontSize: (fontSize) => set({ fontSize }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
