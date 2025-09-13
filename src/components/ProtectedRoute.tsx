import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'cashier';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}