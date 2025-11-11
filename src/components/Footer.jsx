import React from 'react';
import { useTheme } from '../hooks/ThemeContext';
import { Shield, Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer 
      className={`relative py-8 px-6 border-t ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50' 
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 border-gray-200/50'
      }`}
      role="contentinfo"
    >
      {/* Background Pattern */}
      <div className={`absolute inset-0 opacity-5 ${
        isDarkMode ? 'bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)]' : 'bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)]'
      }`} style={{ backgroundSize: '20px 20px' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/ally-logo.png"
                alt="Ally Logo"
                className="w-8 h-8 object-contain"
              />
              <span className={`font-bold text-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent'
              }`}>
                FULCRUM
              </span>
            </div>
            <p className={`text-sm leading-relaxed max-w-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              The enterprise event-driven platform that powers modern data architectures with reliability and scale.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className={`font-semibold text-sm uppercase tracking-wide ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Platform
            </h3>
            <div className="space-y-2">
              <a href="#" className={`block text-sm transition-colors duration-200 hover:text-blue-500 ${
                isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}>
                Documentation
              </a>
              <a href="#" className={`block text-sm transition-colors duration-200 hover:text-blue-500 ${
                isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}>
                API Reference
              </a>
              <a href="#" className={`block text-sm transition-colors duration-200 hover:text-blue-500 ${
                isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}>
                Support
              </a>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className={`font-semibold text-sm uppercase tracking-wide ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Company
            </h3>
            <div className="space-y-2">
              <a href="#" className={`block text-sm transition-colors duration-200 hover:text-blue-500 ${
                isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}>
                About Ally
              </a>
              <a href="#" className={`block text-sm transition-colors duration-200 hover:text-blue-500 ${
                isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}>
                Privacy Policy
              </a>
              <a href="#" className={`block text-sm transition-colors duration-200 hover:text-blue-500 ${
                isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'
              }`}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                © 2025 Ally Financial. All rights reserved.
              </span>
            </div>

            {/* Version & Status */}
            <div className="flex items-center gap-6">
              
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Fulcrum v1.0.0
              </span>
            </div>
          </div>

          {/* Made with Love */}
          <div className="mt-4 flex items-center justify-center">
            <span className={`text-xs flex items-center gap-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Made with 
              <Heart size={12} className="text-red-500 fill-current" /> 
              by Ally Financial
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </footer>
  );
};

export default Footer; 