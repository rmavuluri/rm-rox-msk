import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default guest user when no sign-in (signin/signup removed)
  const defaultUser = { fullName: 'Guest', email: 'guest@example.com' };

  // Token used for API calls when no real login (backend expects Authorization: Bearer <token>)
  const GUEST_ACCESS_TOKEN = 'guest-access-token';

  // Check for existing session on app load; otherwise use guest
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = localStorage.getItem('session');
        const existingToken = localStorage.getItem('access_token');
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            setUser(sessionData.user);
            if (!existingToken && sessionData.access_token) {
              localStorage.setItem('access_token', sessionData.access_token);
            } else if (!existingToken) {
              localStorage.setItem('access_token', GUEST_ACCESS_TOKEN);
            }
          } catch (error) {
            console.error('Error parsing session data:', error);
            localStorage.removeItem('session');
            setUser(defaultUser);
            localStorage.setItem('access_token', GUEST_ACCESS_TOKEN);
          }
        } else {
          setUser(defaultUser);
          if (!existingToken) {
            localStorage.setItem('access_token', GUEST_ACCESS_TOKEN);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(defaultUser);
        localStorage.setItem('access_token', GUEST_ACCESS_TOKEN);
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

