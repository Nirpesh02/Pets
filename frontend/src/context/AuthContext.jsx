import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pawnepal_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => sessionStorage.getItem('pawnepal_jwt_token') || null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [toast]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      const payload = res.data || res;
      if (payload?.token) {
        const authUser = payload.user;
        setUser(authUser);
        setToken(payload.token);
        sessionStorage.setItem('pawnepal_user', JSON.stringify(authUser));
        sessionStorage.setItem('pawnepal_jwt_token', payload.token);
        toast.success(`Welcome back, ${authUser.name}!`);
        return { success: true, user: authUser };
      }
      throw new Error(payload?.message || 'Login failed');
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || apiErr.message || 'Invalid email or password';
      toast.error(msg);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/register', userData);
      const payload = res.data || res;
      if (payload?.token) {
        const authUser = payload.user;
        setUser(authUser);
        setToken(payload.token);
        sessionStorage.setItem('pawnepal_user', JSON.stringify(authUser));
        sessionStorage.setItem('pawnepal_jwt_token', payload.token);
        toast.success('Registration successful! Welcome to PawNepal 🐾');
        return { success: true, user: authUser };
      }
      throw new Error(payload?.message || 'Registration failed');
    } catch (apiErr) {
      const msg = apiErr.response?.data?.message || apiErr.message || 'Registration failed';
      toast.error(msg);
      throw apiErr;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('pawnepal_user');
    sessionStorage.removeItem('pawnepal_jwt_token');
    toast.info('You have logged out.');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      sessionStorage.setItem('pawnepal_user', JSON.stringify(merged));
      return merged;
    });
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axiosClient.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data?.user || res.user;
      if (updatedUser) {
        updateUser(updatedUser);
      } else if (res.data?.avatar || res.avatar) {
        updateUser({ avatar: res.data?.avatar || res.avatar });
      }
      toast.success('Profile picture updated successfully! 📸');
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload profile picture';
      toast.error(msg);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axiosClient.put('/auth/me', profileData);
      const payload = res.data || res;
      if (payload.token) {
        setToken(payload.token);
        sessionStorage.setItem('pawnepal_jwt_token', payload.token);
      }
      const updatedUser = payload.user || payload;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      toast.success('Account information updated successfully! ✨');
      return payload;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update account';
      toast.error(msg);
      throw err;
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = Boolean(user?.isSuperAdmin || user?.email === 'admin@pawnepal.com');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        logout,
        updateUser,
        uploadAvatar,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
