import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth.js';

export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (user) {
    const to = location.state?.from?.pathname ?? '/home';
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}
