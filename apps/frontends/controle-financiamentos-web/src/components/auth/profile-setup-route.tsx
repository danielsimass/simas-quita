import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

export function ProfileSetupRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (user && !user.profileSetupCompleted && location.pathname !== '/app/profile') {
    return <Navigate to="/app/profile" replace />;
  }

  return <Outlet />;
}
