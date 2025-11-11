import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FileText, AlertCircle, GitCompare, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';
import api from '../services/api';
import DiffViewer from 'react-diff-viewer-continued';

const SchemasList = () => {
  const { isDarkMode } = useTheme();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [schemaVersions, setSchemaVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionDetails, setVersionDetails] = useState(null);
  const [loadingVersionDetails, setLoadingVersionDetails] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]); // For comparison
  const [versionDetailsCache, setVersionDetailsCache] = useState({}); // Cache version details
  const [showCompare, setShowCompare] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  
  // Configuration
  const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // Default to true
  const REGISTRY_NAME = import.meta.env.VITE_GLUE_REGISTRY_NAME || 'default-registry';
  const REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

  // Fetch schemas from backend
  const fetchSchemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        registryName: REGISTRY_NAME,
        region: REGION
      };
      
      if (USE_MOCK) {
        params.mock = 'true';
      }

      const response = await api.get('/glue/schemas/info', { params });
      
      if (response.data.success) {
        setSchemas(response.data.data.schemas || []);
      } else {
        setError(response.data.error || 'Failed to fetch schemas');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch schemas';
      setError(`Error: ${errorMessage}. ${USE_MOCK ? 'Using mock mode.' : 'Make sure the backend is running and Glue is accessible.'}`);
      console.error('Error fetching schemas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch versions for a schema
  const fetchSchemaVersions = async (schemaName) => {
    setLoadingVersions(true);
    setError(null);
    try {
      const params = {
        registryName: REGISTRY_NAME,
        region: REGION
      };
      
      if (USE_MOCK) {
        params.mock = 'true';
      }

      const response = await api.get(`/glue/schemas/${encodeURIComponent(schemaName)}/versions`, { params });
      
      if (response.data.success) {
        setSchemaVersions(response.data.data.versions || []);
      } else {
        setError(response.data.error || 'Failed to fetch schema versions');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch schema versions';
      setError(`Error: ${errorMessage}`);
      console.error('Error fetching schema versions:', err);
    } finally {
      setLoadingVersions(false);
    }
  };

  // Fetch specific version details
  const fetchVersionDetails = async (schemaName, schemaVersionId) => {
    const cacheKey = `${schemaName}-${schemaVersionId}`;
    if (versionDetailsCache[cacheKey]) {
      return versionDetailsCache[cacheKey];
    }

    setLoadingVersionDetails(true);
    try {
      const params = {
        registryName: REGISTRY_NAME,
        region: REGION
      };
      
      if (USE_MOCK) {
        params.mock = 'true';
      }

      const response = await api.get(
        `/glue/schemas/${encodeURIComponent(schemaName)}/versions/${encodeURIComponent(schemaVersionId)}`,
        { params }
      );
      
      if (response.data.success) {
        const details = response.data.data;
        setVersionDetailsCache(prev => ({
          ...prev,
          [cacheKey]: details
        }));
        return details;
      }
    } catch (err) {
      console.error('Error fetching version details:', err);
    } finally {
      setLoadingVersionDetails(false);
    }
    return null;
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  // Handle keyboard events for closing slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sliderOpen) {
        handleCloseSlider();
      }
    };

    if (sliderOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [sliderOpen]);

  const handleSchemaClick = async (schema) => {
    setSelectedSchema(schema);
    setSelectedVersion(null);
    setVersionDetails(null);
    setSelectedVersions([]);
    setShowCompare(false);
    setSliderOpen(true);
    await fetchSchemaVersions(schema.schemaName);
  };

  const handleVersionClick = async (version) => {
    setSelectedVersion(version);
    setLoadingVersionDetails(true);
    const schemaVersionId = version.schemaVersionId || version.SchemaVersionId;
    const details = await fetchVersionDetails(selectedSchema.schemaName, schemaVersionId);
    setVersionDetails(details);
    setLoadingVersionDetails(false);
  };

  const handleVersionCheckbox = async (version, checked) => {
    const schemaVersionId = version.schemaVersionId || version.SchemaVersionId;
    
    if (checked) {
      if (selectedVersions.length < 2) {
        // Fetch version details if not cached
        let details = versionDetailsCache[`${selectedSchema.schemaName}-${schemaVersionId}`];
        if (!details) {
          details = await fetchVersionDetails(selectedSchema.schemaName, schemaVersionId);
        }
        setSelectedVersions(prev => [...prev, {
          ...version,
          schemaVersionId: schemaVersionId, // Normalize to camelCase
          details
        }]);
      }
    } else {
      setSelectedVersions(prev => prev.filter(v => {
        const vId = v.schemaVersionId || v.SchemaVersionId;
        return vId !== schemaVersionId;
      }));
      setShowCompare(false);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setShowCompare(true);
    }
  };

  const handleCloseSlider = () => {
    setSliderOpen(false);
    setSelectedSchema(null);
    setSchemaVersions([]);
    setSelectedVersion(null);
    setVersionDetails(null);
    setSelectedVersions([]);
    setShowCompare(false);
  };

  const filteredSchemas = schemas.filter(schema =>
    schema.schemaName?.toLowerCase().includes(search.toLowerCase()) ||
    schema.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Schemas
        </h1>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search schemas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              aria-label="Search schemas"
            />
          </div>
          <button
            onClick={fetchSchemas}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            aria-label="Refresh schemas"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          isDarkMode ? 'bg-red-900/50 border border-red-700' : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className="text-red-500" size={20} />
          <span className={isDarkMode ? 'text-red-200' : 'text-red-800'}>
            {error}
          </span>
        </div>
      )}

      {/* Schemas List - Full Width */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className={`p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-gray-100' : 'text-gray-800'
          }`}>
            Available Schemas ({filteredSchemas.length})
          </h2>
        </div>
        
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          ) : filteredSchemas.length === 0 ? (
            <div className={`p-8 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {search ? 'No schemas match your search' : 'No schemas found'}
            </div>
          ) : (
            <div className={`divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {filteredSchemas.map((schema, index) => (
                <button
                  key={schema.schemaName || `schema-${index}`}
                  onClick={() => handleSchemaClick(schema)}
                  className={`w-full p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedSchema?.schemaName === schema.schemaName
                      ? isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-blue-50'
                      : isDarkMode
                      ? 'hover:bg-gray-700/50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <FileText size={18} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}>
                          {schema.schemaName}
                        </div>
                        {schema.description && (
                          <div className={`text-sm truncate mt-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {schema.description}
                          </div>
                        )}
                        <div className={`text-xs mt-1 flex gap-3 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          <span>Format: {schema.dataFormat || 'N/A'}</span>
                          <span>Versions: {schema.versionCount || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slider - Opens from right */}
      {sliderOpen && selectedSchema && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseSlider}
            aria-hidden="true"
          />
          {/* Slider */}
          <div
            className={`fixed top-0 right-0 h-full shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
              sliderOpen ? 'translate-x-0' : 'translate-x-full'
            } ${isDarkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}
            style={{ width: '70vw', maxWidth: '900px', minWidth: '400px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Slider Header */}
            <div className={`flex items-center justify-between p-6 border-b shadow-md ${isDarkMode ? 'border-gray-800 bg-gray-900/90' : 'border-blue-200 bg-white/80'}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseSlider}
                  className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  aria-label="Close slider"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedSchema.schemaName}
                </span>
              </div>
              <button 
                onClick={handleCloseSlider} 
                className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                }`}
                aria-label="Close schema details"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
              {/* Schema Info */}
              <div className={`p-4 rounded-lg mb-4 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Schema Information
                </h3>
                <div className={`space-y-1 text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <div><strong>Name:</strong> {selectedSchema.schemaName}</div>
                  <div><strong>Format:</strong> {selectedSchema.dataFormat || 'N/A'}</div>
                  <div><strong>Compatibility:</strong> {selectedSchema.compatibility || 'N/A'}</div>
                  <div><strong>Status:</strong> {selectedSchema.schemaStatus || 'N/A'}</div>
                  {selectedSchema.description && (
                    <div><strong>Description:</strong> {selectedSchema.description}</div>
                  )}
                </div>
              </div>

              {/* Versions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    Versions ({schemaVersions.length})
                  </h3>
                  {selectedVersions.length === 2 && (
                    <button
                      onClick={handleCompare}
                      className={`px-3 py-1 rounded-lg flex items-center gap-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <GitCompare size={14} />
                      Compare
                    </button>
                  )}
                  {selectedVersions.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedVersions([]);
                        setShowCompare(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {loadingVersions ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="animate-spin text-blue-500" size={24} />
                  </div>
                ) : schemaVersions.length === 0 ? (
                  <div className={`text-center py-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No versions found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schemaVersions.map((version, index) => {
                      // Handle both camelCase and PascalCase property names
                      const versionNumber = version.versionNumber || version.VersionNumber || index + 1;
                      const status = version.status || version.Status || 'N/A';
                      const createdTime = version.createdTime || version.CreatedTime;
                      const schemaVersionId = version.schemaVersionId || version.SchemaVersionId || `version-${index}`;
                      
                      const isSelected = selectedVersions.some(v => {
                        const vId = v.schemaVersionId || v.SchemaVersionId;
                        return vId === schemaVersionId;
                      });
                      const isActive = selectedVersion && (
                        (selectedVersion.schemaVersionId || selectedVersion.SchemaVersionId) === schemaVersionId
                      );
                      
                      return (
                        <div
                          key={schemaVersionId}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isActive
                              ? isDarkMode
                                ? 'bg-blue-900/50 border-blue-600'
                                : 'bg-blue-100 border-blue-400'
                              : isSelected
                              ? isDarkMode
                                ? 'bg-blue-900/30 border-blue-600'
                                : 'bg-blue-50 border-blue-300'
                              : isDarkMode
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div 
                              className="flex-1"
                              onClick={() => handleVersionClick(version)}
                            >
                              <div className={`font-medium ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-800'
                              }`}>
                                Version {versionNumber}
                              </div>
                              <div className={`text-xs mt-1 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Status: {status} | Created: {createdTime ? new Date(createdTime).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleVersionCheckbox(version, e.target.checked)}
                              className="rounded focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Version Details */}
              {selectedVersion && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      Schema Definition - Version {selectedVersion.versionNumber || selectedVersion.VersionNumber || 'N/A'}
                    </h3>
                    <button
                      onClick={() => {
                      setSelectedVersion(null);
                      setVersionDetails(null);
                    }}
                      className={`p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      aria-label="Close version details"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {loadingVersionDetails ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="animate-spin text-blue-500" size={24} />
                    </div>
                  ) : versionDetails ? (
                    <div className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <pre className={`text-xs font-mono whitespace-pre-wrap overflow-x-auto ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {typeof versionDetails.schemaDefinition === 'string' 
                          ? versionDetails.schemaDefinition 
                          : JSON.stringify(versionDetails.schemaDefinition || {}, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className={`text-center py-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No schema definition available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Schema Comparison Modal */}
      {showCompare && selectedVersions.length === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-6xl rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  Schema Comparison
                </h2>
                <button
                  onClick={() => setShowCompare(false)}
                  className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  aria-label="Close comparison"
                >
                  <X size={20} />
                </button>
              </div>
              <div className={`text-sm mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Comparing Version {selectedVersions[0].versionNumber || selectedVersions[0].VersionNumber || 'N/A'} vs Version {selectedVersions[1].versionNumber || selectedVersions[1].VersionNumber || 'N/A'}
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {selectedVersions[0].details && selectedVersions[1].details ? (
                <div className={`border rounded-lg overflow-hidden ${
                  isDarkMode ? 'bg-gray-900' : 'bg-white'
                }`}>
                  <DiffViewer
                    oldValue={typeof selectedVersions[0].details.schemaDefinition === 'string' 
                      ? selectedVersions[0].details.schemaDefinition 
                      : JSON.stringify(selectedVersions[0].details.schemaDefinition || {}, null, 2)}
                    newValue={typeof selectedVersions[1].details.schemaDefinition === 'string'
                      ? selectedVersions[1].details.schemaDefinition
                      : JSON.stringify(selectedVersions[1].details.schemaDefinition || {}, null, 2)}
                    splitView={true}
                    useDarkTheme={isDarkMode}
                    leftTitle={`Version ${selectedVersions[0].versionNumber || selectedVersions[0].VersionNumber || 'N/A'}`}
                    rightTitle={`Version ${selectedVersions[1].versionNumber || selectedVersions[1].VersionNumber || 'N/A'}`}
                  />
                </div>
              ) : (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Loading version details...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemasList;
