import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Static credentials for the application
  const STATIC_EMAIL = 'researcher@nasa.gov';
  const STATIC_PASSWORD = 'nasa2024';

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedAuth = localStorage.getItem('nasa-auth');
    const savedUser = localStorage.getItem('nasa-user');
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
      const userData = {
        email: STATIC_EMAIL,
        name: 'NASA Researcher',
        role: 'Researcher'
      };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('nasa-auth', 'true');
      localStorage.setItem('nasa-user', JSON.stringify(userData));
      return { success: true };
    } else if (email !== STATIC_EMAIL) {
      return { success: false, error: 'Invalid email address' };
    } else {
      return { success: false, error: 'Invalid password' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('nasa-auth');
    localStorage.removeItem('nasa-user');
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
