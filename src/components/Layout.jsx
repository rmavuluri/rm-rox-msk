import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import BackToTop from './BackToTop';
import FulcrumAIChatFab from './FulcrumAIChatFab';
import { useTheme } from '../hooks/ThemeContext';

const Layout = ({ children }) => {
  const [expanded, setExpanded] = useState(true);
  const mainRef = useRef(null);
  const { isDarkMode } = useTheme();

  const toggleSidebar = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar expanded={expanded} setExpanded={setExpanded} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <Header />
          <main
            ref={mainRef}
            id="main-content"
            className={`flex-1 min-w-0 min-h-0 overflow-y-auto ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
            role="main"
            tabIndex="-1"
          >
            <div className="w-full min-w-0 py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Footer />
      <FulcrumAIChatFab />
      <BackToTop mainRef={mainRef} />
    </div>
  );
};

export default Layout; 