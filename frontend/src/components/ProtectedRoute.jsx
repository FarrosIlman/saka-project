import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', fontSize: '18px' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is in allowed roles
  if (allowedRoles.length > 0) {
    const userRole = user.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect based on user's actual role
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/levels" replace />;
      }
    }
  }

  return children;
}