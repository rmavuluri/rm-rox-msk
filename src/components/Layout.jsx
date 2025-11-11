import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../hooks/ThemeContext';

const Layout = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  const { isDarkMode } = useTheme();
  
  const toggleSidebar = () => {
    setExpanded((prev) => !prev);
  };
  
  return (
    <div className={`min-h-screen flex flex-col relative ${isDarkMode ? 'bg-[#181f2a]' : 'bg-gray-50'}`}>
      <div className="flex flex-1">
        <Sidebar expanded={expanded} setExpanded={setExpanded} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main 
            id="main-content"
            className={`flex-1 p-1 md:p-2 min-w-0 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-[#232b3b] via-[#232b3b] to-[#232b3b]/80' 
                : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
            }`}
            role="main"
            tabIndex="-1"
          >
            <div className="w-full min-w-0 px-2 lg:px-4 xl:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 