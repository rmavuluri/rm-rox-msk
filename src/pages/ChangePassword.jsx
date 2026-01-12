import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/ThemeContext';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    // Check current password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx === -1 || users[idx].password !== passwordData.currentPassword) {
      setPasswordError('Current password is incorrect.');
      return;
    }
    // Update password
    users[idx].password = passwordData.newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    // Update session
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    session.user.password = passwordData.newPassword;
    localStorage.setItem('session', JSON.stringify(session));
    setPasswordSuccess('Password changed successfully!');
    // SignIn functionality commented out
    // setTimeout(() => {
    //   localStorage.removeItem('session');
    //   navigate('/signin', { state: { message: 'Password changed. Please sign in again.' } });
    // }, 1200);
  };

  // SignIn functionality commented out - allow access for now
  // if (!user) {
  //   navigate('/signin');
  //   return null;
  // }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h1>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {passwordSuccess && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm">{passwordSuccess}</div>}
          {passwordError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{passwordError}</div>}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-900' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-900'}`}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-900' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-900'}`}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-900' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-900'}`}
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-blue-900 hover:bg-blue-950 text-white shadow-lg"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 