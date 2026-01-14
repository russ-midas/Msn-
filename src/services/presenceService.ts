import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../stores/authStore';

const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Ephemeral Presence System
 *
 * Rules:
 * - Online: App is in foreground
 * - Away: App is backgrounded
 * - Offline: Away for more than 10 minutes
 */
export function usePresenceManager() {
  const { user, setStatus, updatePresence } = useAuthStore();
  const backgroundedAt = useRef<number | null>(null);
  const offlineCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Set online when hook mounts (app is active)
    setStatus('online');

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - set online
        backgroundedAt.current = null;
        setStatus('online');

        // Clear offline check interval
        if (offlineCheckInterval.current) {
          clearInterval(offlineCheckInterval.current);
          offlineCheckInterval.current = null;
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background - set away and track time
        backgroundedAt.current = Date.now();
        setStatus('away');
        updatePresence({ lastSeen: new Date() });

        // Start checking for offline threshold
        offlineCheckInterval.current = setInterval(() => {
          if (backgroundedAt.current) {
            const awayDuration = Date.now() - backgroundedAt.current;
            if (awayDuration >= OFFLINE_THRESHOLD_MS) {
              setStatus('offline');
              // Clear interval once offline
              if (offlineCheckInterval.current) {
                clearInterval(offlineCheckInterval.current);
                offlineCheckInterval.current = null;
              }
            }
          }
        }, 30000); // Check every 30 seconds
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (offlineCheckInterval.current) {
        clearInterval(offlineCheckInterval.current);
      }
    };
  }, [user?.id]);
}

/**
 * Get the allowed interaction type for a contact based on their status
 */
export type InteractionType = 'message' | 'nudge' | 'nudge_limited' | 'none';

export function getInteractionType(
  contactStatus: string,
  lastNudgeTime?: Date | null
): InteractionType {
  switch (contactStatus) {
    case 'online':
      // Can message online users
      return 'message';

    case 'away':
    case 'busy':
    case 'brb':
    case 'phone':
    case 'lunch':
      // Can nudge away users (any away-like status)
      return 'nudge';

    case 'offline':
    case 'invisible':
      // Can only nudge offline users once per 24 hours
      if (lastNudgeTime) {
        const hoursSinceNudge = (Date.now() - new Date(lastNudgeTime).getTime()) / (1000 * 60 * 60);
        if (hoursSinceNudge < 24) {
          return 'none'; // Already nudged in last 24h
        }
      }
      return 'nudge_limited';

    default:
      return 'none';
  }
}

/**
 * Get human-readable description of interaction availability
 */
export function getInteractionDescription(
  interactionType: InteractionType,
  lastNudgeTime?: Date | null
): string {
  switch (interactionType) {
    case 'message':
      return 'Send a message';
    case 'nudge':
      return 'Send a nudge to get their attention';
    case 'nudge_limited':
      return 'Send a nudge (once per 24h)';
    case 'none':
      if (lastNudgeTime) {
        const hoursRemaining = Math.ceil(
          24 - (Date.now() - new Date(lastNudgeTime).getTime()) / (1000 * 60 * 60)
        );
        return `Already nudged (${hoursRemaining}h until you can nudge again)`;
      }
      return 'Cannot interact right now';
  }
}
