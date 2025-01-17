import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem('jwt'));
  const location = useLocation();

  // Save the attempted URL to sessionStorage
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectPath', location.pathname);
    }
  }, [isAuthenticated, location]);

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/authenticate" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;