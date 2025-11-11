import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!user) {
    // SignIn functionality commented out - allow access for now
    // return <Navigate to="/signin" state={{ from: location }} replace />;
    // Allow access without authentication for now
    return children;
  }

  return children;
};

export default ProtectedRoute; 