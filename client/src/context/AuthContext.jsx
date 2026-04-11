import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const login = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userValue));
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    if (!token) return;
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}