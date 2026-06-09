import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

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
      // Decode stored user as immediate fallback
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);

      // Verify token freshness against backend API
      const res = await api.get('/api/auth/me');
      const freshUser = res.data;
      
      // Update with fresh database details
      setUser(freshUser);
      localStorage.setItem('mbc_user_session', JSON.stringify(freshUser));
    } catch (err) {
      console.error('Session verification failed, logging out...', err);
      // Clean storage if token is invalid or expired
      localStorage.removeItem('mbc_jwt_token');
      localStorage.removeItem('mbc_user_session');
      setUser(null);
      setIsAuthenticated(false);
      
      // Setup auth required error if they are on a protected path
      const publicPaths = ['/login', '/about', '/services', '/projects', '/reviews', '/contact', '/'];
      if (!publicPaths.includes(window.location.pathname) && !window.location.pathname.startsWith('/services/')) {
        setAuthError({ type: 'auth_required', message: 'Authentication expired.' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  /**
   * Triggers OTP generation and delivery on the Express backend
   */
  const sendOtp = async (mobileNumber) => {
    try {
      const res = await api.post('/api/auth/send-otp', { mobile_number: mobileNumber });
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP. Please try again.';
      throw new Error(errorMsg);
    }
  };

  /**
   * Verifies OTP and returns user profile existence flag
   */
  const verifyOtp = async (mobileNumber, otp) => {
    try {
      const res = await api.post('/api/auth/verify-otp', { mobile_number: mobileNumber, otp });
      const { userExists, token, user: loggedUser } = res.data;

      if (userExists && token && loggedUser) {
        localStorage.setItem('mbc_jwt_token', token);
        localStorage.setItem('mbc_user_session', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setIsAuthenticated(true);
        setAuthError(null);
      }
      
      return res.data; // { userExists, token, user } or { userExists: false, verifiedMobile }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Incorrect OTP code. Please try again.';
      throw new Error(errorMsg);
    }
  };

  /**
   * Registers a first-time user profile
   */
  const registerUser = async (name, mobileNumber, city) => {
    try {
      const res = await api.post('/api/auth/register', {
        name,
        mobile_number: mobileNumber,
        city
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

  /**
   * Logs out user and clears local session
   */
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
      sendOtp,
      verifyOtp,
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
