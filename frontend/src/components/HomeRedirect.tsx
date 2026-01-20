import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import LandingPage from '../pages/LandingPage';

const HomeRedirect = () => {
  const { isAuthenticated, isAdmin, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // If authenticated, redirect based on role
  if (isAuthenticated) {
    // Admin users → main dashboard
    // Org users → unit dashboard
    return <Navigate to={isAdmin ? "/dashboard" : "/dashboard/unit"} replace />;
  }

  // If not authenticated, show landing page
  return <LandingPage />;
};

export default HomeRedirect;
