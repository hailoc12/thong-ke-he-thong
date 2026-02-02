import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../stores/authStore';

interface LeaderRouteProps {
  children: React.ReactElement;
}

/**
 * LeaderRoute - Protected route for leader accounts only
 * Only lanhdaobo can access - admin cannot see this route
 */
const LeaderRoute: React.FC<LeaderRouteProps> = ({ children }) => {
  const { isAuthenticated, isLeader, isLoading } = useAuthStore();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but not a leader → redirect to dashboard
  if (!isLeader) {
    return <Navigate to="/dashboard" replace />;
  }

  // Leader user → allow access
  return children;
};

export default LeaderRoute;
