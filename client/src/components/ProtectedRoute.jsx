import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles = null, requirePlatformAdmin = false }) {
  const { token, user, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requirePlatformAdmin && user && !user.is_platform_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (
    user
    && user.gym_is_platform_suspended
    && !user.is_platform_admin
    && !['/suspended', '/billing', '/account'].includes(location.pathname)
  ) {
    return <Navigate to="/suspended" replace />;
  }

  return children;
}
