import { create } from 'zustand';
import api from '../config/api';
import type { User, LoginRequest, TokenResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLeader: boolean; // Special permission for lanhdaobo account
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// List of usernames that can access Strategic Dashboard
// Only lanhdaobo can access - admin cannot see this
const LEADER_USERNAMES = ['lanhdaobo', 'admin']; // TEMP: Added admin for testing

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLeader: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      // Get tokens
      const response = await api.post<TokenResponse>('/token/', credentials);
      const { access, refresh, user } = response.data;

      // Choose storage based on remember_me
      const storage = credentials.remember_me ? localStorage : sessionStorage;

      // Save tokens
      storage.setItem('access_token', access);
      storage.setItem('refresh_token', refresh);

      // Save user data (now included in response)
      if (user) {
        storage.setItem('user', JSON.stringify(user));
        set({
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isLeader: LEADER_USERNAMES.includes(user.username),
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
        isLeader: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: () => {
    // Clear from both storages
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLeader: false,
      error: null,
    });
  },

  checkAuth: async () => {
    // Check both localStorage (remember_me=true) and sessionStorage (remember_me=false)
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;

        // Validate token by making a lightweight API call
        try {
          // Try to fetch current user to verify token is valid
          await api.get('/users/me/');

          // Token is valid, set authenticated state
          set({
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            isLeader: LEADER_USERNAMES.includes(user.username),
            user,
          });
        } catch (apiError: any) {
          // Token validation failed - will be handled by interceptor
          // If token refresh succeeds, next API call will work
          // If token refresh fails, interceptor will clear storage and redirect to login
          // For now, don't set authenticated state
          set({
            isAuthenticated: false,
            isAdmin: false,
            isLeader: false,
            user: null
          });
        }
      } catch (error) {
        // Invalid user data, clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        set({
          isAuthenticated: false,
          isAdmin: false,
          isLeader: false,
          user: null
        });
      }
    } else {
      set({
        isAuthenticated: false,
        isAdmin: false,
        isLeader: false,
        user: null
      });
    }
  },
}));
