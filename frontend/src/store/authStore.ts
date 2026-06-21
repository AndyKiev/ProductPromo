import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  id: number;
  name: string;
  lang?: { id?: number; short_name?: string };
}

interface LoginPayload {
  access_token: string;
  user: AuthUser;
}

interface AuthState {
  access_token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access_token: null,
      user: null,
      isAuthenticated: false,
      login: ({ access_token, user }) =>
        set({ access_token, user, isAuthenticated: true }),
      logout: () => set({ access_token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'productpromo-auth',
      storage: createJSONStorage(() => localStorage),
      // persist only the token; user is re-hydrated on login
      partialize: (state) => ({ access_token: state.access_token }) as AuthState,
    },
  ),
);
