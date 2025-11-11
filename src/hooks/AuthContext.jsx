import React, { createContext, useContext, useState, useEffect } from 'react';
import oktaAuth from '../config/okta';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOktaEnabled, setIsOktaEnabled] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if OKTA is configured
        const oktaIssuer = process.env.REACT_APP_OKTA_ISSUER;
        const oktaClientId = process.env.REACT_APP_OKTA_CLIENT_ID;
        
        if (oktaIssuer && oktaClientId && oktaIssuer !== 'https://your-okta-domain.okta.com/oauth2/default' && oktaClientId !== 'your-client-id') {
          setIsOktaEnabled(true);
          
          try {
            // Check if there are any tokens in storage first (without making network requests)
            const tokenManager = oktaAuth.tokenManager;
            const tokens = await tokenManager.getTokens();
            
            // Only check authentication if we have valid tokens
            if (tokens && tokens.accessToken && tokens.accessToken.value) {
              try {
                const isAuthenticated = await oktaAuth.isAuthenticated();
                if (isAuthenticated) {
                  try {
                    const userInfo = await oktaAuth.getUser();
                    setUser({
                      id: userInfo.sub,
                      fullName: userInfo.name,
                      email: userInfo.email,
                      provider: 'okta'
                    });
                  } catch (getUserError) {
                    // Silently handle getUser errors (token might be expired/revoked)
                    // Don't log 401 errors or revoked token errors
                    if (!getUserError.message?.includes('401') && 
                        !getUserError.message?.includes('revoked') && 
                        !getUserError.message?.includes('Unauthorized')) {
                      console.error('Error getting user info:', getUserError);
                    }
                  }
                }
              } catch (authError) {
                // Silently handle authentication errors (user not logged in)
                // This is normal when the user hasn't logged in yet
                // Don't log 401 errors or revoked token errors
                if (!authError.message?.includes('401') && 
                    !authError.message?.includes('revoked') && 
                    !authError.message?.includes('Unauthorized')) {
                  console.error('Authentication check error:', authError);
                }
              }
            }
            // If no tokens, user is not authenticated - no need to make network requests
          } catch (tokenError) {
            // Silently handle token manager errors
            // This is normal when no tokens exist
          }
        } else {
          // OKTA not configured, check for local storage authentication
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
        }
      } catch (error) {
        // Don't log errors for revoked tokens (normal after logout)
        if (!error.message?.includes('revoked') && !error.message?.includes('401')) {
          console.error('Error checking authentication:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userData) => {
    console.log('AuthContext login called with:', userData);
    console.log('isOktaEnabled:', isOktaEnabled);
    
    if (userData) {
      // Local storage authentication (takes priority)
      console.log('Setting user for local storage auth:', userData);
      setUser(userData);
      console.log('User set successfully');
    } else if (isOktaEnabled) {
      // Redirect to OKTA login (only when no userData provided)
      console.log('Redirecting to Okta...');
      await oktaAuth.signInWithRedirect();
    } else {
      console.log('No userData provided and Okta not enabled');
    }
  };

  const logout = async () => {
    if (isOktaEnabled) {
      // Logout from OKTA
      await oktaAuth.signOut();
    } else {
      // Local storage logout
      localStorage.removeItem('session');
    }
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const handleOktaCallback = async () => {
    try {
      // Check if we're on the callback URL and have authorization code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (!code) {
        // Don't throw error if no code - just return silently
        // This prevents errors when user refreshes the callback page
        return;
      }
      
      console.log('Starting Okta handleRedirect...');
      await oktaAuth.handleRedirect();
      console.log('Okta handleRedirect completed');
      
      // Clear URL parameters after successful token processing
      window.history.replaceState({}, document.title, '/login/callback');
      
      const isAuthenticated = await oktaAuth.isAuthenticated();
      console.log('Is authenticated:', isAuthenticated);
      
      if (isAuthenticated) {
        try {
          const userInfo = await oktaAuth.getUser();
          console.log('User info:', userInfo);
          setUser({
            id: userInfo.sub,
            fullName: userInfo.name,
            email: userInfo.email,
            provider: 'okta'
          });
        } catch (getUserError) {
          // Silently handle getUser errors (token might be expired/revoked)
          // Don't log 401 errors or revoked token errors
          if (!getUserError.message?.includes('401') && 
              !getUserError.message?.includes('revoked') && 
              !getUserError.message?.includes('Unauthorized')) {
            console.error('Error getting user info in callback:', getUserError);
          }
        }
      }
    } catch (error) {
      // Don't log "Unable to parse a token" errors (they're expected when callback is processed multiple times)
      if (!error.message?.includes('Unable to parse a token')) {
        console.error('Error handling OKTA callback:', error);
      }
      throw error; // Re-throw to let the callback component handle it
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated,
      isOktaEnabled,
      handleOktaCallback
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 