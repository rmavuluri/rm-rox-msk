import React from 'react';
import { Sun, Moon, LogOut, User, Shield, Settings, Key, ChevronDown } from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Handle keyboard navigation for menu
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (menuOpen) {
        if (event.key === 'Escape') {
          setMenuOpen(false);
        }
      }
    };

    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    // SignIn functionality commented out - redirect to landing instead
    // navigate('/signin');
    navigate('/landing');
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  const handleChangePassword = () => {
    setMenuOpen(false);
    navigate('/change-password');
  };

  const handleThemeToggle = () => {
    toggleDarkMode();
  };

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 shadow-sm border-b ${isDarkMode
        ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-gray-700'
        : 'bg-gradient-to-r from-white via-gray-100 to-white text-gray-800 border-gray-200'
        }`}
      role="banner"
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span
            className={
              isDarkMode
                ? "font-bold text-lg tracking-wide bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                : "font-bold text-sm tracking-wide bg-gradient-to-r from-purple-900 to-purple-950 bg-clip-text text-transparent"
            }
            aria-label="Fulcrum Dashboard"
          >
            FULCRUM
          </span>
          <span
            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
          >
            The enterprise event driven platform.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleThemeToggle}
          className={`p-2 rounded-lg transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode
            ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
            }`}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode
              ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="User menu"
          >
            <div className={`p-1.5 rounded-md ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-100/60'
              }`}>
              <User size={18} aria-hidden="true" />
            </div>
            <span className="font-medium text-sm">{user?.fullName || 'User'}</span>

            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
          {menuOpen && (
            <div
              className={`absolute right-0 mt-3 w-64 rounded-xl shadow-xl z-50 border backdrop-blur-sm ${isDarkMode
                ? 'bg-gray-800/95 border-gray-700 shadow-gray-900/50'
                : 'bg-white/95 border-gray-200 shadow-gray-900/20'
                }`}
              role="menu"
              aria-orientation="vertical"
            >
              {/* User Info Section */}
              <div className={`px-4 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isDarkMode
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                    {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {user?.fullName || 'User'}
                    </p>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>

                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleProfile}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                    }`}
                  role="menuitem"
                >
                  <User size={16} className="flex-shrink-0" aria-hidden="true" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleChangePassword}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                    }`}
                  role="menuitem"
                >
                  <Key size={16} className="flex-shrink-0" aria-hidden="true" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Divider */}
              <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`} />

              {/* Logout Section */}
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset ${isDarkMode
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  role="menuitem"
                >
                  <LogOut size={16} className="flex-shrink-0" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 