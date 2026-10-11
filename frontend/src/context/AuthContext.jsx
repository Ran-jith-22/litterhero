import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('litterhero_token') || null);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);

  // Initialize and load current user session
  useEffect(() => {
    async function initSession() {
      try {
        const statusRes = await api.getStatus();
        setSystemStatus(statusRes);
      } catch (err) {
        console.warn('Backend status check failed:', err);
      }

      const savedToken = localStorage.getItem('litterhero_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err);
          logout();
        }
      } else {
        // Automatically sign in as default demo user for frictionless judge demo
        try {
          const res = await api.login('demo@litterhero.org', 'LitterHero2026!');
          localStorage.setItem('litterhero_token', res.token);
          setToken(res.token);
          setUser(res.user);
        } catch (demoErr) {
          console.warn('Demo login initialization failed:', demoErr);
        }
      }
      setLoading(false);
    }

    initSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('litterhero_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (email, password, name) => {
    const res = await api.register(email, password, name);
    localStorage.setItem('litterhero_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('litterhero_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
      return res.user;
    } catch (err) {
      console.warn('Failed to refresh user:', err);
    }
  };

  // Demonstration role switcher: genuinely logs in via backend API!
  const switchDemoAccount = async (targetRole) => {
    setLoading(true);
    try {
      if (targetRole === 'ADMIN') {
        await login('admin@litterhero.org', 'LitterHero2026!');
      } else if (targetRole === 'SARAH') {
        await login('sarah@community.org', 'LitterHero2026!');
      } else {
        await login('demo@litterhero.org', 'LitterHero2026!');
      }
    } catch (err) {
      console.error('Demo account switch failed:', err);
      alert('Account switch failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        systemStatus,
        login,
        register,
        logout,
        refreshUser,
        switchDemoAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
