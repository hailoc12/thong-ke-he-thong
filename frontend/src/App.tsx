import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
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

function App() {
  return (
    <ConfigProvider locale={viVN}>
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
