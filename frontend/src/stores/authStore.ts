import { create } from 'zustand';
import api from '../config/api';
import { User, LoginRequest, TokenResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Get tokens
      const response = await api.post<TokenResponse>('/token/', credentials);
      const { access, refresh } = response.data;

      // Save tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // For now, we don't have a /me endpoint, so we'll decode the token or use username
      // In production, add a /api/users/me/ endpoint
      const user: User = {
        id: 1,
        username: credentials.username,
        email: '',
        is_superuser: false,
      };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Token exists, assume authenticated
      // In production, validate token with backend
      set({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'admin',
          email: '',
          is_superuser: false,
        },
      });
    } else {
      set({ isAuthenticated: false, user: null });
    }
  },
}));
