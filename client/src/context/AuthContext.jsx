import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [isAuthReady, setIsAuthReady] = useState(!localStorage.getItem('token'));

  const login = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    setIsAuthReady(true);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userValue));
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setIsAuthReady(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

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

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}
