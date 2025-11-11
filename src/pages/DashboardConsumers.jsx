import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsumers } from '../hooks/useConsumers';
import { useTheme } from '../hooks/ThemeContext';
import { ShrinkIcon } from './Dashboard';

const DashboardConsumers = () => {
  const navigate = useNavigate();
  const { consumers, loading } = useConsumers();
  const { isDarkMode } = useTheme();
  const [search, setSearch] = useState('');
  
  const filteredConsumers = consumers.filter(c =>
    (c.lob_name || c.lobName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.domain || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.subDomain || c.subdomain || c.sub_domain || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.env_arns && c.env_arns.some(env => env.env.toLowerCase().includes(search.toLowerCase())))
  );

  const getEnvironments = (consumer) => {
    if (consumer.env_arns && consumer.env_arns.length > 0) {
      return consumer.env_arns.map(env => env.env).join(', ');
    }
    return '-';
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className={`w-full mx-0 px-0 mt-8 rounded-2xl shadow-xl border-2 py-8 relative ${
      isDarkMode 
        ? 'bg-gray-800 border-purple-600' 
        : 'bg-white border-purple-200'
    }`}>
      <div className="relative px-8">
        <button
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center ${
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
          isDarkMode ? 'text-purple-200' : 'text-purple-900'
        }`}>
          Onboarded Consumers
        </h1>
        
        <div className="mb-6">
          <label htmlFor="consumer-search" className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Search consumers
          </label>
          <input
            id="consumer-search"
            type="text"
            placeholder="Search consumers..."
            value={search}
            onChange={handleSearchChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'border-purple-200 text-gray-900 placeholder-gray-500'
            }`}
            aria-label="Search consumers by name, domain, subdomain, or environment"
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
            Loading consumers...
          </div>
        ) : filteredConsumers.length === 0 ? (
          <div 
            className={`text-center py-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            role="status"
            aria-live="polite"
          >
            {search ? 'No consumers found matching your search.' : 'No consumers found.'}
          </div>
        ) : (
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Found {filteredConsumers.length} consumer{filteredConsumers.length !== 1 ? 's' : ''}
            </h2>
            <ul 
              className="list-disc pl-6 space-y-2"
              role="list"
              aria-label="List of onboarded consumers"
            >
              {filteredConsumers.map(c => (
                <li 
                  key={c.id} 
                  className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">{c.lob_name || c.lobName || 'Unnamed Consumer'}</span>
                  <span className="text-sm opacity-75">
                    {' '}({c.domain || '-'} / {c.subDomain || c.subdomain || c.sub_domain || '-'} / {getEnvironments(c)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardConsumers; 