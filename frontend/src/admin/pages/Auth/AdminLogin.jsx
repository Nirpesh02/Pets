import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Store, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as an administrator, directly open Admin Dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Pass 'admin' portal flag to strictly enforce administrator authentication
      const res = await login(email, password, 'admin');
      if (res?.success) {
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Only administrators can access this portal.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Security / Admin Header */}
        <div className="admin-login-header">
          <div className="admin-shield-icon-wrap">
            <Shield size={32} className="admin-shield-icon" />
          </div>
          <div className="admin-login-badge">RESTRICTED PORTAL</div>
          <h1 className="admin-login-title">PawNepal Admin Console</h1>
          <p className="admin-login-subtitle">
            Sign in with authorized administrator credentials to manage catalog, orders, and inventory.
          </p>
        </div>

        {/* Error Alert if login fails */}
        {errorMsg && (
          <div className="admin-login-alert">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={Mail}
            placeholder="nirpeshdhungel7@gmail.com"
            required
            autoComplete="email"
          />

          <Input
            label="Master Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefixIcon={Lock}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            icon={KeyRound}
            iconPosition="left"
            className="admin-submit-btn"
          >
            Access Management Console
          </Button>
        </form>

        {/* Footer / Back to store */}
        <div className="admin-login-footer">
          <div className="admin-security-note">
            <Lock size={12} />
            <span>Secure 256-bit SSL encrypted administrative access</span>
          </div>

          <Link to="/" className="admin-back-store-link">
            <Store size={15} />
            <span>Return to Public Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
