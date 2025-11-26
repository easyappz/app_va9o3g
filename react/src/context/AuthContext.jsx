import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth';
import instance from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete instance.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const data = await loginApi({ username, password });
      const { token: newToken, id, username: userName } = data;
      
      const userData = { id, username: userName };
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, password) => {
    try {
      const data = await registerApi({ username, password });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutApi();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
