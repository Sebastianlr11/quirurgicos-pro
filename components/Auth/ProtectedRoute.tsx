import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 50%, #f5f3ff 100%)'
      }}>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If profile loaded and role is pending, redirect to login
  if (profile && profile.role === 'pending') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
