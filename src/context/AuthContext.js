import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    decodeAndSetUser(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const decodeAndSetUser = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      console.error('Token decoding error:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      decodeAndSetUser(token);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timeout = setTimeout(() => {
        logout();
      }, 3600000); // Loggt den Benutzer nach 1 Stunde Inaktivität aus
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
