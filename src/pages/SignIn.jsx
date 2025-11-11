import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';
import { useAuth } from '../hooks/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import OktaConfigChecker from '../components/OktaConfigChecker';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { login, isOktaEnabled } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('Starting email/password login...');
      
      // Always use local storage authentication for email/password form
      const userData = {
        id: Date.now().toString(),
        email: formData.email,
        fullName: formData.email.split('@')[0], // Use email prefix as name
        provider: 'local'
      };
      
      console.log('User data created:', userData);
      
      // Store in localStorage
      const session = {
        user: userData,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem('session', JSON.stringify(session));
      
      console.log('Session stored in localStorage');
      
      // Call login function to update auth context
      await login(userData);
      
      console.log('Login function completed, redirecting...');
      
      // Redirect to dashboard after successful login
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOktaLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      setErrors({ general: 'Failed to initiate OKTA login. Please try again.' });
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Okta Configuration Status */}
        <div className="mb-6">
          <OktaConfigChecker />
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent">
              FULCRUM
            </span>
          </div>
          {/* <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome Back
          </h1> */}
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to your account
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div 
            className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm mb-6"
            role="alert"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        {/* OKTA Login Button */}
        {isOktaEnabled && (
          <div className="mb-6">
            <button
              onClick={handleOktaLogin}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-950 transform hover:scale-[1.02]'
              } text-white shadow-lg`}
              aria-label="Sign in with OKTA"
            >
              <Shield size={20} aria-hidden="true" />
              <span>{isLoading ? 'Signing In...' : 'Sign In with OKTA'}</span>
            </button>
          </div>
        )}

        {/* Divider */}
        {isOktaEnabled && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                Or continue with
              </span>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Debug info */}
          {/* <div className="text-xs text-gray-500 mb-2">
            Debug: Form will use local storage authentication
          </div> */}
          {/* Email Field */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.email 
                    ? 'border-red-500' 
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                required
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password 
                    ? 'border-red-500' 
                    : isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-950 transform hover:scale-[1.02]'
            } text-white shadow-lg`}
            aria-label={isLoading ? 'Signing in...' : 'Sign in'}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Error Message */}
        {errors.general && (
          <div 
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm mt-4"
            role="alert"
            aria-live="polite"
          >
            {errors.general}
          </div>
        )}

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-blue-900 hover:text-blue-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 