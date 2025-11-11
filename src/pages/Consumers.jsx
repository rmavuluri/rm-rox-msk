import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConsumers } from '../hooks/useConsumers';
import { useTheme } from '../hooks/ThemeContext';
import { Pencil, Trash2, Info, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const columns = [
  { key: 'lobName', label: 'LOB NAME' },
  { key: 'domain', label: 'DOMAIN' },
  { key: 'onboardType', label: 'ONBOARD TYPE' },
  { key: 'subDomain', label: 'SUB-DOMAIN' },
  { key: 'topicName', label: 'TOPIC NAME' },
  { key: 'contactEmails', label: 'CONTACT' },
  { key: 'createdAt', label: 'CREATED AT' },
  { key: 'actions', label: 'ACTIONS' },
];

const ITEMS_PER_PAGE = 10;

function SkeletonRow() {
  return (
    <tr className="animate-pulse" aria-hidden="true">
      {columns.map((col) => (
        <td key={col.key} className="py-3 px-4 bg-gray-100 h-8"></td>
      ))}
    </tr>
  );
}

function ConsumerRow({ consumer, onEdit, onDelete, onToggleDetails, isExpanded, isDarkMode }) {
  // Map backend fields to frontend display
  const lobName = consumer.lob_name || consumer.lobName || '';
  const domain = consumer.domain || '';
  const onboardType = consumer.onboard_type || consumer.onboardType || '';
  const subDomain = consumer.sub_domain || consumer.subDomain || '';
  let topicName = '';
  if (Array.isArray(consumer.topic_name)) {
    topicName = consumer.topic_name.join(', ');
  } else if (typeof consumer.topic_name === 'string') {
    const str = consumer.topic_name.trim();
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          topicName = parsed.join(', ');
        } else {
          topicName = str;
        }
      } catch {
        topicName = str.replace(/[\[\]{}'"\\]/g, '');
      }
    } else {
      topicName = str.replace(/[\[\]{}'"\\]/g, '');
    }
  } else if (consumer.topicName) {
    topicName = Array.isArray(consumer.topicName) ? consumer.topicName.join(', ') : consumer.topicName;
  }
  const contactEmails = consumer.contact_emails || consumer.contactEmails || '';
  const createdAt = consumer.created_at || consumer.createdAt;
  const allEnvARNs = consumer.allEnvARNs || (consumer.env_arns ? consumer.env_arns.map(e => `${e.env}: ${e.arn}`).join('\n') : '');

  const handleEdit = () => onEdit(consumer);
  const handleDelete = () => onDelete(consumer.id);
  const handleToggleDetails = () => onToggleDetails(consumer.id);

  return (
    <>
      <tr className={`border-b transition-colors duration-200 ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/60' : 'border-gray-100 hover:bg-gray-50'}`}>
        <td className={`py-3 px-4 font-normal align-top ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{lobName}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{domain}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{onboardType}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subDomain}</td>
        <td className={`py-3 px-4 font-mono text-sm align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{topicName}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{contactEmails}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
        </td>
        <td className="py-3 px-4 align-top">
          <div className="flex gap-2" role="group" aria-label={`Actions for ${lobName}`}>
            <button 
              onClick={handleEdit}
              className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? 'bg-green-900 hover:bg-green-800 text-green-200' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
              aria-label={`Edit ${lobName}`}
            >
              <Pencil size={18} aria-hidden="true" />
            </button>
            <button 
              onClick={handleDelete}
              className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-red-900 hover:bg-red-800 text-red-200' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}
              aria-label={`Delete ${lobName}`}
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
            <button 
              onClick={handleToggleDetails}
              className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-900 hover:bg-blue-800 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
              aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${lobName}`}
              aria-expanded={isExpanded}
            >
              <Info size={18} aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className={`border-b ${isDarkMode ? 'border-gray-800 bg-gray-800/30' : 'border-gray-100 bg-gray-50'}`}>
          <td colSpan="8" className="py-4 px-4">
            <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div>
                <strong>Environment ARNs:</strong>
                <pre className={`mt-1 p-2 rounded bg-gray-100 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'} font-mono text-xs overflow-x-auto`}>
                  {allEnvARNs || 'No ARNs available'}
                </pre>
              </div>
              <div>
                <strong>Schema Name:</strong> {consumer.schema_name || consumer.schemaName || 'N/A'}
              </div>
              <div>
                <strong>Volume of Events:</strong> {consumer.volume_of_events || consumer.volumeOfEvents || 'N/A'}
              </div>
              <div>
                <strong>Tentative PROD Date:</strong> {consumer.tentative_prod_date || consumer.tentativeProdDate || 'N/A'}
              </div>
              <div>
                <strong>Can Perform PT:</strong> {consumer.can_perform_pt || consumer.canPerformPT ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Notification Email:</strong> {consumer.notification_email || consumer.notificationEmail || 'N/A'}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const Consumers = () => {
  const { consumers, loading, deleteConsumer } = useConsumers();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter consumers based on search term
  const filteredConsumers = useMemo(() => {
    if (!searchTerm.trim()) return consumers;
    
    const searchLower = searchTerm.toLowerCase();
    return consumers.filter(consumer => {
      const lobName = (consumer.lob_name || consumer.lobName || '').toLowerCase();
      const domain = (consumer.domain || '').toLowerCase();
      const onboardType = (consumer.onboard_type || consumer.onboardType || '').toLowerCase();
      const subDomain = (consumer.sub_domain || consumer.subDomain || '').toLowerCase();
      const contactEmails = (consumer.contact_emails || consumer.contactEmails || '').toLowerCase();
      
      return lobName.includes(searchLower) ||
             domain.includes(searchLower) ||
             onboardType.includes(searchLower) ||
             subDomain.includes(searchLower) ||
             contactEmails.includes(searchLower);
    });
  }, [consumers, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredConsumers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedConsumers = filteredConsumers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (consumer) => {
    navigate('/onboard', { state: { editData: consumer } });
  };

  const handleAddNew = () => {
    navigate('/onboard');
  };

  const handleToggleDetails = (consumerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(consumerId)) {
        newSet.delete(consumerId);
      } else {
        newSet.add(consumerId);
      }
      return newSet;
    });
  };

  const handleDelete = async (consumerId) => {
    if (window.confirm('Are you sure you want to delete this consumer?')) {
      try {
        await deleteConsumer(consumerId);
      } catch (error) {
        console.error('Failed to delete consumer:', error);
        alert('Failed to delete consumer');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Consumers
        </h1>
        <button
          onClick={handleAddNew}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-900 hover:bg-blue-950 text-white'} shadow-lg`}
          aria-label="Add new consumer"
        >
          Add New Consumer
        </button>
      </div>

      {/* Search and Results Summary */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <label htmlFor="consumer-search" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search consumers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
                </div>
                <input
                  id="consumer-search"
                  type="text"
                  placeholder="Search by name, domain, type, or contact..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  aria-label="Search consumers"
                />
              </div>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredConsumers.length)} of {filteredConsumers.length} consumers
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Consumers table">
            <thead className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-700'}`}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide"
                    scope="col"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
              ) : paginatedConsumers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    {searchTerm ? `No consumers found matching "${searchTerm}"` : 'No consumers found'}
                  </td>
                </tr>
              ) : (
                paginatedConsumers.map((consumer) => (
                  <ConsumerRow
                    key={consumer.id}
                    consumer={consumer}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleDetails={handleToggleDetails}
                    isExpanded={expandedRows.has(consumer.id)}
                    isDarkMode={isDarkMode}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredConsumers.length > ITEMS_PER_PAGE && (
          <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <nav className="flex items-center justify-between" role="navigation" aria-label="Pagination">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:bg-gray-800' 
                      : 'bg-white hover:bg-gray-100 text-gray-700 disabled:bg-gray-100 border border-gray-300'
                  }`}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          currentPage === pageNum
                            ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`
                            : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'}`
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:bg-gray-800' 
                      : 'bg-white hover:bg-gray-100 text-gray-700 disabled:bg-gray-100 border border-gray-300'
                  }`}
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consumers; 