import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getRedirectPath = () => {
    if (location.state?.from) {
      if (typeof location.state.from === 'string') {
        return location.state.from;
      }
      if (location.state.from.pathname) {
        return `${location.state.from.pathname}${location.state.from.search || ''}`;
      }
    }
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password, 'customer');
      if (res.success) {
        navigate(getRedirectPath(), { replace: true });
      }
    } catch {
      // Toast message already handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-head">
          <div className="auth-logo-circle">
            <PawPrint size={28} className="text-white" />
          </div>
          <h1 className="auth-title">Welcome to PawNepal</h1>
          <p className="auth-subtitle">Sign in to manage your pets, orders, and nutrition guides</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={Mail}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefixIcon={Lock}
            placeholder="••••••••"
            required
          />

          <div className="auth-options-row">
            <label className="auth-remember-label">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            icon={ArrowRight}
            iconPosition="right"
            className="mt-2"
          >
            Sign In to Account
          </Button>
        </form>

        <div className="auth-footer-text">
          Don't have an account yet?{' '}
          <Link to="/register" state={location.state} className="auth-switch-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
