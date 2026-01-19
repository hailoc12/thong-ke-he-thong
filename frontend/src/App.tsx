import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import viVN from 'antd/locale/vi_VN';
import HomeRedirect from './components/HomeRedirect';
import Login from './pages/Login';
// import Register from './pages/Register'; // Registration disabled
import Dashboard from './pages/Dashboard';
import Systems from './pages/Systems';
import SystemCreate from './pages/SystemCreate';
import SystemDetail from './pages/SystemDetail';
import SystemEdit from './pages/SystemEdit';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import OrganizationEdit from './pages/OrganizationEdit';
import Users from './pages/Users';
import Help from './pages/Help';
import Analytics from './pages/Analytics';
import Approvals from './pages/Approvals';
import Benchmarking from './pages/Benchmarking';
import Lifecycle from './pages/Lifecycle';
import APICatalog from './pages/APICatalog';
import MainLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { colors, borderRadius, spacing } from './theme/tokens';
import { isFeatureEnabled } from './config/features';
import type { FeatureFlags } from './config/features';

// Feature-protected route wrapper
const FeatureRoute = ({
  feature,
  element,
}: {
  feature: keyof FeatureFlags;
  element: React.ReactElement;
}) => {
  return isFeatureEnabled(feature) ? element : <Navigate to="/" replace />;
};

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
          {/* Root - show landing page or redirect to dashboard based on auth */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/help" element={<Help />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="systems" element={<Systems />} />
            <Route path="systems/create" element={<SystemCreate />} />
            <Route path="systems/:id" element={<SystemDetail />} />
            <Route path="systems/:id/edit" element={<SystemEdit />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/:id" element={<OrganizationDetail />} />
            <Route path="organizations/:id/edit" element={<OrganizationEdit />} />
            <Route path="users" element={<Users />} />

            {/* Premium Features - Protected by feature flags */}
            <Route path="analytics" element={<FeatureRoute feature="analytics" element={<Analytics />} />} />
            <Route path="approvals" element={<FeatureRoute feature="approvals" element={<Approvals />} />} />
            <Route path="benchmarking" element={<FeatureRoute feature="benchmarking" element={<Benchmarking />} />} />
            <Route path="lifecycle" element={<FeatureRoute feature="lifecycle" element={<Lifecycle />} />} />
            <Route path="api-catalog" element={<FeatureRoute feature="apiCatalog" element={<APICatalog />} />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
