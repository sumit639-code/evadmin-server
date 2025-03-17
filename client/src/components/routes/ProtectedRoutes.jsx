// src/components/routes/ProtectedRoutes.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';



// Protected route for any authenticated user
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes if authenticated
  return <Outlet />;
};

// Protected route specifically for admin users
export const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to main page if not an admin
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  // Render child routes if user is an admin
  return <Outlet />;
};

// Protected route for verified users only
export const VerifiedUserRoute = () => {
  const { user, loading, isVerified } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to pending verification page if not verified
  if (!isVerified()) {
    return <Navigate to="/pending-verification" replace />;
  }
  
  // Render child routes if user is verified
  return <Outlet />;
};