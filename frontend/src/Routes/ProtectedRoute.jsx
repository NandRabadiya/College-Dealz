import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem("jwt"));
  const location = useLocation();

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute - current location:", location);

  if (!isAuthenticated) {
    console.log("ProtectedRoute - redirecting to authenticate");
    return <Navigate to="/authenticate" state={{ from: location.pathname }} replace />;
  }

  return children; // Render the protected component
};

export default ProtectedRoute;