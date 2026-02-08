import React from 'react';
import { useTheme } from '../hooks/ThemeContext';
import { Heart } from 'lucide-react';

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer
      className={`relative shrink-0 border-t ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Main footer row: Brand + Platform + Company */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 items-start">
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center gap-2">
              <img src="/ally-logo.png" alt="Ally" className="w-6 h-6 object-contain" />
              <span className={`font-semibold text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                FULCRUM
              </span>
            </div>
            <p className={`text-xs leading-snug max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              The enterprise event-driven platform that powers modern data architectures with reliability and scale.
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2025 Ally Financial. All rights reserved.
            </p>
          </div>

          <div className="md:col-span-3 md:pl-2">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Platform
            </h3>
            <ul className="space-y-1">
              {['Documentation', 'API Reference', 'Support'].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 md:pl-2">
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Company
            </h3>
            <ul className="space-y-1">
              {['About Ally', 'Privacy Policy', 'Terms of Service'].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Spacer so grid stays 12 cols; version moved to bottom row */}
          <div className="md:col-span-1 hidden md:block" aria-hidden />
        </div>

        {/* Bottom right: version + Made with love by Ally */}
        <div
          className={`mt-4 pt-4 flex flex-wrap items-center justify-end gap-x-5 gap-y-1 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}
        >
          <span className={`text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Fulcrum v1.0.0
          </span>
          <span className={`text-xs flex items-center gap-1 whitespace-nowrap ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Made with <Heart size={10} className="text-red-500 fill-red-500 shrink-0" aria-hidden /> by Ally
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 