import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// API Base URL - Use relative path for same-origin requests (works with both domains)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check both localStorage (remember_me=true) and sessionStorage (remember_me=false)
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check both storages for refresh token
        let refreshToken = localStorage.getItem('refresh_token');
        let storage: Storage = localStorage;

        if (!refreshToken) {
          refreshToken = sessionStorage.getItem('refresh_token');
          storage = sessionStorage;
        }

        if (refreshToken) {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          // Save to the same storage where refresh token was found
          storage.setItem('access_token', access);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens from both storages and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


// ========================================
// AI Conversation API
// ========================================

export interface AIMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  response_data?: any;
  created_at: string;
}

export interface AIConversation {
  id: number;
  title: string;
  mode: 'quick' | 'deep';
  mode_display?: string;
  first_message: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  messages?: AIMessage[];
}

// Get all conversations for current user
export const getConversations = async (): Promise<AIConversation[]> => {
  const response = await api.get('/ai-conversations/');
  return response.data;
};

// Create new conversation
export const createConversation = async (data?: { title?: string; mode?: 'quick' | 'deep' }): Promise<AIConversation> => {
  const response = await api.post('/ai-conversations/', data || {});
  return response.data;
};

// Get conversation details with messages
export const getConversation = async (id: number): Promise<AIConversation> => {
  const response = await api.get(`/ai-conversations/${id}/`);
  return response.data;
};

// Get messages for a conversation
export const getConversationMessages = async (id: number): Promise<AIMessage[]> => {
  const response = await api.get(`/ai-conversations/${id}/messages/`);
  return response.data;
};

// Add message to conversation
export const addConversationMessage = async (
  conversationId: number,
  role: 'user' | 'assistant',
  content: string,
  responseData?: any
): Promise<AIMessage> => {
  const response = await api.post(`/ai-conversations/${conversationId}/add_message/`, {
    role,
    content,
    response_data: responseData
  });
  return response.data;
};

// Delete conversation
export const deleteConversation = async (id: number): Promise<void> => {
  await api.delete(`/ai-conversations/${id}/`);
};

// Update conversation title
export const updateConversation = async (id: number, title: string): Promise<AIConversation> => {
  const response = await api.patch(`/ai-conversations/${id}/`, { title });
  return response.data;
};


// ========================================
// AI Response Feedback API
// ========================================

export interface AIResponseFeedback {
  id?: number;
  query: string;
  mode: 'quick' | 'deep';
  response_data: any;
  conversation_context?: any;
  rating: 'positive' | 'negative';
  feedback_text?: string;
  created_at?: string;
}

export interface ImprovementPolicy {
  id?: number;
  category: string;
  rule: string;
  priority: 'high' | 'medium' | 'low';
  evidence_count: number;
  is_custom?: boolean;
  examples?: string[];
}

export interface FeedbackStats {
  total_count: number;
  positive_count: number;
  negative_count: number;
  positive_percentage: number;
  negative_percentage: number;
  recent_feedbacks: AIResponseFeedback[];
}

// Submit AI response feedback
export const submitAIFeedback = async (data: {
  query: string;
  mode: 'quick' | 'deep';
  response_data: any;
  conversation_context?: any;
  rating: 'positive' | 'negative';
  feedback_text?: string;
}): Promise<AIResponseFeedback> => {
  const response = await api.post('/ai-feedback/', data);
  return response.data;
};

// Get active improvement policies
export const getActivePolicies = async (): Promise<{
  active_policies: ImprovementPolicy[];
  total_policies: number;
  active_count: number;
  auto_generated_count: number;
  custom_count: number;
}> => {
  const response = await api.get('/ai-feedback/active_policies/');
  return response.data;
};

// Get feedback statistics
export const getFeedbackStats = async (): Promise<FeedbackStats> => {
  const response = await api.get('/ai-feedback/stats/');
  return response.data;
};

// Get all feedbacks with pagination and filters
export const getAllFeedbacks = async (params?: {
  rating?: 'positive' | 'negative';
  mode?: 'quick' | 'deep';
  page?: number;
  page_size?: number;
}): Promise<{
  count: number;
  results: AIResponseFeedback[];
}> => {
  const response = await api.get('/ai-feedback/', { params });
  return response.data;
};

// Regenerate all policies from feedback
export const regeneratePolicies = async (): Promise<{
  policies: ImprovementPolicy[];
  count: number;
  timestamp: string;
  message: string;
}> => {
  const response = await api.post('/ai-feedback/regenerate_policies/');
  return response.data;
};

// Get policy injection status
export const getPolicyStatus = async (): Promise<{
  total_policies: number;
  auto_generated: number;
  custom: number;
  active_policies: number;
  injection_points: string[];
  last_regeneration: string | null;
  policies_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
  status: string;
  message: string;
}> => {
  const response = await api.get('/ai-feedback/policy_status/');
  return response.data;
};

// ========================================
// Custom Policy API
// ========================================

export interface CustomPolicy {
  id?: number;
  category: 'accuracy' | 'clarity' | 'completeness' | 'performance' | 'custom';
  rule: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  created_by?: number;
  created_by_username?: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

// Get all custom policies
export const getCustomPolicies = async (): Promise<CustomPolicy[]> => {
  const response = await api.get('/custom-policies/');
  return response.data;
};

// Create custom policy
export const createCustomPolicy = async (data: {
  category: string;
  rule: string;
  priority: string;
  rationale: string;
}): Promise<CustomPolicy> => {
  const response = await api.post('/custom-policies/', data);
  return response.data;
};

// Update custom policy
export const updateCustomPolicy = async (id: number, data: Partial<CustomPolicy>): Promise<CustomPolicy> => {
  const response = await api.patch(`/custom-policies/${id}/`, data);
  return response.data;
};

// Delete custom policy
export const deleteCustomPolicy = async (id: number): Promise<void> => {
  await api.delete(`/custom-policies/${id}/`);
};
