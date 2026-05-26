import { useCallback, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [isAuthReady, setIsAuthReady] = useState(!localStorage.getItem('token'));

  const login = useCallback((tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    setIsAuthReady(true);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userValue));
  }, []);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setIsAuthReady(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    if (!token) {
      setIsAuthReady(true);
      return undefined;
    }

    const syncCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken('');
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };

    syncCurrentUser();
    return undefined;
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }

    const response = await api.get('/auth/me');
    setUser(response.data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }, [token]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'token' && event.key !== 'user') {
        return;
      }

      const nextToken = localStorage.getItem('token') || '';
      const nextUser = JSON.parse(localStorage.getItem('user') || 'null');

      setToken(nextToken);
      setUser(nextUser);
      setIsAuthReady(true);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}
