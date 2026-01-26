import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface LeaderRouteProps {
  children: React.ReactElement;
}

/**
 * LeaderRoute - Protected route for leader accounts only
 * Only users in LEADER_USERNAMES list (lanhdaobo, admin) can access
 */
const LeaderRoute: React.FC<LeaderRouteProps> = ({ children }) => {
  const { isAuthenticated, isLeader } = useAuthStore();

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
