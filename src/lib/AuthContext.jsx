import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';

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

      const publicPaths = ['/login', '/about', '/services', '/projects', '/reviews', '/contact', '/book', '/'];
      if (!publicPaths.includes(window.location.pathname) && !window.location.pathname.startsWith('/services/')) {
        setAuthError({ type: 'auth_required', message: 'Authentication expired.' });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const completeFirebaseLogin = async (firebaseUser, profile = {}) => {
    try {
      const firebaseToken = await firebaseUser.getIdToken();
      const res = await api.post('/api/auth/firebase-login', {
        firebaseToken,
        profile
      });
      const { token, user: loggedUser } = res.data;

      if (token && loggedUser) {
        const mergedUser = {
          ...loggedUser,
          name: loggedUser.name || profile.name || firebaseUser.displayName || '',
          email: loggedUser.email || firebaseUser.email || '',
          mobile_number: loggedUser.mobile_number || profile.mobileNumber || '',
        };
        localStorage.setItem('mbc_jwt_token', token);
        localStorage.setItem('mbc_user_session', JSON.stringify(mergedUser));
        setUser(mergedUser);
        setIsAuthenticated(true);
        setAuthError(null);
        return mergedUser;
      }
      throw new Error('Login failed. Please try again.');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      const wrappedError = new Error(errorMsg);
      wrappedError.code = err.response?.data?.code;
      throw wrappedError;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return completeFirebaseLogin(result.user);
  };

  const sendEmailOtp = async ({ email, name }) => {
    const normalizedEmail = email.trim().toLowerCase();
    await api.post('/api/auth/send-email-otp', {
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0]
    });
    return { email: normalizedEmail };
  };

  const verifyEmailOtp = async ({ email, otp }) => {
    const normalizedEmail = email.trim().toLowerCase();
    await api.post('/api/auth/verify-email-otp', {
      email: normalizedEmail,
      otp
    });
    return { email: normalizedEmail };
  };

  const loginWithEmail = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);

    try {
      const user = await completeFirebaseLogin(result.user);
      localStorage.removeItem(`mbc_pending_signup_${normalizedEmail}`);
      return user;
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        await sendEmailOtp({
          email: normalizedEmail,
          name: result.user.displayName || normalizedEmail.split('@')[0]
        });
        await signOut(auth).catch(() => {});
      }
      throw err;
    }
  };

  const createAccount = async ({ fullName, email, password, mobileNumber }) => {
    const normalizedEmail = email.trim().toLowerCase();
    await sendEmailOtp({ email: normalizedEmail, name: fullName });
    localStorage.setItem(`mbc_pending_signup_${normalizedEmail}`, JSON.stringify({
      name: fullName,
      mobileNumber,
      password
    }));
    return { otpSent: true, email: normalizedEmail };
  };

  const verifySignupOtp = async ({ email, otp }) => {
    const normalizedEmail = email.trim().toLowerCase();
    await verifyEmailOtp({ email: normalizedEmail, otp });

    const pendingProfile = JSON.parse(localStorage.getItem(`mbc_pending_signup_${normalizedEmail}`) || '{}');
    if (!pendingProfile.password) {
      throw new Error('Signup details expired. Please create your account again.');
    }

    const result = await createUserWithEmailAndPassword(auth, normalizedEmail, pendingProfile.password);
    await updateProfile(result.user, { displayName: pendingProfile.name });
    const user = await completeFirebaseLogin(result.user, pendingProfile);
    localStorage.removeItem(`mbc_pending_signup_${normalizedEmail}`);
    return user;
  };

  const verifyLoginOtp = async ({ email, otp, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    await verifyEmailOtp({ email: normalizedEmail, otp });
    const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    return completeFirebaseLogin(result.user);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Failed to notify backend on logout:', err);
    }
    localStorage.removeItem('mbc_jwt_token');
    localStorage.removeItem('mbc_user_session');
    await signOut(auth).catch(() => {});
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
      loginWithGoogle,
      loginWithEmail,
      createAccount,
      sendEmailOtp,
      verifySignupOtp,
      verifyLoginOtp,
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
