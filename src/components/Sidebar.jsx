import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
} from 'lucide-react';
import FulcrumResourcesSlider from './FulcrumResourcesSlider';
import { useTheme } from '../hooks/ThemeContext';

const menu = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    to: '/',
  },
  {
    label: 'Onboard Form',
    icon: <FileText size={20} />,
    to: '/onboard',
  },
  {
    label: 'Onboarding Tracker',
    icon: <ClipboardList size={20} />,
    to: '/onboarding-tracker',
  },
  {
    label: 'Fulcrum Resources',
    icon: <BookOpen size={20} />,
    action: 'openResources',
  },
];

// Modern, professional logo component with zoom effect using ally-logo image
const Logo = ({ expanded }) => {
  return (
    <div className={`flex items-center justify-center transition-all duration-300 ease-in-out ${expanded ? 'w-48 h-24' : 'w-12 h-12'}`} aria-label="Ally logo">
      <img
        src="/ally-logo.png"
        alt="Ally Logo"
        className={`transition-all duration-300 ease-in-out object-contain ${expanded ? 'w-48 h-48' : 'w-16 h-16'}`}
        style={{ display: 'block' }}
      />
    </div>
  );
};

const Sidebar = ({ expanded, setExpanded, onToggle }) => {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  const isActive = (to) => location.pathname === to;
  const isDropdownActive = (dropdown) => dropdown && dropdown.some((item) => location.pathname.startsWith(item.to));

  const handleMenuClick = (item) => {
    if (item.action === 'openResources') {
      setIsResourcesOpen(true);
    }
  };

  const handleDropdownToggle = (itemLabel) => {
    setOpenDropdown(openDropdown === itemLabel ? null : itemLabel);
  };

  return (
    <>
      <aside
        id="sidebar"
        className={`self-stretch transition-all duration-300 ease-out ${expanded ? 'w-64' : 'w-20'} flex flex-col relative z-10 ${isDarkMode
            ? 'bg-gray-900/95 text-white border-r border-gray-700/80 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.4)]'
            : 'bg-white text-gray-800 border-r border-gray-200 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06)]'
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Collapse/Expand Button */}
        <button
          onClick={onToggle}
          className={`absolute -right-3 top-14 flex items-center justify-center w-7 h-7 rounded-full shadow-md transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 z-20 ${isDarkMode
            ? 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-blue-500 focus:ring-offset-gray-900'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-blue-400 focus:ring-offset-white'
          }`}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={expanded}
          aria-controls="sidebar"
        >
          {expanded ? <ChevronLeft size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
        </button>

        {/* Logo */}
        <div className="flex flex-col shrink-0">
          <div className="flex flex-col items-center justify-center py-5 px-4">
            <Logo expanded={expanded} />
          </div>
          <div className={`h-px mx-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>

        <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto" role="menubar">
          {menu.map((item) => (
            <div key={item.label}>
              {item.dropdown ? (
                <>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isDropdownActive(item.dropdown)
                        ? isDarkMode ? 'bg-blue-500/15 text-blue-200' : 'bg-blue-50 text-blue-800'
                        : isDarkMode ? 'hover:bg-gray-800/50 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                      } ${isDropdownActive(item.dropdown) ? 'font-medium' : ''}`}
                    onClick={() => handleDropdownToggle(item.label)}
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                    aria-label={`${item.label} menu`}
                    role="menuitem"
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isDropdownActive(item.dropdown) ? (isDarkMode ? 'bg-blue-500/25' : 'bg-blue-100') : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}>
                      {React.cloneElement(item.icon, { 'aria-hidden': true, size: 18, className: isDropdownActive(item.dropdown) ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-600') })}
                    </div>
                    {expanded && <span className="flex-1 text-left text-sm truncate">{item.label}</span>}
                    {expanded && <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 shrink-0 ${openDropdown === item.label ? 'rotate-180' : ''}`} />}
                  </button>
                  {openDropdown === item.label && expanded && (
                    <div
                      className="ml-4 flex flex-col gap-0.5 mt-1 pl-3 border-l border-gray-300/20 dark:border-gray-600/20"
                      role="menu"
                      aria-label={`${item.label} submenu`}
                    >
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isActive(sub.to)
                              ? `${isDarkMode
                                ? 'bg-blue-600/10 text-blue-200 font-medium'
                                : 'bg-blue-50 text-blue-700 font-medium'
                              }`
                              : `${isDarkMode
                                ? 'hover:bg-gray-800/20 text-gray-400 hover:text-gray-200'
                                : 'hover:bg-gray-100/60 text-gray-600 hover:text-gray-800'
                              }`
                            }`}
                          role="menuitem"
                          aria-current={isActive(sub.to) ? 'page' : undefined}
                        >
                          <div className={`w-1 h-1 rounded-full transition-colors ${isActive(sub.to)
                              ? isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                              : isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                            }`} />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : item.action ? (
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isDarkMode
                      ? 'hover:bg-gray-800/50 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  aria-label={`Open ${item.label}`}
                  role="menuitem"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    {React.cloneElement(item.icon, { 'aria-hidden': true, size: 18, className: isDarkMode ? 'text-gray-400' : 'text-gray-600' })}
                  </div>
                  {expanded && <span className="flex-1 text-left text-sm truncate">{item.label}</span>}
                </button>
              ) : (
                <Link
                  to={item.to}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${isActive(item.to)
                      ? isDarkMode
                        ? 'bg-blue-500/15 text-blue-200 border-l-2 border-blue-400 -ml-px pl-[11px]'
                        : 'bg-blue-50 text-blue-800 border-l-2 border-blue-600 -ml-px pl-[11px]'
                      : isDarkMode
                        ? 'hover:bg-gray-800/50 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    } ${isActive(item.to) ? 'font-medium' : ''}`}
                  role="menuitem"
                  aria-current={isActive(item.to) ? 'page' : undefined}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isActive(item.to)
                      ? isDarkMode ? 'bg-blue-500/25' : 'bg-blue-100'
                      : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                    {React.cloneElement(item.icon, {
                      'aria-hidden': true,
                      size: 18,
                      className: isActive(item.to) ? (isDarkMode ? 'text-blue-300' : 'text-blue-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                    })}
                  </div>
                  {expanded && <span className="flex-1 text-left text-sm truncate">{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Fulcrum Resources Slider */}
      <FulcrumResourcesSlider
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
      />
    </>
  );
};

export default Sidebar; 