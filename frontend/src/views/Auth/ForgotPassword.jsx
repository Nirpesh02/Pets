import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    }, 600);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-brand-head">
          <div className="auth-logo-circle">
            <PawPrint size={28} className="text-white" />
          </div>
          <h1 className="auth-title">Reset Your Password</h1>
          <p className="auth-subtitle">
            Enter your registered email and we'll send a recovery link for your account.
          </p>
        </div>

        {submitted ? (
          <div className="reset-success-box">
            <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-3" />
            <h3>Check Your Email</h3>
            <p>
              We've dispatched recovery instructions to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="block mt-4">
              <Button variant="primary" fullWidth>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Registered Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefixIcon={Mail}
              placeholder="you@example.com"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              className="mt-2"
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="auth-footer-text">
          <Link to="/login" className="back-to-login-link">
            <ArrowLeft size={14} className="inline-icon" /> Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
