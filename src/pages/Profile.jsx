import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || '', email: user.email || '' });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...formData };
        localStorage.setItem('users', JSON.stringify(users));
      }
      const session = JSON.parse(localStorage.getItem('session') || '{}');
      session.user = { ...session.user, ...formData };
      localStorage.setItem('session', JSON.stringify(session));
      login({ ...user, ...formData });
      setSuccess('Profile updated successfully!');
      // SignIn functionality commented out
      // setTimeout(() => {
      //   localStorage.removeItem('session');
      //   navigate('/signin', { state: { message: 'Profile updated. Please sign in again.' } });
      // }, 1200);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  // SignIn functionality commented out - allow access for now
  // if (!user) {
  //   navigate('/signin');
  //   return null;
  // }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          {success && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm">{success}</div>}
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-900' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-900'}`}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-900' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-900'}`}
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-blue-900 hover:bg-blue-950 text-white shadow-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile; 