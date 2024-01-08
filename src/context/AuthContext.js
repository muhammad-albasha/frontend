import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
      } catch {
        return false;
      }
    }
    return false;
  });
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const decodeAndSetUser = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token decoding error:', error);
      logout();
    }
  }, [logout]);

  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    decodeAndSetUser(token);
  }, [decodeAndSetUser]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      decodeAndSetUser(token);
    }
  }, [decodeAndSetUser]);

  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
    };

    const interval = setInterval(checkTokenValidity, 60000); // Überprüft alle 60 Sekunden
    return () => clearInterval(interval);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
