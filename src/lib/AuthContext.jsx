import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';
import { auth } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    const token = localStorage.getItem('mbc_jwt_token');
    const storedUser = localStorage.getItem('mbc_user_session');

    if (!token || !storedUser) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);

      const res = await api.get('/api/auth/me');
      const freshUser = res.data;

      setUser(freshUser);
      localStorage.setItem('mbc_user_session', JSON.stringify(freshUser));
    } catch (err) {
      console.error('Session verification failed, logging out...', err);
      localStorage.removeItem('mbc_jwt_token');
      localStorage.removeItem('mbc_user_session');
      setUser(null);
      setIsAuthenticated(false);

      const publicPaths = ['/login', '/about', '/services', '/projects', '/reviews', '/contact', '/'];
      if (!publicPaths.includes(window.location.pathname) && !window.location.pathname.startsWith('/services/')) {
        setAuthError({ type: 'auth_required', message: 'Authentication expired.' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const firebaseLogin = async (firebaseToken) => {
    try {
      const res = await api.post('/api/auth/firebase-login', { firebaseToken });
      const { userExists, token, user: loggedUser, phoneNumber } = res.data;

      if (userExists && token && loggedUser) {
        localStorage.setItem('mbc_jwt_token', token);
        localStorage.setItem('mbc_user_session', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setIsAuthenticated(true);
        setAuthError(null);
      }

      return { userExists, phoneNumber, user: loggedUser || null };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      throw new Error(errorMsg);
    }
  };

  const registerUser = async (name, city, firebaseToken) => {
    try {
      const res = await api.post('/api/auth/register', {
        name,
        city,
        firebaseToken
      });
      const { token, user: createdUser } = res.data;

      if (token && createdUser) {
        localStorage.setItem('mbc_jwt_token', token);
        localStorage.setItem('mbc_user_session', JSON.stringify(createdUser));
        setUser(createdUser);
        setIsAuthenticated(true);
        setAuthError(null);
      }

      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Failed to notify backend on logout:', err);
    }
    localStorage.removeItem('mbc_jwt_token');
    localStorage.removeItem('mbc_user_session');
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    window.location.href = '/login';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      authChecked,
      firebaseLogin,
      registerUser,
      logout,
      navigateToLogin,
      checkAppState,
      checkUserAuth: checkAppState,
      isLoadingPublicSettings
    }}>
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
