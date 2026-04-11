import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('avaran_admin');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAdmin(parsed);
      } catch (e) {
        console.error('Error parsing admin session:', e);
        localStorage.removeItem('avaran_admin');
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    setAdmin(data);
    localStorage.setItem('avaran_admin', JSON.stringify(data));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('avaran_admin');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
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
