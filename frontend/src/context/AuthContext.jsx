import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Fetch latest user data in background
      userAPI.getProfile()
        .then(res => {
          if (res.data && res.data._id) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        })
        .catch(err => console.error('Failed to fetch latest profile:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...newData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const completeTutorial = async () => {
    try {
      await userAPI.completeTutorial();
      updateUser({ hasCompletedTutorial: true });
    } catch (error) {
      console.error('Failed to complete tutorial:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAdmin,
    updateUser,
    completeTutorial,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};