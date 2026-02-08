import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';
import api from '../services/api';

// Provided ExpandIcon SVG
export const ExpandIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="28" height="28" {...props}>
    <path d="M408 64L552 64C565.3 64 576 74.7 576 88L576 232C576 241.7 570.2 250.5 561.2 254.2C552.2 257.9 541.9 255.9 535 249L496 210L409 297C399.6 306.4 384.4 306.4 375.1 297L343.1 265C333.7 255.6 333.7 240.4 343.1 231.1L430.1 144.1L391.1 105.1C384.2 98.2 382.2 87.9 385.9 78.9C389.6 69.9 398.3 64 408 64zM232 576L88 576C74.7 576 64 565.3 64 552L64 408C64 398.3 69.8 389.5 78.8 385.8C87.8 382.1 98.1 384.2 105 391L144 430L231 343C240.4 333.6 255.6 333.6 264.9 343L296.9 375C306.3 384.4 306.3 399.6 296.9 408.9L209.9 495.9L248.9 534.9C255.8 541.8 257.8 552.1 254.1 561.1C250.4 570.1 241.7 576 232 576z" />
  </svg>
);

// Provided ShrinkIcon SVG
export const ShrinkIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="28" height="28" {...props}>
    <path d="M503.5 71C512.9 61.6 528.1 61.6 537.4 71L569.4 103C578.8 112.4 578.8 127.6 569.4 136.9L482.4 223.9L521.4 262.9C528.3 269.8 530.3 280.1 526.6 289.1C522.9 298.1 514.2 304 504.5 304L360.5 304C347.2 304 336.5 293.3 336.5 280L336.5 136C336.5 126.3 342.3 117.5 351.3 113.8C360.3 110.1 370.6 112.1 377.5 119L416.5 158L503.5 71zM136.5 336L280.5 336C293.8 336 304.5 346.7 304.5 360L304.5 504C304.5 513.7 298.7 522.5 289.7 526.2C280.7 529.9 270.4 527.9 263.5 521L224.5 482L137.5 569C128.1 578.4 112.9 578.4 103.6 569L71.6 537C62.2 527.6 62.2 512.4 71.6 503.1L158.6 416.1L119.6 377.1C112.7 370.2 110.7 359.9 114.4 350.9C118.1 341.9 126.8 336 136.5 336z" />
  </svg>
);


// Removed cardMeta array - now using navigation to separate pages

const Dashboard = () => {
  const { isDarkMode } = useTheme ? useTheme() : { isDarkMode: false };
  /* Existing code ... */
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);


  // Removed smooth scrolling logic since we're navigating to separate pages
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const res = await api.get('/topics');
        const topics = res.data || [];
        // Group by (domain, subdomain, environment)
        const topicMap = new Map();
        topics.forEach(s => {
          const key = `${s.domain}-${s.subdomain}-${s.environment}`.toLowerCase();
          if (!topicMap.has(key)) {
            topicMap.set(key, {
              topicName: key,
              domain: s.domain,
              subdomain: s.subdomain,
              environment: s.environment,
              schemas: []
            });
          }
          topicMap.get(key).schemas.push(s);
        });
        setTopics(Array.from(topicMap.values()));
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        // If it's a 401, the interceptor will handle redirect
        if (error.response?.status !== 401) {
          // Only set empty array if it's not an auth error
          setTopics([]);
        }
      }
      setLoadingTopics(false);
    };

    fetchTopics();


  }, []);


  const counts = {
    topics: loadingTopics ? '...' : topics.length,
  };

  const handleCardClick = (cardKey) => {
    navigate(`/dashboard/${cardKey}`);
  };

  // Removed handleKeyDown function - no longer needed

  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <h1 className={`text-2xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Welcome to your Fulcrum overview
        </p>
      </div>

      {/* Main card */}
      <div
        className={`rounded-xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}
      >
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Overview
              </h2>
              <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Event-driven platform metrics and quick actions
              </p>
            </div>
            <button
              onClick={() => handleCardClick('topics')}
              className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" aria-hidden />
              {counts.topics} Topics
            </button>
          </div>
        </div>
      </div>

      {/* Quick links / secondary content - reduces empty feel */}
      <div className={`rounded-xl border p-6 ${isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Quick actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/onboard"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Onboard Form
          </Link>
          <Link
            to="/onboarding-tracker"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Onboarding Tracker
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 