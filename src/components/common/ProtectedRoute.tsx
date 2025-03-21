import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { hasPermission } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  path: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  path
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Check if user has permission to access this route
  // if (!hasPermission(path)) {
  //   return <Navigate to="/unauthorized" />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;