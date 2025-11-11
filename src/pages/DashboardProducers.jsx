import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducers } from '../hooks/useProducers';
import { useTheme } from '../hooks/ThemeContext';
import { ShrinkIcon } from './Dashboard';

const DashboardProducers = () => {
  const navigate = useNavigate();
  const { producers, loading } = useProducers();
  const { isDarkMode } = useTheme();
  const [search, setSearch] = useState('');
  
  const filteredProducers = producers.filter(p =>
    (p.lob_name || p.lobName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.domain || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.subDomain || p.subdomain || p.sub_domain || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.env_arns && p.env_arns.some(env => env.env.toLowerCase().includes(search.toLowerCase())))
  );

  const getEnvironments = (producer) => {
    if (producer.env_arns && producer.env_arns.length > 0) {
      return producer.env_arns.map(env => env.env).join(', ');
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
        ? 'bg-gray-800 border-blue-600' 
        : 'bg-white border-blue-200'
    }`}>
      <div className="relative px-8">
        <button
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center ${
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
          isDarkMode ? 'text-blue-200' : 'text-blue-900'
        }`}>
          Onboarded Producers
        </h1>
        
        <div className="mb-6">
          <label htmlFor="producer-search" className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Search producers
          </label>
          <input
            id="producer-search"
            type="text"
            placeholder="Search producers..."
            value={search}
            onChange={handleSearchChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'border-blue-200 text-gray-900 placeholder-gray-500'
            }`}
            aria-label="Search producers by name, domain, subdomain, or environment"
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
            Loading producers...
          </div>
        ) : filteredProducers.length === 0 ? (
          <div 
            className={`text-center py-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            role="status"
            aria-live="polite"
          >
            {search ? 'No producers found matching your search.' : 'No producers found.'}
          </div>
        ) : (
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Found {filteredProducers.length} producer{filteredProducers.length !== 1 ? 's' : ''}
            </h2>
            <ul 
              className="list-disc pl-6 space-y-2"
              role="list"
              aria-label="List of onboarded producers"
            >
              {filteredProducers.map(p => (
                <li 
                  key={p.id} 
                  className={`${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium">{p.lob_name || p.lobName || 'Unnamed Producer'}</span>
                  <span className="text-sm opacity-75">
                    {' '}({p.domain || '-'} / {p.subDomain || p.subdomain || p.sub_domain || '-'} / {getEnvironments(p)})
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

export default DashboardProducers; 