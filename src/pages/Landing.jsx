import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';

const Landing = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // SignIn/SignUp functionality commented out - redirect to dashboard instead
    // Check if there are any registered users
    // const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // if (users.length > 0) {
    //   // If users exist, redirect to signin
    //   navigate('/signin', { replace: true });
    // } else {
    //   // If no users exist, redirect to signup
    //   navigate('/signup', { replace: true });
    // }
    
    // Redirect to dashboard instead
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto mb-4"></div>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Redirecting...
        </p>
      </div>
    </div>
  );
};

export default Landing; 