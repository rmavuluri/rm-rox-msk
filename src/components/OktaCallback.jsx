import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { useTheme } from '../hooks/ThemeContext';

const OktaCallback = () => {
  const navigate = useNavigate();
  const { handleOktaCallback } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleOktaCallback();
        // Redirect to dashboard after successful authentication
        navigate('/', { replace: true });
      } catch (error) {
        // Don't log "Unable to parse a token" errors (they're expected when callback is processed multiple times)
        if (!error.message?.includes('Unable to parse a token')) {
          console.error('Error processing OKTA callback:', error);
        }
        // SignIn functionality commented out - redirect to landing instead
        // navigate('/signin', { replace: true });
        navigate('/landing', { replace: true });
      }
    };

    processCallback();
  }, [handleOktaCallback, navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
        <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Authenticating...
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Please wait while we complete your sign-in
        </p>
      </div>
    </div>
  );
};

export default OktaCallback; 