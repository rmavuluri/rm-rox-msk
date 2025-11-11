import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';
import { ShrinkIcon } from './Dashboard';
import api from '../services/api';

const DashboardTopics = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/schemas');
        const schemas = res.data || [];
        const topicMap = new Map();
        schemas.forEach(s => {
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
        setTopics([]);
      }
      setLoading(false);
    };
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter(t =>
    t.topicName.toLowerCase().includes(search.toLowerCase()) ||
    (t.domain && t.domain.toLowerCase().includes(search.toLowerCase())) ||
    (t.subdomain && t.subdomain.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBackClick = () => {
    navigate('/');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className={`w-full mx-0 px-0 mt-8 rounded-2xl shadow-xl border-2 py-8 relative ${
      isDarkMode 
        ? 'bg-gray-800 border-green-600' 
        : 'bg-white border-green-200'
    }`}>
      <div className="relative px-8">
        <button
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          onClick={handleBackClick}
          aria-label="Back to Dashboard"
        >
          <ShrinkIcon aria-hidden="true" className="w-5 h-5" />
        </button>
        
        <h1 className={`text-3xl font-bold mb-6 ${
          isDarkMode ? 'text-green-200' : 'text-green-900'
        }`}>
          Topics
        </h1>
        
        <div className="mb-6">
          <label htmlFor="topic-search" className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Search topics
          </label>
          <input
            id="topic-search"
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={handleSearchChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'border-green-200 text-gray-900 placeholder-gray-500'
            }`}
            aria-label="Search topics by name, domain, or subdomain"
          />
        </div>

        {loading ? (
          <div 
            className={`text-center py-8 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
            role="status"
            aria-live="polite"
          >
            Loading topics...
          </div>
        ) : filteredTopics.length === 0 ? (
          <div 
            className={`text-center py-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            role="status"
            aria-live="polite"
          >
            {search ? 'No topics found matching your search.' : 'No topics found.'}
          </div>
        ) : (
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Found {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}
            </h2>
            <ul 
              className="list-disc pl-6 space-y-2"
              role="list"
              aria-label="List of topics"
            >
              {filteredTopics.map(t => (
                <li 
                  key={t.topicName} 
                  className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">{t.topicName}</span>
                  <span className="text-sm opacity-75">
                    {' '}({t.domain} / {t.subdomain} / {t.environment})
                  </span>
                  {t.schemas && t.schemas.length > 0 && (
                    <span className="text-sm opacity-60">
                      {' '}- {t.schemas.length} schema{t.schemas.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTopics; 