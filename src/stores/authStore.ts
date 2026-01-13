import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPresence, UserStatus } from '../types';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, screenName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updatePresence: (presence: Partial<UserPresence>) => void;
  setStatus: (status: UserStatus, customMessage?: string) => void;
  clearError: () => void;
}

// Mock user for demo purposes
const createMockUser = (email: string, screenName: string): User => ({
  id: `user_${Date.now()}`,
  email,
  screenName,
  displayName: screenName,
  avatarUrl: undefined,
  presence: {
    status: 'online',
    customMessage: '🌟 Using Retro Messenger!',
  },
  createdAt: new Date(),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // For demo: accept any email/password
          if (!email || !password) {
            throw new Error('Email and password are required');
          }

          const screenName = email.split('@')[0];
          const user = createMockUser(email, screenName);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      signup: async (email: string, password: string, screenName: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));

          if (!email || !password || !screenName) {
            throw new Error('All fields are required');
          }

          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }

          const user = createMockUser(email, screenName);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      updatePresence: (presence: Partial<UserPresence>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              presence: { ...user.presence, ...presence },
            },
          });
        }
      },

      setStatus: (status: UserStatus, customMessage?: string) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              presence: {
                ...user.presence,
                status,
                customMessage: customMessage ?? user.presence.customMessage,
              },
            },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
