import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lunar_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (user && user.token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser((prev) => ({ ...prev, ...res.data.data }));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('lunar_user', JSON.stringify(userData));
      return userData;
    }
  };

  const register = async (name, email, password, organization, role = 'user') => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      organization,
      role,
    });
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('lunar_user', JSON.stringify(userData));
      return userData;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lunar_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
