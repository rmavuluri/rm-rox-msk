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
    label: 'Schemas List',
    icon: <FileText size={20} />,
    to: '/schemas',
  },
  {
    label: 'Topics',
    icon: <BookOpen size={20} />,
    to: '/topics',
  },
  {
    label: 'Onboard Form',
    icon: <FileText size={20} />,
    to: '/onboard',
  },
  {
    label: 'Producers',
    icon: <User size={20} />,
    dropdown: [
      { label: 'All Producers', to: '/producers' },
    ],
  },
  {
    label: 'Consumers',
    icon: <Users size={20} />,
    dropdown: [
      { label: 'All Consumers', to: '/consumers' },
    ],
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
        className={`h-screen transition-all duration-300 ease-out ${expanded ? 'w-64' : 'w-20'} flex flex-col shadow-xl border-r relative ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white border-gray-700' 
            : 'bg-gradient-to-b from-white via-gray-50 to-white text-gray-800 border-gray-200'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Collapse/Expand Button - positioned on the right edge near top */}
        <button
          onClick={onToggle}
          className={`absolute -right-4 top-12 flex items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 z-10 ${
            isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 focus:ring-blue-500' : 'border-gray-300 bg-white text-gray-800 focus:ring-grey-500'
          } ${expanded ? 'w-8 h-8' : 'w-8 h-8'}`}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={expanded}
          aria-controls="sidebar"
        >
          {expanded ? (
            <ChevronLeft size={16} aria-hidden="true" className="text-gray-800" />
          ) : (
            <ChevronRight size={16} aria-hidden="true" className="text-gray-800" />
          )}
        </button>

        {/* Logo and collapse button */}
        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center p-6 pb-4">
            <div className="flex items-center justify-center">
              <Logo expanded={expanded} />
            </div>
          </div>
          {/* Modern gradient separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-3 mt-4" role="menubar">
          {menu.map((item) => (
            <div key={item.label}>
              {item.dropdown ? (
                <>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isDropdownActive(item.dropdown)
                        ? `${isDarkMode 
                            ? 'bg-blue-600/15 text-blue-200 shadow-sm' 
                            : 'bg-blue-50 text-blue-700 shadow-sm'
                          } font-medium` 
                        : `${isDarkMode 
                            ? 'hover:bg-gray-800/30 text-gray-300 hover:text-white' 
                            : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                          }`
                    }`}
                    onClick={() => handleDropdownToggle(item.label)}
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                    aria-label={`${item.label} menu`}
                    role="menuitem"
                  >
                    <div className={`p-1 rounded-md transition-colors ${
                      isDropdownActive(item.dropdown)
                        ? isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                        : isDarkMode ? 'bg-gray-700/40' : 'bg-gray-100/60'
                    }`}>
                      {React.cloneElement(item.icon, { 
                        'aria-hidden': true,
                        size: 18,
                        className: isDropdownActive(item.dropdown) ? 'text-blue-500' : ''
                      })}
                    </div>
                    {expanded && <span className="flex-1 text-left text-sm">{item.label}</span>}
                    {expanded && (
                      <div className={`transition-transform duration-200 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}>
                        <ChevronDown size={14} aria-hidden="true" />
                      </div>
                    )}
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
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isActive(sub.to)
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
                          <div className={`w-1 h-1 rounded-full transition-colors ${
                            isActive(sub.to)
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isDarkMode 
                      ? 'hover:bg-gray-800/30 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                  }`}
                  aria-label={`Open ${item.label}`}
                  role="menuitem"
                >
                  <div className={`p-1 rounded-md transition-colors ${
                    isDarkMode ? 'bg-gray-700/40' : 'bg-gray-100/60'
                  }`}>
                    {React.cloneElement(item.icon, { 
                      'aria-hidden': true,
                      size: 18
                    })}
                  </div>
                  {expanded && <span className="flex-1 text-left text-sm">{item.label}</span>}
                </button>
              ) : (
                <Link
                  to={item.to}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isActive(item.to)
                      ? `${isDarkMode 
                          ? 'bg-blue-600/15 text-blue-200 shadow-sm' 
                          : 'bg-blue-50 text-blue-700 shadow-sm'
                        } font-medium` 
                      : `${isDarkMode 
                          ? 'hover:bg-gray-800/30 text-gray-300 hover:text-white' 
                          : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                        }`
                  }`}
                  role="menuitem"
                  aria-current={isActive(item.to) ? 'page' : undefined}
                >
                  <div className={`p-1 rounded-md transition-colors ${
                    isActive(item.to)
                      ? isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                      : isDarkMode ? 'bg-gray-700/40' : 'bg-gray-100/60'
                  }`}>
                    {React.cloneElement(item.icon, { 
                      'aria-hidden': true,
                      size: 18,
                      className: isActive(item.to) ? 'text-blue-500' : ''
                    })}
                  </div>
                  {expanded && <span className="flex-1 text-left text-sm">{item.label}</span>}
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