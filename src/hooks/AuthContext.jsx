import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for local storage authentication
        const session = localStorage.getItem('session');
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            setUser(sessionData.user);
          } catch (error) {
            console.error('Error parsing session data:', error);
            localStorage.removeItem('session');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    console.log('AuthContext login called with:', userData);

    if (userData) {
      // Local storage authentication
      console.log('Setting user for local storage auth:', userData);
      setUser(userData);
      console.log('User set successfully');
    }
  };

  const logout = async () => {
    // Local storage logout
    localStorage.removeItem('session');
    // Always clear the access token on logout
    localStorage.removeItem('access_token');

    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

