import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  timeoutMinutes?: number;
}

export default function ProtectedRoute({ allowedRoles, timeoutMinutes = 15 }: ProtectedRouteProps) {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      logout();
      notify({
        title: 'Session Expired',
        message: 'You have been automatically logged out due to inactivity.',
        type: 'info'
      });
      navigate('/login', { state: { from: location }, replace: true });
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (user) {
      // Set initial timeout
      resetTimeout();

      // Events to track user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const handleActivity = () => {
        resetTimeout();
      };

      // Add event listeners
      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      // Cleanup
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

