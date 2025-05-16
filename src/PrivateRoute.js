import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ isAuthenticated, children }) => {
  if (isAuthenticated === null) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
