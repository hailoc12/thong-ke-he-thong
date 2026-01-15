# Task: Init React Frontend

**ID**: TODO-006
**Phase**: 1 - Core Setup
**Priority**: P1 (High)
**Estimate**: 3 hours
**Status**: TODO

---

## 📋 Description

Khởi tạo React + TypeScript + Ant Design frontend với login và organization management.

---

## ✅ Acceptance Criteria

- [ ] Vite + React + TypeScript project created
- [ ] Ant Design installed and configured
- [ ] React Router setup
- [ ] Axios configured with JWT interceptor
- [ ] Zustand store for auth
- [ ] Login page working
- [ ] Organization List page working
- [ ] Can connect to Django backend API

---

## 🛠️ Implementation Steps

### 1. Create Vite Project
```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Install Dependencies
```bash
npm install antd @ant-design/icons
npm install axios react-router-dom zustand
npm install react-hook-form zod @hookform/resolvers
npm install dayjs recharts

# Dev dependencies
npm install -D @types/node
```

### 3. Configure Vite (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### 4. Create API Service (src/services/api.ts)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          'http://localhost:8000/api/token/refresh/',
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 5. Create Auth Store (src/stores/authStore.ts)
```typescript
import { create } from 'zustand';
import api from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async (username: string, password: string) => {
    const response = await api.post('/api/token/', { username, password });
    const { access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    set({ isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/api/user/me/');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
```

### 6. Create Login Page (src/pages/Login.tsx)
```typescript
import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      message.error('Đăng nhập thất bại. Kiểm tra lại username/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Đăng nhập" style={{ width: 400 }}>
        <Form name="login" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
```

### 7. Create App Router (src/App.tsx)
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { OrganizationList } from './pages/Organizations/OrganizationList';
import { useAuthStore } from './stores/authStore';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <OrganizationList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
```

### 8. Create .env.example
```env
VITE_API_URL=http://localhost:8000
```

### 9. Test Frontend
```bash
npm run dev
# Visit http://localhost:3000
# Try login with admin/admin123
```

---

## 📦 Deliverables

- Vite + React + TypeScript project
- Ant Design configured
- API service with JWT interceptor
- Auth store with Zustand
- Login page working
- Router setup
- Protected routes

---

## 🔗 Dependencies

**Blocked by**: TODO-004 (REST API Setup)
**Blocks**: Form development

---

## 📝 Notes

- Use Vite for fast HMR
- Ant Design has great form components
- Zustand is simpler than Redux
- JWT auto-refresh prevents logout

---

**Created**: 2026-01-15
