import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NudgeRecord {
  contactId: string;
  lastNudgeTime: string; // ISO string
  wasOffline: boolean; // Track if they were offline when nudged
}

interface NudgeState {
  // State
  nudgeRecords: Record<string, NudgeRecord>; // contactId -> record

  // Actions
  recordNudge: (contactId: string, wasOffline: boolean) => void;
  getLastNudgeTime: (contactId: string) => Date | null;
  canNudgeOfflineUser: (contactId: string) => boolean;
  getHoursUntilNextNudge: (contactId: string) => number | null;
  clearNudgeRecord: (contactId: string) => void;
  clearAllNudgeRecords: () => void;
}

const OFFLINE_NUDGE_COOLDOWN_HOURS = 24;

export const useNudgeStore = create<NudgeState>()(
  persist(
    (set, get) => ({
      nudgeRecords: {},

      recordNudge: (contactId: string, wasOffline: boolean) => {
        set((state) => ({
          nudgeRecords: {
            ...state.nudgeRecords,
            [contactId]: {
              contactId,
              lastNudgeTime: new Date().toISOString(),
              wasOffline,
            },
          },
        }));
      },

      getLastNudgeTime: (contactId: string) => {
        const record = get().nudgeRecords[contactId];
        return record ? new Date(record.lastNudgeTime) : null;
      },

      canNudgeOfflineUser: (contactId: string) => {
        const record = get().nudgeRecords[contactId];

        // If never nudged, can nudge
        if (!record || !record.wasOffline) {
          return true;
        }

        // Check if 24 hours have passed
        const lastNudge = new Date(record.lastNudgeTime);
        const hoursSinceNudge = (Date.now() - lastNudge.getTime()) / (1000 * 60 * 60);

        return hoursSinceNudge >= OFFLINE_NUDGE_COOLDOWN_HOURS;
      },

      getHoursUntilNextNudge: (contactId: string) => {
        const record = get().nudgeRecords[contactId];

        if (!record || !record.wasOffline) {
          return null;
        }

        const lastNudge = new Date(record.lastNudgeTime);
        const hoursSinceNudge = (Date.now() - lastNudge.getTime()) / (1000 * 60 * 60);

        if (hoursSinceNudge >= OFFLINE_NUDGE_COOLDOWN_HOURS) {
          return null;
        }

        return Math.ceil(OFFLINE_NUDGE_COOLDOWN_HOURS - hoursSinceNudge);
      },

      clearNudgeRecord: (contactId: string) => {
        set((state) => {
          const { [contactId]: _, ...rest } = state.nudgeRecords;
          return { nudgeRecords: rest };
        });
      },

      clearAllNudgeRecords: () => {
        set({ nudgeRecords: {} });
      },
    }),
    {
      name: 'nudge-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
