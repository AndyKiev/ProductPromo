import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ access_token: accessToken, refresh_token: refreshToken, isAuthenticated: true }),

      setAccessToken: (accessToken) =>
        set({ access_token: accessToken, isAuthenticated: true }),

      logout: () =>
        set({ access_token: null, refresh_token: null, isAuthenticated: false }),
    }),
    {
      name: 'productpromo-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
      }),
    },
  ),
);