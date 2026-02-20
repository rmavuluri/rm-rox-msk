import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';

const FULCRUM_AI_URL = import.meta.env.VITE_FULCRUM_AI_URL || 'http://localhost:5173';

/**
 * Floating action button to open Fulcrum AI chat.
 * Opens the Fulcrum AI app in a new tab (URL configurable via VITE_FULCRUM_AI_URL).
 */
const FulcrumAIChatFab = () => {
  const { isDarkMode } = useTheme();
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    window.open(FULCRUM_AI_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`fixed bottom-6 right-20 z-[9998] flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDarkMode
          ? 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/50 focus:ring-violet-400 focus:ring-offset-gray-900'
          : 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/30 focus:ring-violet-500 focus:ring-offset-white'
      } ${pressed ? 'scale-95' : ''}`}
      aria-label="Open Fulcrum AI chat"
    >
      <MessageCircle size={24} aria-hidden="true" strokeWidth={2} />
    </button>
  );
};

export default FulcrumAIChatFab;
