import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '../../app/providers/AuthProvider';
import { LoadingScreen } from '../ui/LoadingScreen';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
