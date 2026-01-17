import { create } from 'zustand';
import api from '../config/api';
import type { User, LoginRequest, TokenResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Get tokens
      const response = await api.post<TokenResponse>('/token/', credentials);
      const { access, refresh, user } = response.data;

      // Save tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Save user data (now included in response)
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('User data not found in response');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          user,
        });
      } catch (error) {
        // Invalid user data, clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        set({
          isAuthenticated: false,
          isAdmin: false,
          user: null
        });
      }
    } else {
      set({
        isAuthenticated: false,
        isAdmin: false,
        user: null
      });
    }
  },
}));
