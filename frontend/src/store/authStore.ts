import { create } from "zustand";
import type { UserResponse } from "@/components/auth/types";

const TOKEN_KEY = "qlex_token";
const USER_KEY = "qlex_user";

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
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
    set({ user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUserStr = localStorage.getItem(USER_KEY);
    let parsedUser = null;

    if (storedUserStr) {
      try {
        parsedUser = JSON.parse(storedUserStr);
      } catch {}
    }

    if (storedToken) {
      set({ token: storedToken, user: parsedUser, isAuthenticated: true });
      return storedToken;
    }
    return null;
  },
}));

