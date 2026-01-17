import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import viVN from 'antd/locale/vi_VN';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Systems from './pages/Systems';
import SystemCreate from './pages/SystemCreate';
import SystemDetail from './pages/SystemDetail';
import SystemEdit from './pages/SystemEdit';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import OrganizationEdit from './pages/OrganizationEdit';
import Users from './pages/Users';
import MainLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { colors, borderRadius, spacing } from './theme/tokens';

// Ant Design Theme Configuration
const antdTheme: ThemeConfig = {
  token: {
    // Color tokens
    colorPrimary: colors.primary.main,
    colorSuccess: colors.success.main,
    colorWarning: colors.warning.main,
    colorError: colors.error.main,
    colorInfo: colors.info.main,

    // Border radius
    borderRadius: parseInt(borderRadius.base),
    borderRadiusLG: parseInt(borderRadius.md),
    borderRadiusSM: parseInt(borderRadius.sm),

    // Typography
    fontSize: 16,
    fontSizeHeading1: 36,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 18,

    // Spacing
    padding: parseInt(spacing.md),
    paddingLG: parseInt(spacing.lg),
    paddingSM: parseInt(spacing.sm),
    paddingXS: parseInt(spacing.xs),

    margin: parseInt(spacing.md),
    marginLG: parseInt(spacing.lg),
    marginSM: parseInt(spacing.sm),
    marginXS: parseInt(spacing.xs),
  },
  components: {
    Button: {
      borderRadius: parseInt(borderRadius.base),
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Input: {
      borderRadius: parseInt(borderRadius.base),
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Card: {
      borderRadiusLG: parseInt(borderRadius.md),
    },
    Table: {
      borderRadius: parseInt(borderRadius.base),
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={antdTheme}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="systems" element={<Systems />} />
            <Route path="systems/create" element={<SystemCreate />} />
            <Route path="systems/:id" element={<SystemDetail />} />
            <Route path="systems/:id/edit" element={<SystemEdit />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/:id" element={<OrganizationDetail />} />
            <Route path="organizations/:id/edit" element={<OrganizationEdit />} />
            <Route path="users" element={<Users />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
