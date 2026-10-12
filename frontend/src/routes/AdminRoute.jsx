import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-loader-screen">
        <div className="loader-box">Verifying Admin Permissions...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="unauthorized-page-container">
        <div className="unauthorized-card">
          <div className="unauth-icon-wrap">
            <ShieldAlert size={48} className="text-red" />
          </div>
          <h2 className="unauth-title">Admin Access Required</h2>
          <p className="unauth-desc">
            You are currently logged in as a <strong>Customer</strong>. Only store administrators can access the admin management portal.
          </p>
          <div className="unauth-actions">
            <Link to="/login" className="app-btn btn-primary">
              Sign In as Admin
            </Link>
            <Link to="/" className="app-btn btn-outline">
              <ArrowLeft size={16} /> Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
