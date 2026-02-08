import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';

// Inline SVG chevron so icon always shows in both themes (no Lucide inheritance issues)
const ChevronUpIcon = ({ className, stroke }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const SCROLL_SHOW_PX = 80;

const BackToTop = ({ mainRef }) => {
  const [visible, setVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const mainElRef = useRef(null);

  const getScrollElement = useCallback(() => {
    if (mainRef?.current) return mainRef.current;
    if (mainElRef.current) return mainElRef.current;
    return document.getElementById('main-content');
  }, [mainRef]);

  const checkScroll = useCallback(() => {
    let show = false;
    const el = getScrollElement();
    if (el) {
      mainElRef.current = el;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const canScroll = scrollHeight > clientHeight;
      const scrolledDown = scrollTop > SCROLL_SHOW_PX;
      const nearBottom = scrollHeight - clientHeight - scrollTop < 120;
      // Show when user has scrolled down (or near bottom); also show if scrollTop > 0 and content is tall (fallback for layout quirks)
      show = (canScroll && (scrolledDown || nearBottom)) || (scrollTop > SCROLL_SHOW_PX && scrollHeight > clientHeight + 50);
    }
    if (!show && typeof window !== 'undefined') {
      show = window.scrollY > SCROLL_SHOW_PX;
    }
    setVisible(show);
  }, [getScrollElement]);

  useEffect(() => {
    const timeouts = [];
    let resizeObserver;
    const schedule = () => {
      const el = mainRef?.current || document.getElementById('main-content');
      if (el) {
        mainElRef.current = el;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        // Re-check after layout (e.g. long forms like Onboard Form)
        timeouts.push(setTimeout(checkScroll, 300));
        timeouts.push(setTimeout(checkScroll, 600));
        timeouts.push(setTimeout(checkScroll, 1200));
        // On Onboard Form, keep re-checking for a bit in case layout is late
        if (location.pathname === '/onboard') {
          timeouts.push(setTimeout(checkScroll, 2000));
          timeouts.push(setTimeout(checkScroll, 3500));
        }
        // When main content wrapper grows (e.g. form rendered), re-check
        const firstChild = el.firstElementChild;
        if (firstChild && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => checkScroll());
          resizeObserver.observe(firstChild);
        }
      }
      checkScroll();
      window.addEventListener('scroll', checkScroll, { passive: true });
    };
    const id = setTimeout(schedule, 200);
    return () => {
      clearTimeout(id);
      timeouts.forEach(clearTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      const el = mainElRef.current;
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('scroll', checkScroll);
    };
  }, [mainRef, checkScroll, location.pathname]);

  const scrollToTop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = mainElRef.current || mainRef?.current || document.getElementById('main-content');
    if (el) {
      el.scrollTop = 0;
      if (typeof el.scrollTo === 'function') {
        el.scrollTo(0, 0);
      }
    }
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [mainRef]);

  if (!visible) return null;

  const button = (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-11 h-11 rounded-full shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDarkMode
          ? 'bg-gray-500 border-2 border-gray-400 hover:bg-gray-400 hover:border-gray-300 focus:ring-blue-400 focus:ring-offset-gray-900'
          : 'bg-white hover:bg-gray-100 border border-gray-200 focus:ring-blue-500 focus:ring-offset-white'
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUpIcon
        className="shrink-0 block"
        stroke={isDarkMode ? '#fff' : '#1f2937'}
      />
    </button>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(button, document.body);
  }
  return button;
};

export default BackToTop;
