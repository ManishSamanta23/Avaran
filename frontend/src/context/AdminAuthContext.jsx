import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const token = localStorage.getItem('avaran_admin_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/admin/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmin(response.data);
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('avaran_admin_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/admin/auth/login', { email, password });
      const { token, admin: adminData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('avaran_admin_token', token);
      
      // Store admin data in state
      setAdmin(adminData);
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password, confirmPassword, secretKey) => {
    try {
      const response = await api.post('/admin/auth/register', { 
        name, 
        email, 
        password,
        confirmPassword,
        secretKey
      });
      const { token, admin: adminData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('avaran_admin_token', token);
      
      // Store admin data in state
      setAdmin(adminData);
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('avaran_admin_token');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, register, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
