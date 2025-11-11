import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';
import { ShrinkIcon } from './Dashboard';
import { useProducers } from '../hooks/useProducers';
import { useConsumers } from '../hooks/useConsumers';

const getEnvironments = (item) => {
  if (item.env_arns && item.env_arns.length > 0) {
    return item.env_arns.map(env => env.env).join(', ');
  }
  return '-';
};

const getRecentActivity = (producers, consumers) => {
  const all = [
    ...producers.map(p => ({
      type: 'Producer',
      name: p.lob_name || p.lobName,
      domain: p.domain,
      subdomain: p.subDomain || p.subdomain || p.sub_domain,
      env_arns: p.env_arns,
      createdAt: new Date(p.created_at || p.createdAt || 0),
    })),
    ...consumers.map(c => ({
      type: 'Consumer',
      name: c.lob_name || c.lobName,
      domain: c.domain,
      subdomain: c.subDomain || c.subdomain || c.sub_domain,
      env_arns: c.env_arns,
      createdAt: new Date(c.created_at || c.createdAt || 0),
    })),
  ].filter(x => x.createdAt && !isNaN(x.createdAt));
  all.sort((a, b) => b.createdAt - a.createdAt);
  return all;
};

const PAGE_SIZE = 5;

const DashboardActivity = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { producers } = useProducers();
  const { consumers } = useConsumers();
  const recent = getRecentActivity(producers, consumers);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(recent.length / PAGE_SIZE) || 1;
  const paginated = recent.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBackClick = () => {
    navigate('/');
  };

  const handlePreviousPage = () => {
    setPage(p => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage(p => Math.min(totalPages, p + 1));
  };

  return (
    <div className={`w-full mx-0 px-0 mt-8 rounded-2xl shadow-xl border-2 py-8 relative ${
      isDarkMode 
        ? 'bg-gray-800 border-pink-600' 
        : 'bg-white border-pink-200'
    }`}>
      <div className="relative px-8">
        <button
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 flex items-center justify-center ${
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
          isDarkMode ? 'text-pink-200' : 'text-pink-900'
        }`}>
          Recent Activity
        </h1>
        
        {recent.length === 0 ? (
          <div 
            className={`text-center py-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
            role="status"
            aria-live="polite"
          >
            No recent activity
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                Showing {paginated.length} of {recent.length} recent activities
              </h2>
              <ul 
                className="list-disc pl-6 space-y-2 mb-6"
                role="list"
                aria-label="Recent activity list"
              >
                {paginated.map((item, idx) => (
                  <li 
                    key={idx} 
                    className={`${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    <span className="font-semibold">{item.type}:</span>{' '}
                    <span className="font-medium">{item.name || 'Unnamed'}</span>
                    <span className="text-sm opacity-75">
                      {' '}({item.domain || '-'} / {item.subdomain || '-'} / {getEnvironments(item)})
                    </span>
                    <span className={`ml-2 text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {item.createdAt.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <nav 
              className="flex items-center justify-between"
              role="navigation"
              aria-label="Activity pagination"
            >
              <button
                className={`px-4 py-4 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-pink-800 hover:bg-pink-700 text-pink-200 disabled:bg-gray-700' 
                    : 'bg-pink-100 hover:bg-pink-200 text-pink-700 disabled:bg-gray-200'
                }`}
                onClick={handlePreviousPage}
                disabled={page === 1}
                aria-label="Go to previous page"
              >
                Previous
              </button>
              
              <span 
                className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                aria-live="polite"
                aria-label={`Page ${page} of ${totalPages}`}
              >
                Page {page} of {totalPages}
              </span>
              
              <button
                className={`px-4 py-2 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-pink-800 hover:bg-pink-700 text-pink-200 disabled:bg-gray-700' 
                    : 'bg-pink-100 hover:bg-pink-200 text-pink-700 disabled:bg-gray-200'
                }`}
                onClick={handleNextPage}
                disabled={page === totalPages}
                aria-label="Go to next page"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardActivity; 