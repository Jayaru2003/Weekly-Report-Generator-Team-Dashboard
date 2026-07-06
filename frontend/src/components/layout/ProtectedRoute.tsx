import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';

function defaultRouteForRole(role: UserRole): string {
  return role === 'MANAGER' ? '/dashboard' : '/my-reports';
}

type ProtectedRouteProps = {
  children: ReactNode;
  role?: UserRole;
};

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role ? defaultRouteForRole(user.role) : '/login'} replace />;
  }

  return <>{children}</>;
}

export function postLoginRoute(role: UserRole): string {
  return defaultRouteForRole(role);
}
