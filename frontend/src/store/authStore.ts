import { create } from "zustand";
import type { UserResponse } from "@/components/auth/types";

const TOKEN_KEY = "qlex_token";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;

  /** Set token after successful login */
  setToken: (token: string) => void;

  /** Set full user profile (from /me) */
  setUser: (user: UserResponse) => void;

  /** Clear everything on logout / token expiry */
  logout: () => void;

  /** Hydrate from localStorage on app bootstrap — returns token if found */
  hydrate: () => string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user: UserResponse) => {
    set({ user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      set({ token: stored, isAuthenticated: true });
      return stored;
    }
    return null;
  },
}));

