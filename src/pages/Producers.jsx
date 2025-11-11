import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducers } from '../hooks/useProducers';
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

function ProducerRow({ producer, onEdit, onDelete, onToggleDetails, isExpanded, isDarkMode }) {
  // Map backend fields to frontend display
  const lobName = producer.lob_name || producer.lobName || '';
  const domain = producer.domain || '';
  const onboardType = producer.onboard_type || producer.onboardType || '';
  const subDomain = producer.sub_domain || producer.subDomain || '';
  let topicName = '';
  if (Array.isArray(producer.topic_name)) {
    topicName = producer.topic_name.join(', ');
  } else if (typeof producer.topic_name === 'string') {
    const str = producer.topic_name.trim();
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
  } else if (producer.topicName) {
    topicName = Array.isArray(producer.topicName) ? producer.topicName.join(', ') : producer.topicName;
  }
  const contactEmails = producer.contact_emails || producer.contactEmails || '';
  const createdAt = producer.created_at || producer.createdAt;
  const allEnvARNs = producer.allEnvARNs || (producer.env_arns ? producer.env_arns.map(e => `${e.env}: ${e.arn}`).join('\n') : '');

  const handleEdit = () => onEdit(producer);
  const handleDelete = () => onDelete(producer.id);
  const handleToggleDetails = () => onToggleDetails(producer.id);

  return (
    <>
      <tr className={`border-b transition-colors duration-200 font-sans text-base ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/60' : 'border-gray-100 hover:bg-gray-50'}`}>
        <td className={`py-3 px-4 font-normal align-top ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{lobName}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{domain}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{onboardType}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subDomain}</td>
        <td className={`py-3 px-4 font-mono text-sm align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {topicName.split(',').map((t, i, arr) => (
            <div key={i}>
              {t.trim()}{i < arr.length - 1 ? ',' : ''}
            </div>
          ))}
        </td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{contactEmails}</td>
        <td className={`py-3 px-4 align-top ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {createdAt ? new Date(createdAt).toLocaleDateString() : ''}
        </td>
        <td className="py-3 px-4 align-top">
          <div className="flex gap-2" role="group" aria-label={`Actions for ${lobName}`}>
            <button 
              onClick={handleEdit}
              className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-900 hover:bg-blue-800 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
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
              className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? 'bg-green-900 hover:bg-green-800 text-green-200' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
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
                <strong>Schema Name:</strong> {producer.schema_name || producer.schemaName || 'N/A'}
              </div>
              <div>
                <strong>Volume of Events:</strong> {producer.volume_of_events || producer.volumeOfEvents || 'N/A'}
              </div>
              <div>
                <strong>Tentative PROD Date:</strong> {producer.tentative_prod_date || producer.tentativeProdDate || 'N/A'}
              </div>
              <div>
                <strong>Can Perform PT:</strong> {producer.can_perform_pt || producer.canPerformPT ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Notification Email:</strong> {producer.notification_email || producer.notificationEmail || 'N/A'}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const Producers = () => {
  const { producers, loading, deleteProducer } = useProducers();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter producers based on search term
  const filteredProducers = useMemo(() => {
    if (!searchTerm.trim()) return producers;
    
    const searchLower = searchTerm.toLowerCase();
    return producers.filter(producer => {
      const lobName = (producer.lob_name || producer.lobName || '').toLowerCase();
      const domain = (producer.domain || '').toLowerCase();
      const onboardType = (producer.onboard_type || producer.onboardType || '').toLowerCase();
      const subDomain = (producer.sub_domain || producer.subDomain || '').toLowerCase();
      const contactEmails = (producer.contact_emails || producer.contactEmails || '').toLowerCase();
      
      return lobName.includes(searchLower) ||
             domain.includes(searchLower) ||
             onboardType.includes(searchLower) ||
             subDomain.includes(searchLower) ||
             contactEmails.includes(searchLower);
    });
  }, [producers, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducers = filteredProducers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEdit = (producer) => {
    navigate('/onboard', { state: { editData: producer } });
  };

  const handleAddNew = () => {
    navigate('/onboard');
  };

  const handleToggleDetails = (producerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(producerId)) {
        newSet.delete(producerId);
      } else {
        newSet.add(producerId);
      }
      return newSet;
    });
  };

  const handleDelete = async (producerId) => {
    if (window.confirm('Are you sure you want to delete this producer?')) {
      try {
        await deleteProducer(producerId);
      } catch (error) {
        console.error('Failed to delete producer:', error);
        alert('Failed to delete producer');
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
          Producers
        </h1>
        <button
          onClick={handleAddNew}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-900 hover:bg-blue-950 text-white'} shadow-lg`}
          aria-label="Add new producer"
        >
          Add New Producer
        </button>
      </div>

      {/* Search and Results Summary */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <label htmlFor="producer-search" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search producers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={20} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
                </div>
                <input
                  id="producer-search"
                  type="text"
                  placeholder="Search by name, domain, type, or contact..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                      : 'border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  aria-label="Search producers"
                />
              </div>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducers.length)} of {filteredProducers.length} producers
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Producers table">
            <thead className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-700'}`}>
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
              ) : paginatedProducers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    {searchTerm ? `No producers found matching "${searchTerm}"` : 'No producers found'}
                  </td>
                </tr>
              ) : (
                paginatedProducers.map((producer) => (
                  <ProducerRow
                    key={producer.id}
                    producer={producer}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleDetails={handleToggleDetails}
                    isExpanded={expandedRows.has(producer.id)}
                    isDarkMode={isDarkMode}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredProducers.length > ITEMS_PER_PAGE && (
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

export default Producers; 